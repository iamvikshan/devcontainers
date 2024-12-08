import { apiClients, config } from './utils'
import {
  DockerHubResponse,
  GitLabRepository,
  GitLabResponse,
  ImageManifest,
  ImageSizes,
  TokenResponse
} from './types'

function calculateSize(layers?: Array<{ size: number }>): string {
  if (!layers) return '0.00'
  const size = layers.reduce((acc, layer) => acc + layer.size, 0) / 1024 / 1024
  return size.toFixed(2)
}

async function getGhcrSize(image: string): Promise<string> {
  try {
    const tokenResponse = await apiClients.github.get<TokenResponse>(
      `https://ghcr.io/token`,
      {
        params: {
          scope: `repository:${image}:pull`
        }
      }
    )

    const manifestResponse = await axios.get<ImageManifest>(
      `https://ghcr.io/v2/${image}/manifests/latest`,
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.token}`,
          Accept:
            'application/vnd.oci.image.index.v1+json,application/vnd.docker.distribution.manifest.v2+json'
        }
      }
    )

    const manifest = manifestResponse.data

    if (manifest.mediaType === 'application/vnd.oci.image.index.v1+json') {
      const amd64Manifest = manifest.manifests?.find(
        m => m.platform.architecture === 'amd64'
      )
      if (!amd64Manifest) return '0.00'

      const fullManifestResponse = await axios.get<ImageManifest>(
        `https://ghcr.io/v2/${image}/manifests/${amd64Manifest.digest}`,
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.data.token}`,
            Accept:
              'application/vnd.oci.image.manifest.v1+json,application/vnd.docker.distribution.manifest.v2+json'
          }
        }
      )
      return calculateSize(fullManifestResponse.data.layers)
    }

    return calculateSize(manifest.layers)
  } catch (error) {
    console.error('Error getting GHCR size:', error.message)
    return '0.00'
  }
}

async function getDockerHubSize(image: string): Promise<string> {
  try {
    const [namespace, repo] = image.split('/')

    const response = await apiClients.dockerhub.get<DockerHubResponse>(
      `/repositories/${namespace}/${repo}/tags/latest`,
      {
        headers: {
          Accept: 'application/json'
        }
      }
    )

    const size = (response.data.full_size || 0) / 1024 / 1024
    return size.toFixed(2)
  } catch (error) {
    console.error('Error getting Docker Hub size:', error.message)
    return '0.00'
  }
}

async function getRepoId(imagePath: string): Promise<number> {
  const projectPath = `${config.owner}/${config.repoName}`
  const imageName = path.basename(imagePath)

  const response = await apiClients.gitlab.get<GitLabRepository[]>(
    `/projects/${encodeURIComponent(projectPath)}/registry/repositories`,
    {
      params: { tags: true }
    }
  )

  const repo = response.data.find(r => r.name === imageName)
  return repo?.id || 0
}

async function getGitlabSize(imagePath: string): Promise<string> {
  const repoId = await getRepoId(imagePath)
  if (repoId === 0) return '0.00'

  const response = await apiClients.gitlab.get<GitLabResponse>(
    `/registry/repositories/${repoId}`,
    {
      params: { size: true }
    }
  )

  const size = (response.data.size || 0) / 1024 / 1024
  return size.toFixed(2)
}

import fs from 'fs/promises'
import axios from 'axios'
import path from 'path'

function getImagePattern(image: string): RegExp {
  if (image.startsWith('ghcr.io/')) {
    return new RegExp(`\`${image}:latest\`.*?~\\s*\\d+(?:\\.\\d+)?\\s*MiB`, 'g')
  }
  if (image.startsWith('docker.io/')) {
    return new RegExp(
      `${image.replace('docker.io/', '')}:latest.*?~\\s*\\d+(?:\\.\\d+)?\\s*MiB`,
      'g'
    )
  }
  return new RegExp(
    `registry\\.gitlab\\.com/${image}:latest.*?~\\s*\\d+(?:\\.\\d+)?\\s*MiB`,
    'g'
  )
}

async function updateReadme(
  readmePath: string,
  images: ImageSizes
): Promise<void> {
  const content = await fs.readFile(readmePath, 'utf8')
  let updatedContent = content

  for (const [image, size] of Object.entries(images)) {
    if (!size) continue

    const pattern = getImagePattern(image)
    updatedContent = updatedContent.replace(pattern, match =>
      match.replace(/~\s*\d+(?:\.\d+)?\s*MiB/, `~ ${size} MiB`)
    )
  }

  await fs.writeFile(readmePath, updatedContent)
  console.log(`Updated ${readmePath}`)
}

const { owner, ghcrOwner, repoName } = config

const images: ImageSizes = {
  [`ghcr.io/${ghcrOwner}/${repoName}/bun`]: '',
  [`ghcr.io/${ghcrOwner}/${repoName}/bun-node`]: '',
  [`ghcr.io/${ghcrOwner}/${repoName}/ubuntu-bun`]: '',
  [`ghcr.io/${ghcrOwner}/${repoName}/ubuntu-bun-node`]: '',
  [`${owner}/${repoName}/bun`]: '',
  [`${owner}/${repoName}/bun-node`]: '',
  [`${owner}/${repoName}/ubuntu-bun`]: '',
  [`${owner}/${repoName}/ubuntu-bun-node`]: '',
  [`docker.io/${owner}/bun`]: '',
  [`docker.io/${owner}/bun-node`]: '',
  [`docker.io/${owner}/ubuntu-bun`]: '',
  [`docker.io/${owner}/ubuntu-bun-node`]: ''
}

async function main() {
  // Get sizes for all images
  for (const image of Object.keys(images)) {
    try {
      if (image.startsWith('ghcr.io/')) {
        images[image] = await getGhcrSize(image.replace('ghcr.io/', ''))
      } else if (image.startsWith('docker.io/')) {
        images[image] = await getDockerHubSize(image.replace('docker.io/', ''))
      } else {
        images[image] = await getGitlabSize(image)
      }
      console.log(`Retrieved size for ${image}: ${images[image]} MiB`)
    } catch (error) {
      console.error(`Error getting size for ${image}:`, error)
    }
  }

  // Update README files
  const readmeFiles = [
    'README.md',
    'base/bun/README.md',
    'base/bun-node/README.md',
    'base/ubuntu/README.md'
  ]

  for (const readme of readmeFiles) {
    try {
      await updateReadme(readme, images)
    } catch (error) {
      console.error(`Error updating ${readme}:`, error)
    }
  }
}

main().catch(console.error)
