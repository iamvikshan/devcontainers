import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { registryClient, IMAGE_DEFINITIONS } from './registryClient'
import { imageOperations } from './imageOperations'

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
    // Load tool versions if available
    const toolVersions = this.loadToolVersions()
    
    // Generate complete container images section
    const containerImagesSection = await this.generateContainerImagesSection(
      sizes,
      baseImageDigests,
      toolVersions
    )

    // Replace the entire container images section
    const containerImagesRegex = /(## Container Images\n\n)([\s\S]*?)(\n## Automation)/
    if (containerImagesRegex.test(content)) {
      content = content.replace(containerImagesRegex, `$1${containerImagesSection}$3`)
    } else {
      // If section doesn't exist, add it
      const automationIndex = content.indexOf('## Automation')
      if (automationIndex !== -1) {
        content = content.slice(0, automationIndex) + 
                 `## Container Images\n\n${containerImagesSection}\n` +
                 content.slice(automationIndex)
      }
    }

    return content
  }

  private async generateContainerImagesSection(
    sizes: any,
    baseImageDigests: Record<string, string>,
    toolVersions: any[]
  ): Promise<string> {
    let section = ''

    for (const imageName of IMAGE_DEFINITIONS.names) {
      const imageSize = sizes[imageName]?.ghcr?.size_mb || 0
      const baseImage = IMAGE_DEFINITIONS.baseImages[imageName] || 'unknown'
      const digest = baseImageDigests[imageName] || 'unknown'
      
      // Get tool versions for this container
      const containerToolVersions = toolVersions.find(tv => tv.container === imageName)
      const tools = containerToolVersions?.versions || {}
      
      // Generate tools description
      const toolsDesc = this.generateToolsDescription(imageName, tools)
      
      // Generate emoji based on container type
      const emoji = this.getContainerEmoji(imageName)
      
      section += `### ${emoji} ${imageName}

- **Base Image:** \`${baseImage}:latest\`
- **Base Image Digest:** \`${digest}\`
- **Tools:** ${toolsDesc}
- **Size:** ~${imageSize.toFixed(2)} MB
- **Registries:**
  - GitHub: \`ghcr.io/iamvikshan/devcontainers/${imageName}:latest\`
  - GitLab: \`registry.gitlab.com/vikshan/devcontainers/${imageName}:latest\`
  - Docker Hub: \`docker.io/vikshan/${imageName}:latest\`

`
    }

    return section
  }

  private generateToolsDescription(imageName: string, tools: any): string {
    const toolsList = []
    
    if (tools.bun_version) {
      toolsList.push(`Bun ${tools.bun_version}`)
    }
    
    if (tools.node_version) {
      toolsList.push(`Node.js ${tools.node_version}`)
    }
    
    if (tools.npm_version) {
      toolsList.push(`npm ${tools.npm_version}`)
    }
    
    if (tools.eslint_version) {
      toolsList.push(`ESLint ${tools.eslint_version}`)
    } else if (imageName.includes('node') && !imageName.includes('gitpod')) {
      toolsList.push('ESLint (global)')
    }
    
    if (tools.git_version) {
      toolsList.push(`Git ${tools.git_version}`)
    }
    
    if (tools.curl_version) {
      toolsList.push(`curl ${tools.curl_version}`)
    }

    // Add special notes for certain containers
    if (imageName.includes('ubuntu') && imageName.includes('node') && !imageName.includes('gitpod')) {
      toolsList.push('ESLint (non-root)')
    }

    return toolsList.length > 0 ? toolsList.join(', ') : 'Basic development tools'
  }

  private getContainerEmoji(imageName: string): string {
    if (imageName.includes('gitpod')) {
      return '🟠' // Gitpod orange
    } else if (imageName.includes('ubuntu')) {
      return '🐧' // Ubuntu penguin
    } else {
      return '🚀' // Default rocket
    }
  }

  private loadToolVersions(): any[] {
    try {
      const toolVersionsPath = join(process.cwd(), 'tool-versions.json')
      if (existsSync(toolVersionsPath)) {
        const content = readFileSync(toolVersionsPath, 'utf-8')
        return JSON.parse(content)
      }
    } catch (error) {
      console.log('⚠️  Could not load tool versions, using defaults')
    }
    return []
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

// CLI functionality
async function main() {
  const args = process.argv.slice(2)
  const newVersion = args
    .find(arg => arg.startsWith('--version='))
    ?.split('=')[1]
  const versionMapArg = args
    .find(arg => arg.startsWith('--version-map='))
    ?.split('=')[1]
  const releaseNotesArg = args
    .find(arg => arg.startsWith('--notes='))
    ?.split('=')[1]
  const releaseNotes = releaseNotesArg ? releaseNotesArg.split(',') : undefined
  const syncOnly = args.includes('--sync-only')

  console.log('🔄 Version Manager Starting...\n')

  try {
    if (syncOnly) {
      // Just sync sizes between README and VERSIONS.md
      console.log('📊 Syncing sizes only...')
      await versionsMdManager.syncAllSizes()
    } else if (versionMapArg) {
      // Update with version map from new release system
      console.log('📝 Updating VERSIONS.md with version map...')
      const versionMap = JSON.parse(versionMapArg)

      // Use the highest version from the map as the overall version
      const versions = Object.values(versionMap) as string[]
      const overallVersion = versions.sort((a, b) => {
        const [aMajor, aMinor, aPatch] = a.split('.').map(Number)
        const [bMajor, bMinor, bPatch] = b.split('.').map(Number)
        if (aMajor !== bMajor) return bMajor - aMajor
        if (aMinor !== bMinor) return bMinor - aMinor
        return bPatch - aPatch
      })[0]

      await versionsMdManager.updateVersionsFile(overallVersion, releaseNotes)
    } else {
      // Full version update with real-time data
      console.log('📝 Updating VERSIONS.md with real-time data...')
      await versionsMdManager.updateVersionsFile(newVersion, releaseNotes)
    }

    console.log('\n🎉 Version management complete!')
  } catch (error) {
    console.error('❌ Version management failed:', error.message)
    process.exit(1)
  }
}

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error)
}
