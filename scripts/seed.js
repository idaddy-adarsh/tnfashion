const { seedDatabase } = require('../src/lib/seed.ts')

async function runSeed() {
  try {
    console.log('Starting database seed...')
    await seedDatabase()
    console.log('Seed completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

runSeed()
