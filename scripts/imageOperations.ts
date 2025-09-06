import {
  registryClient,
  IMAGE_DEFINITIONS,
  RegistryClient
} from './registryClient'
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

    this.log(
      `🔍 Starting base image update check for ${IMAGE_DEFINITIONS.names.length} containers...`
    )

    for (const containerName of IMAGE_DEFINITIONS.names) {
      const baseImage = RegistryClient.getBaseImageForContainer(containerName)
      if (!baseImage) {
        this.logError(`⚠️  No base image found for ${containerName}`)
        continue
      }

      this.log(`🔍 Checking ${containerName} (base: ${baseImage})`)

      try {
        // Add timeout and retry logic
        const result = await this.checkSingleImageWithRetry(
          containerName,
          baseImage
        )
        if (result) {
          updates.push(result)
        }
      } catch (error) {
        this.logError(`❌ Error checking ${containerName}: ${error.message}`)
        // Add a failed check entry to maintain consistency
        updates.push({
          containerName,
          baseImage: `${baseImage}:latest`,
          hasUpdate: false,
          currentDigest: 'error',
          latestDigest: 'error',
          lastUpdated: new Date().toISOString()
        })
      }
    }

    this.log(
      `✅ Completed base image check. Found ${updates.filter(u => u.hasUpdate).length} updates.`
    )
    return updates
  }

  // Check a single image with retry logic
  private async checkSingleImageWithRetry(
    containerName: string,
    baseImage: string,
    maxRetries: number = 3
  ): Promise<BaseImageUpdate | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Add timeout wrapper
        const result = await Promise.race([
          this.checkSingleImage(containerName, baseImage),
          this.timeoutPromise(30000) // 30 second timeout
        ])

        return result
      } catch (error) {
        this.logError(
          `Attempt ${attempt}/${maxRetries} failed for ${containerName}: ${error.message}`
        )

        if (attempt === maxRetries) {
          throw error
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }

    return null
  }

  // Timeout promise helper
  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error(`Operation timed out after ${ms}ms`)),
        ms
      )
    })
  }

  // Check a single image (extracted from original logic)
  private async checkSingleImage(
    containerName: string,
    baseImage: string
  ): Promise<BaseImageUpdate> {
    // Get the latest digest from the base image registry
    const latestDigest = await this.getLatestBaseImageDigest(baseImage)
    const tags = await registryClient.getDockerHubTags(baseImage)
    const latestTag = tags.find(t => t.name === 'latest')

    if (!latestDigest || !latestTag) {
      throw new Error(`Could not get digest or tags for ${baseImage}`)
    }

    // With daily checks, we can be more responsive - check for updates in last 1 day
    const baseImageDate = new Date(latestTag.last_updated)
    const daysSinceUpdate =
      (Date.now() - baseImageDate.getTime()) / (1000 * 60 * 60 * 24)
    const hasUpdate = daysSinceUpdate < 1 // Updated in last 1 day

    const result: BaseImageUpdate = {
      containerName,
      baseImage: `${baseImage}:latest`,
      hasUpdate,
      currentDigest: 'auto-check',
      latestDigest: latestDigest.substring(0, 12),
      lastUpdated: latestTag.last_updated
    }

    if (hasUpdate) {
      this.log(
        `  🔄 Update available - base image updated ${Math.floor(daysSinceUpdate * 24)} hours ago`
      )
    } else {
      this.log(
        `  ✅ Up to date - last updated ${Math.floor(daysSinceUpdate)} days ago`
      )
    }

    this.log(
      `  📊 Base image last updated: ${baseImageDate.toLocaleDateString()}`
    )
    this.log(`  🔗 Digest: ${latestDigest.substring(0, 12)}`)

    return result
  }

  // Get latest digest for a base image
  private async getLatestBaseImageDigest(
    baseImage: string
  ): Promise<string | null> {
    try {
      const tags = await registryClient.getDockerHubTags(baseImage)
      const latestTag = tags.find(t => t.name === 'latest')
      return latestTag?.digest || null
    } catch (error) {
      this.logError(`Error getting digest for ${baseImage}: ${error.message}`)
      return null
    }
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
      'docs/IMAGE_VARIANTS.md',
      'base/bun/README.md',
      'base/bun-node/README.md',
      'base/ubuntu/README.md',
      'gitpod/bun/README.md',
      'gitpod/bun-node/README.md',
      'gitpod/ubuntu-bun/README.md',
      'gitpod/ubuntu-bun-node/README.md'
    ]

    for (const readmePath of readmeFiles) {
      try {
        await this.updateSingleReadme(readmePath, sizeMap)
        this.log(`✅ Updated ${readmePath}`)
      } catch (error) {
        this.logError(`❌ Error updating ${readmePath}: ${error.message}`)
      }
    }
  }

  private async updateSingleReadme(
    readmePath: string,
    sizeMap: Map<string, Map<string, number>>
  ): Promise<void> {
    const content = readFileSync(readmePath, 'utf8')
    let updatedContent = content

    // Handle main README.md with new table format
    if (readmePath === 'README.md') {
      // Update the image comparison table
      const tablePattern = /(\| \*\*[^*]+\*\* +\| ~)\d+( MB)/g

      updatedContent = updatedContent.replace(
        tablePattern,
        (match, prefix, suffix) => {
          // Extract image name from the table row
          const imageMatch = match.match(/\*\*([^*]+)\*\*/)
          if (!imageMatch) return match

          const imageName = imageMatch[1]
          const registryMap = sizeMap.get(imageName)
          if (!registryMap) return match

          // Use GitHub Container Registry size as primary
          const size = registryMap.get('ghcr.io')
          if (!size) return match

          const sizeInMB = Math.round(size / (1024 * 1024))
          return `${prefix}${sizeInMB}${suffix}`
        }
      )
    } else if (readmePath === 'docs/IMAGE_VARIANTS.md') {
      // Update IMAGE_VARIANTS.md with new format
      // Update the comparison table
      const tablePattern = /(\| \*\*Size\*\* +\| ~)\d+( MB)/g
      updatedContent = updatedContent.replace(
        tablePattern,
        (match, prefix, suffix) => {
          // This updates the "Size" column in the comparison table
          const rowMatch = updatedContent.match(
            new RegExp(`\\| \\*\\*([^*]+)\\*\\* +\\| ~\\d+ MB`, 'g')
          )
          // For IMAGE_VARIANTS, we need to update each row individually
          return match // Keep original for now, will be updated by individual image sections
        }
      )

      // Update individual image section headers with sizes
      const imageSectionPattern = /### \d+\. ([^(]+) \(~\d+ MB\)/g
      updatedContent = updatedContent.replace(
        imageSectionPattern,
        (match, imageName) => {
          const cleanImageName = imageName.trim()
          const registryMap = sizeMap.get(cleanImageName)
          if (!registryMap) return match

          const size = registryMap.get('ghcr.io')
          if (!size) return match

          const sizeInMB = Math.round(size / (1024 * 1024))
          return match.replace(/~\d+ MB/, `~${sizeInMB} MB`)
        }
      )
    } else {
      // Handle individual README files with old format (if any exist)
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
    }

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

// CLI functionality
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--analyze') || args.includes('--analyze-sizes')) {
    console.log('🔍 Starting comprehensive image size analysis...\n')
    try {
      await imageOperations.analyzeImageSizes()
    } catch (error) {
      console.error('❌ Error analyzing image sizes:', error.message)
      process.exit(1)
    }
  } else if (args.includes('--sync-sizes')) {
    console.log('🔄 Syncing README sizes...\n')
    try {
      const sizes = await imageOperations.getAllImageSizes()
      await imageOperations.updateReadmeFiles(sizes)
      console.log('✅ README sizes synced successfully!')
    } catch (error) {
      console.error('❌ Error syncing sizes:', error.message)
      process.exit(1)
    }
  } else {
    console.log('Usage:')
    console.log(
      '  --analyze, --analyze-sizes  Analyze image sizes across registries'
    )
    console.log('  --sync-sizes               Sync sizes in README files')
  }
}

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error)
}
