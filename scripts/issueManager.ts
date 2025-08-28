import { execSync } from 'child_process'
import axios from 'axios'

export interface BuildFailure {
  container: string
  version: string
  error: string
  buildLog?: string
  timestamp: string
  workflow?: string
  runId?: string
}

export interface IssueCreationResult {
  success: boolean
  issueNumber?: number
  issueUrl?: string
  error?: string
}

export class IssueManager {
  private githubToken: string
  private owner: string
  private repo: string
  private silent = false

  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
    this.owner = process.env.GITHUB_REPOSITORY?.split('/')[0] || ''
    this.repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || ''
  }

  setSilent(silent: boolean): void {
    this.silent = silent
  }

  private log(message: string): void {
    if (!this.silent) {
      console.log(message)
    }
  }

  // Create a GitHub issue for build failure
  async createBuildFailureIssue(
    failure: BuildFailure
  ): Promise<IssueCreationResult> {
    if (!this.githubToken || !this.owner || !this.repo) {
      return {
        success: false,
        error: 'Missing GitHub configuration (token, owner, or repo)'
      }
    }

    try {
      this.log(`🐛 Creating issue for ${failure.container} build failure...`)

      const title = `Build Failed: ${failure.container} v${failure.version}`
      const body = this.generateIssueBody(failure)
      const labels = ['bug', 'build-failure', `container:${failure.container}`]

      // Check if similar issue already exists
      const existingIssue = await this.findExistingBuildFailureIssue(
        failure.container
      )
      if (existingIssue) {
        this.log(`ℹ️  Similar issue already exists: #${existingIssue.number}`)
        await this.updateExistingIssue(existingIssue.number, failure)
        return {
          success: true,
          issueNumber: existingIssue.number,
          issueUrl: existingIssue.html_url
        }
      }

      // Create new issue
      const response = await axios.post(
        `https://api.github.com/repos/${this.owner}/${this.repo}/issues`,
        {
          title,
          body,
          labels
        },
        {
          headers: {
            Authorization: `Bearer ${this.githubToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      )

      this.log(
        `✅ Created issue #${response.data.number}: ${response.data.html_url}`
      )

      return {
        success: true,
        issueNumber: response.data.number,
        issueUrl: response.data.html_url
      }
    } catch (error) {
      this.log(`❌ Failed to create issue: ${error.message}`)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Generate issue body content
  private generateIssueBody(failure: BuildFailure): string {
    const sections = [
      '## Build Failure Report',
      '',
      '**Container:** ' + failure.container,
      '**Version:** ' + failure.version,
      '**Timestamp:** ' + failure.timestamp,
      ''
    ]

    if (failure.workflow) {
      sections.push('**Workflow:** ' + failure.workflow)
    }

    if (failure.runId) {
      sections.push(`**Run ID:** ${failure.runId}`)
      sections.push(
        `**Workflow URL:** https://github.com/${this.owner}/${this.repo}/actions/runs/${failure.runId}`
      )
    }

    sections.push('', '## Error Details', '', '```')
    sections.push(failure.error)
    sections.push('```')

    if (failure.buildLog) {
      sections.push(
        '',
        '## Build Log',
        '',
        '<details>',
        '<summary>Click to expand build log</summary>',
        '',
        '```'
      )
      sections.push(failure.buildLog)
      sections.push('```', '', '</details>')
    }

    sections.push('', '## Possible Causes', '')
    sections.push('- Base image updates that introduced breaking changes')
    sections.push('- Dependency version conflicts')
    sections.push('- Network issues during package installation')
    sections.push('- Docker build environment changes')
    sections.push('- Missing or changed dependencies')

    sections.push('', '## Next Steps', '')
    sections.push('- [ ] Review the error message and build log')
    sections.push('- [ ] Check for recent changes in base images')
    sections.push('- [ ] Verify Dockerfile syntax and dependencies')
    sections.push('- [ ] Test build locally')
    sections.push('- [ ] Update dependencies if needed')

    sections.push('', '---')
    sections.push('*This issue was automatically created by the build system.*')

    return sections.join('\n')
  }

  // Find existing build failure issue for the same container
  private async findExistingBuildFailureIssue(
    container: string
  ): Promise<any | null> {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${this.owner}/${this.repo}/issues`,
        {
          params: {
            labels: `build-failure,container:${container}`,
            state: 'open',
            sort: 'created',
            direction: 'desc',
            per_page: 1
          },
          headers: {
            Authorization: `Bearer ${this.githubToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      )

      return response.data.length > 0 ? response.data[0] : null
    } catch (error) {
      this.log(`⚠️  Error checking for existing issues: ${error.message}`)
      return null
    }
  }

  // Update existing issue with new failure information
  private async updateExistingIssue(
    issueNumber: number,
    failure: BuildFailure
  ): Promise<void> {
    try {
      const comment = [
        '## New Build Failure',
        '',
        '**Version:** ' + failure.version,
        '**Timestamp:** ' + failure.timestamp,
        ''
      ]

      if (failure.runId) {
        comment.push(
          `**Workflow URL:** https://github.com/${this.owner}/${this.repo}/actions/runs/${failure.runId}`
        )
        comment.push('')
      }

      comment.push('**Error:**', '```')
      comment.push(failure.error)
      comment.push('```')

      await axios.post(
        `https://api.github.com/repos/${this.owner}/${this.repo}/issues/${issueNumber}/comments`,
        {
          body: comment.join('\n')
        },
        {
          headers: {
            Authorization: `Bearer ${this.githubToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      )

      this.log(
        `✅ Updated existing issue #${issueNumber} with new failure information`
      )
    } catch (error) {
      this.log(`⚠️  Failed to update existing issue: ${error.message}`)
    }
  }

  // Close build failure issues when builds succeed
  async closeBuildFailureIssues(
    container: string,
    version: string
  ): Promise<void> {
    try {
      this.log(`🔍 Checking for open build failure issues for ${container}...`)

      const response = await axios.get(
        `https://api.github.com/repos/${this.owner}/${this.repo}/issues`,
        {
          params: {
            labels: `build-failure,container:${container}`,
            state: 'open'
          },
          headers: {
            Authorization: `Bearer ${this.githubToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      )

      for (const issue of response.data) {
        await this.closeIssueWithSuccessComment(
          issue.number,
          container,
          version
        )
      }
    } catch (error) {
      this.log(`⚠️  Error closing build failure issues: ${error.message}`)
    }
  }

  // Close issue with success comment
  private async closeIssueWithSuccessComment(
    issueNumber: number,
    container: string,
    version: string
  ): Promise<void> {
    try {
      // Add success comment
      await axios.post(
        `https://api.github.com/repos/${this.owner}/${this.repo}/issues/${issueNumber}/comments`,
        {
          body: [
            '## ✅ Build Successful',
            '',
            `The build for **${container} v${version}** has completed successfully.`,
            '',
            'This issue is now resolved and will be closed automatically.',
            '',
            `**Timestamp:** ${new Date().toISOString()}`
          ].join('\n')
        },
        {
          headers: {
            Authorization: `Bearer ${this.githubToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      )

      // Close the issue
      await axios.patch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/issues/${issueNumber}`,
        {
          state: 'closed'
        },
        {
          headers: {
            Authorization: `Bearer ${this.githubToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      )

      this.log(`✅ Closed build failure issue #${issueNumber}`)
    } catch (error) {
      this.log(`⚠️  Failed to close issue #${issueNumber}: ${error.message}`)
    }
  }

  // Create issue using gh CLI as fallback
  async createIssueWithGhCli(
    failure: BuildFailure
  ): Promise<IssueCreationResult> {
    try {
      this.log(
        `🐛 Creating issue using gh CLI for ${failure.container} build failure...`
      )

      const title = `Build Failed: ${failure.container} v${failure.version}`
      const body = this.generateIssueBody(failure)
      const labels = ['bug', 'build-failure', `container:${failure.container}`]

      const command = [
        'gh',
        'issue',
        'create',
        '--title',
        `"${title}"`,
        '--body',
        `"${body}"`,
        '--label',
        labels.join(',')
      ].join(' ')

      const output = execSync(command, { encoding: 'utf-8' }).trim()
      const issueUrl = output.split('\n').pop() || ''
      const issueNumber = issueUrl.split('/').pop()

      this.log(`✅ Created issue via gh CLI: ${issueUrl}`)

      return {
        success: true,
        issueNumber: issueNumber ? parseInt(issueNumber) : undefined,
        issueUrl
      }
    } catch (error) {
      this.log(`❌ Failed to create issue via gh CLI: ${error.message}`)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Main method to handle build failure
  async handleBuildFailure(
    failure: BuildFailure
  ): Promise<IssueCreationResult> {
    // Try API first, then fallback to gh CLI
    let result = await this.createBuildFailureIssue(failure)

    if (
      !result.success &&
      !result.error?.includes('Missing GitHub configuration')
    ) {
      this.log('🔄 Falling back to gh CLI...')
      result = await this.createIssueWithGhCli(failure)
    }

    return result
  }
}

// Export singleton instance
export const issueManager = new IssueManager()

// CLI usage
async function main() {
  const args = process.argv.slice(2)
  const container = args
    .find(arg => arg.startsWith('--container='))
    ?.split('=')[1]
  const version = args.find(arg => arg.startsWith('--version='))?.split('=')[1]
  const error = args.find(arg => arg.startsWith('--error='))?.split('=')[1]
  const buildLog = args
    .find(arg => arg.startsWith('--build-log='))
    ?.split('=')[1]
  const workflow = args
    .find(arg => arg.startsWith('--workflow='))
    ?.split('=')[1]
  const runId = args.find(arg => arg.startsWith('--run-id='))?.split('=')[1]
  const closeSuccess = args.includes('--close-success')
  const silent = args.includes('--silent')

  if (silent) {
    issueManager.setSilent(true)
  }

  try {
    if (closeSuccess && container && version) {
      await issueManager.closeBuildFailureIssues(container, version)
      console.log(`✅ Closed build failure issues for ${container} v${version}`)
    } else if (container && version && error) {
      const failure: BuildFailure = {
        container,
        version,
        error,
        buildLog,
        timestamp: new Date().toISOString(),
        workflow,
        runId
      }

      const result = await issueManager.handleBuildFailure(failure)

      if (result.success) {
        console.log(`✅ Issue created: ${result.issueUrl}`)
      } else {
        console.error(`❌ Failed to create issue: ${result.error}`)
        process.exit(1)
      }
    } else {
      console.error(
        'Usage: bun scripts/issueManager.ts --container=name --version=1.0.0 --error="error message" [--build-log="log"] [--workflow="workflow"] [--run-id="123"] [--silent]'
      )
      console.error(
        '   or: bun scripts/issueManager.ts --close-success --container=name --version=1.0.0 [--silent]'
      )
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Issue management failed:', error.message)
    process.exit(1)
  }
}

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error)
}
