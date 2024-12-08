const axios = require('axios');

// API Client configurations
const createApiClient = (baseURL, authHeader) => axios.create({
  baseURL,
  headers: {
    ...authHeader,
    Accept: 'application/vnd.github.v3+json'
  }
});

const apiClients = {
  github: createApiClient('https://api.github.com', {
    Authorization: `token ${process.env.GH_TOKEN}`
  }),
  ghcr: createApiClient('https://api.github.com', {
    Authorization: `Bearer ${process.env.GH_TOKEN}`
  }),
  gitlab: createApiClient('https://gitlab.com/api/v4', {
    'PRIVATE-TOKEN': process.env.GITLAB_TOKEN
  }),
  dockerhub: createApiClient('https://hub.docker.com/v2', {
    Authorization: `Bearer ${process.env.DOCKERHUB_TOKEN}`
  })
};

// GitHub Operations
async function deleteGitHubTags(ghOwner, repo) {
  try {
    const { data: tags } = await apiClients.github.get(`/repos/${ghOwner}/${repo}/tags`);
    await Promise.all(tags.map(tag => 
      apiClients.github.delete(`/repos/${ghOwner}/${repo}/git/refs/tags/${tag.name}`)
        .then(() => console.log(`Deleted GitHub tag: ${tag.name}`))
    ));
  } catch (error) {
    console.error('Error deleting GitHub tags:', error.message);
  }
}

async function deleteGitHubReleases(ghOwner, repo) {
  try {
    const { data: releases } = await apiClients.github.get(`/repos/${ghOwner}/${repo}/releases`);
    await Promise.all(releases.map(release =>
      apiClients.github.delete(`/repos/${ghOwner}/${repo}/releases/${release.id}`)
        .then(() => console.log(`Deleted GitHub release: ${release.tag_name}`))
    ));
  } catch (error) {
    console.error('Error deleting GitHub releases:', error.message);
  }
}

// GHCR Operations
async function deleteGHCRPackages(ghOwner) {
  try {
    const { data: packages } = await apiClients.ghcr.get(`/users/${ghOwner}/packages?package_type=container`);
    await Promise.all(packages
      .filter(pkg => pkg.name.startsWith('devcontainers/'))
      .map(pkg => {
        const encodedPackageName = encodeURIComponent(pkg.name);
        return apiClients.ghcr.delete(`/users/${ghOwner}/packages/container/${encodedPackageName}`)
          .then(() => console.log(`Deleted GHCR package: ${pkg.name}`));
      }));
  } catch (error) {
    console.error('Error deleting GHCR packages:', error.response?.status, error.response?.data);
  }
}

// GitLab Operations
async function deleteGitLabTags(projectId) {
  try {
    const { data: tags } = await apiClients.gitlab.get(`/projects/${projectId}/repository/tags`);
    await Promise.all(tags.map(tag =>
      apiClients.gitlab.delete(`/projects/${projectId}/repository/tags/${encodeURIComponent(tag.name)}`)
        .then(() => console.log(`Deleted GitLab tag: ${tag.name}`))
    ));
  } catch (error) {
    console.error('Error deleting GitLab tags:', error.response?.status, error.response?.data);
  }
}

async function deleteGitLabRegistry(projectId) {
  try {
    const { data: containers } = await apiClients.gitlab.get(`/projects/${projectId}/registry/repositories`);
    await Promise.all(containers.map(container =>
      apiClients.gitlab.delete(`/projects/${projectId}/registry/repositories/${container.id}`)
        .then(() => console.log(`Deleted GitLab container: ${container.name}`))
    ));
  } catch (error) {
    console.error('Error deleting GitLab containers:', error.response?.status, error.response?.data);
  }
}

// DockerHub Operations
async function deleteDockerHubTags(owner, repo) {
  try {
    const { data: { results: tags } } = await apiClients.dockerhub.get(`/repositories/${owner}/${repo}/tags`);
    await Promise.all(tags.map(tag =>
      apiClients.dockerhub.delete(`/repositories/${owner}/${repo}/tags/${tag.name}`)
        .then(() => console.log(`Deleted DockerHub tag: ${tag.name}`))
    ));
  } catch (error) {
    console.error('Error deleting DockerHub tags:', error.message);
  }
}

async function main() {
  const config = {
    owner: 'vikshan',
    ghOwner: 'iamvikshan',
    repo: 'devcontainers',
    gitlabProjectId: '64626588'
  };

  console.log('Starting cleanup...');

  await Promise.all([
    deleteGitHubTags(config.owner, config.repo),
    deleteGitHubReleases(config.owner, config.repo),
    deleteGHCRPackages(config.owner),
    deleteGitLabTags(config.gitlabProjectId),
    deleteGitLabRegistry(config.gitlabProjectId),
    deleteDockerHubTags(config.owner, config.repo)
  ]);

  console.log('Cleanup completed!');
}

main().catch(console.error);