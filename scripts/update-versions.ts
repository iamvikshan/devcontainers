import { versionManager } from './version-manager'

async function main() {
  const args = process.argv.slice(2)
  const newVersion = args
    .find(arg => arg.startsWith('--version='))
    ?.split('=')[1]
  const releaseNotesArg = args
    .find(arg => arg.startsWith('--notes='))
    ?.split('=')[1]
  const releaseNotes = releaseNotesArg ? releaseNotesArg.split(',') : undefined
  const syncOnly = args.includes('--sync-only')

  console.log('🔄 Version Manager Starting...\n')

  try {
    if (syncOnly) {
      // Just sync sizes between README and versions.json
      console.log('📊 Syncing sizes only...')
      await versionManager.syncAllSizes()
    } else {
      // Full version update with real-time data
      console.log('📝 Updating versions with real-time data...')
      await versionManager.updateVersionsFile(newVersion, releaseNotes)
    }

    console.log('\n🎉 Version management complete!')
  } catch (error) {
    console.error('❌ Version management failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { main as updateVersions }
