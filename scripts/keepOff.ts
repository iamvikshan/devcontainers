import { apiClients, config } from './utils'

export async function deleteGitHubTags(owner, repo) {
  try {
    const { data: tags } = await apiClients.github.get(
      `/repos/${owner}/${repo}/tags`
    )
    await Promise.all(
      tags.map(tag =>
        apiClients.github
          .delete(`/repos/${owner}/${repo}/git/refs/tags/${tag.name}`)
          .then(() => console.log(`Deleted GitHub tag: ${tag.name}`))
      )
    )
  } catch (error) {
    console.error('Error deleting GitHub tags:', error.message)
  }
}

export async function deleteGitHubReleases(owner, repo) {
  try {
    const { data: releases } = await apiClients.github.get(
      `/repos/${owner}/${repo}/releases`
    )
    await Promise.all(
      releases.map(release =>
        apiClients.github
          .delete(`/repos/${owner}/${repo}/releases/${release.id}`)
          .then(() =>
            console.log(`Deleted GitHub release: ${release.tag_name}`)
          )
      )
    )
  } catch (error) {
    console.error('Error deleting GitHub releases:', error.message)
  }
}

export async function deleteGHCRPackages(owner) {
  try {
    const { data: packages } = await apiClients.ghcr.get(
      `/users/${owner}/packages?package_type=container`
    )
    await Promise.all(
      packages
        .filter(pkg => pkg.name.startsWith('devcontainers/'))
        .map(pkg => {
          const encodedPackageName = encodeURIComponent(pkg.name)
          return apiClients.ghcr
            .delete(`/users/${owner}/packages/container/${encodedPackageName}`)
            .then(() => console.log(`Deleted GHCR package: ${pkg.name}`))
        })
    )
  } catch (error) {
    console.error(
      'Error deleting GHCR packages:',
      error.response?.status,
      error.response?.data
    )
  }
}

async function getProjectId(owner, repo) {
  try {
    const encodedPath = encodeURIComponent(`${owner}/${repo}`)
    const { data } = await apiClients.gitlab.get(`/projects/${encodedPath}`)
    return data.id
  } catch (error) {
    throw new Error(`Failed to get GitLab project ID: ${error.message}`)
  }
}

export async function deleteGitLabTags(owner, repo) {
  try {
    const projectId = await getProjectId(owner, repo)
    const { data: tags } = await apiClients.gitlab.get(
      `/projects/${projectId}/repository/tags`
    )
    await Promise.all(
      tags.map(tag =>
        apiClients.gitlab
          .delete(
            `/projects/${projectId}/repository/tags/${encodeURIComponent(tag.name)}`
          )
          .then(() => console.log(`Deleted GitLab tag: ${tag.name}`))
      )
    )
  } catch (error) {
    console.error(
      'Error deleting GitLab tags:',
      error.response?.status,
      error.response?.data
    )
  }
}

export async function deleteGitLabRegistry(owner, repo) {
  try {
    const projectId = await getProjectId(owner, repo)
    const { data: containers } = await apiClients.gitlab.get(
      `/projects/${projectId}/registry/repositories`
    )
    await Promise.all(
      containers.map(container =>
        apiClients.gitlab
          .delete(
            `/projects/${projectId}/registry/repositories/${container.id}`
          )
          .then(() =>
            console.log(`Deleted GitLab container: ${container.name}`)
          )
      )
    )
  } catch (error) {
    console.error(
      'Error deleting GitLab containers:',
      error.response?.status,
      error.response?.data
    )
  }
}

export async function deleteDockerHubTags(owner, repo) {
  try {
    const {
      data: { results: tags }
    } = await apiClients.dockerhub.get(`/repositories/${owner}/${repo}/tags`)
    await Promise.all(
      tags.map(tag =>
        apiClients.dockerhub
          .delete(`/repositories/${owner}/${repo}/tags/${tag.name}`)
          .then(() => console.log(`Deleted DockerHub tag: ${tag.name}`))
      )
    )
  } catch (error) {
    console.error('Error deleting DockerHub tags:', error.message)
  }
}

export async function clearDockerImages(owner, repo) {
  try {
    const { data: images } = await apiClients.dockerhub.get(
      `/repositories/${owner}/${repo}/images`
    )
    await Promise.all(
      images.map(image =>
        apiClients.dockerhub
          .delete(`/repositories/${owner}/${repo}/images/${image.digest}`)
          .then(() =>
            console.log(
              `Deleted Docker image: ${image.digest.substring(0, 12)}`
            )
          )
      )
    )
  } catch (error) {
    console.error('Error clearing Docker images:', error.message)
  }
}

async function main() {
  console.log('Starting cleanup...')

  await Promise.all([
    deleteGitHubTags(config.ghcrOwner, config.repoName),
    deleteGitHubReleases(config.ghcrOwner, config.repoName),
    deleteGHCRPackages(config.ghcrOwner),
    deleteGitLabTags(config.owner, config.repoName),
    deleteGitLabRegistry(config.owner, config.repoName),
    deleteDockerHubTags(config.owner, config.repoName),
    clearDockerImages(config.owner, config.repoName)
  ])

  console.log('Cleanup completed!')
}

main().catch(console.error)
