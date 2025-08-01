import { imageOperations } from './image-operations'

async function main() {
  console.log('🔍 Checking for base image updates...\n')

  try {
    const updates = await imageOperations.checkBaseImageUpdates()

    const hasUpdates = updates.some(u => u.hasUpdate)

    if (hasUpdates) {
      console.log('\n🚀 Updates found! Consider running a new release.')
      console.log('\nUpdated images:')
      updates
        .filter(u => u.hasUpdate)
        .forEach(u => {
          console.log(`  - ${u.containerName} (${u.baseImage})`)
          console.log(
            `    Last updated: ${new Date(u.lastUpdated).toLocaleDateString()}`
          )
        })
    } else {
      console.log('\n✅ All images are up to date!')
    }

    return hasUpdates
  } catch (error) {
    console.error('❌ Error checking base images:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { main as checkBaseImages }
