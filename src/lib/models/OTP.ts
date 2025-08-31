import mongoose, { Schema, Document } from 'mongoose'

export interface IOTP extends Document {
  email: string
  code: string
  expiresAt: Date
  isUsed: boolean
  purpose: 'email_verification' | 'password_reset'
  createdAt: Date
}

const OTPSchema = new Schema<IOTP>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    length: 6
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  purpose: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    default: 'email_verification'
  }
}, {
  timestamps: true
})

// Index to automatically delete expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Index for faster lookups
OTPSchema.index({ email: 1, purpose: 1 })

export default mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema)
