import { preReleaseChecker } from './pre-release-check'

// Standalone script to predict the next semantic release version
async function main() {
  try {
    const version = await preReleaseChecker.predictNextVersion()
    console.log(version || 'no-version')
  } catch (error) {
    console.error('❌ Version prediction failed:', error.message)
    console.log('no-version')
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(console.error)
}
