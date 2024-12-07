// image-size-updater.js
import fs from 'fs/promises'
import path from 'path'
import fetch from 'node-fetch'

async function getRepoId(imagePath) {
  const projectPath = 'vikshan/devcontainers'
  const imageName = path.basename(imagePath)

  if (!process.env.GITLAB_TOKEN) {
    throw new Error('GITLAB_TOKEN not set in .env')
  }

  const response = await fetch(
    `https://gitlab.com/api/v4/projects/${encodeURIComponent(projectPath)}/registry/repositories?tags=true`,
    {
      headers: { 'PRIVATE-TOKEN': process.env.GITLAB_TOKEN }
    }
  )

  const data = await response.json()
  const repo = data.find(r => r.name === imageName)
  return repo?.id || 0
}

async function getGhcrSize(image) {
  const tokenResponse = await fetch(
    `https://ghcr.io/token?scope=repository:${image}:pull`
  )
  const { token } = await tokenResponse.json()

  // Get OCI index
  const indexResponse = await fetch(
    `https://ghcr.io/v2/${image}/manifests/latest`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.oci.image.index.v1+json'
      }
    }
  )
  const index = await indexResponse.json()

  // Get amd64 manifest
  const amd64Manifest = index.manifests.find(
    m => m.platform.architecture === 'amd64'
  )
  if (!amd64Manifest) return 0

  // Get full manifest
  const manifestResponse = await fetch(
    `https://ghcr.io/v2/${image}/manifests/${amd64Manifest.digest}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.oci.image.manifest.v1+json'
      }
    }
  )
  const manifest = await manifestResponse.json()

  // Calculate total size in MiB
  const size =
    manifest.layers.reduce((acc, layer) => acc + layer.size, 0) / 1024 / 1024
  return size.toFixed(2)
}

async function getGitlabSize(imagePath) {
  const repoId = await getRepoId(imagePath)
  if (repoId === 0) return '0.00'

  const response = await fetch(
    `https://gitlab.com/api/v4/registry/repositories/${repoId}?size=true`,
    {
      headers: { 'PRIVATE-TOKEN': process.env.GITLAB_TOKEN }
    }
  )

  const data = await response.json()
  const size = (data.size || 0) / 1024 / 1024
  return size.toFixed(2)
}

async function updateReadme(readmePath, images) {
  const content = await fs.readFile(readmePath, 'utf8')
  let updatedContent = content

  for (const [image, size] of Object.entries(images)) {
    if (!size) continue

    const pattern = image.startsWith('ghcr.io/')
      ? new RegExp(`\`${image}:latest\`.*?~\\s*\\d+(?:\\.\\d+)?\\s*MiB`, 'g')
      : new RegExp(
          `registry\\.gitlab\\.com/${image}:latest.*?~\\s*\\d+(?:\\.\\d+)?\\s*MiB`,
          'g'
        )

    updatedContent = updatedContent.replace(pattern, match =>
      match.replace(/~\s*\d+(?:\.\d+)?\s*MiB/, `~ ${size} MiB`)
    )
  }

  await fs.writeFile(readmePath, updatedContent)
  console.log(`Updated ${readmePath}`)
}

async function main() {
  const images = {
    'ghcr.io/iamvikshan/devcontainers/bun': '',
    'ghcr.io/iamvikshan/devcontainers/bun-node': '',
    'ghcr.io/iamvikshan/devcontainers/ubuntu-bun': '',
    'ghcr.io/iamvikshan/devcontainers/ubuntu-bun-node': '',
    'vikshan/devcontainers/bun': '',
    'vikshan/devcontainers/bun-node': '',
    'vikshan/devcontainers/ubuntu-bun': '',
    'vikshan/devcontainers/ubuntu-bun-node': ''
  }

  // Get sizes for all images
  for (const image of Object.keys(images)) {
    try {
      if (image.startsWith('ghcr.io/')) {
        images[image] = await getGhcrSize(image.replace('ghcr.io/', ''))
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
