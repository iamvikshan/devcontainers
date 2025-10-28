import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { registryClient, IMAGE_DEFINITIONS } from './registryClient'
import { imageOperations } from './imageOperations'

export class ChangelogManager {
  private changelogPath: string

  constructor() {
    this.changelogPath = join(process.cwd(), 'CHANGELOG.md')
  }

  // Update CHANGELOG.md with new release information
  async updateChangelogFile(
    versionMap?: Record<string, string>,
    releaseNotes?: string[]
  ): Promise<void> {
    console.log(
      '📝 Updating CHANGELOG.md with release and container information...'
    )

    try {
      const currentDate = new Date().toISOString().split('T')[0]

      // Read existing CHANGELOG.md
      let content = ''
      if (existsSync(this.changelogPath)) {
        content = readFileSync(this.changelogPath, 'utf-8')
      } else {
        content = this.createInitialChangelogContent()
      }

      // If we have a version map, create a new release entry
      if (versionMap && Object.keys(versionMap).length > 0) {
        const overallVersion = this.getHighestVersion(versionMap)
        content = this.addReleaseEntry(
          content,
          overallVersion,
          currentDate,
          versionMap,
          releaseNotes || []
        )
      }

      // Write updated content
      writeFileSync(this.changelogPath, content)

      console.log('✅ CHANGELOG.md updated successfully')

      if (versionMap) {
        const overallVersion = this.getHighestVersion(versionMap)
        console.log(`🚀 New version: ${overallVersion}`)
      }
    } catch (error: any) {
      console.error('❌ Error updating CHANGELOG.md:', error.message)
      throw error
    }
  }

  // Sync sizes only (for --sync-only flag)
  async syncAllSizes(): Promise<void> {
    console.log('🔄 Syncing sizes in CHANGELOG.md and README files...')

    try {
      // Get real-time sizes
      const sizes = await imageOperations.getAllImageSizes()

      // Update README files
      await imageOperations.updateReadmeFiles(sizes)

      // Update CHANGELOG.md with new sizes
      await this.updateChangelogFile()

      console.log('✅ All sizes synced successfully!')
    } catch (error: any) {
      console.error('❌ Error syncing sizes:', error.message)
      throw error
    }
  }

  private createInitialChangelogContent(): string {
    return `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of DevContainer configurations

---

*This file is automatically updated by our CI/CD workflows.*`
  }

  private getHighestVersion(versionMap: Record<string, string>): string {
    const versions = Object.values(versionMap)
    return versions.sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.split('.').map(Number)
      const [bMajor, bMinor, bPatch] = b.split('.').map(Number)
      if (aMajor !== bMajor) return bMajor - aMajor
      if (aMinor !== bMinor) return bMinor - aMinor
      return bPatch - aPatch
    })[0]
  }

  private addReleaseEntry(
    content: string,
    version: string,
    date: string,
    versionMap: Record<string, string>,
    releaseNotes: string[]
  ): string {
    // Generate Released Versions table for this release
    const releasedVersionsTable = this.generateReleasedVersionsTable(
      versionMap,
      date
    )

    // Create the release entry (without Container Images section)
    const releaseEntry = `## [${version}] - ${date}

${releasedVersionsTable}

${releaseNotes.join('\n')}

---

`

    // Insert the new release entry right after the file header
    // Find the end of the header (after "All notable changes..." line)
    const headerEndMatch = content.match(
      /All notable changes to this project will be documented in this file\.\s*\n\s*\n/
    )

    if (headerEndMatch) {
      const insertPosition =
        content.indexOf(headerEndMatch[0]) + headerEndMatch[0].length
      content =
        content.slice(0, insertPosition) +
        releaseEntry +
        content.slice(insertPosition)
    } else {
      // Fallback: insert after the first blank line following the title
      const firstHeadingIndex = content.indexOf('# Changelog')
      if (firstHeadingIndex !== -1) {
        const afterTitle = content.indexOf('\n\n', firstHeadingIndex)
        if (afterTitle !== -1) {
          content =
            content.slice(0, afterTitle + 2) +
            releaseEntry +
            content.slice(afterTitle + 2)
        } else {
          content += '\n' + releaseEntry
        }
      } else {
        content += '\n' + releaseEntry
      }
    }

    return content
  }

  private generateReleasedVersionsTable(
    versionMap: Record<string, string>,
    date: string
  ): string {
    const rows = Object.entries(versionMap).map(([container, version]) => {
      // Generate registry links
      const ghcrLink = `[GHCR](https://ghcr.io/iamvikshan/devcontainers/${container}:${version})`
      const dockerLink = `[Docker Hub](https://hub.docker.com/r/vikshan/${container})`
      const gitlabLink = `[GitLab](https://registry.gitlab.com/vikshan/devcontainers/${container}:${version})`
      const registryLinks = `${ghcrLink} · ${dockerLink} · ${gitlabLink}`

      return `| ${container} | v${version} | ${date} | ${registryLinks} |`
    })

    return [
      '### Released Versions',
      '',
      '| Container | Version | Date | Registry Links |',
      '| --------- | ------- | ---- | -------------- |',
      ...rows,
      ''
    ].join('\n')
  }

  private generateContainerUpdatesSection(
    versionMap: Record<string, string>
  ): string {
    let section = ''
    for (const [container, version] of Object.entries(versionMap)) {
      section += `- **${container}**: Updated to v${version}\n`
    }
    return section
  }

  private generateContainerInfoSection(
    versionMap: Record<string, string>,
    sizes: any,
    baseImageDigests: Record<string, string>,
    toolVersions: any[]
  ): string {
    let section = ''

    for (const imageName of IMAGE_DEFINITIONS.names) {
      if (!versionMap[imageName]) continue // Only include containers that were updated

      const imageSize = sizes[imageName]?.ghcr?.size_mb || 0
      const baseImage =
        (IMAGE_DEFINITIONS.baseImages as any)[imageName] || 'unknown'
      const digest = baseImageDigests[imageName] || 'unknown'
      const version = versionMap[imageName]

      // Get tool versions for this container
      const containerToolVersions = toolVersions.find(
        tv => tv.container === imageName
      )
      const tools = containerToolVersions?.versions || {}

      // Generate tools description
      const toolsDesc = this.generateToolsDescription(imageName, tools)

      // Generate emoji based on container type
      const emoji = this.getContainerEmoji(imageName)

      section += `### ${emoji} ${imageName}

- **Version:** v${version}
- **Base Image:** \`${baseImage}\`
- **Base Image Digest:** \`${digest}\`
- **Tools:** ${toolsDesc}
- **Size:** ~${imageSize.toFixed(2)} MB
- **Registries:**
  - GitHub: \`ghcr.io/iamvikshan/devcontainers/${imageName}:v${version}\`
  - GitLab: \`registry.gitlab.com/vikshan/devcontainers/${imageName}:v${version}\`
  - Docker Hub: \`docker.io/vikshan/${imageName}:v${version}\`

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
    if (
      imageName.includes('ubuntu') &&
      imageName.includes('node') &&
      !imageName.includes('gitpod')
    ) {
      toolsList.push('ESLint (non-root)')
    }

    return toolsList.length > 0
      ? toolsList.join(', ')
      : 'Basic development tools'
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
      } catch (error: any) {
        console.error(`Error getting digest for ${baseImage}:`, error.message)
        digests[imageName] = 'sha256:unknown'
      }
    }

    return digests
  }
}

// Export singleton instance
export const changelogManager = new ChangelogManager()

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

  console.log('🔄 Changelog Manager Starting...\n')

  try {
    if (syncOnly) {
      // Just sync sizes between README and CHANGELOG.md
      console.log('📊 Syncing sizes only...')
      await changelogManager.syncAllSizes()
    } else if (versionMapArg) {
      // Update with version map from new release system
      console.log('📝 Updating CHANGELOG.md with version map...')
      const versionMap = JSON.parse(versionMapArg)

      await changelogManager.updateChangelogFile(versionMap, releaseNotes)
    } else {
      // Full version update with real-time data
      console.log('📝 Updating CHANGELOG.md with real-time data...')
      await changelogManager.updateChangelogFile()
    }

    console.log('\n🎉 Changelog management complete!')
  } catch (error: any) {
    console.error('❌ Changelog management failed:', error.message)
    process.exit(1)
  }
}

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error)
}
