import { execSync } from 'child_process'
import { versionManager } from './versionManager'
import { ReleaseContext } from './types'
import { imageOperations } from './imageOperations'
import { IMAGE_DEFINITIONS } from './registryClient'

export class ChangeDetector {
  private silent = false
  private versionOverride: string | undefined

  setSilent(silent: boolean): void {
    this.silent = silent
    // Propagate silent mode to imageOperations
    imageOperations.setSilent(silent)
  }

  setVersionOverride(version: string): void {
    this.versionOverride = version
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

    // For manual trigger, release ALL containers
    if (trigger === 'manual') {
      this.log('🎯 Manual trigger detected - releasing ALL containers')
      return this.createManualReleaseContext()
    }

    const rawCommits = versionManager.getCommitsSinceLastRelease()
    // Filter out commits that don't affect any containers
    const commits = rawCommits.filter(
      c => c.affectedContainers && c.affectedContainers.length > 0
    )
    const versionBumps = versionManager.processCommits(commits)

    // Check for manual release override
    const manualReleaseCommit = commits.find(
      c => c.type === 'release' && c.manualVersion
    )
    let manualOverride: ReleaseContext['manualOverride'] = undefined

    if (manualReleaseCommit && manualReleaseCommit.manualVersion) {
      manualOverride = {
        version: manualReleaseCommit.manualVersion,
        commitHash: manualReleaseCommit.hash
      }
      this.log(
        `🎯 Manual release override detected: v${manualReleaseCommit.manualVersion}`
      )
    }

    // Get unique affected containers
    const affectedContainers = Array.from(
      new Set(commits.flatMap(c => c.affectedContainers))
    )

    // Check for base image updates and tool updates if this is a scheduled run
    let baseImageUpdates: any[] = []
    if (trigger === 'schedule' || trigger === 'base-image-update') {
      try {
        // Check base image updates
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

        // Check tool version updates
        const toolUpdates = await imageOperations.checkToolVersionUpdates()
        if (
          toolUpdates.hasUpdates &&
          toolUpdates.affectedContainers.length > 0
        ) {
          this.log(
            `🔧 Found tool updates for ${toolUpdates.affectedContainers.length} containers`
          )

          // Add tool update version bumps
          toolUpdates.affectedContainers.forEach(containerName => {
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
                reason: 'tool version update'
              })

              if (!affectedContainers.includes(containerName)) {
                affectedContainers.push(containerName)
              }
            }
          })
        }
      } catch (error) {
        this.log(
          `⚠️  Error checking external updates: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }

    return {
      trigger,
      affectedContainers,
      versionBumps,
      commits,
      baseImageUpdates,
      manualOverride
    }
  }

  // Create release context for manual trigger (all containers)
  private createManualReleaseContext(): ReleaseContext {
    const versions = versionManager.loadVersions()

    // Get commits since last release for release notes (even in manual mode)
    const rawCommits = versionManager.getCommitsSinceLastRelease()
    const commits = rawCommits.filter(
      c => c.affectedContainers && c.affectedContainers.length > 0
    )

    const versionBumps = IMAGE_DEFINITIONS.names.map(container => {
      const currentVersion = versions[container]?.version || '1.0.0'

      // Use version override if provided, otherwise auto-increment
      let newVersion: string
      let bumpType: 'major' | 'minor' | 'patch'

      if (this.versionOverride) {
        newVersion = this.versionOverride
        // Determine bump type based on version difference
        const [curMajor, curMinor] = currentVersion.split('.').map(Number)
        const [newMajor, newMinor] = newVersion.split('.').map(Number)
        if (newMajor > curMajor) bumpType = 'major'
        else if (newMinor > curMinor) bumpType = 'minor'
        else bumpType = 'patch'
      } else {
        const result = versionManager.calculateVersionBump(
          currentVersion,
          'fix',
          false
        )
        newVersion = result.newVersion
        bumpType = result.bumpType
      }

      return {
        container,
        currentVersion,
        newVersion,
        bumpType,
        reason: 'manual release'
      }
    })

    return {
      trigger: 'manual',
      affectedContainers: [...IMAGE_DEFINITIONS.names],
      versionBumps,
      commits, // Include commits for release notes
      baseImageUpdates: []
    }
  }

  // Check if any containers need to be released
  shouldRelease(context: ReleaseContext): boolean {
    // Manual trigger always releases
    if (context.trigger === 'manual') return true
    return (
      context.versionBumps.length > 0 ||
      (context.baseImageUpdates?.length ?? 0) > 0
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
    // Manual override always returns major (since it can be any version)
    if (context.manualOverride) return 'major'

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

    // Removed Container Updates section - now shown in Released Versions table

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

      // GitHub repository info (adjust if needed)
      const repoUrl = 'https://github.com/iamvikshan/devcontainers'

      if (features.length > 0) {
        notes.push('## Features')
        features.forEach(commit => {
          const shortHash = commit.hash.substring(0, 7)
          notes.push(
            `- ${commit.message} ([${shortHash}](${repoUrl}/commit/${commit.hash}))`
          )
        })
      }

      if (fixes.length > 0) {
        notes.push('## Bug Fixes')
        fixes.forEach(commit => {
          const shortHash = commit.hash.substring(0, 7)
          notes.push(
            `- ${commit.message} ([${shortHash}](${repoUrl}/commit/${commit.hash}))`
          )
        })
      }

      if (others.length > 0) {
        notes.push('## Other Changes')
        others.forEach(commit => {
          const shortHash = commit.hash.substring(0, 7)
          notes.push(
            `- ${commit.message} ([${shortHash}](${repoUrl}/commit/${commit.hash}))`
          )
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
      this.log(
        `⚠️  Error checking for changes: ${error instanceof Error ? error.message : String(error)}`
      )
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
      this.log(
        `⚠️  Error getting changed files: ${error instanceof Error ? error.message : String(error)}`
      )
      return []
    }
  }
}

// Export singleton instance
export const changeDetector = new ChangeDetector()
