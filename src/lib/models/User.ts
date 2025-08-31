import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import { User, UserProfile, UserPreferences, Address } from '@/types'

const AddressSchema = new Schema<Address>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true }
})

// Enhanced Address schema for multiple addresses
const UserAddressSchema = new Schema({
  type: { 
    type: String, 
    enum: ['home', 'work', 'other'], 
    required: true 
  },
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  placeId: { type: String },
  isDefault: { type: Boolean, default: false }
}, {
  timestamps: true
})

const UserPreferencesSchema = new Schema<UserPreferences>({
  newsletter: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  categories: [{ type: String }]
})

const UserProfileSchema = new Schema<UserProfile>({
  phone: { type: String },
  address: { type: AddressSchema },
  dateOfBirth: { type: Date },
  preferences: { type: UserPreferencesSchema }
})

interface UserDocument extends User, Document {
  password?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<UserDocument>({
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
    select: false // Don't include password in queries by default
  },
  image: { type: String },
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
  profile: { type: UserProfileSchema },
  addresses: [UserAddressSchema]
}, {
  timestamps: true
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Check if user is admin based on email
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []
  if (adminEmails.includes(this.email)) {
    this.isAdmin = true
    // Admin users are always verified
    this.emailVerified = true
  }

  // If user becomes admin (role change), auto-verify them
  if (this.isModified('isAdmin') && this.isAdmin) {
    this.emailVerified = true
  }

  // Hash password if it's modified
  if (!this.isModified('password') || !this.password) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema)
