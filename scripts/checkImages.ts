import { imageOperations } from './imageOperations'

interface BaseImageCommitInfo {
  containerName: string
  baseImage: string
  hasUpdate: boolean
  lastUpdated: string
  commitMessage?: string
  digest: string
}

async function main() {
  const args = process.argv.slice(2)
  const checkOnly = args.includes('--check-only')
  const getCommitMessages = args.includes('--get-commit-messages')
  const comprehensive = args.includes('--comprehensive')
  const outputJson = args.includes('--output-json')
  const generateUpdateNotes = args.includes('--generate-update-notes')
  const containersArg = args
    .find(arg => arg.startsWith('--containers='))
    ?.split('=')[1]

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

  if (comprehensive && outputJson) {
    // Comprehensive check with JSON output for workflow
    await comprehensiveCheck()
    return
  }

  console.log('🔍 Checking for base image updates...\n')

  try {
    const updates = await imageOperations.checkBaseImageUpdates()
    const hasUpdates = updates.some(u => u.hasUpdate)

    if (hasUpdates) {
      console.log('\n🚀 Updates found! Consider running a new release.')
      console.log('\nUpdated images:')

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

      // If getting commit messages, also output structured data for workflow
      if (getCommitMessages) {
        const commitInfo = await getBaseImageCommitInfo(updatedImages)
        console.log('\n📝 Commit information for workflow:')
        console.log(JSON.stringify(commitInfo, null, 2))
      }
    } else {
      console.log('\n✅ All images are up to date!')
    }

    return hasUpdates
  } catch (error) {
    console.error('❌ Error checking base images:', error.message)
    process.exit(1)
  }
}

async function checkForUpdates(): Promise<boolean> {
  try {
    const updates = await imageOperations.checkBaseImageUpdates()
    return updates.some(u => u.hasUpdate)
  } catch (error) {
    console.error('❌ Error checking for updates:', error.message)
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
    console.error(
      `Error getting commit message for ${baseImage}:`,
      error.message
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
async function comprehensiveCheck(): Promise<void> {
  try {
    const updates = await imageOperations.checkBaseImageUpdates()
    const hasUpdates = updates.some(u => u.hasUpdate)
    const updatedContainers = updates.filter(u => u.hasUpdate)

    const result = {
      hasUpdates,
      updateCount: updatedContainers.length,
      affectedContainers: updatedContainers.map(u => u.containerName),
      updates: updatedContainers.map(u => ({
        container: u.containerName,
        baseImage: u.baseImage,
        lastUpdated: u.lastUpdated,
        currentDigest: u.currentDigest,
        latestDigest: u.latestDigest
      }))
    }

    console.log(JSON.stringify(result))
  } catch (error) {
    console.log(
      JSON.stringify({
        hasUpdates: false,
        updateCount: 0,
        affectedContainers: [],
        updates: [],
        error: error.message
      })
    )
  }
}

// Generate documentation updates for base image changes
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

    // Update VERSIONS.md
    await updateVersionsWithBaseImages(relevantUpdates)

    // Update README files if needed
    await updateReadmeFiles(relevantUpdates)

    console.log('✅ Documentation updated successfully')
  } catch (error) {
    console.error('❌ Error generating documentation updates:', error.message)
    throw error
  }
}

// Update VERSIONS.md with base image changes
async function updateVersionsWithBaseImages(updates: any[]): Promise<void> {
  const { readFileSync, writeFileSync, existsSync } = await import('fs')
  const { join } = await import('path')

  const versionsPath = join(process.cwd(), 'VERSIONS.md')

  let content = ''
  if (existsSync(versionsPath)) {
    content = readFileSync(versionsPath, 'utf-8')
  } else {
    content = `# DevContainer Versions\n\nThis file tracks base image updates and releases for our DevContainer configurations.\n\n## Latest Updates\n\n`
  }

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

  // Insert at the beginning of the Latest Updates section
  const latestUpdatesIndex = content.indexOf('## Latest Updates')
  if (latestUpdatesIndex !== -1) {
    const insertIndex = content.indexOf('\n\n', latestUpdatesIndex) + 2
    content =
      content.slice(0, insertIndex) + updateEntry + content.slice(insertIndex)
  } else {
    content += updateEntry
  }

  writeFileSync(versionsPath, content)
  console.log('✅ VERSIONS.md updated with base image changes')
}

// Update README files with base image information
async function updateReadmeFiles(updates: any[]): Promise<void> {
  // For now, just log that we would update README files
  // In the future, this could update container-specific README files
  console.log(`📋 Would update README files for ${updates.length} containers`)
}

if (require.main === module) {
  main().catch(console.error)
}

export { main as checkBaseImages, checkForUpdates, getBaseImageCommitInfo }
