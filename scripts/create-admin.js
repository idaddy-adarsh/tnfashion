#!/usr/bin/env node

/**
 * Create Admin User Script
 * 
 * This script creates an admin user with email/password credentials
 * Run with: node scripts/create-admin.js
 */

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://demo:1122334455@demo.hhebirj.mongodb.net/?retryWrites=true&w=majority&appName=demo')
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// User Schema (simplified version)
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    select: false
  },
  image: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  provider: {
    type: String,
    enum: ['credentials', 'google', 'email'],
    default: 'credentials'
  },
  profile: Object,
  addresses: Array
}, {
  timestamps: true
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

const createAdminUser = async () => {
  try {
    await connectDB()

    // Admin user details
    const adminEmail = 'bhartistorytime@gmail.com'
    const adminPassword = 'admin123456'
    const adminName = 'Admin User'

    // Check if admin user already exists
    const existingUser = await User.findOne({ email: adminEmail })
    
    if (existingUser) {
      console.log('📝 Admin user already exists!')
      console.log('🔑 Admin Credentials:')
      console.log('📧 Email:', adminEmail)
      console.log('🔒 Password: admin123456')
      console.log('👑 Admin Status:', existingUser.isAdmin ? 'Yes' : 'No')
      console.log('✅ Email Verified:', existingUser.emailVerified ? 'Yes' : 'No')
      
      // Update existing user to be admin and verified if not already
      if (!existingUser.isAdmin || !existingUser.emailVerified) {
        existingUser.isAdmin = true
        existingUser.emailVerified = true
        await existingUser.save()
        console.log('🔄 Updated user to admin and verified status')
      }
      
      process.exit(0)
    }

    // Hash password
    console.log('🔒 Hashing password...')
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(adminPassword, salt)

    // Create admin user
    console.log('👤 Creating admin user...')
    const adminUser = await User.create({
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      isAdmin: true,
      emailVerified: true,
      provider: 'credentials'
    })

    console.log('🎉 Admin user created successfully!')
    console.log('\n🔑 Admin Login Credentials:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:    bhartistorytime@gmail.com')
    console.log('🔒 Password: admin123456')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n📋 User Details:')
    console.log('👑 Admin Status: Yes')
    console.log('✅ Email Verified: Yes')
    console.log('🔐 Provider: credentials')
    console.log('📅 Created:', adminUser.createdAt)

    console.log('\n🌐 Next Steps:')
    console.log('1. Start your development server: npm run dev')
    console.log('2. Go to: http://localhost:3000/auth/signin')
    console.log('3. Use the credentials above to sign in')
    console.log('4. Access admin panel at: http://localhost:3000/admin')

  } catch (error) {
    if (error.code === 11000) {
      console.log('❌ User with this email already exists')
    } else {
      console.error('❌ Error creating admin user:', error.message)
    }
  } finally {
    await mongoose.disconnect()
    console.log('📴 Disconnected from MongoDB')
  }
}

// Run the script
createAdminUser()
