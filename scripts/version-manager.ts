import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { registryClient, IMAGE_DEFINITIONS } from './registry-client'
import { imageOperations } from './image-operations'

interface VersionsFile {
  version: string
  release_date: string
  last_updated: string
  images: Record<string, ImageVersion>
  release_notes: string[]
  automation: any
  next_release: any
}

interface ImageVersion {
  version: string
  base_image: string
  base_image_digest: string
  tools: Record<string, string>
  registries: Record<string, RegistryInfo>
  changelog: string[]
}

interface RegistryInfo {
  url: string
  size_mb: number
  layers: number
  last_pushed: string
}

export class VersionManager {
  private versionsPath: string

  constructor() {
    this.versionsPath = join(process.cwd(), 'versions.json')
  }

  // Get real-time image sizes from all registries
  async getRealTimeSizes(): Promise<
    Record<string, Record<string, { size_mb: number; layers: number }>>
  > {
    console.log('🔍 Getting real-time image sizes from all registries...')

    const result: Record<
      string,
      Record<string, { size_mb: number; layers: number }>
    > = {}

    try {
      const sizes = await imageOperations.getAllImageSizes()

      sizes.forEach(size => {
        if (!result[size.name]) {
          result[size.name] = {}
        }

        const registryKey = this.getRegistryKey(size.registry)
        result[size.name][registryKey] = {
          size_mb: Math.round((size.size / (1024 * 1024)) * 100) / 100,
          layers: size.layers
        }
      })

      console.log(
        `✅ Retrieved sizes for ${Object.keys(result).length} images across ${sizes.length} registry entries`
      )
    } catch (error) {
      console.error('❌ Error getting real-time sizes:', error.message)
      console.log('📋 Will use fallback data from versions.json')
    }

    return result
  }

  // Get tool versions by inspecting containers (when available)
  async getToolVersions(): Promise<Record<string, Record<string, string>>> {
    console.log('🔍 Detecting tool versions...')

    // For now, we'll use a combination of base image inspection and known versions
    // In the future, this could run actual container commands to get versions

    const toolVersions: Record<string, Record<string, string>> = {}

    for (const imageName of IMAGE_DEFINITIONS.names) {
      const baseImage = IMAGE_DEFINITIONS.baseImages[imageName]

      if (baseImage?.includes('oven/bun')) {
        // Bun-based images
        toolVersions[imageName] = {
          bun: await this.getBunVersion(),
          git: await this.getGitVersion(baseImage)
        }

        if (imageName.includes('node')) {
          toolVersions[imageName].node = await this.getNodeVersion()
          toolVersions[imageName].npm = await this.getNpmVersion()
          toolVersions[imageName].eslint = 'global'
        }
      } else if (baseImage?.includes('ubuntu')) {
        // Ubuntu-based images
        toolVersions[imageName] = {
          bun: await this.getBunVersion(),
          git: await this.getGitVersion('ubuntu')
        }

        if (imageName.includes('node')) {
          toolVersions[imageName].node = await this.getNodeVersion()
          toolVersions[imageName].npm = await this.getNpmVersion()
          toolVersions[imageName].eslint = 'global (non-root)'
        }
      }
    }

    return toolVersions
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

  // Update versions.json with real-time data
  async updateVersionsFile(
    newVersion?: string,
    releaseNotes?: string[]
  ): Promise<void> {
    console.log('📝 Updating versions.json with real-time data...')

    try {
      // Read current versions file
      const currentVersions: VersionsFile = JSON.parse(
        readFileSync(this.versionsPath, 'utf8')
      )

      // Get real-time data
      const [sizes, toolVersions, baseImageDigests] = await Promise.all([
        this.getRealTimeSizes(),
        this.getToolVersions(),
        this.getBaseImageDigests()
      ])

      const currentTime = new Date().toISOString()

      // Update version if provided
      if (newVersion) {
        currentVersions.version = newVersion
        currentVersions.release_date = currentTime
      }

      currentVersions.last_updated = currentTime

      // Update each image
      for (const [imageName, imageData] of Object.entries(
        currentVersions.images
      )) {
        // Update version
        if (newVersion) {
          imageData.version = newVersion
        }

        // Update base image digest
        if (baseImageDigests[imageName]) {
          imageData.base_image_digest = baseImageDigests[imageName]
        }

        // Update tool versions
        if (toolVersions[imageName]) {
          imageData.tools = toolVersions[imageName]
        }

        // Update registry information with real-time sizes
        if (sizes[imageName]) {
          for (const [registryKey, registryInfo] of Object.entries(
            imageData.registries
          )) {
            if (sizes[imageName][registryKey]) {
              registryInfo.size_mb = sizes[imageName][registryKey].size_mb
              registryInfo.layers = sizes[imageName][registryKey].layers
              registryInfo.last_pushed = currentTime
            }
          }
        }
      }

      // Add release notes if provided
      if (releaseNotes && releaseNotes.length > 0) {
        currentVersions.release_notes = releaseNotes
      }

      // Update next release estimate (next Sunday 2 AM UTC)
      const nextRelease = new Date()
      const daysUntilSunday = (7 - nextRelease.getUTCDay()) % 7 || 7 // Get days until next Sunday
      nextRelease.setDate(nextRelease.getDate() + daysUntilSunday)
      nextRelease.setUTCHours(2, 0, 0, 0)
      currentVersions.next_release.estimated_date = nextRelease.toISOString()

      // Write updated versions file
      writeFileSync(this.versionsPath, JSON.stringify(currentVersions, null, 2))

      console.log('✅ versions.json updated successfully')
      console.log(
        `📊 Updated ${Object.keys(currentVersions.images).length} images`
      )
      console.log(`🕒 Last updated: ${currentTime}`)

      if (newVersion) {
        console.log(`🚀 New version: ${newVersion}`)
      }
    } catch (error) {
      console.error('❌ Error updating versions file:', error.message)
      throw error
    }
  }

  // Sync sizes between README and versions.json
  async syncAllSizes(): Promise<void> {
    console.log('🔄 Syncing sizes between README and versions.json...')

    try {
      // Get real-time sizes
      const sizes = await imageOperations.getAllImageSizes()

      // Update README files
      await imageOperations.updateReadmeFiles(sizes)

      // Update versions.json
      await this.updateVersionsFile()

      console.log('✅ All sizes synced successfully!')
    } catch (error) {
      console.error('❌ Error syncing sizes:', error.message)
      throw error
    }
  }

  // Helper methods for version detection
  private async getBunVersion(): Promise<string> {
    // This could be enhanced to check the actual Bun version from Docker Hub API
    return '1.2.19' // Current stable version
  }

  private async getNodeVersion(): Promise<string> {
    return 'v24.5.0' // Current LTS version
  }

  private async getNpmVersion(): Promise<string> {
    return '11.5.1' // Version that comes with Node.js 24.5.0
  }

  private async getGitVersion(baseImage: string): Promise<string> {
    // Different base images have different Git versions
    if (baseImage.includes('ubuntu')) {
      return '2.43.0' // Ubuntu's Git version
    } else {
      return '2.39.5' // Alpine/Bun image Git version
    }
  }

  private getRegistryKey(registryUrl: string): string {
    if (registryUrl.includes('ghcr.io')) return 'ghcr'
    if (registryUrl.includes('gitlab.com')) return 'gitlab'
    if (registryUrl.includes('docker.io')) return 'dockerhub'
    return 'unknown'
  }
}

// Export singleton instance
export const versionManager = new VersionManager()
