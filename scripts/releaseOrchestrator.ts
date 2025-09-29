import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import { versionManager } from './versionManager'
import { changeDetector } from './changeDetector'
import { ReleaseContext, BuildResult } from './types'

export class ReleaseOrchestrator {
  private silent = false

  setSilent(silent: boolean): void {
    this.silent = silent
    versionManager.setSilent(silent)
    changeDetector.setSilent(silent)
  }

  private log(message: string): void {
    if (!this.silent) {
      console.log(message)
    }
  }

  // Main release check - determines if a release is needed
  async checkReleaseNeeded(
    trigger: ReleaseContext['trigger'] = 'push'
  ): Promise<{
    shouldRelease: boolean
    context?: ReleaseContext
    releaseType: 'major' | 'minor' | 'patch' | 'none'
  }> {
    this.log('🔍 Checking if release is needed...')

    const context = await changeDetector.analyzeChanges(trigger)
    const shouldRelease = changeDetector.shouldRelease(context)
    const releaseType = changeDetector.getOverallReleaseType(context)

    if (shouldRelease) {
      this.log(
        `🚀 Release needed: ${releaseType} release for ${context.affectedContainers.length} containers`
      )
      this.log(
        `📦 Affected containers: ${context.affectedContainers.join(', ')}`
      )
    } else {
      this.log('ℹ️  No release needed - no changes detected')
    }

    return {
      shouldRelease,
      context: shouldRelease ? context : undefined,
      releaseType
    }
  }

  // Predict versions for containers that will be released
  predictVersions(context: ReleaseContext): Record<string, string> {
    const predictions: Record<string, string> = {}

    context.versionBumps.forEach(bump => {
      predictions[bump.container] = bump.newVersion
    })

    return predictions
  }

  // Apply version bumps and prepare for release
  prepareRelease(context: ReleaseContext): Record<string, string> {
    this.log('📝 Preparing release...')

    // Apply version bumps
    const updatedVersions = versionManager.applyVersionBumps(
      context.versionBumps
    )

    // Create version mapping for build process
    const versionMap: Record<string, string> = {}
    context.versionBumps.forEach(bump => {
      versionMap[bump.container] = bump.newVersion
    })

    this.log(
      `✅ Prepared release for ${context.versionBumps.length} containers`
    )
    return versionMap
  }

  // Create GitHub release
  async createGitHubRelease(
    context: ReleaseContext,
    versionMap: Record<string, string>
  ): Promise<void> {
    this.log('🚀 Creating GitHub release...')

    try {
      // Determine the overall release version (use the highest version from affected containers)
      const versions = Object.values(versionMap)
      const releaseVersion = this.getHighestVersion(versions)

      // Generate release notes
      const releaseNotes = changeDetector.generateReleaseNotes(context)
      const releaseBody = releaseNotes.join('\n')

      // Create git tag
      const tagName = `v${releaseVersion}`
      execSync(`git tag -a ${tagName} -m "Release ${tagName}"`, {
        stdio: 'inherit'
      })

      // Push tag
      execSync(`git push origin ${tagName}`, { stdio: 'inherit' })

      // Create GitHub release using gh CLI if available
      try {
        const releaseCommand = [
          'gh',
          'release',
          'create',
          tagName,
          '--title',
          `Release ${tagName}`,
          '--notes',
          `"${releaseBody}"`,
          '--latest'
        ].join(' ')

        execSync(releaseCommand, { stdio: 'inherit' })
        this.log(`✅ GitHub release ${tagName} created successfully`)
      } catch (error) {
        this.log(
          `⚠️  Could not create GitHub release via gh CLI: ${error.message}`
        )
        this.log(
          'ℹ️  Tag was created and pushed - release can be created manually'
        )
      }
    } catch (error) {
      throw new Error(`Failed to create GitHub release: ${error.message}`)
    }
  }

  // Get the highest semantic version from a list
  private getHighestVersion(versions: string[]): string {
    if (versions.length === 0) return '1.0.0'
    if (versions.length === 1) return versions[0]

    return versions.sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.split('.').map(Number)
      const [bMajor, bMinor, bPatch] = b.split('.').map(Number)

      if (aMajor !== bMajor) return bMajor - aMajor
      if (aMinor !== bMinor) return bMinor - aMinor
      return bPatch - aPatch
    })[0]
  }

  // Create commit for base image updates
  async createBaseImageUpdateCommit(baseImageUpdates: any[]): Promise<void> {
    this.log('📝 Creating base image update commit...')

    try {
      const { message, body } =
        changeDetector.createBaseImageCommitMessage(baseImageUpdates)

      // Configure git with environment variables or fallback
      const gitEmail =
        process.env.GIT_AUTHOR_EMAIL ||
        process.env.GIT_COMMITTER_EMAIL ||
        'action@github.com'
      const gitName =
        process.env.GIT_AUTHOR_NAME ||
        process.env.GIT_COMMITTER_NAME ||
        'GitHub Action'

      execSync(`git config --global user.email "${gitEmail}"`)
      execSync(`git config --global user.name "${gitName}"`)

      // Create commit
      const fullMessage = [message, '', ...body].join('\n')
      execSync(
        `git commit --allow-empty -m "${message}" -m "${body.join('\n')}"`
      )

      this.log('✅ Base image update commit created')
    } catch (error) {
      throw new Error(
        `Failed to create base image update commit: ${error.message}`
      )
    }
  }

  // Update CHANGELOG.md
  updateChangelog(
    context: ReleaseContext,
    versionMap: Record<string, string>
  ): void {
    this.log('📝 Updating CHANGELOG.md...')

    try {
      const releaseVersion = this.getHighestVersion(Object.values(versionMap))
      const releaseDate = new Date().toISOString().split('T')[0]
      const releaseNotes = changeDetector.generateReleaseNotes(context)

      // Read existing changelog or create new one
      let changelog = ''
      try {
        changelog = require('fs').readFileSync('CHANGELOG.md', 'utf-8')
      } catch {
        changelog =
          '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n'
      }

      // Prepare new entry
      const newEntry = [
        `## [${releaseVersion}] - ${releaseDate}`,
        '',
        ...releaseNotes,
        ''
      ].join('\n')

      // Insert new entry after the header
      const lines = changelog.split('\n')
      const headerEndIndex = lines.findIndex(line => line.startsWith('## '))

      if (headerEndIndex === -1) {
        // No existing releases, add after header
        changelog += '\n' + newEntry
      } else {
        // Insert before first existing release
        lines.splice(headerEndIndex, 0, newEntry)
        changelog = lines.join('\n')
      }

      writeFileSync('CHANGELOG.md', changelog)
      this.log('✅ CHANGELOG.md updated')
    } catch (error) {
      this.log(`⚠️  Error updating CHANGELOG.md: ${error.message}`)
    }
  }

  // Generate workflow outputs for GitHub Actions
  generateWorkflowOutputs(
    context: ReleaseContext,
    versionMap: Record<string, string>
  ): Record<string, string> {
    const outputs: Record<string, string> = {
      should_release: changeDetector.shouldRelease(context).toString(),
      release_type: changeDetector.getOverallReleaseType(context),
      affected_containers: context.affectedContainers.join(','),
      version_map: JSON.stringify(versionMap)
    }

    // Add individual container versions
    Object.entries(versionMap).forEach(([container, version]) => {
      outputs[`${container}_version`] = version
    })

    return outputs
  }

  // Main workflow method for GitHub Actions
  async executeRelease(trigger: ReleaseContext['trigger'] = 'push'): Promise<{
    success: boolean
    outputs: Record<string, string>
    error?: string
  }> {
    try {
      const { shouldRelease, context, releaseType } =
        await this.checkReleaseNeeded(trigger)

      if (!shouldRelease || !context) {
        return {
          success: true,
          outputs: {
            should_release: 'false',
            release_type: 'none',
            affected_containers: '',
            version_map: '{}'
          }
        }
      }

      // Prepare release
      const versionMap = this.prepareRelease(context)

      // Update changelog
      this.updateChangelog(context, versionMap)

      // Generate outputs for workflow
      const outputs = this.generateWorkflowOutputs(context, versionMap)

      return {
        success: true,
        outputs
      }
    } catch (error) {
      return {
        success: false,
        outputs: {
          should_release: 'false',
          release_type: 'none',
          affected_containers: '',
          version_map: '{}'
        },
        error: error.message
      }
    }
  }
}

// Export singleton instance
export const releaseOrchestrator = new ReleaseOrchestrator()

// CLI usage
async function main() {
  const args = process.argv.slice(2)
  const trigger = (args
    .find(arg => arg.startsWith('--trigger='))
    ?.split('=')[1] || 'push') as ReleaseContext['trigger']
  const workflowMode = args.includes('--workflow')

  if (workflowMode) {
    releaseOrchestrator.setSilent(true)
  }

  try {
    // Normal release analysis mode
    const result = await releaseOrchestrator.executeRelease(trigger)

    if (workflowMode) {
      console.log(JSON.stringify(result))
    } else {
      console.log('\n📊 Release orchestration result:')
      console.log(JSON.stringify(result, null, 2))
    }

    process.exit(result.success ? 0 : 1)
  } catch (error) {
    console.error('❌ Release orchestration failed:', error.message)
    process.exit(1)
  }
}

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error)
}
