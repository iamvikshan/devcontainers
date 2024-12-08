import { apiClients, config, Registry, RegistryConfig } from './utils'
import * as semver from 'semver'

const github: Registry = {
  name: 'GitHub Container Registry',
  async listTags(image: string) {
    try {
      const packageName = image.split('/').pop() || ''

      const response = await apiClients.github.get(
        `${config.ghcrOwner}/packages/container/${config.repoName}/${packageName}/versions`
      )

      const tags = response.data || []
      console.log(`Found ${tags.length} tags for ${image}`)

      // Map the response to expected format
      return tags
        .filter((version: any) => version.metadata?.container?.tags?.length > 0)
        .map((version: any) => ({
          name: version.metadata.container.tags[0],
          digest: version.name
        }))
    } catch (error: any) {
      const status = error.response?.status
      const message = error.response?.data?.message || error.message

      console.error(`Error listing GHCR tags (${status}): ${message}`)
      console.error(`API URL: ${error.config?.url}`)

      return []
    }
  },

  async deleteTag(image: string, tag: string) {
    try {
      await apiClients.github.delete(
        `/users/${config.ghcrOwner}/packages/container/${config.repoName}/tags/${tag}`
      )
      console.log(`Deleted tag ${tag} from ${image}`)
    } catch (error: any) {
      console.error(`Error deleting GHCR tag: ${error.message}`)
      if (error.response) {
        console.error('Response:', error.response.data)
      }
    }
  }
}
const gitlabRegistry: Registry = {
  name: 'GitLab Container Registry',
  async listTags(image: string) {
    try {
      const projectPath = `${config.owner}/${config.repoName}`

      const projectResponse = await apiClients.gitlab.get(
        `/projects/${encodeURIComponent(projectPath)}`
      )
      const { id } = projectResponse.data

      const reposResponse = await apiClients.gitlab.get(
        `/projects/${id}/registry/repositories`
      )

      const imagePath = image.replace('registry.gitlab.com/', '')
      const repository = reposResponse.data.find(
        (r: any) => r.path === imagePath
      )

      if (!repository) {
        console.log(`No repository found for image: ${imagePath}`)
        return []
      }

      const tagsResponse = await apiClients.gitlab.get(
        `/projects/${id}/registry/repositories/${repository.id}/tags`
      )
      const tags = tagsResponse.data
      console.log(`Found ${tags.length} tags for ${image}`)
      return tags.map((tag: any) => ({
        name: tag.name,
        digest: tag.digest
      }))
    } catch (error) {
      console.error(`Error listing GitLab tags: ${error.message}`)
      if (error.response) {
        console.error('Response:', error.response.data)
      }
      return []
    }
  },

  async deleteTag(image: string, tag: string) {
    try {
      const projectPath = encodeURIComponent(
        `${config.owner}/${config.repoName}`
      )
      const projectResponse = await apiClients.gitlab.get(
        `/projects/${projectPath}`
      )
      const { id } = projectResponse.data

      const reposResponse = await apiClients.gitlab.get(
        `/projects/${id}/registry/repositories`
      )
      const repository = reposResponse.data.find(
        (r: any) => r.path === image.split('/').pop()
      )

      if (repository) {
        await apiClients.gitlab.delete(
          `/projects/${id}/registry/repositories/${repository.id}/tags/${tag}`
        )
      }
    } catch (error) {
      console.error(`Error deleting GitLab tag: ${error.message}`)
    }
  }
}

const dockerHubRegistry: Registry = {
  name: 'Docker Hub',
  async listTags(image: string) {
    try {
      const [namespace, repository] = image.split('/').slice(-2)
      const response = await apiClients.dockerhub.get(
        `/repositories/${namespace}/${repository}/tags/?page_size=100`
      )
      const tags = response.data.results || []
      console.log(`Found ${tags.length} tags for ${image}`)
      if (tags.length <= 5) {
        console.log(`Only ${tags.length} tags found, skipping cleanup`)
      }
      return tags.map((tag: any) => ({
        name: tag.name
      }))
    } catch (error) {
      console.error(`Error listing Docker Hub tags: ${error.message}`)
      if (error.response) {
        console.error('Response:', error.response.data)
      }
      return []
    }
  },

  async deleteTag(image: string, tag: string) {
    try {
      const [namespace, repository] = image.split('/').slice(-2)
      await apiClients.dockerhub.delete(
        `/repositories/${namespace}/${repository}/tags/${tag}/`
      )
    } catch (error) {
      console.error(`Error deleting Docker Hub tag: ${error.message}`)
    }
  }
}

const registryConfigs: Record<string, RegistryConfig> = {
  github: {
    images: [
      `ghcr.io/${config.ghcrOwner}/${config.repoName}/bun`,
      `ghcr.io/${config.ghcrOwner}/${config.repoName}/bun-node`,
      `ghcr.io/${config.ghcrOwner}/${config.repoName}/ubuntu-bun`,
      `ghcr.io/${config.ghcrOwner}/${config.repoName}/ubuntu-bun-node`
    ],
    retentionCount: 5
  },
  gitlab: {
    images: [
      `registry.gitlab.com/${config.owner}/${config.repoName}/bun`,
      `registry.gitlab.com/${config.owner}/${config.repoName}/bun-node`,
      `registry.gitlab.com/${config.owner}/${config.repoName}/ubuntu-bun`,
      `registry.gitlab.com/${config.owner}/${config.repoName}/ubuntu-bun-node`
    ],
    retentionCount: 5
  },
  dockerhub: {
    images: [
      `docker.io/${config.owner}/bun`,
      `docker.io/${config.owner}/bun-node`,
      `docker.io/${config.owner}/ubuntu-bun`,
      `docker.io/${config.owner}/ubuntu-bun-node`
    ],
    retentionCount: 5
  }
}

function isSemverTag(tag: string): boolean {
  // Remove 'v' prefix if present
  const version = tag.startsWith('v') ? tag.substring(1) : tag
  return semver.valid(version) !== null
}

async function cleanupRegistry(
  registry: Registry,
  registryConfig: RegistryConfig
) {
  console.log(`\nCleaning up ${registry.name}...`)

  for (const image of registryConfig.images) {
    console.log(`\nProcessing ${image}...`)

    try {
      const tags = await registry.listTags(image)

      if (tags.length === 0) {
        console.log('No tags found')
        continue
      }

      // First, delete SHA256 tags
      const sha256Tags = tags.filter(tag => tag.name.startsWith('sha256'))
      for (const tag of sha256Tags) {
        try {
          await registry.deleteTag(image, tag.name)
          console.log(`Deleted SHA256 tag: ${tag.name}`)
        } catch (error) {
          console.error(
            `Failed to delete SHA256 tag ${tag.name}:`,
            error.message
          )
        }
      }

      // Handle semver tags
      const semverTags = tags
        .filter(tag => tag.name !== 'latest' && isSemverTag(tag.name))
        .sort((a, b) => {
          const vA = semver.clean(a.name) || ''
          const vB = semver.clean(b.name) || ''
          return semver.rcompare(vA, vB)
        })

      // Keep only the latest 5 semver tags
      const tagsToDelete = semverTags.slice(registryConfig.retentionCount)

      for (const tag of tagsToDelete) {
        try {
          await registry.deleteTag(image, tag.name)
          console.log(`Deleted semver tag: ${tag.name}`)
        } catch (error) {
          console.error(`Failed to delete tag ${tag.name}:`, error.message)
        }
      }

      console.log(
        `Retained ${registryConfig.retentionCount} latest semver tags`
      )
    } catch (error) {
      console.error(`Error processing ${image}:`, error.message)
    }
  }
}

async function main() {
  try {
    await cleanupRegistry(github, registryConfigs.github)
    await cleanupRegistry(gitlabRegistry, registryConfigs.gitlab)
    await cleanupRegistry(dockerHubRegistry, registryConfigs.dockerhub)
  } catch (error) {
    console.error('Cleanup failed:', error.message)
    process.exit(1)
  }
}

main()
