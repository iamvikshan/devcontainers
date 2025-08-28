import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import {
  ContainerVersion,
  VersionBump,
  CommitAnalysis,
  ReleaseContext
} from './types'
import { IMAGE_DEFINITIONS } from './registryClient'

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

  // Load current container versions
  loadVersions(): Record<string, ContainerVersion> {
    if (!existsSync(this.versionsFile)) {
      return this.initializeVersions()
    }

    try {
      const content = readFileSync(this.versionsFile, 'utf-8')
      return JSON.parse(content)
    } catch (error) {
      this.log(`⚠️  Error reading versions file: ${error.message}`)
      return this.initializeVersions()
    }
  }

  // Initialize versions for all containers
  private initializeVersions(): Record<string, ContainerVersion> {
    const versions: Record<string, ContainerVersion> = {}
    const now = new Date().toISOString()

    IMAGE_DEFINITIONS.names.forEach(name => {
      versions[name] = {
        name,
        version: '1.0.0',
        lastUpdated: now,
        baseImage: IMAGE_DEFINITIONS.baseImages[name] || 'unknown'
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
      throw new Error(`Failed to save versions: ${error.message}`)
    }
  }

  // Parse semantic commit message
  parseCommit(commitMessage: string, commitHash: string): CommitAnalysis {
    const conventionalCommitRegex =
      /^(feat|fix|chore|docs|style|refactor|test|build|ci|perf|revert)(\([^)]+\))?(!)?: (.+)/
    const match = commitMessage.match(conventionalCommitRegex)

    if (!match) {
      return {
        hash: commitHash,
        message: commitMessage,
        type: 'chore',
        breaking: false,
        affectedContainers: IMAGE_DEFINITIONS.names // Default to all containers
      }
    }

    const [, type, scopeMatch, breaking, description] = match
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
          // Check if file is in a specific container directory
          const containerMatch = file.match(/^base\/([^\/]+)/)
          if (containerMatch) {
            const containerName = containerMatch[1]
            if (IMAGE_DEFINITIONS.names.includes(containerName)) {
              affectedContainers.add(containerName)
            }
          }

          // Check for ubuntu subdirectories
          const ubuntuMatch = file.match(/^base\/ubuntu\/([^\/]+)/)
          if (ubuntuMatch) {
            const subContainer = ubuntuMatch[1]
            const fullName = `ubuntu-${subContainer}`
            if (IMAGE_DEFINITIONS.names.includes(fullName)) {
              affectedContainers.add(fullName)
            }
          }
        })

        if (affectedContainers.size > 0) {
          return Array.from(affectedContainers)
        }
      } catch (error) {
        this.log(
          `⚠️  Could not determine changed files for ${commitHash}: ${error.message}`
        )
      }
    }

    // Default to all containers if we can't determine specific ones
    return IMAGE_DEFINITIONS.names
  }

  // Calculate version bump based on commit type
  calculateVersionBump(
    currentVersion: string,
    commitType: CommitAnalysis['type'],
    isBreaking: boolean
  ): { newVersion: string; bumpType: 'major' | 'minor' | 'patch' } {
    const [major, minor, patch] = currentVersion.split('.').map(Number)

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
    if (newBreaking && !currentBreaking) return true
    if (!newBreaking && currentBreaking) return false

    const priority = {
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
      // Get all commits since last tag or from beginning
      let gitCommand = 'git log --oneline --format="%H|%s"'

      try {
        const lastTag = execSync('git describe --tags --abbrev=0', {
          encoding: 'utf-8'
        }).trim()
        gitCommand += ` ${lastTag}..HEAD`
      } catch {
        // No tags found, get all commits
        this.log('ℹ️  No previous tags found, analyzing all commits')
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
      this.log(`⚠️  Error getting commits: ${error.message}`)
      return []
    }
  }
}

// Export singleton instance
export const versionManager = new VersionManager()
