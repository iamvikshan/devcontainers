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
    this.log(`🔍 Extracting tool versions from ${imageName}:${tag}...`)

    try {
      // Try to extract from the tool-versions.txt file first
      const toolVersionsOutput = execSync(
        `docker run --rm ${imageName}:${tag} cat /usr/local/share/tool-versions.txt 2>/dev/null || echo "not_found"`,
        { encoding: 'utf-8' }
      ).trim()

      if (toolVersionsOutput !== 'not_found') {
        return this.parseToolVersionsFile(toolVersionsOutput)
      }

      // Fallback: extract versions manually
      this.log(
        `⚠️  tool-versions.txt not found in ${imageName}:${tag}, extracting manually...`
      )
      return await this.extractManually(imageName, tag)
    } catch (error) {
      this.log(
        `❌ Error extracting tool versions from ${imageName}:${tag}: ${error.message}`
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

    try {
      // Extract common tool versions
      const commands = {
        bun_version: 'bun --version 2>/dev/null || echo "not_installed"',
        node_version: 'node --version 2>/dev/null || echo "not_installed"',
        npm_version: 'npm --version 2>/dev/null || echo "not_installed"',
        git_version:
          'git --version 2>/dev/null | cut -d\' \' -f3 || echo "not_installed"',
        curl_version:
          'curl --version 2>/dev/null | head -n1 | cut -d\' \' -f2 || echo "not_installed"',
        debian_version:
          'cat /etc/debian_version 2>/dev/null || echo "not_available"',
        ubuntu_version:
          "lsb_release -rs 2>/dev/null || cat /etc/os-release 2>/dev/null | grep VERSION_ID | cut -d'=' -f2 | tr -d '\"' || echo \"not_available\""
      }

      for (const [key, command] of Object.entries(commands)) {
        try {
          const result = execSync(
            `docker run --rm ${imageName}:${tag} bash -c "${command}"`,
            { encoding: 'utf-8' }
          ).trim()

          if (
            result &&
            result !== 'not_installed' &&
            result !== 'not_available'
          ) {
            versions[key] = result
          }
        } catch (error) {
          // Skip if command fails
        }
      }

      // Add extraction metadata
      versions.build_date = new Date().toISOString()
      versions.extracted_manually = 'true'
    } catch (error) {
      this.log(`⚠️  Error in manual extraction: ${error.message}`)
    }

    return versions
  }

  // Extract tool versions from all containers in a registry
  async extractFromRegistry(
    registry: 'ghcr' | 'gitlab' | 'dockerhub',
    version: string = 'latest'
  ): Promise<ContainerToolVersions[]> {
    this.log(`🔍 Extracting tool versions from ${registry} registry...`)

    const results: ContainerToolVersions[] = []
    const registryUrl = this.getRegistryUrl(registry)

    for (const containerName of IMAGE_DEFINITIONS.names) {
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
        this.log(
          `⚠️  Failed to extract from ${containerName}: ${error.message}`
        )
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

  // Save tool versions to a JSON file
  saveToolVersions(
    versions: ContainerToolVersions[],
    outputPath?: string
  ): void {
    const filePath = outputPath || join(process.cwd(), 'tool-versions.json')

    try {
      writeFileSync(filePath, JSON.stringify(versions, null, 2))
      this.log(`✅ Tool versions saved to ${filePath}`)
    } catch (error) {
      throw new Error(`Failed to save tool versions: ${error.message}`)
    }
  }

  // Load tool versions from JSON file
  loadToolVersions(inputPath?: string): ContainerToolVersions[] {
    const filePath = inputPath || join(process.cwd(), 'tool-versions.json')

    if (!existsSync(filePath)) {
      return []
    }

    try {
      const content = readFileSync(filePath, 'utf-8')
      return JSON.parse(content)
    } catch (error) {
      this.log(`⚠️  Error loading tool versions: ${error.message}`)
      return []
    }
  }

  // Update container versions with tool version data
  updateContainerVersionsWithTools(
    containerVersions: Record<string, any>,
    toolVersions: ContainerToolVersions[]
  ): Record<string, any> {
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
        // Try different possible local image names
        const possibleNames = [
          `devcontainers/${containerName}:${tag}`,
          `${containerName}:${tag}`,
          `devcontainer-${containerName}:${tag}`
        ]

        let versions: ToolVersions = {}
        let foundImage = false

        for (const imageName of possibleNames) {
          try {
            // Check if image exists
            execSync(`docker image inspect ${imageName}`, { stdio: 'pipe' })
            versions = await this.extractFromImage(imageName, tag)
            foundImage = true
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
            `⚠️  Could not find or extract from ${containerName} locally`
          )
        }
      } catch (error) {
        this.log(`❌ Error extracting from ${containerName}: ${error.message}`)
      }
    }

    return results
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
  const outputPath = args
    .find(arg => arg.startsWith('--output='))
    ?.split('=')[1]
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
        version
      )
    } else {
      console.error(
        'Usage: bun scripts/toolVersionExtractor.ts --registry=ghcr|gitlab|dockerhub [--version=latest] [--output=path] [--silent]'
      )
      console.error(
        '   or: bun scripts/toolVersionExtractor.ts --local --containers=bun,bun-node [--version=latest] [--output=path] [--silent]'
      )
      process.exit(1)
    }

    if (results.length > 0) {
      toolVersionExtractor.saveToolVersions(results, outputPath)
      console.log(
        `\n📊 Extracted tool versions from ${results.length} containers`
      )
    } else {
      console.log('ℹ️  No tool versions extracted')
    }
  } catch (error) {
    console.error('❌ Tool version extraction failed:', error.message)
    process.exit(1)
  }
}

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error)
}
