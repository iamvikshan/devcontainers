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

export interface ContainerVersion {
  name: string
  version: string
  lastUpdated: string
  baseImage: string
  baseImageDigest?: string
  toolVersions?: Record<string, string>
}

export interface VersionBump {
  container: string
  currentVersion: string
  newVersion: string
  bumpType: 'major' | 'minor' | 'patch'
  reason: string
}

export interface BuildResult {
  container: string
  success: boolean
  version?: string
  error?: string
  toolVersions?: Record<string, string>
  size?: number
  digest?: string
}

export interface CommitAnalysis {
  hash: string
  message: string
  type:
    | 'feat'
    | 'fix'
    | 'chore'
    | 'docs'
    | 'style'
    | 'refactor'
    | 'test'
    | 'build'
    | 'ci'
    | 'perf'
    | 'revert'
    | 'release' // Manual release override
  scope?: string
  breaking: boolean
  affectedContainers: string[]
  manualVersion?: string // Version specified in rel/release commits
}

export interface ReleaseContext {
  trigger: 'push' | 'schedule' | 'manual' | 'base-image-update'
  affectedContainers: string[]
  versionBumps: VersionBump[]
  commits: CommitAnalysis[]
  baseImageUpdates?: any[]
  manualOverride?: {
    version: string
    commitHash: string
  }
}
