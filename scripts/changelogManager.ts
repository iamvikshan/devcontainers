import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { registryClient, IMAGE_DEFINITIONS } from './registryClient'
import { imageOperations } from './imageOperations'

export class ChangelogManager {
  private changelogPath: string
  private silent: boolean = false

  constructor() {
    this.changelogPath = join(process.cwd(), 'CHANGELOG.md')
  }

  setSilent(silent: boolean): void {
    this.silent = silent
  }

  private log(message: string): void {
    // In workflow/silent mode we route informational logs to stderr so
    // the caller can safely capture stdout for machine-readable output.
    if (this.silent) {
      console.error(message)
    } else {
      console.log(message)
    }
  }

  // Update CHANGELOG.md with new release information
  async updateChangelogFile(
    versionMap?: Record<string, string>,
    releaseNotes?: string[]
  ): Promise<void> {
    this.log(
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

      this.log('✅ CHANGELOG.md updated successfully')

      if (versionMap) {
        const overallVersion = this.getHighestVersion(versionMap)
        this.log(`🚀 New version: ${overallVersion}`)
      }
    } catch (error: any) {
      console.error('❌ Error updating CHANGELOG.md:', error.message)
      throw error
    }
  }

  // Sync sizes only (for --sync-only flag)
  async syncAllSizes(): Promise<void> {
    this.log('🔄 Syncing sizes in CHANGELOG.md and README files...')

    try {
      // Get real-time sizes
      const sizes = await imageOperations.getAllImageSizes()

      // Update README files
      await imageOperations.updateReadmeFiles(sizes)

      // Update CHANGELOG.md with new sizes
      await this.updateChangelogFile()

      this.log('✅ All sizes synced successfully!')
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
    } else if (imageName.includes('node')) {
      toolsList.push('ESLint (global)')
    }

    if (tools.git_version) {
      toolsList.push(`Git ${tools.git_version}`)
    }

    if (tools.curl_version) {
      toolsList.push(`curl ${tools.curl_version}`)
    }

    // Add special notes for certain containers
    if (imageName.includes('ubuntu') && imageName.includes('node')) {
      toolsList.push('ESLint (non-root)')
    }

    return toolsList.length > 0
      ? toolsList.join(', ')
      : 'Basic development tools'
  }

  private getContainerEmoji(imageName: string): string {
    if (imageName.includes('ubuntu')) {
      return '🐧' // Ubuntu penguin
    } else {
      return '🚀' // Default rocket
    }
  }

  private loadToolVersions(): any[] {
    // Tool versions should now be loaded from container-versions.json
    return []
  }

  // Get base image digests
  async getBaseImageDigests(): Promise<Record<string, string>> {
    this.log('🔍 Getting base image digests...')

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

  /**
   * Update only the Released Versions table in CHANGELOG.md
   * This is used by the workflow to quickly update version numbers without full changelog generation
   */
  async updateVersionsTable(versionMap: Record<string, string>): Promise<void> {
    this.log('📝 Updating Released Versions table in CHANGELOG.md...')

    if (!existsSync(this.changelogPath)) {
      throw new Error('CHANGELOG.md not found')
    }

    let content = readFileSync(this.changelogPath, 'utf-8')
    const currentDate = new Date().toISOString().split('T')[0]

    // Find the Released Versions table
    const tableRegex = /## Released Versions\s+([\s\S]*?)(?=\n---)/
    const tableMatch = content.match(tableRegex)

    if (!tableMatch) {
      throw new Error('Released Versions table not found in CHANGELOG.md')
    }

    const tableContent = tableMatch[1]
    const lines = tableContent.split('\n')

    // Update the table rows
    const updatedLines = lines.map(line => {
      if (
        !line.includes('|') ||
        line.includes('Container') ||
        line.includes('---')
      ) {
        return line
      }

      const cells = line
        .split('|')
        .map(c => c.trim())
        .filter(Boolean)

      if (cells.length < 3) return line

      const containerName = cells[0]

      // Check if this container was updated
      if (versionMap[containerName]) {
        const newVersion = versionMap[containerName]
        cells[1] = `v${newVersion}`
        cells[2] = currentDate
        return `| ${cells.join(' | ')} |`
      }

      return line
    })

    // Replace the table in the content
    const updatedTable = updatedLines.join('\n')
    const newContent = content.replace(
      tableRegex,
      `## Released Versions\n${updatedTable}\n`
    )

    writeFileSync(this.changelogPath, newContent)

    this.log('✅ Released Versions table updated successfully')
    this.log(`📦 Updated versions: ${Object.keys(versionMap).join(', ')}`)
  }
}

// Export singleton instance
export const changelogManager = new ChangelogManager()

// CLI functionality
async function main() {
  const args = process.argv.slice(2)
  const workflowMode = args.includes('--workflow')
  // Respect workflow mode by routing informational logs to stderr
  changelogManager.setSilent(workflowMode)
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
  const updateTableOnly = args.includes('--update-table')

  if (workflowMode) {
    console.error('🔄 Changelog Manager Starting...\n')
  } else {
    console.log('🔄 Changelog Manager Starting...\n')
  }

  try {
    if (syncOnly) {
      // Just sync sizes between README and CHANGELOG.md
      if (workflowMode) console.error('📊 Syncing sizes only...')
      else console.log('📊 Syncing sizes only...')
      await changelogManager.syncAllSizes()
    } else if (updateTableOnly && versionMapArg) {
      // Just update the Released Versions table
      if (workflowMode)
        console.error('📝 Updating Released Versions table only...')
      else console.log('📝 Updating Released Versions table only...')
      const versionMap = JSON.parse(versionMapArg)
      await changelogManager.updateVersionsTable(versionMap)
    } else if (versionMapArg) {
      // Update with version map from new release system
      if (workflowMode)
        console.error('📝 Updating CHANGELOG.md with version map...')
      else console.log('📝 Updating CHANGELOG.md with version map...')
      const versionMap = JSON.parse(versionMapArg)

      await changelogManager.updateChangelogFile(versionMap, releaseNotes)
    } else {
      // Full version update with real-time data
      if (workflowMode)
        console.error('📝 Updating CHANGELOG.md with real-time data...')
      else console.log('📝 Updating CHANGELOG.md with real-time data...')
      await changelogManager.updateChangelogFile()
    }

    if (workflowMode) console.error('\n🎉 Changelog management complete!')
    else console.log('\n🎉 Changelog management complete!')
  } catch (error: any) {
    console.error('❌ Changelog management failed:', error.message)
    process.exit(1)
  }
}

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error)
}
