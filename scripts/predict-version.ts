import { execSync } from 'child_process'

// Standalone script to predict the next semantic release version
// This script outputs ONLY the version number for workflow consumption
async function main() {
  try {
    // Run semantic release in dry-run mode and capture output silently
    const output = execSync('bunx semantic-release --dry-run --no-ci', {
      encoding: 'utf-8',
      stdio: 'pipe' // Suppress all output except what we explicitly print
    })

    // Parse the output to find the version
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
        console.log(versionMatch[1]) // Output ONLY the version number
        return
      }
    }

    // If no version found, output no-version
    console.log('no-version')
  } catch (error) {
    // If semantic release fails, output no-version (don't log error to stdout)
    console.log('no-version')
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(console.error)
}
