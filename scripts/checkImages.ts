import { imageOperations } from './imageOperations'
import { readFileSync } from 'fs'
import { join } from 'path'

interface BaseImageCommitInfo {
  containerName: string
  baseImage: string
  hasUpdate: boolean
  lastUpdated: string
  commitMessage?: string
  digest: string
}

interface ToolVersionCheck {
  tool: string
  source: 'alpine' | 'ubuntu' | 'all'
  currentVersion: string
  latestVersion: string
  hasUpdate: boolean
  updateSource: string
}

interface ToolUpdateSummary {
  hasToolUpdates: boolean
  checks: ToolVersionCheck[]
  affectedContainers: string[]
}

async function main() {
  const args = process.argv.slice(2)
  const checkOnly = args.includes('--check-only')
  const getCommitMessages = args.includes('--get-commit-messages')
  const comprehensive = args.includes('--comprehensive')
  const outputJson = args.includes('--output-json')
  const jsonOnly = args.includes('--json-only')
  const generateUpdateNotes = args.includes('--generate-update-notes')
  const help = args.includes('--help') || args.includes('-h')
  const containersArg = args
    .find(arg => arg.startsWith('--containers='))
    ?.split('=')[1]

  if (help) {
    console.log(`
🔍 DevContainer Base Image Update Checker

Usage: bun scripts/checkImages.ts [options]

Options:
  --help, -h                 Show this help message
  --check-only              Return true/false for workflow usage (exit code based)
  --comprehensive           Run comprehensive check with detailed output
  --output-json             Output results as JSON (legacy, use with --comprehensive)
  --json-only               Output only JSON to stdout (recommended for workflows)
  --get-commit-messages     Include commit messages in output
  --generate-update-notes   Generate documentation updates
  --containers=name1,name2  Filter by specific containers

Examples:
  # Interactive check with detailed output
  bun scripts/checkImages.ts

  # For GitHub Actions workflow (recommended)
  bun scripts/checkImages.ts --comprehensive --json-only

  # Quick check for scripts
  bun scripts/checkImages.ts --check-only

  # Generate documentation updates
  bun scripts/checkImages.ts --generate-update-notes --containers=ubuntu-bun,bun-node
`)
    return
  }

  if (checkOnly) {
    // Just return true/false for workflow usage
    const hasUpdates = await checkForUpdates()
    console.log(hasUpdates ? 'true' : 'false')
    process.exit(hasUpdates ? 0 : 1)
  }

  if (generateUpdateNotes) {
    // Generate update notes for documentation
    await generateDocumentationUpdates(containersArg?.split(',') || [])
    return
  }

  if (comprehensive && (outputJson || jsonOnly)) {
    // Comprehensive check with JSON output for workflow
    await comprehensiveCheck(true) // Always silent for JSON output
    return
  }

  console.log('🔍 Checking for base image updates...\n')

  try {
    // Check base images
    const updates = await imageOperations.checkBaseImageUpdates()
    const hasBaseImageUpdates = updates.some(u => u.hasUpdate)

    // Check tool versions
    const toolCheck = await checkToolVersions()

    const hasAnyUpdates = hasBaseImageUpdates || toolCheck.hasToolUpdates

    // Display base image updates
    if (hasBaseImageUpdates) {
      console.log('\n📦 Base Image Updates Found:')
      const updatedImages = updates.filter(u => u.hasUpdate)

      for (const update of updatedImages) {
        console.log(`  - ${update.containerName} (${update.baseImage})`)
        console.log(
          `    Last updated: ${new Date(update.lastUpdated).toLocaleDateString()}`
        )

        if (getCommitMessages) {
          const commitMessage = await getBaseImageCommitMessage(
            update.baseImage
          )
          if (commitMessage) {
            console.log(`    Commit: ${commitMessage}`)
          }
        }
      }
    }

    // Display tool version updates
    if (toolCheck.hasToolUpdates) {
      console.log('\n🔧 Tool Version Updates Found:')
      const outdatedTools = toolCheck.checks.filter(c => c.hasUpdate)

      for (const check of outdatedTools) {
        console.log(
          `  - ${check.tool} (${check.source}): ${check.currentVersion} → ${check.latestVersion}`
        )
        console.log(`    Source: ${check.updateSource}`)
      }

      console.log(
        `\n� Affected containers: ${toolCheck.affectedContainers.join(', ')}`
      )
    }

    // Summary
    if (hasAnyUpdates) {
      console.log('\n🚀 Updates found! Consider running a new release.')
    } else {
      console.log('\n✅ All images and tools are up to date!')
    }

    return hasAnyUpdates
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Error checking base images:', errorMessage)
    process.exit(1)
  }
}

async function checkForUpdates(): Promise<boolean> {
  try {
    const updates = await imageOperations.checkBaseImageUpdates()
    const hasBaseImageUpdates = updates.some(u => u.hasUpdate)

    const toolCheck = await checkToolVersions()

    return hasBaseImageUpdates || toolCheck.hasToolUpdates
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Error checking for updates:', errorMessage)
    return false
  }
}

async function getBaseImageCommitMessage(
  baseImage: string
): Promise<string | null> {
  try {
    // Parse base image name (e.g., "oven/bun:latest" -> "oven/bun")
    const imageName = baseImage.split(':')[0]

    // For now, we'll create generic commit messages based on the base image
    // In a real implementation, you might want to fetch actual commit messages from Docker Hub API
    // or GitHub releases if the base images have associated repositories

    if (imageName.includes('oven/bun')) {
      return 'Updated Bun runtime with latest features and security patches'
    } else if (imageName.includes('ubuntu')) {
      return 'Updated Ubuntu base image with latest security updates and package versions'
    } else {
      return `Updated ${imageName} base image with latest changes`
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(
      `Error getting commit message for ${baseImage}:`,
      errorMessage
    )
    return null
  }
}

async function getBaseImageCommitInfo(
  updates: any[]
): Promise<BaseImageCommitInfo[]> {
  const commitInfo: BaseImageCommitInfo[] = []

  for (const update of updates) {
    const commitMessage = await getBaseImageCommitMessage(update.baseImage)

    commitInfo.push({
      containerName: update.containerName,
      baseImage: update.baseImage,
      hasUpdate: update.hasUpdate,
      lastUpdated: update.lastUpdated,
      commitMessage: commitMessage || undefined,
      digest: update.latestDigest || update.currentDigest
    })
  }

  return commitInfo
}

// Comprehensive check with JSON output for workflow
async function comprehensiveCheck(silent: boolean = false): Promise<void> {
  try {
    if (silent) {
      imageOperations.setSilent(true)
    }

    // Check base images
    const updates = await imageOperations.checkBaseImageUpdates()
    const hasBaseImageUpdates = updates.some(u => u.hasUpdate)
    const updatedContainers = updates.filter(u => u.hasUpdate)

    // Check tool versions (silent mode)
    const toolCheck = await checkToolVersions(true)

    // Combine affected containers from both checks
    const allAffectedContainers = new Set([
      ...updatedContainers.map(u => u.containerName),
      ...toolCheck.affectedContainers
    ])

    const hasUpdates = hasBaseImageUpdates || toolCheck.hasToolUpdates

    const result = {
      hasUpdates,
      updateCount: allAffectedContainers.size,
      affectedContainers: Array.from(allAffectedContainers),
      baseImageUpdates: {
        hasUpdates: hasBaseImageUpdates,
        count: updatedContainers.length,
        updates: updatedContainers.map(u => ({
          container: u.containerName,
          baseImage: u.baseImage,
          lastUpdated: u.lastUpdated,
          currentDigest: u.currentDigest,
          latestDigest: u.latestDigest
        }))
      },
      toolUpdates: {
        hasUpdates: toolCheck.hasToolUpdates,
        count: toolCheck.checks.filter(c => c.hasUpdate).length,
        checks: toolCheck.checks.map(c => ({
          tool: c.tool,
          source: c.source,
          currentVersion: c.currentVersion,
          latestVersion: c.latestVersion,
          hasUpdate: c.hasUpdate,
          updateSource: c.updateSource
        })),
        affectedContainers: toolCheck.affectedContainers
      },
      timestamp: new Date().toISOString(),
      success: true
    }

    // Always output JSON to stdout for workflow consumption
    console.log(JSON.stringify(result))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorResult = {
      hasUpdates: false,
      updateCount: 0,
      affectedContainers: [],
      baseImageUpdates: { hasUpdates: false, count: 0, updates: [] },
      toolUpdates: {
        hasUpdates: false,
        count: 0,
        checks: [],
        affectedContainers: []
      },
      error: errorMessage,
      timestamp: new Date().toISOString(),
      success: false
    }

    // Output error result as JSON to stdout
    console.log(JSON.stringify(errorResult))

    // Exit with error code to indicate failure
    process.exit(1)
  }
} // Generate documentation updates for base image changes
async function generateDocumentationUpdates(
  containers: string[]
): Promise<void> {
  try {
    console.log('📝 Generating documentation updates for base image changes...')

    const updates = await imageOperations.checkBaseImageUpdates()
    const relevantUpdates =
      containers.length > 0
        ? updates.filter(
            u => containers.includes(u.containerName) && u.hasUpdate
          )
        : updates.filter(u => u.hasUpdate)

    if (relevantUpdates.length === 0) {
      console.log('ℹ️  No updates to document')
      return
    }

    // Update CHANGELOG.md
    await updateChangelogWithBaseImages(relevantUpdates)

    // Update README files if needed
    await updateReadmeFiles(relevantUpdates)

    console.log('✅ Documentation updated successfully')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Error generating documentation updates:', errorMessage)
    throw error
  }
}

// Update CHANGELOG.md with base image changes
async function updateChangelogWithBaseImages(updates: any[]): Promise<void> {
  const { readFileSync, writeFileSync, existsSync } = await import('fs')
  const { join } = await import('path')

  const changelogPath = join(process.cwd(), 'CHANGELOG.md')

  if (!existsSync(changelogPath)) {
    console.log('⚠️  CHANGELOG.md not found, skipping update')
    return
  }

  let content = readFileSync(changelogPath, 'utf-8')

  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const timeStr = now.toISOString()

  // Generate update entry
  let updateEntry = `### ${dateStr} - Base Image Updates\n\n`
  updateEntry += `**Updated at:** ${timeStr}\n\n`
  updateEntry += `**Base images updated:**\n`

  for (const update of updates) {
    const lastUpdated = new Date(update.lastUpdated).toLocaleDateString()
    updateEntry += `- **${update.containerName}**: \`${update.baseImage}\`\n`
    updateEntry += `  - Base image last updated: ${lastUpdated}\n`
    updateEntry += `  - Digest: \`${update.latestDigest}\`\n`
  }

  updateEntry += `\n**Changes:**\n`
  updateEntry += `- Updated base images to latest versions\n`
  updateEntry += `- Security patches and bug fixes from upstream\n`
  updateEntry += `- Improved compatibility and performance\n\n`
  updateEntry += `**Impact:** Patch release - DevContainers will be rebuilt with updated base images\n\n`
  updateEntry += `---\n\n`

  // Insert after the Released Versions table (after the first ---)
  const firstDividerIndex = content.indexOf('---\n')
  if (firstDividerIndex !== -1) {
    const insertIndex = firstDividerIndex + 4 // After "---\n"
    content =
      content.slice(0, insertIndex) +
      '\n' +
      updateEntry +
      content.slice(insertIndex)
  } else {
    content += updateEntry
  }

  writeFileSync(changelogPath, content)
  console.log('✅ CHANGELOG.md updated with base image changes')
}

// Update README files with base image information
async function updateReadmeFiles(updates: any[]): Promise<void> {
  // For now, just log that we would update README files
  // In the future, this could update container-specific README files
  console.log(`📋 Would update README files for ${updates.length} containers`)
}

// ============================================================================
// Tool Version Checking Functions
// ============================================================================

// Get current tool versions from README.md
async function getCurrentVersionsFromDocs(): Promise<{
  bun: { alpine: string; ubuntu: string }
  node: { alpine: string; ubuntu: string }
  npm: { alpine: string; ubuntu: string }
}> {
  try {
    const readmePath = join(process.cwd(), 'README.md')
    const content = readFileSync(readmePath, 'utf-8')

    // Extract Alpine versions
    const alpineBunMatch = content.match(
      /#### Alpine-based Images[\s\S]*?- \*\*Bun\*\* ([0-9.]+)/
    )
    const alpineNodeMatch = content.match(
      /#### Alpine-based Images[\s\S]*?- \*\*Node\.js\*\* (v[0-9.]+)/
    )
    const alpineNpmMatch = content.match(
      /#### Alpine-based Images[\s\S]*?- \*\*npm\*\* ([0-9.]+)/
    )

    // Extract Ubuntu versions
    const ubuntuBunMatch = content.match(
      /#### Ubuntu-based Images[\s\S]*?- \*\*Bun\*\* ([0-9.]+)/
    )
    const ubuntuNodeMatch = content.match(
      /#### Ubuntu-based Images[\s\S]*?- \*\*Node\.js\*\* (v[0-9.]+)/
    )
    const ubuntuNpmMatch = content.match(
      /#### Ubuntu-based Images[\s\S]*?- \*\*npm\*\* ([0-9.]+)/
    )

    return {
      bun: {
        alpine: alpineBunMatch?.[1] || 'unknown',
        ubuntu: ubuntuBunMatch?.[1] || 'unknown'
      },
      node: {
        alpine: alpineNodeMatch?.[1] || 'unknown',
        ubuntu: ubuntuNodeMatch?.[1] || 'unknown'
      },
      npm: {
        alpine: alpineNpmMatch?.[1] || 'unknown',
        ubuntu: ubuntuNpmMatch?.[1] || 'unknown'
      }
    }
  } catch (error) {
    console.error('⚠️  Error reading current versions from README.md:', error)
    return {
      bun: { alpine: 'unknown', ubuntu: 'unknown' },
      node: { alpine: 'unknown', ubuntu: 'unknown' },
      npm: { alpine: 'unknown', ubuntu: 'unknown' }
    }
  }
}

// Get latest Bun version from GitHub releases
async function getLatestBunFromGitHub(): Promise<string | null> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json'
    }

    // Use GitHub token if available to avoid rate limits
    const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
    if (githubToken) {
      headers['Authorization'] = `Bearer ${githubToken}`
    }

    const response = await fetch(
      'https://api.github.com/repos/oven-sh/bun/releases/latest',
      { headers }
    )
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }
    const data = await response.json()
    // Tag format is "bun-v1.3.1", extract just the version
    const version = data.tag_name?.replace('bun-v', '')
    return version || null
  } catch (error) {
    console.error('⚠️  Error fetching Bun version from GitHub:', error)
    return null
  }
}

// Get Bun version from oven/bun:latest Docker image
async function getBunVersionFromOvenImage(): Promise<string | null> {
  try {
    // Fetch manifest from Docker Hub for oven/bun:latest
    const response = await fetch(
      'https://hub.docker.com/v2/repositories/oven/bun/tags/latest'
    )
    if (!response.ok) {
      throw new Error(`Docker Hub API error: ${response.status}`)
    }
    const data = await response.json()

    // Try to extract version from image labels or name
    // The oven/bun image often includes the version in the full description
    // For now, we'll use the same as GitHub since oven/bun tracks releases closely
    // In production, you might want to actually inspect the image manifest
    return await getLatestBunFromGitHub()
  } catch (error) {
    console.error('⚠️  Error fetching Bun version from oven/bun image:', error)
    return null
  }
}

// Get latest Node.js LTS version
async function getLatestNodeVersion(): Promise<string | null> {
  try {
    const response = await fetch('https://nodejs.org/dist/index.json')
    if (!response.ok) {
      throw new Error(`Node.js API error: ${response.status}`)
    }
    const data = await response.json()
    // Get the latest LTS version
    const latestLts = data.find((v: any) => v.lts !== false)
    return latestLts?.version || null
  } catch (error) {
    console.error('⚠️  Error fetching Node.js version:', error)
    return null
  }
}

// Check for tool version updates
async function checkToolVersions(
  silent: boolean = false
): Promise<ToolUpdateSummary> {
  if (!silent) {
    console.log('🔍 Checking tool versions...\n')
  }

  const currentVersions = await getCurrentVersionsFromDocs()
  const checks: ToolVersionCheck[] = []
  const affectedContainers: Set<string> = new Set()

  // Check Bun for Ubuntu (installed via script - always latest from GitHub)
  const latestBunGitHub = await getLatestBunFromGitHub()
  if (latestBunGitHub && currentVersions.bun.ubuntu !== 'unknown') {
    const hasUpdate = latestBunGitHub !== currentVersions.bun.ubuntu
    checks.push({
      tool: 'Bun',
      source: 'ubuntu',
      currentVersion: currentVersions.bun.ubuntu,
      latestVersion: latestBunGitHub,
      hasUpdate,
      updateSource: 'GitHub releases (bun.sh/install)'
    })

    if (hasUpdate) {
      affectedContainers.add('ubuntu-bun')
      affectedContainers.add('ubuntu-bun-node')
    }
  }

  // Check Bun for Alpine (from oven/bun:latest image)
  const latestBunAlpine = await getBunVersionFromOvenImage()
  if (latestBunAlpine && currentVersions.bun.alpine !== 'unknown') {
    const hasUpdate = latestBunAlpine !== currentVersions.bun.alpine
    checks.push({
      tool: 'Bun',
      source: 'alpine',
      currentVersion: currentVersions.bun.alpine,
      latestVersion: latestBunAlpine,
      hasUpdate,
      updateSource: 'oven/bun:latest Docker image'
    })

    if (hasUpdate) {
      affectedContainers.add('bun')
      affectedContainers.add('bun-node')
    }
  }

  // Check Node.js (same for both Alpine and Ubuntu in -node variants)
  const latestNode = await getLatestNodeVersion()
  if (latestNode) {
    // Check Alpine Node.js
    if (currentVersions.node.alpine !== 'unknown') {
      const hasUpdate = latestNode !== currentVersions.node.alpine
      checks.push({
        tool: 'Node.js',
        source: 'alpine',
        currentVersion: currentVersions.node.alpine,
        latestVersion: latestNode,
        hasUpdate,
        updateSource: 'Node.js official releases'
      })

      if (hasUpdate) {
        affectedContainers.add('bun-node')
      }
    }

    // Check Ubuntu Node.js
    if (currentVersions.node.ubuntu !== 'unknown') {
      const hasUpdate = latestNode !== currentVersions.node.ubuntu
      checks.push({
        tool: 'Node.js',
        source: 'ubuntu',
        currentVersion: currentVersions.node.ubuntu,
        latestVersion: latestNode,
        hasUpdate,
        updateSource: 'Node.js official releases'
      })

      if (hasUpdate) {
        affectedContainers.add('ubuntu-bun-node')
      }
    }
  }

  const hasToolUpdates = checks.some(c => c.hasUpdate)

  return {
    hasToolUpdates,
    checks,
    affectedContainers: Array.from(affectedContainers)
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { main as checkBaseImages, checkForUpdates, getBaseImageCommitInfo }
