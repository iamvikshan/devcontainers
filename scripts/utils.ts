import axios from 'axios'

export const config = {
  owner: 'vikshan',
  ghcrOwner: 'iamvikshan',
  repoName: 'devcontainers'
}

export function getTokens() {
  const githubToken = process.env.GH_TOKEN
  const gitlabToken = process.env.GITLAB_TOKEN
  const dockerhubToken = process.env.DOCKERHUB_TOKEN

  if (!githubToken) throw new Error('GH_TOKEN not set in environment')
  if (!gitlabToken) throw new Error('GITLAB_TOKEN not set in environment')
  if (!dockerhubToken) throw new Error('DOCKERHUB_TOKEN not set in environment')

  return {
    github: githubToken,
    gitlab: gitlabToken,
    dockerhub: dockerhubToken
  }
}

const tokens = getTokens()

export const createApiClient = (
  baseURL: string,
  headers: Record<string, string>
) =>
  axios.create({
    baseURL,
    headers: {
      ...headers
    }
  })

export const apiClients = {
  github: createApiClient('https://api.github.com', {
    Authorization: `Bearer ${tokens.github}`,
    Accept: 'application/vnd.github.v3+json'
  }),
  gitlab: createApiClient('https://gitlab.com/api/v4', {
    'PRIVATE-TOKEN': tokens.gitlab
  }),
  dockerhub: createApiClient('https://hub.docker.com/v2', {
    Authorization: `Bearer ${tokens.dockerhub}`
  })
}

export interface Tag {
  name: string
  digest?: string
}

export interface Registry {
  name: string
  listTags: (image: string) => Promise<Tag[]>
  deleteTag: (image: string, tag: string) => Promise<void>
}

export interface RegistryConfig {
  images: string[]
  retentionCount: number
}
