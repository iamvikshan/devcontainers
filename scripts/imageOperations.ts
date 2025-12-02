import {
  registryClient,
  IMAGE_DEFINITIONS,
  RegistryClient
} from './registryClient'
import { readFileSync, writeFileSync, existsSync } from 'fs'

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
        this.logError(
          `❌ Error checking ${containerName}: ${error instanceof Error ? error.message : String(error)}`
        )
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
          `Attempt ${attempt}/${maxRetries} failed for ${containerName}: ${error instanceof Error ? error.message : String(error)}`
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
      this.logError(
        `Error getting digest for ${baseImage}: ${error instanceof Error ? error.message : String(error)}`
      )
      return null
    }
  }

  // Update README files with current sizes and tool versions
  public async updateReadmeFiles(sizes: ImageSizeInfo[]): Promise<void> {
    const sizeMap = new Map<string, Map<string, number>>()

    // Organize sizes by image name and registry
    sizes.forEach(size => {
      if (!sizeMap.has(size.name)) {
        sizeMap.set(size.name, new Map())
      }
      sizeMap.get(size.name)!.set(size.registry, size.size)
    })

    // Load tool versions from tool-versions.json if available
    const toolVersions = this.loadToolVersions()

    const readmeFiles = [
      'README.md',
      'docs/IMAGE_VARIANTS.md'
      // Note: Individual image directories don't have README files
      // All documentation is consolidated in the main README.md and docs/
    ]

    for (const readmePath of readmeFiles) {
      try {
        await this.updateSingleReadme(readmePath, sizeMap, toolVersions)
        this.log(`✅ Updated ${readmePath}`)
      } catch (error) {
        this.logError(
          `❌ Error updating ${readmePath}: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }
  }

  // Load tool versions from tool-versions.json
  // Load tool versions from container-versions.json
  private loadToolVersions(): Map<string, any> {
    const toolVersionMap = new Map<string, any>()
    try {
      const { join } = require('path')
      const versionsPath = join(process.cwd(), 'container-versions.json')
      if (existsSync(versionsPath)) {
        const content = readFileSync(versionsPath, 'utf-8')
        const versions = JSON.parse(content)
        Object.entries(versions).forEach(([container, info]: [string, any]) => {
          if (info.toolVersions) {
            toolVersionMap.set(container, info.toolVersions)
          }
        })
        this.log(
          `📊 Loaded tool versions for ${toolVersionMap.size} containers`
        )
      }
    } catch (error) {
      this.logError(
        `⚠️  Error loading tool versions: ${error instanceof Error ? error.message : String(error)}`
      )
    }
    return toolVersionMap
  }

  private async updateSingleReadme(
    readmePath: string,
    sizeMap: Map<string, Map<string, number>>,
    toolVersions: Map<string, any> = new Map()
  ): Promise<void> {
    // Check if the file exists before attempting to read it
    if (!existsSync(readmePath)) {
      throw new Error(`ENOENT: no such file or directory, open '${readmePath}'`)
    }

    const content = readFileSync(readmePath, 'utf8')
    let updatedContent = content

    // Handle main README.md with new table format
    if (readmePath === 'README.md') {
      // Update the image comparison table sizes
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

      // Update tool versions in README.md
      if (toolVersions.size > 0) {
        // Get Alpine-based image versions (from bun or bun-node)
        let alpineVersions: any = null
        for (const containerName of ['bun-node', 'bun']) {
          if (toolVersions.has(containerName)) {
            alpineVersions = toolVersions.get(containerName)
            this.log(`📋 Using Alpine tool versions from '${containerName}'`)
            break
          }
        }

        // Get Ubuntu-based image versions (from ubuntu-bun or ubuntu-bun-node)
        let ubuntuVersions: any = null
        for (const containerName of ['ubuntu-bun-node', 'ubuntu-bun']) {
          if (toolVersions.has(containerName)) {
            ubuntuVersions = toolVersions.get(containerName)
            this.log(`📋 Using Ubuntu tool versions from '${containerName}'`)
            break
          }
        }

        // Update Alpine-based Images section
        if (alpineVersions) {
          // Update Bun version for Alpine
          if (alpineVersions.bun_version) {
            updatedContent = updatedContent.replace(
              /(#### Alpine-based Images[\s\S]*?- \*\*Bun\*\* )[0-9.]+( - Fast JavaScript runtime)/,
              `$1${alpineVersions.bun_version}$2`
            )
            this.log(
              `  ✅ Updated Alpine Bun version to ${alpineVersions.bun_version}`
            )
          }

          // Update Node.js version for Alpine
          if (alpineVersions.node_version) {
            updatedContent = updatedContent.replace(
              /(#### Alpine-based Images[\s\S]*?- \*\*Node\.js\*\* )v[0-9.]+( _\(bun-node only\)_)/,
              `$1${alpineVersions.node_version}$2`
            )
            this.log(
              `  ✅ Updated Alpine Node.js version to ${alpineVersions.node_version}`
            )
          }

          // Update npm version for Alpine
          if (alpineVersions.npm_version) {
            updatedContent = updatedContent.replace(
              /(#### Alpine-based Images[\s\S]*?- \*\*npm\*\* )[0-9.]+( _\(bun-node only\)_)/,
              `$1${alpineVersions.npm_version}$2`
            )
            this.log(
              `  ✅ Updated Alpine npm version to ${alpineVersions.npm_version}`
            )
          }
        }

        // Update Ubuntu-based Images section
        if (ubuntuVersions) {
          // Update Bun version for Ubuntu
          if (ubuntuVersions.bun_version) {
            updatedContent = updatedContent.replace(
              /(#### Ubuntu-based Images[\s\S]*?- \*\*Bun\*\* )[0-9.]+( - Installed via script)/,
              `$1${ubuntuVersions.bun_version}$2`
            )
            this.log(
              `  ✅ Updated Ubuntu Bun version to ${ubuntuVersions.bun_version}`
            )
          }

          // Update Node.js version for Ubuntu
          if (ubuntuVersions.node_version) {
            updatedContent = updatedContent.replace(
              /(#### Ubuntu-based Images[\s\S]*?- \*\*Node\.js\*\* )v[0-9.]+( _\(ubuntu-bun-node only\)_)/,
              `$1${ubuntuVersions.node_version}$2`
            )
            this.log(
              `  ✅ Updated Ubuntu Node.js version to ${ubuntuVersions.node_version}`
            )
          }

          // Update npm version for Ubuntu
          if (ubuntuVersions.npm_version) {
            updatedContent = updatedContent.replace(
              /(#### Ubuntu-based Images[\s\S]*?- \*\*npm\*\* )[0-9.]+( _\(ubuntu-bun-node only\)_)/,
              `$1${ubuntuVersions.npm_version}$2`
            )
            this.log(
              `  ✅ Updated Ubuntu npm version to ${ubuntuVersions.npm_version}`
            )
          }
        }
      }
    } else if (readmePath === 'docs/IMAGE_VARIANTS.md') {
      // Update IMAGE_VARIANTS.md with new format

      // First, update tool versions in comparison tables if tool-versions.json is available
      if (toolVersions.size > 0) {
        // Get a representative container's tool versions for the tables
        // Priority: bun-node > bun > ubuntu-bun-node > ubuntu-bun
        let representativeVersions: any = null
        for (const containerName of [
          'bun-node',
          'bun',
          'ubuntu-bun-node',
          'ubuntu-bun'
        ]) {
          if (toolVersions.has(containerName)) {
            representativeVersions = toolVersions.get(containerName)
            this.log(
              `📋 Using tool versions from '${containerName}' for IMAGE_VARIANTS tables`
            )
            break
          }
        }

        if (representativeVersions) {
          // Update Bun Version rows in both tables
          if (representativeVersions.bun_version) {
            const bunVersion = representativeVersions.bun_version
            // Match and replace each version number while preserving spacing
            updatedContent = updatedContent.replace(
              /(\| \*\*Bun Version\*\* \| )([0-9.]+)( +\| )([0-9.]+)( +\| )([0-9.]+)( +\| )([0-9.]+)( +\|)/g,
              (match, p1, v1, p3, v2, p5, v3, p7, v4, p9) => {
                // Calculate padding to maintain column width
                const pad = (original: string, newVal: string) => {
                  const diff = original.length - newVal.length
                  return diff > 0 ? newVal + ' '.repeat(diff) : newVal
                }
                return `${p1}${pad(v1, bunVersion)}${p3}${pad(v2, bunVersion)}${p5}${pad(v3, bunVersion)}${p7}${pad(v4, bunVersion)}${p9}`
              }
            )
            this.log(`  ✅ Updated Bun version to ${bunVersion} in tables`)
          }

          // Update Node.js versions in tables
          if (representativeVersions.node_version) {
            const nodeVersion = representativeVersions.node_version
            updatedContent = updatedContent.replace(
              /(\| \*\*Node\.js\*\* +\| ❌ +\| ✅ )v[0-9.]+/g,
              `$1${nodeVersion}`
            )
            updatedContent = updatedContent.replace(
              /(\| \*\*Node\.js\*\* +\| ❌ +\| ❌ +\| ✅ )v[0-9.]+/g,
              `$1${nodeVersion}`
            )
            this.log(`  ✅ Updated Node.js version to ${nodeVersion}`)
          }

          // Update npm versions in tables
          if (representativeVersions.npm_version) {
            const npmVersion = representativeVersions.npm_version
            updatedContent = updatedContent.replace(
              /(\| \*\*npm\*\* +\| ❌ +\| ✅ )[0-9.]+/g,
              `$1${npmVersion}`
            )
            updatedContent = updatedContent.replace(
              /(\| \*\*npm\*\* +\| ❌ +\| ❌ +\| ✅ )[0-9.]+/g,
              `$1${npmVersion}`
            )
            this.log(`  ✅ Updated npm version to ${npmVersion}`)
          }

          // Update individual tool version mentions in descriptions
          // Pattern: "Bun X.X.X" anywhere in the document
          if (representativeVersions.bun_version) {
            const bunVersion = representativeVersions.bun_version
            updatedContent = updatedContent.replace(
              /Bun [0-9.]+/g,
              `Bun ${bunVersion}`
            )
          }

          // Pattern: "Node.js vX.X.X" anywhere in the document
          if (representativeVersions.node_version) {
            const nodeVersion = representativeVersions.node_version
            updatedContent = updatedContent.replace(
              /Node\.js v[0-9.]+/g,
              `Node.js ${nodeVersion}`
            )
          }

          // Pattern: "npm X.X.X" anywhere in the document
          if (representativeVersions.npm_version) {
            const npmVersion = representativeVersions.npm_version
            updatedContent = updatedContent.replace(
              /npm [0-9.]+/g,
              `npm ${npmVersion}`
            )
          }
        }
      }

      // Update the comparison table sizes
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

  // Check for tool version updates
  public async checkToolVersionUpdates(): Promise<{
    hasUpdates: boolean
    affectedContainers: string[]
    updates: Array<{
      tool: string
      containerName: string
      currentVersion: string
      latestVersion: string
    }>
  }> {
    this.log('🔧 Checking tool version updates...')

    try {
      // Import and use versionManager for tool update checking
      const { versionManager } = await import('./versionManager')
      versionManager.setSilent(this.silent)

      const result = await versionManager.checkToolUpdates()

      // Transform the result to match our interface
      const updates = result.checks
        .filter(c => c.hasUpdate)
        .flatMap(check =>
          result.affectedContainers.map(containerName => ({
            tool: check.tool,
            containerName,
            currentVersion: check.currentVersion,
            latestVersion: check.latestVersion
          }))
        )

      return {
        hasUpdates: result.hasUpdates,
        affectedContainers: result.affectedContainers,
        updates
      }
    } catch (error) {
      this.logError(
        `⚠️  Error checking tool versions: ${error instanceof Error ? error.message : String(error)}`
      )
      return {
        hasUpdates: false,
        affectedContainers: [],
        updates: []
      }
    }
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
      console.error(
        '❌ Error analyzing image sizes:',
        error instanceof Error ? error.message : String(error)
      )
      process.exit(1)
    }
  } else if (args.includes('--sync-sizes')) {
    console.log('🔄 Syncing README sizes...\n')
    try {
      const sizes = await imageOperations.getAllImageSizes()
      await imageOperations.updateReadmeFiles(sizes)
      console.log('✅ README sizes synced successfully!')
    } catch (error) {
      console.error(
        '❌ Error syncing sizes:',
        error instanceof Error ? error.message : String(error)
      )
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
