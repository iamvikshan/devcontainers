import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { registryClient, IMAGE_DEFINITIONS } from './registry-client'
import { imageOperations } from './image-operations'

export class VersionsMdManager {
  private versionsPath: string

  constructor() {
    this.versionsPath = join(process.cwd(), 'VERSIONS.md')
  }

  // Update VERSIONS.md with new release information
  async updateVersionsFile(
    newVersion?: string,
    releaseNotes?: string[]
  ): Promise<void> {
    console.log('📝 Updating VERSIONS.md with real-time data...')

    try {
      // Get real-time data
      const sizes = await imageOperations.getAllImageSizes()
      const baseImageDigests = await this.getBaseImageDigests()
      const currentTime = new Date().toISOString()
      const currentDate = new Date().toISOString().split('T')[0]

      // Read existing VERSIONS.md
      let content = ''
      if (existsSync(this.versionsPath)) {
        content = readFileSync(this.versionsPath, 'utf-8')
      } else {
        content = this.createInitialVersionsContent()
      }

      // Update current release section
      if (newVersion) {
        content = this.updateCurrentRelease(
          content,
          newVersion,
          currentDate,
          currentTime
        )
      }

      // Update container images section
      content = await this.updateContainerImages(
        content,
        sizes,
        baseImageDigests
      )

      // Update next release section
      content = this.updateNextRelease(content)

      // Add new release entry if this is a new version
      if (newVersion && releaseNotes) {
        content = this.addReleaseEntry(
          content,
          newVersion,
          currentDate,
          releaseNotes
        )
      }

      // Write updated content
      writeFileSync(this.versionsPath, content)

      console.log('✅ VERSIONS.md updated successfully')
      console.log(`📊 Updated ${IMAGE_DEFINITIONS.names.length} images`)
      console.log(`🕒 Last updated: ${currentTime}`)

      if (newVersion) {
        console.log(`🚀 New version: ${newVersion}`)
      }
    } catch (error) {
      console.error('❌ Error updating VERSIONS.md:', error.message)
      throw error
    }
  }

  // Sync sizes only (for --sync-only flag)
  async syncAllSizes(): Promise<void> {
    console.log('🔄 Syncing sizes in VERSIONS.md and README files...')

    try {
      // Get real-time sizes
      const sizes = await imageOperations.getAllImageSizes()

      // Update README files
      await imageOperations.updateReadmeFiles(sizes)

      // Update VERSIONS.md with new sizes
      await this.updateVersionsFile()

      console.log('✅ All sizes synced successfully!')
    } catch (error) {
      console.error('❌ Error syncing sizes:', error.message)
      throw error
    }
  }

  private createInitialVersionsContent(): string {
    return `# DevContainer Versions

This file tracks base image updates and releases for our DevContainer configurations.

## Current Release

**Version:** 1.0.0  
**Release Date:** ${new Date().toISOString().split('T')[0]}  
**Last Updated:** ${new Date().toISOString()}

## Container Images

## Automation

### 🔄 Weekly Releases
- **Schedule:** Every Sunday at 2 AM UTC
- **Workflow:** \`.github/workflows/releases.yml\`
- **Purpose:** Automated releases with latest base images and documentation updates

### 🔍 Base Image Monitoring
- **Schedule:** Daily at 6 AM UTC
- **Workflow:** \`.github/workflows/check-base-images.yml\`
- **Purpose:** Monitor base images (\`oven/bun\`, \`ubuntu\`) for updates and trigger patch releases

### 📦 Sync Operations
- **GitHub → GitLab:** Every 6 hours via \`.github/workflows/sync.yml\`
- **GitLab → GitHub:** On push/MR events via \`.gitlab/gh-sync.yml\`

## Latest Updates

## Release History

## Next Release

---

*This file is automatically updated by our CI/CD workflows. For manual updates, please edit via pull request.*`
  }

  private updateCurrentRelease(
    content: string,
    version: string,
    date: string,
    timestamp: string
  ): string {
    const currentReleaseRegex =
      /## Current Release\n\n\*\*Version:\*\* [^\n]+\n\*\*Release Date:\*\* [^\n]+\n\*\*Last Updated:\*\* [^\n]+/
    const replacement = `## Current Release

**Version:** ${version}  
**Release Date:** ${date}  
**Last Updated:** ${timestamp}`

    return content.replace(currentReleaseRegex, replacement)
  }

  private async updateContainerImages(
    content: string,
    sizes: any,
    baseImageDigests: Record<string, string>
  ): Promise<string> {
    // This is a complex update that would need to parse and update each container section
    // For now, we'll keep the existing container images section and just update sizes
    // A full implementation would parse each container section and update the size information

    // Update sizes in the container sections
    for (const imageName of IMAGE_DEFINITIONS.names) {
      const imageSize = sizes[imageName]?.ghcr?.size_mb || 0
      const sizeRegex = new RegExp(
        `(### [^\\n]*${imageName}[^\\n]*\\n[\\s\\S]*?\\*\\*Size:\\*\\*) ~[0-9.]+( MB)`,
        'i'
      )
      content = content.replace(sizeRegex, `$1 ~${imageSize.toFixed(2)}$2`)
    }

    return content
  }

  private updateNextRelease(content: string): string {
    // Calculate next Sunday 2 AM UTC
    const nextRelease = new Date()
    const daysUntilSunday = (7 - nextRelease.getUTCDay()) % 7 || 7
    nextRelease.setDate(nextRelease.getDate() + daysUntilSunday)
    nextRelease.setUTCHours(2, 0, 0, 0)

    const nextReleaseRegex = /\*\*Estimated Date:\*\* [^\n]+/
    const replacement = `**Estimated Date:** ${nextRelease.toISOString()}`

    return content.replace(nextReleaseRegex, replacement)
  }

  private addReleaseEntry(
    content: string,
    version: string,
    date: string,
    releaseNotes: string[]
  ): string {
    const releaseEntry = `### ${date} - Release ${version}

**Changes:**
${releaseNotes.map(note => `- ${note}`).join('\n')}

**Impact:** ${this.determineImpactLevel(version)} release

---

`

    // Insert after "## Latest Updates" section
    const latestUpdatesIndex = content.indexOf('## Latest Updates')
    if (latestUpdatesIndex !== -1) {
      const insertIndex = content.indexOf('\n\n', latestUpdatesIndex) + 2
      content =
        content.slice(0, insertIndex) +
        releaseEntry +
        content.slice(insertIndex)
    }

    return content
  }

  private determineImpactLevel(version: string): string {
    const [major, minor, patch] = version.split('.').map(Number)
    if (patch > 0) return 'Patch'
    if (minor > 0) return 'Minor'
    return 'Major'
  }

  // Get base image digests
  async getBaseImageDigests(): Promise<Record<string, string>> {
    console.log('🔍 Getting base image digests...')

    const digests: Record<string, string> = {}

    for (const [imageName, baseImage] of Object.entries(
      IMAGE_DEFINITIONS.baseImages
    )) {
      try {
        const tags = await registryClient.getDockerHubTags(baseImage)
        const latestTag = tags.find(t => t.name === 'latest')

        if (latestTag?.digest) {
          digests[imageName] = latestTag.digest
        }
      } catch (error) {
        console.error(`Error getting digest for ${baseImage}:`, error.message)
        digests[imageName] = 'sha256:unknown'
      }
    }

    return digests
  }
}

// Export singleton instance
export const versionsMdManager = new VersionsMdManager()
