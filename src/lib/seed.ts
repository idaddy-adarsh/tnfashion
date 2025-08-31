import dbConnect from './mongodb'
import User from './models/User'
import Product from './models/Product'
import { Category } from './models'

export async function seedDatabase() {
  try {
    await dbConnect()
    
    console.log('🌱 Starting database seeding...')

    // Create admin users
    const adminEmails = [
      'admin1@tn.com',
      'admin2@tn.com', 
      'admin3@tn.com',
      'admin4@tn.com',
      'admin5@tn.com'
    ]

    for (const email of adminEmails) {
      const existingAdmin = await User.findOne({ email })
      if (!existingAdmin) {
        await User.create({
          name: `Admin ${email.split('@')[0].slice(-1)}`,
          email,
          password: '12345678', // This will be hashed
          isAdmin: true,
          emailVerified: true // Admin users don't need email verification
        })
        console.log(`✅ Created admin user: ${email}`)
      }
    }

    // Create categories
    const categories = [
      { name: 'Women', slug: 'women', description: 'Women\'s fashion and accessories' },
      { name: 'Men', slug: 'men', description: 'Men\'s fashion and accessories' },
      { name: 'Accessories', slug: 'accessories', description: 'Fashion accessories for all' },
      { name: 'New Arrivals', slug: 'new-arrivals', description: 'Latest additions to our collection' },
      { name: 'Sale', slug: 'sale', description: 'Discounted items' }
    ]

    for (const category of categories) {
      const existingCategory = await Category.findOne({ slug: category.slug })
      if (!existingCategory) {
        await Category.create(category)
        console.log(`✅ Created category: ${category.name}`)
      }
    }

    // Note: Sample products removed - admin will add products manually

    console.log('🎉 Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    throw error
  }
}
