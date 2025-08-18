import { versionsMdManager } from './versions-md-manager'

// This version manager now delegates to versions-md-manager for VERSIONS.md operations
// It provides compatibility with the existing interface while using the markdown file

export class VersionManager {
  constructor() {
    // This class now delegates all operations to versionsMdManager
  }

  // Update VERSIONS.md with real-time data (delegates to versionsMdManager)
  async updateVersionsFile(
    newVersion?: string,
    releaseNotes?: string[]
  ): Promise<void> {
    console.log('📝 Updating VERSIONS.md with real-time data...')

    // Delegate to the versions-md-manager
    return versionsMdManager.updateVersionsFile(newVersion, releaseNotes)
  }

  // Sync sizes between README and VERSIONS.md (delegates to versionsMdManager)
  async syncAllSizes(): Promise<void> {
    console.log('🔄 Syncing sizes between README and VERSIONS.md...')

    // Delegate to the versions-md-manager
    return versionsMdManager.syncAllSizes()
  }

  // Additional methods can be added here if needed for compatibility
  // All core functionality is now handled by versionsMdManager
}

// Export singleton instance
export const versionManager = new VersionManager()
