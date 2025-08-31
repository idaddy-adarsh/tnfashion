import mongoose, { Schema } from 'mongoose'
import { Product, ProductVariant } from '@/types'

const ProductVariantSchema = new Schema<ProductVariant>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['size', 'color', 'style'], 
    required: true 
  },
  value: { type: String, required: true },
  price: { type: Number },
  stock: { type: Number, required: true, min: 0 },
  image: { type: String }
})

const ProductSchema = new Schema<Product>({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  subcategory: {
    type: String,
    index: true
  },
  images: [{
    type: String,
    required: true
  }],
  variants: [ProductVariantSchema],
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  isOnSale: {
    type: Boolean,
    default: false,
    index: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [{
    type: String,
    index: true
  }]
}, {
  timestamps: true
})

// Indexes for better query performance
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' })
ProductSchema.index({ price: 1 })
ProductSchema.index({ rating: -1 })
ProductSchema.index({ createdAt: -1 })

export default mongoose.models.Product || mongoose.model<Product>('Product', ProductSchema)
