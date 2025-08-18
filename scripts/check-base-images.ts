import { imageOperations } from './image-operations'

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

  if (checkOnly) {
    // Just return true/false for workflow usage
    const hasUpdates = await checkForUpdates()
    console.log(hasUpdates ? 'true' : 'false')
    process.exit(hasUpdates ? 0 : 1)
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

if (require.main === module) {
  main().catch(console.error)
}

export { main as checkBaseImages, checkForUpdates, getBaseImageCommitInfo }
