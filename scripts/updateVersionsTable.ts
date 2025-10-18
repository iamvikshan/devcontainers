#!/usr/bin/env bun
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Updates the Released Versions table in CHANGELOG.md
 * This script is called after a successful release to update version numbers
 */

interface VersionMap {
  [containerName: string]: string
}

function updateVersionsTable(versionMap: VersionMap): void {
  const changelogPath = join(process.cwd(), 'CHANGELOG.md')

  if (!existsSync(changelogPath)) {
    console.error('❌ CHANGELOG.md not found')
    process.exit(1)
  }

  let content = readFileSync(changelogPath, 'utf-8')
  const currentDate = new Date().toISOString().split('T')[0]

  // Find the Released Versions table (optimized: stops at first ---)
  const tableRegex = /## Released Versions\s+([\s\S]*?)(?=\n---)/

  const tableMatch = content.match(tableRegex)

  if (!tableMatch) {
    console.error('❌ Released Versions table not found in CHANGELOG.md')
    process.exit(1)
  }

  const tableContent = tableMatch[1]
  const lines = tableContent.split('\n')

  // Update the table rows
  const updatedLines = lines.map(line => {
    if (
      !line.includes('|') ||
      line.includes('Container') ||
      line.includes('---')
    ) {
      return line
    }

    const cells = line
      .split('|')
      .map(c => c.trim())
      .filter(Boolean)
    if (cells.length < 3) return line

    const containerName = cells[0]

    // Check if this container was updated in the version map
    if (versionMap[containerName]) {
      const newVersion = versionMap[containerName]

      // Update the version cell (second column)
      cells[1] = `v${newVersion} (latest)`

      // Update the date cell (third column)
      cells[2] = currentDate

      // Reconstruct the line
      return `| ${cells.join(' | ')} |`
    }

    // If container wasn't updated, remove "(latest)" marker if present
    if (cells[1].includes('(latest)')) {
      cells[1] = cells[1].replace(' (latest)', '')
      return `| ${cells.join(' | ')} |`
    }

    return line
  })

  // Replace the table in the content
  const updatedTable = updatedLines.join('\n')
  const newContent = content.replace(
    tableRegex,
    `## Released Versions\n${updatedTable}\n`
  )

  // Write back to file
  writeFileSync(changelogPath, newContent)

  console.log('✅ CHANGELOG.md Released Versions table updated successfully')
  console.log(`📦 Updated versions for: ${Object.keys(versionMap).join(', ')}`)
}

// CLI execution
function main() {
  const args = process.argv.slice(2)
  const versionMapArg = args
    .find(arg => arg.startsWith('--version-map='))
    ?.split('=')[1]

  if (!versionMapArg) {
    console.error(
      'Usage: bun scripts/updateVersionsTable.ts --version-map=\'{"bun":"1.0.2","bun-node":"1.0.2"}\''
    )
    process.exit(1)
  }

  try {
    const versionMap: VersionMap = JSON.parse(versionMapArg)
    updateVersionsTable(versionMap)
  } catch (error: any) {
    console.error('❌ Error updating CHANGELOG.md:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { updateVersionsTable }
