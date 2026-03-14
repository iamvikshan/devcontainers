import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { ContainerVersion, VersionBump, CommitAnalysis } from './types'
import { IMAGE_DEFINITIONS } from './registryClient'

type NodeDistIndexEntry = {
  version?: string
  lts?: string | false
}

export class VersionManager {
  private versionsFile: string
  private silent = false

  constructor() {
    this.versionsFile = join(process.cwd(), 'container-versions.json')
  }

  setSilent(silent: boolean): void {
    this.silent = silent
  }

  private log(message: string): void {
    if (!this.silent) {
      console.log(message)
    }
  }

  private getContainerBaseImage(containerName: string): string {
    const baseImages = IMAGE_DEFINITIONS.baseImages
    if (containerName in baseImages) {
      return baseImages[containerName as keyof typeof baseImages]
    }
    return 'unknown'
  }

  // Load current container versions
  loadVersions(): Record<string, ContainerVersion> {
    // Load existing JSON to preserve toolVersions
    let existingVersions: Record<string, ContainerVersion> = {}
    if (existsSync(this.versionsFile)) {
      try {
        const content = readFileSync(this.versionsFile, 'utf-8')
        existingVersions = JSON.parse(content)
      } catch {
        // Ignore parsing errors
      }
    }

    // First try to load from CHANGELOG.md (source of truth for version numbers)
    const versionsFromChangelog = this.loadVersionsFromChangelog()
    if (
      versionsFromChangelog &&
      Object.keys(versionsFromChangelog).length > 0
    ) {
      this.log('📋 Loaded versions from CHANGELOG.md')
      // Merge: use changelog versions but preserve toolVersions from existing JSON
      const merged = this.mergeVersionsPreservingToolVersions(
        versionsFromChangelog,
        existingVersions
      )
      this.saveVersions(merged)
      return merged
    }

    // Fallback to JSON file if it exists
    if (Object.keys(existingVersions).length > 0) {
      this.log('📋 Loaded versions from container-versions.json')
      return existingVersions
    }

    // Last resort: initialize with defaults
    return this.initializeVersions()
  }

  // Merge versions from changelog with existing JSON, preserving toolVersions
  private mergeVersionsPreservingToolVersions(
    fromChangelog: Record<string, ContainerVersion>,
    existing: Record<string, ContainerVersion>
  ): Record<string, ContainerVersion> {
    const merged: Record<string, ContainerVersion> = {}

    for (const [name, version] of Object.entries(fromChangelog)) {
      merged[name] = {
        ...version,
        // Preserve toolVersions from existing if present
        toolVersions: existing[name]?.toolVersions
      }
    }

    return merged
  }

  // Load versions from CHANGELOG.md (source of truth)
  // Optimized: Only reads until the end of the Released Versions table
  private loadVersionsFromChangelog(): Record<string, ContainerVersion> | null {
    const changelogPath = join(process.cwd(), 'CHANGELOG.md')

    if (!existsSync(changelogPath)) {
      return null
    }

    try {
      const content = readFileSync(changelogPath, 'utf-8')
      const versions: Record<string, ContainerVersion> = {}

      // Look for the "Released Versions" section
      const releasedVersionsMatch = content.match(
        /## Released Versions\s+([\s\S]*?)(?=\n---)/i
      )

      if (!releasedVersionsMatch) {
        this.log('⚠️  Released Versions table not found in CHANGELOG.md')
        return null
      }

      // Only parse the table content (stops at ---), not the entire file
      const tableContent = releasedVersionsMatch[1]
      const rows = tableContent
        .split('\n')
        .filter(line => line.trim().startsWith('|'))

      for (const row of rows) {
        // Skip header and separator rows
        if (row.includes('Container') || row.includes('---')) continue

        const cells = row
          .split('|')
          .map(cell => cell.trim())
          .filter(Boolean)
        if (cells.length >= 2) {
          const containerName = cells[0]
          const versionCell = cells[1]

          // Extract version (remove "latest" marker and "v" prefix)
          const versionMatch = versionCell.match(/v?([\d.]+)/)
          if (versionMatch && IMAGE_DEFINITIONS.names.includes(containerName)) {
            versions[containerName] = {
              name: containerName,
              version: versionMatch[1],
              lastUpdated: new Date().toISOString(),
              baseImage: this.getContainerBaseImage(containerName)
            }
          }
        }
      }

      // If no versions found in table, return null to trigger initializeVersions
      if (Object.keys(versions).length === 0) {
        return null
      }

      return Object.keys(versions).length > 0 ? versions : null
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.log(`⚠️  Error parsing CHANGELOG.md: ${message}`)
      return null
    }
  }

  // Get default version when no versions found in changelog
  private getDefaultVersion(): string {
    return '1.0.0'
  }

  // Initialize versions for all containers
  private initializeVersions(): Record<string, ContainerVersion> {
    const versions: Record<string, ContainerVersion> = {}
    const now = new Date().toISOString()
    const baseVersion = this.getDefaultVersion()

    IMAGE_DEFINITIONS.names.forEach(name => {
      versions[name] = {
        name,
        version: baseVersion,
        lastUpdated: now,
        baseImage: this.getContainerBaseImage(name)
      }
    })

    this.saveVersions(versions)
    return versions
  }

  // Save versions to file
  saveVersions(versions: Record<string, ContainerVersion>): void {
    try {
      writeFileSync(this.versionsFile, JSON.stringify(versions, null, 2))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to save versions: ${message}`, {
        cause: error
      })
    }
  }

  // Parse semantic commit message
  parseCommit(commitMessage: string, commitHash: string): CommitAnalysis {
    // Check for manual release override first: rel: vX.Y.Z or release: vX.Y.Z
    const manualReleaseRegex =
      /^(?:rel|release):\s*v?(\d+\.\d+\.\d+)\s*-?\s*(.+)?/i
    const manualMatch = commitMessage.match(manualReleaseRegex)

    if (manualMatch) {
      const [, version] = manualMatch
      this.log(`🎯 Manual release override detected: v${version}`)
      return {
        hash: commitHash,
        message: commitMessage,
        type: 'release',
        breaking: false,
        affectedContainers: IMAGE_DEFINITIONS.names, // All containers
        manualVersion: version
      }
    }

    const conventionalCommitRegex =
      /^(feat|fix|chore|docs|style|refactor|test|build|ci|perf|revert)(\([^)]+\))?(!)?: (.+)/
    const match = commitMessage.match(conventionalCommitRegex)

    if (!match) {
      return {
        hash: commitHash,
        message: commitMessage,
        type: 'chore',
        breaking: false,
        affectedContainers: [] // Default to no containers when we can't parse message
      }
    }

    const [, type, scopeMatch, breaking] = match
    const scope = scopeMatch ? scopeMatch.slice(1, -1) : undefined
    const isBreaking = !!breaking || commitMessage.includes('BREAKING CHANGE')

    // Determine affected containers based on scope or changed files
    const affectedContainers = this.determineAffectedContainers(
      scope,
      commitHash
    )

    return {
      hash: commitHash,
      message: commitMessage,
      type: type as CommitAnalysis['type'],
      scope,
      breaking: isBreaking,
      affectedContainers
    }
  }

  // Determine which containers are affected by a commit
  private determineAffectedContainers(
    scope?: string,
    commitHash?: string
  ): string[] {
    // If scope matches a container name, only that container is affected
    if (scope && IMAGE_DEFINITIONS.names.includes(scope)) {
      return [scope]
    }

    // If we have a commit hash, check changed files
    if (commitHash) {
      try {
        const changedFiles = execSync(
          `git show --name-only --format="" ${commitHash}`,
          {
            encoding: 'utf-8'
          }
        )
          .trim()
          .split('\n')
          .filter(Boolean)

        const affectedContainers = new Set<string>()

        changedFiles.forEach(file => {
          // Check if file is in a specific container directory under images/
          const containerMatch = file.match(/^images\/([^/]+)/)
          if (containerMatch) {
            const containerName = containerMatch[1]
            if (IMAGE_DEFINITIONS.names.includes(containerName)) {
              affectedContainers.add(containerName)
            }
          }
        })

        if (affectedContainers.size > 0) {
          return Array.from(affectedContainers)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        this.log(
          `⚠️  Could not determine changed files for ${commitHash}: ${message}`
        )
      }
    }

    // Default to all containers if we can't determine specific ones
    return [] // Default to no containers if we can't determine specific ones
  }

  // Calculate version bump based on commit type
  calculateVersionBump(
    currentVersion: string,
    commitType: CommitAnalysis['type'],
    isBreaking: boolean
  ): { newVersion: string; bumpType: 'major' | 'minor' | 'patch' } {
    const [major, minor, patch] = currentVersion.split('.').map(Number)

    // Special case: Initial release from 0.0.0
    if (major === 0 && minor === 0 && patch === 0) {
      return {
        newVersion: '1.0.0',
        bumpType: 'major'
      }
    }

    if (isBreaking) {
      return {
        newVersion: `${major + 1}.0.0`,
        bumpType: 'major'
      }
    }

    switch (commitType) {
      case 'feat':
        return {
          newVersion: `${major}.${minor + 1}.0`,
          bumpType: 'minor'
        }
      case 'fix':
      case 'perf':
        return {
          newVersion: `${major}.${minor}.${patch + 1}`,
          bumpType: 'patch'
        }
      default:
        return {
          newVersion: `${major}.${minor}.${patch + 1}`,
          bumpType: 'patch'
        }
    }
  }

  // Process commits and determine version bumps
  processCommits(commits: CommitAnalysis[]): VersionBump[] {
    const versions = this.loadVersions()
    const versionBumps: VersionBump[] = []

    // Check for manual release override first
    const manualReleaseCommit = commits.find(
      c => c.type === 'release' && c.manualVersion
    )

    if (manualReleaseCommit && manualReleaseCommit.manualVersion) {
      const manualVersion = manualReleaseCommit.manualVersion

      this.log(`📋 Manual release override requested: v${manualVersion}`)

      // Helper: compare semver strings 'MAJOR.MINOR.PATCH'
      const compareSemver = (a: string, b: string): number => {
        const [aM, aN, aP] = a.split('.').map(Number)
        const [bM, bN, bP] = b.split('.').map(Number)
        if (aM !== bM) return aM - bM
        if (aN !== bN) return aN - bN
        return aP - bP
      }

      // If manual version would downgrade any current version, skip override
      const downgrades = IMAGE_DEFINITIONS.names.filter(name => {
        const current = versions[name]?.version || '0.0.0'
        return compareSemver(manualVersion!, current) < 0
      })

      if (downgrades.length > 0) {
        this.log(
          `\u26a0\ufe0f Manual override v${manualVersion} would downgrade: ${downgrades.join(', ')} - ignoring`
        )
        return []
      }

      // If manual version equals current versions for all containers, skip manual override
      // and process other commits normally
      const allEqual = IMAGE_DEFINITIONS.names.every(name => {
        const current = versions[name]?.version || '0.0.0'
        return compareSemver(manualVersion!, current) === 0
      })

      if (allEqual) {
        this.log(
          `\u2139\ufe0f Manual override v${manualVersion} matches current versions - processing other commits instead`
        )
        // Don't return early - fall through to process other commits
      } else {
        // Apply the manual version to ALL containers
        IMAGE_DEFINITIONS.names.forEach(container => {
          const currentVersion = versions[container]?.version || '1.0.0'
          versionBumps.push({
            container,
            currentVersion,
            newVersion: manualVersion!,
            bumpType: 'major', // Manual releases can be any type, we use major as default
            reason: 'manual release override'
          })
        })

        return versionBumps
      }
    }

    const containerBumps: Record<
      string,
      { type: CommitAnalysis['type']; breaking: boolean }
    > = {}

    // Analyze all commits to determine the highest bump needed per container
    commits.forEach(commit => {
      commit.affectedContainers.forEach(container => {
        const current = containerBumps[container]

        if (
          !current ||
          this.isHigherPriority(
            commit.type,
            commit.breaking,
            current.type,
            current.breaking
          )
        ) {
          containerBumps[container] = {
            type: commit.type,
            breaking: commit.breaking
          }
        }
      })
    })

    // Generate version bumps
    Object.entries(containerBumps).forEach(([container, bump]) => {
      const currentVersion = versions[container]?.version || '1.0.0'
      const { newVersion, bumpType } = this.calculateVersionBump(
        currentVersion,
        bump.type,
        bump.breaking
      )

      versionBumps.push({
        container,
        currentVersion,
        newVersion,
        bumpType,
        reason: `${bump.type}${bump.breaking ? ' (breaking)' : ''}`
      })
    })

    return versionBumps
  }

  // Determine if one commit type has higher priority than another
  private isHigherPriority(
    newType: CommitAnalysis['type'],
    newBreaking: boolean,
    currentType: CommitAnalysis['type'],
    currentBreaking: boolean
  ): boolean {
    // Manual release always has highest priority
    if (newType === 'release') return true
    if (currentType === 'release') return false

    if (newBreaking && !currentBreaking) return true
    if (!newBreaking && currentBreaking) return false

    const priority: Record<CommitAnalysis['type'], number> = {
      release: 10, // Highest priority
      feat: 2,
      fix: 1,
      perf: 1,
      chore: 0,
      docs: 0,
      style: 0,
      refactor: 0,
      test: 0,
      build: 0,
      ci: 0,
      revert: 0
    }

    return priority[newType] > priority[currentType]
  }

  // Apply version bumps and update versions file
  applyVersionBumps(
    versionBumps: VersionBump[]
  ): Record<string, ContainerVersion> {
    const versions = this.loadVersions()
    const now = new Date().toISOString()

    versionBumps.forEach(bump => {
      if (versions[bump.container]) {
        versions[bump.container].version = bump.newVersion
        versions[bump.container].lastUpdated = now
      }
    })

    this.saveVersions(versions)
    return versions
  }

  // Get commits since last release for specific containers
  getCommitsSinceLastRelease(containers?: string[]): CommitAnalysis[] {
    try {
      // Find the last release commit (our automated commit message pattern)
      // This is more reliable than a fixed number of commits
      const lastReleaseCommit = this.findLastReleaseCommit()

      let gitCommand: string
      if (lastReleaseCommit) {
        // Get all commits since the last release commit (exclusive)
        gitCommand = `git log ${lastReleaseCommit}..HEAD --oneline --format="%H|%s"`
        this.log(
          `ℹ️  Analyzing commits since last release (${lastReleaseCommit.substring(0, 7)})`
        )
      } else {
        // Fallback: analyze last 20 commits if no release commit found
        const commitLimit = parseInt(
          process.env.COMMIT_ANALYSIS_LIMIT || '20',
          10
        )
        gitCommand = `git log --oneline --format="%H|%s" -${commitLimit}`
        this.log(
          `ℹ️  No release commit found, analyzing last ${commitLimit} commits`
        )
      }

      const output = execSync(gitCommand, { encoding: 'utf-8' }).trim()
      if (!output) return []

      const commits = output.split('\n').map(line => {
        const [hash, message] = line.split('|')
        return this.parseCommit(message, hash)
      })

      // Filter commits if specific containers are requested
      if (containers && containers.length > 0) {
        return commits.filter(commit =>
          commit.affectedContainers.some(container =>
            containers.includes(container)
          )
        )
      }

      return commits
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.log(`⚠️  Error getting commits: ${message}`)
      return []
    }
  }

  // Find the last release commit by looking for our automated commit message
  private findLastReleaseCommit(): string | null {
    try {
      // Look for commits matching our release commit patterns
      // Pattern 1: "chore: update versions and documentation [skip ci]" (new combined commit)
      // Pattern 2: "docs: update documentation [skip ci]" (old pattern)
      // Pattern 3: "chore: update tool versions cache [skip ci]" (old pattern)
      const patterns = [
        'chore: update versions and documentation \\[skip ci\\]',
        'docs: update documentation \\[skip ci\\]',
        'chore: update tool versions cache \\[skip ci\\]'
      ]

      for (const pattern of patterns) {
        try {
          const result = execSync(
            `git log --oneline --format="%H" --grep="${pattern}" -1`,
            { encoding: 'utf-8' }
          ).trim()

          if (result) {
            return result
          }
        } catch {
          // Pattern not found, try next
        }
      }

      return null
    } catch {
      return null
    }
  }

  // ============================================================================
  // External Version Checking (merged from versionChecker.ts)
  // ============================================================================

  // Fetch latest Bun version from GitHub releases
  async fetchLatestBunVersion(): Promise<string | null> {
    try {
      const response = await fetch(
        'https://api.github.com/repos/oven-sh/bun/releases/latest'
      )
      const data = await response.json()
      return data.tag_name?.replace('bun-v', '') || null
    } catch {
      this.log('⚠️  Error fetching Bun version from GitHub')
      return null
    }
  }

  // Fetch latest Node.js LTS version
  async fetchLatestNodeVersion(): Promise<string | null> {
    try {
      const response = await fetch('https://nodejs.org/dist/index.json')
      const data = (await response.json()) as NodeDistIndexEntry[]
      const latestLts = data.find(v => v.lts !== false)
      return latestLts?.version?.replace('v', '') || null
    } catch {
      this.log('⚠️  Error fetching Node.js version')
      return null
    }
  }

  // Fetch latest Python version
  async fetchLatestPythonVersion(): Promise<string | null> {
    try {
      const response = await fetch('https://www.python.org/downloads/')
      const html = await response.text()
      const match = html.match(/Download Python (\d+\.\d+\.\d+)/i)
      return match?.[1] || null
    } catch {
      this.log('⚠️  Error fetching Python version')
      return null
    }
  }

  // Compare semantic versions
  compareSemver(current: string, latest: string): boolean {
    // Remove 'v' prefix if present
    const cleanCurrent = current.replace(/^v/, '')
    const cleanLatest = latest.replace(/^v/, '')

    if (cleanCurrent === cleanLatest) return false

    const currentParts = cleanCurrent.split('.').map(Number)
    const latestParts = cleanLatest.split('.').map(Number)

    for (
      let i = 0;
      i < Math.max(currentParts.length, latestParts.length);
      i++
    ) {
      const curr = currentParts[i] || 0
      const lat = latestParts[i] || 0

      if (lat > curr) return true
      if (lat < curr) return false
    }

    return false
  }

  // Load tool versions from cache in container-versions.json
  loadToolVersionsFromCache(): Record<string, Record<string, string>> {
    const versions = this.loadVersions()
    const toolVersions: Record<string, Record<string, string>> = {}

    for (const [containerName, containerInfo] of Object.entries(versions)) {
      if (containerInfo.toolVersions) {
        toolVersions[containerName] = containerInfo.toolVersions
      }
    }

    return toolVersions
  }

  // Save tool versions to cache in container-versions.json
  saveToolVersionsToCache(
    containerName: string,
    toolVersions: Record<string, string>
  ): void {
    const versions = this.loadVersions()
    const containerVersion = versions[containerName]

    if (containerVersion) {
      containerVersion.toolVersions = toolVersions
      this.saveVersions(versions)
      this.log(`✅ Saved tool versions for ${containerName} to cache`)
    } else {
      this.log(`⚠️  Container ${containerName} not found in versions`)
    }
  }

  // Compare cached tool versions with external APIs
  async checkToolUpdates(): Promise<{
    hasUpdates: boolean
    affectedContainers: string[]
    checks: Array<{
      tool: string
      containerName: string
      currentVersion: string
      latestVersion: string
      hasUpdate: boolean
      source: string
    }>
  }> {
    this.log('🔧 Checking tool versions against external sources...\n')

    const cachedVersions = this.loadToolVersionsFromCache()
    const checks: Array<{
      tool: string
      containerName: string
      currentVersion: string
      latestVersion: string
      hasUpdate: boolean
      source: string
    }> = []
    const affectedContainers = new Set<string>()

    const checkToolByContainer = async ({
      tool,
      toolKey,
      source,
      fetchLatestVersion,
      formatLatestVersion = (latestVersion: string) => latestVersion,
      normalizeCurrentVersion = (currentVersion: string) => currentVersion,
      normalizeLatestVersion = (latestVersion: string) => latestVersion
    }: {
      tool: string
      toolKey: string
      source: string
      fetchLatestVersion: () => Promise<string | null>
      formatLatestVersion?: (latestVersion: string) => string
      normalizeCurrentVersion?: (currentVersion: string) => string
      normalizeLatestVersion?: (latestVersion: string) => string
    }): Promise<void> => {
      const containersWithTool = Object.entries(cachedVersions).filter(
        ([, versions]) => Boolean(versions[toolKey])
      )

      if (containersWithTool.length === 0) {
        return
      }

      const latestVersionRaw = await fetchLatestVersion()
      if (!latestVersionRaw) {
        return
      }

      const latestVersion = normalizeLatestVersion(latestVersionRaw)

      containersWithTool.forEach(([containerName, versions]) => {
        const currentVersion = versions[toolKey]
        const hasUpdate = this.compareSemver(
          normalizeCurrentVersion(currentVersion),
          latestVersion
        )

        checks.push({
          tool,
          containerName,
          currentVersion,
          latestVersion: formatLatestVersion(latestVersionRaw),
          hasUpdate,
          source
        })

        if (hasUpdate) {
          affectedContainers.add(containerName)
        }
      })
    }

    if (Object.keys(cachedVersions).length === 0) {
      this.log('⚠️  No cached tool versions found')
      return { hasUpdates: false, affectedContainers: [], checks: [] }
    }

    // Check Bun
    await checkToolByContainer({
      tool: 'Bun',
      toolKey: 'bun_version',
      source: 'GitHub releases',
      fetchLatestVersion: () => this.fetchLatestBunVersion()
    })

    // Check Node.js
    await checkToolByContainer({
      tool: 'Node.js',
      toolKey: 'node_version',
      source: 'nodejs.org',
      fetchLatestVersion: () => this.fetchLatestNodeVersion(),
      formatLatestVersion: latestNode => `v${latestNode.replace(/^v/, '')}`,
      normalizeCurrentVersion: currentNode => currentNode.replace(/^v/, ''),
      normalizeLatestVersion: latestNode => latestNode.replace(/^v/, '')
    })

    // Check Python
    await checkToolByContainer({
      tool: 'Python',
      toolKey: 'python_version',
      source: 'python.org',
      fetchLatestVersion: () => this.fetchLatestPythonVersion()
    })

    // Log results
    const updatesFound = checks.filter(c => c.hasUpdate)
    if (updatesFound.length > 0) {
      this.log('📦 Tool updates found:')
      updatesFound.forEach(check => {
        this.log(
          `  • ${check.containerName} ${check.tool}: ${check.currentVersion} → ${check.latestVersion} (${check.source})`
        )
      })
      this.log(
        `\n🎯 Affected containers: ${Array.from(affectedContainers).join(', ')}`
      )
    } else {
      this.log('✅ All tools are up to date!')
    }

    return {
      hasUpdates: affectedContainers.size > 0,
      affectedContainers: Array.from(affectedContainers),
      checks
    }
  }
}

// Export singleton instance
export const versionManager = new VersionManager()
