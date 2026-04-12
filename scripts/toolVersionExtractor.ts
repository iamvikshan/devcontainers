import { execSync } from 'child_process'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { IMAGE_DEFINITIONS } from './registryClient'

export interface ToolVersions {
  [key: string]: string
}

export interface ContainerToolVersions {
  container: string
  registry: string
  tag: string
  versions: ToolVersions
  extractedAt: string
}

interface ContainerVersionsEntry {
  toolVersions?: ToolVersions
  toolVersionsExtractedAt?: string
  lastUpdated?: string
  [key: string]: unknown
}

type ContainerVersionsMap = Record<string, ContainerVersionsEntry>

export class ToolVersionExtractor {
  private silent = false

  setSilent(silent: boolean): void {
    this.silent = silent
  }

  private log(message: string): void {
    if (!this.silent) {
      console.log(message)
    }
  }

  // Extract tool versions from a built Docker image
  async extractFromImage(
    imageName: string,
    tag: string = 'latest'
  ): Promise<ToolVersions> {
    // Clean the tag to remove any 'v' prefix if present
    const cleanTag = tag.startsWith('v') ? tag.slice(1) : tag
    const fullImageName = `${imageName}:${cleanTag}`

    this.log(`🔍 Extracting tool versions from ${fullImageName}...`)

    try {
      // Try to extract from the tool-versions.txt file first
      const toolVersionsOutput = execSync(
        `docker run --rm ${fullImageName} cat /usr/local/share/tool-versions.txt 2>/dev/null || echo "not_found"`,
        { encoding: 'utf-8' }
      ).trim()

      if (toolVersionsOutput !== 'not_found') {
        return this.parseToolVersionsFile(toolVersionsOutput)
      }

      // Fallback: extract versions manually
      this.log(
        `⚠️  tool-versions.txt not found in ${fullImageName}, extracting manually...`
      )
      return await this.extractManually(imageName, tag)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.log(
        `❌ Error extracting tool versions from ${fullImageName}: ${message}`
      )
      return {}
    }
  }

  // Parse tool-versions.txt file content
  private parseToolVersionsFile(content: string): ToolVersions {
    const versions: ToolVersions = {}

    content.split('\n').forEach(line => {
      line = line.trim()
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=', 2)
        if (key && value) {
          versions[key] = value
        }
      }
    })

    return versions
  }

  // Manually extract tool versions when tool-versions.txt is not available
  private async extractManually(
    imageName: string,
    tag: string
  ): Promise<ToolVersions> {
    const versions: ToolVersions = {}
    const cleanTag = tag.startsWith('v') ? tag.slice(1) : tag
    const fullImageName = `${imageName}:${cleanTag}`

    try {
      // Extract common tool versions
      const commands = {
        bun_version: 'bun --version 2>/dev/null || echo "not_installed"',
        node_version: 'node --version 2>/dev/null || echo "not_installed"',
        npm_version: 'npm --version 2>/dev/null || echo "not_installed"',
        zsh_version:
          'zsh --version 2>/dev/null | head -n1 | cut -d\' \' -f2 || echo "not_installed"',
        git_version:
          'git --version 2>/dev/null | cut -d\' \' -f3 || echo "not_installed"',
        curl_version:
          'curl --version 2>/dev/null | head -n1 | cut -d\' \' -f2 || echo "not_installed"',
        jq_version:
          'jq --version 2>/dev/null | cut -d\'-\' -f2 || echo "not_installed"',
        python_version:
          'python3 --version 2>/dev/null | cut -d\' \' -f2 || echo "not_installed"',
        btop_version:
          'btop --version 2>/dev/null | head -n1 || echo "not_installed"',
        alpine_version:
          'cat /etc/alpine-release 2>/dev/null || echo "not_available"',
        debian_version:
          'cat /etc/debian_version 2>/dev/null || echo "not_available"',
        ubuntu_version:
          "lsb_release -rs 2>/dev/null || cat /etc/os-release 2>/dev/null | grep VERSION_ID | cut -d'=' -f2 | tr -d '\"' || echo \"not_available\""
      }

      for (const [key, command] of Object.entries(commands)) {
        try {
          const result = execSync(
            `docker run --rm ${fullImageName} sh -lc "${command}"`,
            { encoding: 'utf-8' }
          ).trim()

          if (
            result &&
            result !== 'not_installed' &&
            result !== 'not_available'
          ) {
            versions[key] = result
          }
        } catch {
          // Skip if command fails
        }
      }

      // Add extraction metadata
      versions.build_date = new Date().toISOString()
      versions.extracted_manually = 'true'
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.log(`⚠️  Error in manual extraction: ${message}`)
    }

    return versions
  }

  // Extract tool versions from all containers in a registry
  async extractFromRegistry(
    registry: 'ghcr' | 'gitlab' | 'dockerhub',
    version: string = 'latest',
    containerFilter?: string[]
  ): Promise<ContainerToolVersions[]> {
    this.log(`🔍 Extracting tool versions from ${registry} registry...`)

    const results: ContainerToolVersions[] = []
    const registryUrl = this.getRegistryUrl(registry)

    // Use provided container filter or default to all containers
    const containersToProcess = containerFilter || IMAGE_DEFINITIONS.names

    for (const containerName of containersToProcess) {
      try {
        const imageName = this.getImageName(registry, containerName)
        const versions = await this.extractFromImage(imageName, version)

        if (Object.keys(versions).length > 0) {
          results.push({
            container: containerName,
            registry: registryUrl,
            tag: version,
            versions,
            extractedAt: new Date().toISOString()
          })

          this.log(
            `✅ Extracted ${Object.keys(versions).length} tool versions from ${containerName}`
          )
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        this.log(`⚠️  Failed to extract from ${containerName}: ${message}`)
      }
    }

    return results
  }

  // Get registry URL
  private getRegistryUrl(registry: 'ghcr' | 'gitlab' | 'dockerhub'): string {
    switch (registry) {
      case 'ghcr':
        return 'ghcr.io'
      case 'gitlab':
        return 'registry.gitlab.com'
      case 'dockerhub':
        return 'docker.io'
    }
  }

  // Get full image name for a registry
  private getImageName(
    registry: 'ghcr' | 'gitlab' | 'dockerhub',
    containerName: string
  ): string {
    switch (registry) {
      case 'ghcr':
        return IMAGE_DEFINITIONS.registries.ghcr(containerName)
      case 'gitlab':
        return IMAGE_DEFINITIONS.registries.gitlab(containerName)
      case 'dockerhub':
        return IMAGE_DEFINITIONS.registries.dockerhub(containerName)
    }
  }

  // Update container versions with tool version data
  updateContainerVersionsWithTools(
    containerVersions: ContainerVersionsMap,
    toolVersions: ContainerToolVersions[]
  ): ContainerVersionsMap {
    const updated = { ...containerVersions }

    toolVersions.forEach(toolVersion => {
      if (updated[toolVersion.container]) {
        updated[toolVersion.container].toolVersions = toolVersion.versions
        updated[toolVersion.container].toolVersionsExtractedAt =
          toolVersion.extractedAt
      }
    })

    return updated
  }

  // Extract tool versions from locally built images (for CI/CD)
  async extractFromLocalImages(
    containers: string[],
    tag: string = 'latest'
  ): Promise<ContainerToolVersions[]> {
    this.log(`🔍 Extracting tool versions from local images with tag ${tag}...`)

    const results: ContainerToolVersions[] = []

    for (const containerName of containers) {
      try {
        // Try different possible local image names based on common CI patterns
        const possibleNames = [
          // GitHub Container Registry format (most likely in CI)
          `ghcr.io/iamvikshan/devcontainers/${containerName}:${tag}`,
          // GitLab registry format
          `registry.gitlab.com/vikshan/devcontainers/${containerName}:${tag}`,
          // Docker Hub format
          `vikshan/${containerName}:${tag}`,
          // Simple local names
          `devcontainers/${containerName}:${tag}`,
          `${containerName}:${tag}`,
          `devcontainer-${containerName}:${tag}`
        ]

        let versions: ToolVersions = {}
        let foundImage = false
        let imageName = ''

        for (const possibleName of possibleNames) {
          try {
            // Check if image exists
            execSync(`docker image inspect ${possibleName}`, { stdio: 'pipe' })
            versions = await this.extractFromImage(possibleName, tag)
            foundImage = true
            imageName = possibleName
            this.log(`✅ Found and extracted from ${imageName}`)
            break
          } catch {
            // Try next image name
          }
        }

        if (foundImage && Object.keys(versions).length > 0) {
          results.push({
            container: containerName,
            registry: 'local',
            tag,
            versions,
            extractedAt: new Date().toISOString()
          })
        } else {
          this.log(
            `⚠️  Could not find or extract from ${containerName} locally with tag ${tag}`
          )
          this.log(`📋 Tried these image names: ${possibleNames.join(', ')}`)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        this.log(`❌ Error extracting from ${containerName}: ${message}`)
      }
    }

    return results
  }

  // Save tool versions to container-versions.json cache
  async saveToolVersionsToCache(
    results: ContainerToolVersions[]
  ): Promise<void> {
    const cacheFile = join(process.cwd(), 'container-versions.json')

    try {
      let cache: ContainerVersionsMap = {}

      // Load existing cache
      if (existsSync(cacheFile)) {
        const content = readFileSync(cacheFile, 'utf-8')
        cache = JSON.parse(content) as ContainerVersionsMap
      }

      // Update each container's toolVersions
      for (const result of results) {
        if (cache[result.container]) {
          cache[result.container].toolVersions = result.versions
          cache[result.container].lastUpdated = result.extractedAt
          this.log(
            `✅ Updated cache for ${result.container} with ${Object.keys(result.versions).length} tool versions`
          )
        } else {
          this.log(`⚠️  Container ${result.container} not found in cache`)
        }
      }

      // Save updated cache
      writeFileSync(cacheFile, JSON.stringify(cache, null, 2))
      this.log(`\n✅ Saved tool versions to cache: ${cacheFile}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to save to cache: ${message}`, { cause: error })
    }
  }
}

// Export singleton instance
export const toolVersionExtractor = new ToolVersionExtractor()

// CLI usage
async function main() {
  const args = process.argv.slice(2)
  const registry = args
    .find(arg => arg.startsWith('--registry='))
    ?.split('=')[1] as 'ghcr' | 'gitlab' | 'dockerhub'
  const version =
    args.find(arg => arg.startsWith('--version='))?.split('=')[1] || 'latest'
  const containers = args
    .find(arg => arg.startsWith('--containers='))
    ?.split('=')[1]
    ?.split(',')
  const local = args.includes('--local')
  const silent = args.includes('--silent')

  if (silent) {
    toolVersionExtractor.setSilent(true)
  }

  try {
    let results: ContainerToolVersions[] = []

    if (local && containers) {
      results = await toolVersionExtractor.extractFromLocalImages(
        containers,
        version
      )
    } else if (registry) {
      results = await toolVersionExtractor.extractFromRegistry(
        registry,
        version,
        containers // Pass containers filter for registry extraction too
      )
    } else {
      console.error(
        'Usage: bun scripts/toolVersionExtractor.ts --registry=ghcr|gitlab|dockerhub [--containers=bun,bun-node] [--version=latest] [--save-to-cache] [--silent]'
      )
      console.error(
        '   or: bun scripts/toolVersionExtractor.ts --local --containers=bun,bun-node [--version=latest] [--save-to-cache] [--silent]'
      )
      process.exit(1)
    }

    if (results.length > 0) {
      // Always save to container-versions.json cache (tool-versions.json is deprecated)
      await toolVersionExtractor.saveToolVersionsToCache(results)
      console.log(
        `\n📊 Extracted tool versions from ${results.length} containers`
      )
    } else {
      console.log('ℹ️  No tool versions extracted')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('❌ Tool version extraction failed:', message)
    process.exit(1)
  }
}

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error)
}
