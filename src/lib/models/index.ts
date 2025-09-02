import mongoose, { Schema } from 'mongoose'
import { Review, Wishlist, Category, Campaign, Banner } from '@/types'

// Review Schema
const ReviewSchema = new Schema<Review>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    trim: true
  },
  userImage: {
    type: String,
    trim: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  images: [{ type: String }],
  isVerified: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0
  },
  helpfulVotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  reports: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reportedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  needsModeration: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
})

ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true })

// Wishlist Schema
const WishlistSchema = new Schema<Wishlist>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    unique: true,
    index: true
  },
  productIds: [{
    type: String,
    ref: 'Product'
  }]
}, {
  timestamps: true
})

// Category Schema
const CategorySchema = new Schema<Category>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  description: { type: String },
  image: { type: String },
  parentId: {
    type: String,
    ref: 'Category',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
})

// Campaign Schema
const CampaignSchema = new Schema<Campaign>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['discount', 'bogo', 'shipping'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  code: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true
  },
  minAmount: {
    type: Number,
    min: 0
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  usageLimit: { type: Number },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  applicableProducts: [{
    type: String,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: String,
    ref: 'Category'
  }]
}, {
  timestamps: true
})

// Banner Schema
const BannerSchema = new Schema<Banner>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  link: {
    type: String,
    trim: true
  },
  buttonText: {
    type: String,
    trim: true,
    default: 'Shop Now'
  },
  displayOrder: {
    type: Number,
    required: true,
    default: 0,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
})

// Export models
export const Review = mongoose.models.Review || mongoose.model<Review>('Review', ReviewSchema)
export const Wishlist = mongoose.models.Wishlist || mongoose.model<Wishlist>('Wishlist', WishlistSchema)
export const Category = mongoose.models.Category || mongoose.model<Category>('Category', CategorySchema)
export const Campaign = mongoose.models.Campaign || mongoose.model<Campaign>('Campaign', CampaignSchema)
export const Banner = mongoose.models.Banner || mongoose.model<Banner>('Banner', BannerSchema)

// Re-export Product model
export { default as Product } from './Product'
