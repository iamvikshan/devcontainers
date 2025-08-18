import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import { checkForUpdates, getBaseImageCommitInfo } from './check-base-images'
import { imageOperations } from './image-operations'

interface PreReleaseCheckResult {
  shouldRelease: boolean
  releaseType: 'semantic' | 'forced' | 'none'
  nextVersion?: string
  baseImageUpdates?: any[]
  commitMessage?: string
  commitBody?: string[]
}

export class PreReleaseChecker {
  async checkReleaseNeeded(): Promise<PreReleaseCheckResult> {
    console.log('🔍 Checking if release is needed...\n')

    try {
      // Step 1: Check if semantic release would create a release
      const semanticReleaseResult = await this.checkSemanticRelease()

      if (semanticReleaseResult.shouldRelease) {
        console.log(
          `✅ Semantic release will create version: ${semanticReleaseResult.nextVersion}`
        )
        return {
          shouldRelease: true,
          releaseType: 'semantic',
          nextVersion: semanticReleaseResult.nextVersion
        }
      }

      console.log('ℹ️  No semantic release needed based on commits')

      // Step 2: Check for base image updates
      console.log('🔍 Checking for base image updates...')
      const hasBaseImageUpdates = await checkForUpdates()

      if (hasBaseImageUpdates) {
        console.log('🚀 Base image updates found - will force a release')

        // Get detailed base image update information
        const updates = await imageOperations.checkBaseImageUpdates()
        const updatedImages = updates.filter(u => u.hasUpdate)
        const commitInfo = await getBaseImageCommitInfo(updatedImages)

        // Create commit message for base image updates
        const { commitMessage, commitBody } =
          this.createBaseImageCommitMessage(commitInfo)

        return {
          shouldRelease: true,
          releaseType: 'forced',
          baseImageUpdates: commitInfo,
          commitMessage,
          commitBody
        }
      }

      console.log('✅ No release needed - all images are up to date')
      return {
        shouldRelease: false,
        releaseType: 'none'
      }
    } catch (error) {
      console.error('❌ Error during pre-release check:', error.message)
      throw error
    }
  }

  private async checkSemanticRelease(): Promise<{
    shouldRelease: boolean
    nextVersion?: string
  }> {
    try {
      console.log('🔍 Running semantic release dry-run...')

      // Run semantic release in dry-run mode
      const output = execSync('bunx semantic-release --dry-run --no-ci', {
        encoding: 'utf-8',
        stdio: 'pipe'
      })

      // Parse the output to see if a release would be created
      const lines = output.split('\n')
      const releaseVersionLine = lines.find(
        line =>
          line.includes('next release version is') ||
          line.includes('The next release version is')
      )

      if (releaseVersionLine) {
        // Extract version number from the line
        const versionMatch = releaseVersionLine.match(/(\d+\.\d+\.\d+)/)
        if (versionMatch) {
          return {
            shouldRelease: true,
            nextVersion: versionMatch[1]
          }
        }
      }

      // Also check for "no release" indicators
      const noReleaseIndicators = [
        'no release',
        'no new version',
        'skip release',
        'nothing to release'
      ]

      const hasNoReleaseIndicator = lines.some(line =>
        noReleaseIndicators.some(indicator =>
          line.toLowerCase().includes(indicator)
        )
      )

      return {
        shouldRelease: !hasNoReleaseIndicator
      }
    } catch (error) {
      // If semantic release fails, it usually means no release is needed
      console.log('ℹ️  Semantic release dry-run indicates no release needed')
      return { shouldRelease: false }
    }
  }

  private createBaseImageCommitMessage(commitInfo: any[]): {
    commitMessage: string
    commitBody: string[]
  } {
    const imageNames = commitInfo.map(info => info.containerName).join(', ')
    const commitMessage = `fix: update base images for ${imageNames}`

    const commitBody = ['Updated base images to latest versions:', '']

    // Add details for each updated image
    for (const info of commitInfo) {
      commitBody.push(`- **${info.containerName}**: ${info.baseImage}`)
      if (info.commitMessage) {
        commitBody.push(`  - ${info.commitMessage}`)
      }
      commitBody.push(
        `  - Last updated: ${new Date(info.lastUpdated).toLocaleDateString()}`
      )
      if (info.digest) {
        commitBody.push(`  - Digest: ${info.digest.substring(0, 12)}`)
      }
      commitBody.push('')
    }

    commitBody.push(
      'This commit triggers an automated patch release to rebuild DevContainers with updated base images.'
    )

    return { commitMessage, commitBody }
  }

  async createForceReleaseCommit(
    commitMessage: string,
    commitBody: string[]
  ): Promise<void> {
    console.log('📝 Creating force release commit...')

    try {
      // Configure git
      execSync('git config --local user.email "action@github.com"')
      execSync('git config --local user.name "GitHub Action"')

      // Create the commit message file
      const fullCommitMessage = [commitMessage, '', ...commitBody].join('\n')
      writeFileSync('commit-message.txt', fullCommitMessage)

      // Create an empty commit with the message
      execSync('git commit --allow-empty -F commit-message.txt')

      console.log('✅ Force release commit created successfully')
      console.log(`📝 Commit message: ${commitMessage}`)
    } catch (error) {
      console.error('❌ Error creating force release commit:', error.message)
      throw error
    }
  }

  async predictNextVersion(): Promise<string | null> {
    try {
      // Run semantic release dry-run to predict the next version
      const result = await this.checkSemanticRelease()
      return result.nextVersion || null
    } catch (error) {
      console.error('❌ Error predicting next version:', error.message)
      return null
    }
  }
}

// Export singleton instance
export const preReleaseChecker = new PreReleaseChecker()

// CLI usage
async function main() {
  const args = process.argv.slice(2)
  const createCommit = args.includes('--create-commit')
  const predictVersion = args.includes('--predict-version')

  try {
    if (predictVersion) {
      const version = await preReleaseChecker.predictNextVersion()
      console.log(version || 'no-version')
      return
    }

    const result = await preReleaseChecker.checkReleaseNeeded()

    if (
      result.shouldRelease &&
      result.releaseType === 'forced' &&
      createCommit
    ) {
      await preReleaseChecker.createForceReleaseCommit(
        result.commitMessage!,
        result.commitBody!
      )
    }

    // Output result for workflow consumption
    console.log('\n📊 Pre-release check result:')
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('❌ Pre-release check failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(console.error)
}
