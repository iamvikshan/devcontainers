export interface TokenResponse {
  token: string
}

export interface ImageManifest {
  mediaType: string
  manifests?: Array<{ platform: { architecture: string }; digest: string }>
  layers?: Array<{ size: number }>
}

export interface DockerHubResponse {
  full_size: number
}

export interface GitLabRepository {
  id: number
  name: string
}

export interface GitLabResponse {
  size: number
}

export interface ImageSizes {
  [key: string]: string
}

export interface ImageTag {
  name: string
  digest?: string
}

export interface Registry {
  name: string
  deleteTag: (image: string, tag: string) => Promise<void>
  listTags: (image: string) => Promise<ImageTag[]>
}

export interface RegistryConfig {
  images: string[]
  retentionCount: number
}
