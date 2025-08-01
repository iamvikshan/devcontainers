import axios from 'axios'

export const config = {
  owner: 'vikshan',
  ghcrOwner: 'iamvikshan',
  repoName: 'devcontainers'
}

export function getTokens() {
  // GitHub Actions uses GITHUB_TOKEN, local dev uses GH_TOKEN
  const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  const gitlabToken = process.env.GITLAB_TOKEN
  const dockerhubToken = process.env.DOCKERHUB_TOKEN

  if (!githubToken)
    throw new Error('GITHUB_TOKEN or GH_TOKEN not set in environment')
  if (!gitlabToken) throw new Error('GITLAB_TOKEN not set in environment')
  if (!dockerhubToken) throw new Error('DOCKERHUB_TOKEN not set in environment')

  return {
    github: githubToken,
    gitlab: gitlabToken,
    dockerhub: dockerhubToken
  }
}

// Lazy token loading - only get tokens when needed
let _tokens: ReturnType<typeof getTokens> | null = null

function getTokensLazy() {
  if (!_tokens) {
    _tokens = getTokens()
  }
  return _tokens
}

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

// Lazy API clients - only create when accessed
export const apiClients = {
  get github() {
    const tokens = getTokensLazy()
    return createApiClient('https://api.github.com', {
      Authorization: `Bearer ${tokens.github}`,
      Accept: 'application/vnd.github.v3+json'
    })
  },
  get gitlab() {
    const tokens = getTokensLazy()
    return createApiClient('https://gitlab.com/api/v4', {
      'PRIVATE-TOKEN': tokens.gitlab
    })
  }
  // Docker Hub authentication is handled separately in the getDockerHubSize function
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
