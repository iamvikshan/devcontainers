import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import { versionManager } from './versionManager'
import { changeDetector } from './changeDetector'
import { changelogManager } from './changelogManager'
import { ReleaseContext, BuildResult } from './types'

export class ReleaseOrchestrator {
  private silent = false

  setSilent(silent: boolean): void {
    this.silent = silent
    versionManager.setSilent(silent)
    changeDetector.setSilent(silent)
    // Ensure changelogManager follows the same silent/workflow behavior
    changelogManager.setSilent?.(silent)
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

  // Generate release summary (no longer creates git tags - containers have different versions)
  async generateReleaseSummary(
    context: ReleaseContext,
    versionMap: Record<string, string>
  ): Promise<void> {
    this.log('� Generating release summary...')

    try {
      // Generate release notes
      const releaseNotes = changeDetector.generateReleaseNotes(context)
      const releaseBody = releaseNotes.join('\n')

      this.log('✅ Release summary generated')
      this.log('\n' + releaseBody)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to generate release summary: ${errorMessage}`)
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
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new Error(
        `Failed to create base image update commit: ${errorMessage}`
      )
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

      // Update changelog using changelogManager
      const releaseNotes = changeDetector.generateReleaseNotes(context)
      await changelogManager.updateChangelogFile(versionMap, releaseNotes)
      this.log('✅ CHANGELOG.md updated')

      // Generate outputs for workflow
      const outputs = this.generateWorkflowOutputs(context, versionMap)

      return {
        success: true,
        outputs
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      return {
        success: false,
        outputs: {
          should_release: 'false',
          release_type: 'none',
          affected_containers: '',
          version_map: '{}'
        },
        error: errorMessage
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
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Release orchestration failed:', errorMessage)
    process.exit(1)
  }
}

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error)
}
