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

// Utility for retrying failed requests
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

async function getGhcrSize(image) {
  if (!process.env.GH_TOKEN) {
    throw new Error('GH_TOKEN not set in environment')
  }

  const headers = {
    Authorization: `Bearer ${process.env.GH_TOKEN}`,
    Accept: 'application/vnd.oci.image.index.v1+json'
  }

  // Get manifest directly
  const indexResponse = await fetchWithRetry(
    `https://ghcr.io/v2/${image}/manifests/latest`,
    { headers }
  )
  const index = await indexResponse.json()

  const amd64Manifest = index.manifests.find(
    m => m.platform.architecture === 'amd64'
  )
  if (!amd64Manifest) return 0

  // Get full manifest
  headers.Accept = 'application/vnd.oci.image.manifest.v1+json'
  const manifestResponse = await fetchWithRetry(
    `https://ghcr.io/v2/${image}/manifests/${amd64Manifest.digest}`,
    { headers }
  )
  const manifest = await manifestResponse.json()

  const size = manifest.layers.reduce((acc, layer) => acc + layer.size, 0) / 1024 / 1024
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

async function getDockerHubSize(image) {
  if (!process.env.DOCKERHUB_TOKEN) {
    throw new Error('DOCKERHUB_TOKEN not set in environment')
  }

  const [namespace, repo] = image.split('/')
  
  const headers = {
    Authorization: `Bearer ${process.env.DOCKERHUB_TOKEN}`,
    Accept: 'application/vnd.docker.distribution.manifest.v2+json'
  }

  // Get manifest directly using token
  const manifestResponse = await fetchWithRetry(
    `https://registry.hub.docker.com/v2/${namespace}/${repo}/manifests/latest`,
    { headers }
  )
  const manifest = await manifestResponse.json()

  const size = manifest.layers.reduce((acc, layer) => acc + layer.size, 0) / 1024 / 1024
  return size.toFixed(2)
}


  async function updateReadme(readmePath, images) {
    const content = await fs.readFile(readmePath, 'utf8')
    let updatedContent = content

    for (const [image, size] of Object.entries(images)) {
      if (!size) continue

      let pattern
      if (image.startsWith('ghcr.io/')) {
        pattern = new RegExp(`\`${image}:latest\`.*?~\\s*\\d+(?:\\.\\d+)?\\s*MiB`, 'g')
      } else if (image.startsWith('docker.io/')) {
        pattern = new RegExp(`\`${image.replace('docker.io/', '')}:latest\`.*?~\\s*\\d+(?:\\.\\d+)?\\s*MiB`, 'g')
      } else {
        pattern = new RegExp(`registry\\.gitlab\\.com/${image}:latest.*?~\\s*\\d+(?:\\.\\d+)?\\s*MiB`, 'g')
      }

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
    'vikshan/devcontainers/ubuntu-bun-node': '',

    'docker.io/vikshan/bun': '',
    'docker.io/vikshan/bun-node': '',
    'docker.io/vikshan/ubuntu-bun': '', 
    'docker.io/vikshan/ubuntu-bun-node': ''
  }

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
