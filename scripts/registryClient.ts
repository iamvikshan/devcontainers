import axios from 'axios'
import { readFileSync } from 'fs'
import { join } from 'path'

// Configuration (moved here to avoid token loading issues)
const config = {
  owner: 'vikshan',
  ghcrOwner: 'iamvikshan',
  repoName: 'devcontainers'
}

// Centralized environment loading
export function loadEnvironment(): void {
  try {
    const envFile = readFileSync(join(process.cwd(), '.env'), 'utf8')
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=')
      if (key && value && !process.env[key]) {
        process.env[key] = value.replace(/"/g, '')
      }
    })
  } catch (error) {
    // .env file not found or not readable, continue without it
  }
}

// Centralized image definitions
export const IMAGE_DEFINITIONS = {
  names: ['bun', 'bun-node', 'ubuntu-bun', 'ubuntu-bun-node'],
  registries: {
    ghcr: (image: string) =>
      `ghcr.io/${config.ghcrOwner}/${config.repoName}/${image}`,
    gitlab: (image: string) =>
      `registry.gitlab.com/${config.owner}/${config.repoName}/${image}`,
    dockerhub: (image: string) => `docker.io/${config.owner}/${image}`
  },
  baseImages: {
    bun: 'oven/bun',
    'bun-node': 'oven/bun',
    'ubuntu-bun': 'library/ubuntu',
    'ubuntu-bun-node': 'library/ubuntu'
  }
}

export interface LayerInfo {
  digest: string
  size: number
  mediaType: string
}

export interface ManifestInfo {
  layers: LayerInfo[]
  totalSize: number
  layerCount: number
}

export interface DockerHubTag {
  name: string
  last_updated: string
  digest: string
  full_size?: number
}

export interface DockerHubResponse {
  results: DockerHubTag[]
}

export class RegistryClient {
  private static instance: RegistryClient
  private dockerHubToken: string | null = null

  private constructor() {
    loadEnvironment()
  }

  public static getInstance(): RegistryClient {
    if (!RegistryClient.instance) {
      RegistryClient.instance = new RegistryClient()
    }
    return RegistryClient.instance
  }

  // Centralized Docker Hub authentication
  private async getDockerHubToken(): Promise<string> {
    if (this.dockerHubToken) {
      return this.dockerHubToken
    }

    try {
      const response = await axios.post(
        'https://hub.docker.com/v2/users/login/',
        {
          username: config.owner,
          password: process.env.DOCKERHUB_TOKEN
        }
      )

      if (!response.data.token) {
        throw new Error('Docker Hub authentication failed: No token received')
      }

      this.dockerHubToken = response.data.token
      return response.data.token
    } catch (error) {
      throw new Error(`Docker Hub authentication failed: ${error.message}`)
    }
  }

  // Centralized Docker Hub API calls
  public async getDockerHubTags(image: string): Promise<DockerHubTag[]> {
    try {
      const response = await axios.get<DockerHubResponse>(
        `https://hub.docker.com/v2/repositories/${image}/tags`,
        { params: { page_size: 100 } }
      )
      return response.data.results
    } catch (error) {
      console.error(
        `Error fetching Docker Hub tags for ${image}:`,
        error.message
      )
      return []
    }
  }

  public async getDockerHubImageSize(image: string): Promise<number> {
    try {
      const token = await this.getDockerHubToken()
      const [namespace, repo] = image.split('/')

      const response = await axios.get<{ full_size: number }>(
        `https://hub.docker.com/v2/repositories/${namespace}/${repo}/tags/latest`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `JWT ${token}`
          }
        }
      )

      return response.data.full_size || 0
    } catch (error) {
      console.error(
        `Error getting Docker Hub size for ${image}:`,
        error.message
      )
      return 0
    }
  }

  // Centralized GitHub Container Registry calls
  public async getGHCRManifest(image: string): Promise<ManifestInfo | null> {
    try {
      const tokenResponse = await axios.get(
        `https://ghcr.io/token?scope=repository:${image}:pull`
      )

      const manifestResponse = await axios.get(
        `https://ghcr.io/v2/${image}/manifests/latest`,
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.data.token}`,
            Accept:
              'application/vnd.docker.distribution.manifest.v2+json,application/vnd.oci.image.manifest.v1+json'
          }
        }
      )

      const manifest = manifestResponse.data
      const layers = manifest.layers || []
      const totalSize = layers.reduce(
        (sum: number, layer: any) => sum + layer.size,
        0
      )

      return {
        layers: layers.map((layer: any) => ({
          digest: layer.digest,
          size: layer.size,
          mediaType: layer.mediaType
        })),
        totalSize,
        layerCount: layers.length
      }
    } catch (error) {
      console.error(`Error getting GHCR manifest for ${image}:`, error.message)
      return null
    }
  }

  // Centralized GitLab Container Registry calls
  public async getGitLabManifest(image: string): Promise<ManifestInfo | null> {
    try {
      const gitlabToken = process.env.GITLAB_TOKEN
      if (!gitlabToken) {
        console.log('GitLab token not available')
        return null
      }

      // Get JWT token for GitLab registry
      const scope = `repository:${image}:pull`
      const authResponse = await axios.get(
        `https://gitlab.com/jwt/auth?service=container_registry&scope=${scope}`,
        {
          auth: {
            username: config.owner,
            password: gitlabToken
          }
        }
      )

      const manifestResponse = await axios.get(
        `https://registry.gitlab.com/v2/${image}/manifests/latest`,
        {
          headers: {
            Authorization: `Bearer ${authResponse.data.token}`,
            Accept: 'application/vnd.docker.distribution.manifest.v2+json'
          }
        }
      )

      const manifest = manifestResponse.data
      const layers = manifest.layers || []
      const totalSize = layers.reduce(
        (sum: number, layer: any) => sum + layer.size,
        0
      )

      return {
        layers: layers.map((layer: any) => ({
          digest: layer.digest,
          size: layer.size,
          mediaType: layer.mediaType
        })),
        totalSize,
        layerCount: layers.length
      }
    } catch (error) {
      console.error(
        `Error getting GitLab manifest for ${image}:`,
        error.message
      )
      return null
    }
  }

  // Utility methods
  public static formatSize(bytes: number): string {
    return (bytes / (1024 * 1024)).toFixed(2)
  }

  public static getAllImagePaths(): Record<string, string[]> {
    const paths: Record<string, string[]> = {
      ghcr: [],
      gitlab: [],
      dockerhub: []
    }

    IMAGE_DEFINITIONS.names.forEach(name => {
      paths.ghcr.push(IMAGE_DEFINITIONS.registries.ghcr(name))
      paths.gitlab.push(IMAGE_DEFINITIONS.registries.gitlab(name))
      paths.dockerhub.push(IMAGE_DEFINITIONS.registries.dockerhub(name))
    })

    return paths
  }

  public static getBaseImageForContainer(containerName: string): string {
    return IMAGE_DEFINITIONS.baseImages[containerName] || ''
  }
}

// Export singleton instance
export const registryClient = RegistryClient.getInstance()
