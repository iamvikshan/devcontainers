// cleanup.js
require('dotenv').config()
const axios = require('axios')

// API Clients
const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `token ${process.env.GH_TOKEN}`,
    Accept: 'application/vnd.github.v3+json'
  }
})

const ghcrApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `Bearer ${process.env.GH_TOKEN}`,
    Accept: 'application/vnd.github.v3+json'
  }
})

const gitlabApi = axios.create({
  baseURL: 'https://gitlab.com/api/v4',
  headers: {
    'PRIVATE-TOKEN': process.env.GITLAB_TOKEN
  }
})

// GitHub Operations
async function deleteGitHubTags(owner, repo) {
  try {
    const { data: tags } = await githubApi.get(`/repos/${owner}/${repo}/tags`)
    for (const tag of tags) {
      await githubApi.delete(
        `/repos/${owner}/${repo}/git/refs/tags/${tag.name}`
      )
      console.log(`Deleted GitHub tag: ${tag.name}`)
    }
  } catch (error) {
    console.error('Error deleting GitHub tags:', error.message)
  }
}

async function deleteGitHubReleases(owner, repo) {
  try {
    const { data: releases } = await githubApi.get(
      `/repos/${owner}/${repo}/releases`
    )
    for (const release of releases) {
      await githubApi.delete(`/repos/${owner}/${repo}/releases/${release.id}`)
      console.log(`Deleted GitHub release: ${release.tag_name}`)
    }
  } catch (error) {
    console.error('Error deleting GitHub releases:', error.message)
  }
}

// GHCR Operations
async function deleteGHCRPackages(owner) {
  try {
    // List all packages
    const { data: packages } = await ghcrApi.get(
      `/users/${owner}/packages?package_type=container`
    )

    // Filter and delete devcontainers packagesPAT
    for (const pkg of packages) {
      if (pkg.name.startsWith('devcontainers/')) {
        const encodedPackageName = encodeURIComponent(pkg.name)
        await ghcrApi.delete(
          `/users/${owner}/packages/container/${encodedPackageName}`
        )
        console.log(`Deleted GHCR package: ${pkg.name}`)
      }
    }
  } catch (error) {
    console.error(
      'Error deleting GHCR packages:',
      error.response?.status,
      error.response?.data
    )
  }
}

// GitLab Operations
async function deleteGitLabTags(projectId) {
  try {
    const { data: tags } = await gitlabApi.get(
      `/projects/${projectId}/repository/tags`
    )
    for (const tag of tags) {
      await gitlabApi.delete(
        `/projects/${projectId}/repository/tags/${encodeURIComponent(tag.name)}`
      )
      console.log(`Deleted GitLab tag: ${tag.name}`)
    }
  } catch (error) {
    console.error(
      'Error deleting GitLab tags:',
      error.response?.status,
      error.response?.data
    )
  }
}

async function deleteGitLabRegistry(projectId) {
  try {
    const { data: containers } = await gitlabApi.get(
      `/projects/${projectId}/registry/repositories`
    )
    for (const container of containers) {
      await gitlabApi.delete(
        `/projects/${projectId}/registry/repositories/${container.id}`
      )
      console.log(`Deleted GitLab container: ${container.name}`)
    }
  } catch (error) {
    console.error(
      'Error deleting GitLab containers:',
      error.response?.status,
      error.response?.data
    )
  }
}

async function main() {
  const owner = 'iamvikshan'
  const repo = 'devcontainers'
  const gitlabProjectId = '64626588'

  console.log('Starting cleanup...')

  await deleteGitHubTags(owner, repo)
  await deleteGitHubReleases(owner, repo)
  await deleteGHCRPackages(owner)
  await deleteGitLabTags(gitlabProjectId)
  await deleteGitLabRegistry(gitlabProjectId)

  console.log('Cleanup completed!')
}

main().catch(console.error)
