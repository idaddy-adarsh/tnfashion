import mongoose, { Schema } from 'mongoose'
import { Order, OrderItem, OrderStatus, Address } from '@/types'

const AddressSchema = new Schema<Address>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true }
})

const OrderItemSchema = new Schema<OrderItem>({
  productId: {
    type: String,
    required: true,
    ref: 'Product'
  },
  productName: {
    type: String,
    required: true
  },
  variantId: { type: String },
  variantName: { type: String },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  }
})

const OrderSchema = new Schema<Order>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  items: [OrderItemSchema],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  shippingAddress: {
    type: AddressSchema,
    required: true
  },
  billingAddress: {
    type: AddressSchema,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentId: { type: String },
  trackingNumber: { type: String },
  notes: { type: String }
}, {
  timestamps: true
})

// Indexes for better query performance
OrderSchema.index({ createdAt: -1 })
OrderSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.models.Order || mongoose.model<Order>('Order', OrderSchema)
