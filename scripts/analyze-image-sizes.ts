import { imageOperations } from './image-operations'

async function main() {
  console.log('🔍 Starting comprehensive image size analysis...\n')

  try {
    await imageOperations.analyzeImageSizes()
  } catch (error) {
    console.error('❌ Error analyzing image sizes:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { main as analyzeImageSizes }
