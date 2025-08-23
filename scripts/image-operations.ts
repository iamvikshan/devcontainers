import {
  registryClient,
  IMAGE_DEFINITIONS,
  RegistryClient
} from './registry-client'
import { readFileSync, writeFileSync } from 'fs'

export interface ImageSizeInfo {
  name: string
  registry: string
  size: number
  layers: number
  lastUpdated: string
}

export interface BaseImageUpdate {
  containerName: string
  baseImage: string
  hasUpdate: boolean
  currentDigest: string
  latestDigest: string
  lastUpdated: string
}

export class ImageOperations {
  private static instance: ImageOperations
  private silent = false

  private constructor() {}

  public static getInstance(): ImageOperations {
    if (!ImageOperations.instance) {
      ImageOperations.instance = new ImageOperations()
    }
    return ImageOperations.instance
  }

  public setSilent(silent: boolean): void {
    this.silent = silent
  }

  private log(message: string): void {
    if (!this.silent) {
      console.log(message)
    }
  }

  private logError(message: string): void {
    if (!this.silent) {
      console.error(message)
    }
  }

  // Get sizes for all images across all registries
  public async getAllImageSizes(): Promise<ImageSizeInfo[]> {
    const results: ImageSizeInfo[] = []
    const imagePaths = RegistryClient.getAllImagePaths()

    // GitHub Container Registry
    for (const imagePath of imagePaths.ghcr) {
      const manifest = await registryClient.getGHCRManifest(
        imagePath.replace('ghcr.io/', '')
      )
      if (manifest) {
        results.push({
          name: imagePath.split('/').pop() || '',
          registry: 'ghcr.io',
          size: manifest.totalSize,
          layers: manifest.layerCount,
          lastUpdated: new Date().toISOString()
        })
      }
    }

    // GitLab Container Registry
    for (const imagePath of imagePaths.gitlab) {
      const manifest = await registryClient.getGitLabManifest(
        imagePath.replace('registry.gitlab.com/', '')
      )
      if (manifest) {
        results.push({
          name: imagePath.split('/').pop() || '',
          registry: 'registry.gitlab.com',
          size: manifest.totalSize,
          layers: manifest.layerCount,
          lastUpdated: new Date().toISOString()
        })
      }
    }

    // Docker Hub
    for (const imagePath of imagePaths.dockerhub) {
      const size = await registryClient.getDockerHubImageSize(
        imagePath.replace('docker.io/', '')
      )
      if (size > 0) {
        results.push({
          name: imagePath.split('/').pop() || '',
          registry: 'docker.io',
          size,
          layers: 0, // Docker Hub API doesn't provide layer count easily
          lastUpdated: new Date().toISOString()
        })
      }
    }

    return results
  }

  // Check for base image updates
  public async checkBaseImageUpdates(): Promise<BaseImageUpdate[]> {
    const updates: BaseImageUpdate[] = []

    for (const containerName of IMAGE_DEFINITIONS.names) {
      const baseImage = RegistryClient.getBaseImageForContainer(containerName)
      if (!baseImage) continue

      this.log(`🔍 Checking ${containerName} (base: ${baseImage})`)

      try {
        const tags = await registryClient.getDockerHubTags(baseImage)
        const latestTag = tags.find(t => t.name === 'latest')

        if (latestTag) {
          // For now, we'll assume updates are available if the base image was updated recently
          const baseImageDate = new Date(latestTag.last_updated)
          const daysSinceUpdate =
            (Date.now() - baseImageDate.getTime()) / (1000 * 60 * 60 * 24)

          updates.push({
            containerName,
            baseImage: `${baseImage}:latest`,
            hasUpdate: daysSinceUpdate < 7, // Consider it an update if base image was updated in last 7 days
            currentDigest: latestTag.digest?.substring(0, 12) || '',
            latestDigest: latestTag.digest?.substring(0, 12) || '',
            lastUpdated: latestTag.last_updated
          })

          this.log(
            `  📊 Base image last updated: ${baseImageDate.toLocaleDateString()}`
          )
          this.log(
            `  ${daysSinceUpdate < 7 ? '🔄 Update available' : '✅ Up to date'}`
          )
        }
      } catch (error) {
        this.logError(`Error checking ${containerName}:`, error.message)
      }
    }

    return updates
  }

  // Update README files with current sizes
  public async updateReadmeFiles(sizes: ImageSizeInfo[]): Promise<void> {
    const sizeMap = new Map<string, Map<string, number>>()

    // Organize sizes by image name and registry
    sizes.forEach(size => {
      if (!sizeMap.has(size.name)) {
        sizeMap.set(size.name, new Map())
      }
      sizeMap.get(size.name)!.set(size.registry, size.size)
    })

    const readmeFiles = [
      'README.md',
      'base/bun/README.md',
      'base/bun-node/README.md',
      'base/ubuntu/README.md'
    ]

    for (const readmePath of readmeFiles) {
      try {
        await this.updateSingleReadme(readmePath, sizeMap)
        this.log(`✅ Updated ${readmePath}`)
      } catch (error) {
        this.logError(`❌ Error updating ${readmePath}:`, error.message)
      }
    }
  }

  private async updateSingleReadme(
    readmePath: string,
    sizeMap: Map<string, Map<string, number>>
  ): Promise<void> {
    const content = readFileSync(readmePath, 'utf8')
    let updatedContent = content

    // Update patterns for different registries
    const patterns = {
      ghcr: /`ghcr\.io\/[^`]+:latest`.*?~\s*\d+(?:\.\d+)?\s*MiB/g,
      gitlab:
        /`registry\.gitlab\.com\/[^`]+:latest`.*?~\s*\d+(?:\.\d+)?\s*MiB/g,
      dockerhub: /`docker\.io\/[^`]+:latest`.*?~\s*\d+(?:\.\d+)?\s*MiB/g
    }

    // Update each pattern
    Object.entries(patterns).forEach(([registry, pattern]) => {
      updatedContent = updatedContent.replace(pattern, match => {
        // Extract image name from the match
        const imageNameMatch = match.match(/([^\/]+):latest/)
        if (!imageNameMatch) return match

        const imageName = imageNameMatch[1]
        const registryMap = sizeMap.get(imageName)
        if (!registryMap) return match

        let registryKey = registry
        if (registry === 'dockerhub') registryKey = 'docker.io'
        if (registry === 'gitlab') registryKey = 'registry.gitlab.com'
        if (registry === 'ghcr') registryKey = 'ghcr.io'

        const size = registryMap.get(registryKey)
        if (!size) return match

        const sizeInMB = RegistryClient.formatSize(size)
        return match.replace(/~\s*\d+(?:\.\d+)?\s*MiB/, `~ ${sizeInMB} MiB`)
      })
    })

    writeFileSync(readmePath, updatedContent)
  }

  // Analyze image sizes and detect bloat
  public async analyzeImageSizes(): Promise<void> {
    this.log('🔍 Starting comprehensive image size analysis...\n')

    const sizes = await this.getAllImageSizes()

    if (sizes.length === 0) {
      this.log('❌ No image size data available')
      return
    }

    // Group by image name
    const imageGroups = new Map<string, ImageSizeInfo[]>()
    sizes.forEach(size => {
      if (!imageGroups.has(size.name)) {
        imageGroups.set(size.name, [])
      }
      imageGroups.get(size.name)!.push(size)
    })

    this.log('📊 IMAGE SIZE ANALYSIS REPORT')
    this.log('='.repeat(80))

    let hasBloat = false

    imageGroups.forEach((imageSizes, imageName) => {
      this.log(`\n🐳 ${imageName.toUpperCase()}`)
      this.log('-'.repeat(40))

      imageSizes.forEach(size => {
        const sizeInMB = RegistryClient.formatSize(size.size)
        this.log(`  ${size.registry}: ${sizeInMB} MB (${size.layers} layers)`)
      })

      // Check for size discrepancies
      if (imageSizes.length > 1) {
        const sizes = imageSizes.map(s => s.size)
        const minSize = Math.min(...sizes)
        const maxSize = Math.max(...sizes)
        const sizeDiff = maxSize - minSize
        const sizeRatio = maxSize / minSize

        if (sizeDiff > 10 * 1024 * 1024) {
          // More than 10MB difference
          const diffInMB = RegistryClient.formatSize(sizeDiff)
          this.log(
            `  ⚠️  Size difference: ${diffInMB} MB (${sizeRatio.toFixed(1)}x)`
          )

          if (sizeRatio > 2) {
            this.log(`  🚨 SIGNIFICANT SIZE BLOAT DETECTED!`)
            hasBloat = true
          }
        }
      }
    })

    this.log('\n💡 RECOMMENDATIONS')
    this.log('-'.repeat(40))

    if (hasBloat) {
      this.log('🔧 Size bloat detected. Consider:')
      this.log('  1. Combining RUN commands to reduce layers')
      this.log('  2. Cleaning package caches in the same layer')
      this.log('  3. Using multi-stage builds')
      this.log('  4. Reviewing .dockerignore files')
    } else {
      this.log('✅ No significant size bloat detected!')
      this.log('📈 Images are well-optimized across registries')
    }

    this.log('\n✅ Analysis complete!')
  }
}

// Export singleton instance
export const imageOperations = ImageOperations.getInstance()
