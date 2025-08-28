import { execSync } from 'child_process'
import { versionManager } from './versionManager'
import { CommitAnalysis, ReleaseContext, VersionBump } from './types'
import { imageOperations } from './imageOperations'

export class ChangeDetector {
  private silent = false

  setSilent(silent: boolean): void {
    this.silent = silent
  }

  private log(message: string): void {
    if (!this.silent) {
      console.log(message)
    }
  }

  // Analyze changes and determine what needs to be released
  async analyzeChanges(
    trigger: ReleaseContext['trigger'] = 'push'
  ): Promise<ReleaseContext> {
    this.log('🔍 Analyzing changes for release...')

    const commits = versionManager.getCommitsSinceLastRelease()
    const versionBumps = versionManager.processCommits(commits)

    // Get unique affected containers
    const affectedContainers = Array.from(
      new Set(commits.flatMap(c => c.affectedContainers))
    )

    // Check for base image updates if this is a scheduled run
    let baseImageUpdates: any[] = []
    if (trigger === 'schedule' || trigger === 'base-image-update') {
      try {
        const updates = await imageOperations.checkBaseImageUpdates()
        baseImageUpdates = updates.filter(u => u.hasUpdate)

        if (baseImageUpdates.length > 0) {
          this.log(`📦 Found ${baseImageUpdates.length} base image updates`)

          // Add base image update version bumps
          baseImageUpdates.forEach(update => {
            const containerName = update.containerName
            if (!versionBumps.find(v => v.container === containerName)) {
              const versions = versionManager.loadVersions()
              const currentVersion = versions[containerName]?.version || '1.0.0'
              const { newVersion } = versionManager.calculateVersionBump(
                currentVersion,
                'fix',
                false
              )

              versionBumps.push({
                container: containerName,
                currentVersion,
                newVersion,
                bumpType: 'patch',
                reason: 'base image update'
              })

              if (!affectedContainers.includes(containerName)) {
                affectedContainers.push(containerName)
              }
            }
          })
        }
      } catch (error) {
        this.log(`⚠️  Error checking base image updates: ${error.message}`)
      }
    }

    return {
      trigger,
      affectedContainers,
      versionBumps,
      commits,
      baseImageUpdates
    }
  }

  // Check if any containers need to be released
  shouldRelease(context: ReleaseContext): boolean {
    return (
      context.versionBumps.length > 0 || context.baseImageUpdates?.length > 0
    )
  }

  // Get containers that need building based on changes
  getContainersToRebuild(context: ReleaseContext): string[] {
    return context.affectedContainers
  }

  // Get the highest version bump type across all containers
  getOverallReleaseType(
    context: ReleaseContext
  ): 'major' | 'minor' | 'patch' | 'none' {
    if (context.versionBumps.length === 0) return 'none'

    const priorities = { major: 3, minor: 2, patch: 1 }
    let highestPriority = 0
    let releaseType: 'major' | 'minor' | 'patch' = 'patch'

    context.versionBumps.forEach(bump => {
      const priority = priorities[bump.bumpType]
      if (priority > highestPriority) {
        highestPriority = priority
        releaseType = bump.bumpType
      }
    })

    return releaseType
  }

  // Generate release notes for the changes
  generateReleaseNotes(context: ReleaseContext): string[] {
    const notes: string[] = []

    if (context.versionBumps.length > 0) {
      notes.push('## Container Updates')
      context.versionBumps.forEach(bump => {
        notes.push(
          `- **${bump.container}**: ${bump.currentVersion} → ${bump.newVersion} (${bump.reason})`
        )
      })
    }

    if (context.baseImageUpdates && context.baseImageUpdates.length > 0) {
      notes.push('## Base Image Updates')
      context.baseImageUpdates.forEach(update => {
        notes.push(`- **${update.containerName}**: Updated ${update.baseImage}`)
      })
    }

    if (context.commits.length > 0) {
      const features = context.commits.filter(c => c.type === 'feat')
      const fixes = context.commits.filter(c => c.type === 'fix')
      const others = context.commits.filter(
        c => !['feat', 'fix'].includes(c.type)
      )

      if (features.length > 0) {
        notes.push('## Features')
        features.forEach(commit => {
          notes.push(`- ${commit.message} (${commit.hash.substring(0, 7)})`)
        })
      }

      if (fixes.length > 0) {
        notes.push('## Bug Fixes')
        fixes.forEach(commit => {
          notes.push(`- ${commit.message} (${commit.hash.substring(0, 7)})`)
        })
      }

      if (others.length > 0) {
        notes.push('## Other Changes')
        others.forEach(commit => {
          notes.push(`- ${commit.message} (${commit.hash.substring(0, 7)})`)
        })
      }
    }

    return notes
  }

  // Create a commit message for base image updates
  createBaseImageCommitMessage(baseImageUpdates: any[]): {
    message: string
    body: string[]
  } {
    const updatedImages = baseImageUpdates.map(u => u.containerName).join(', ')

    const message = `fix: update base images for ${updatedImages}`
    const body = [
      '- Updated base images to latest versions',
      '- Security patches and bug fixes from upstream',
      '- Improved compatibility and performance',
      '',
      'This commit triggers an automated patch release to rebuild DevContainers with updated base images.'
    ]

    return { message, body }
  }

  // Check if there are any changes since last release
  hasChangesSinceLastRelease(): boolean {
    try {
      const commits = versionManager.getCommitsSinceLastRelease()
      return commits.length > 0
    } catch (error) {
      this.log(`⚠️  Error checking for changes: ${error.message}`)
      return false
    }
  }

  // Get changed files since last release
  getChangedFilesSinceLastRelease(): string[] {
    try {
      let gitCommand = 'git diff --name-only'

      try {
        const lastTag = execSync('git describe --tags --abbrev=0', {
          encoding: 'utf-8'
        }).trim()
        gitCommand += ` ${lastTag}..HEAD`
      } catch {
        // No tags found, get all files
        gitCommand = 'git ls-files'
      }

      const output = execSync(gitCommand, { encoding: 'utf-8' }).trim()
      return output ? output.split('\n').filter(Boolean) : []
    } catch (error) {
      this.log(`⚠️  Error getting changed files: ${error.message}`)
      return []
    }
  }
}

// Export singleton instance
export const changeDetector = new ChangeDetector()
