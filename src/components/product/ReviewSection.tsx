"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, ThumbsUp, User, Plus, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Review } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface ReviewSectionProps {
  reviews: Review[]
  productId: string
  averageRating: number
  totalReviews: number
}

export default function ReviewSection({ 
  reviews, 
  productId, 
  averageRating, 
  totalReviews 
}: ReviewSectionProps) {
  const { data: session } = useSession()
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating-high' | 'rating-low'>('newest')
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [showAddReview, setShowAddReview] = useState(false)
  const [reviewFormData, setReviewFormData] = useState({
    rating: 0,
    comment: '',
    images: [] as string[]
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [votingReviews, setVotingReviews] = useState<Set<string>>(new Set())
  const [allReviews, setAllReviews] = useState<Review[]>(reviews)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [userHasReviewed, setUserHasReviewed] = useState(false)

  // Initialize state with props
  useEffect(() => {
    setAllReviews(reviews)
    setHasMore(reviews.length >= 5) // Assume more if we have 5 or more
  }, [reviews])

  // Check if current user has already reviewed this product
  useEffect(() => {
    if (session?.user?.id) {
      const userReview = allReviews.find(
        review => review.userId === session.user.id
      )
      setUserHasReviewed(!!userReview)
    } else {
      setUserHasReviewed(false)
    }
  }, [session, allReviews])

  const loadMoreReviews = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const nextPage = currentPage + 1
      const response = await fetch(
        `/api/products/${productId}/reviews?page=${nextPage}&limit=5&sort=${sortBy}${filterRating ? `&rating=${filterRating}` : ''}`
      )

      if (!response.ok) {
        throw new Error('Failed to load more reviews')
      }

      const data = await response.json()
      if (data.success && data.data.reviews) {
        setAllReviews(prev => [...prev, ...data.data.reviews])
        setCurrentPage(nextPage)
        setHasMore(data.data.pagination.totalPages > nextPage)
      }
    } catch (error) {
      console.error('Error loading more reviews:', error)
      toast.error('Failed to load more reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleHelpfulVote = async (reviewId: string) => {
    if (!session) {
      toast.error('Please sign in to vote on reviews')
      return
    }

    if (votingReviews.has(reviewId)) {
      return // Already voting on this review
    }

    setVotingReviews(prev => new Set(prev.add(reviewId)))

    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to vote on review')
      }

      const result = await response.json()
      toast.success(result.data.message)
      
      // Refresh the page to update the vote counts
      window.location.reload()
    } catch (error) {
      console.error('Error voting on review:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to vote on review')
    } finally {
      setVotingReviews(prev => {
        const newSet = new Set(prev)
        newSet.delete(reviewId)
        return newSet
      })
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      toast.error('Please sign in to leave a review')
      return
    }

    if (reviewFormData.rating === 0) {
      toast.error('Please select a rating')
      return
    }

    if (reviewFormData.comment.trim().length < 10) {
      toast.error('Please write at least 10 characters in your review')
      return
    }

    setSubmittingReview(true)
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: reviewFormData.rating,
          comment: reviewFormData.comment.trim()
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 409) {
          // User already reviewed this product
          setUserHasReviewed(true)
          setShowAddReview(false)
          toast.error('You have already reviewed this product. Each user can only submit one review per product.')
          return
        }
        throw new Error(error.error || error.message || 'Failed to submit review')
      }

      toast.success('Review submitted successfully!')
      setReviewFormData({ rating: 0, comment: '', images: [] })
      setShowAddReview(false)
      // Refresh the page to show the new review
      window.location.reload()
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const renderRatingSelector = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setReviewFormData({ ...reviewFormData, rating: star })}
            className={`p-1 rounded-full transition-colors ${
              star <= reviewFormData.rating
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star
              className={`h-6 w-6 ${
                star <= reviewFormData.rating ? 'fill-current' : ''
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {reviewFormData.rating > 0 && (
            reviewFormData.rating === 1 ? 'Poor' :
            reviewFormData.rating === 2 ? 'Fair' :
            reviewFormData.rating === 3 ? 'Good' :
            reviewFormData.rating === 4 ? 'Very Good' : 'Excellent'
          )}
        </span>
      </div>
    )
  }

  const sortedAndFilteredReviews = allReviews
    .filter(review => filterRating ? review.rating === filterRating : true)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'rating-high':
          return b.rating - a.rating
        case 'rating-low':
          return a.rating - b.rating
        default:
          return 0
      }
    })

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${
              size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
            } ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getRatingDistribution = () => {
    const distribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(review => review.rating === rating).length,
      percentage: totalReviews > 0 ? (reviews.filter(review => review.rating === rating).length / totalReviews) * 100 : 0
    }))
    return distribution.reverse() // Show 5 stars first
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
            <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
            {renderStars(Math.round(averageRating), 'md')}
          </div>
          <p className="text-gray-600">
            Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        <div className="space-y-2">
          {getRatingDistribution().map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center space-x-2">
              <span className="text-sm w-8">{rating}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Filter:</span>
          <div className="flex space-x-1">
            <Button
              variant={filterRating === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRating(null)}
            >
              All
            </Button>
            {[5, 4, 3, 2, 1].map(rating => (
              <Button
                key={rating}
                variant={filterRating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRating(rating)}
              >
                {rating}★
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rating-high">Highest Rated</option>
            <option value="rating-low">Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* Add Review Section */}
      <div className="border-t pt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Write a Review</h3>
          {session ? (
            userHasReviewed ? (
              <div className="text-right">
                <p className="text-sm text-gray-600">You have already reviewed this product</p>
                <p className="text-xs text-gray-500">Each user can only submit one review per product</p>
              </div>
            ) : (
              !showAddReview ? (
                <Button
                  onClick={() => setShowAddReview(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Review</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddReview(false)
                    setReviewFormData({ rating: 0, comment: '', images: [] })
                  }}
                >
                  Cancel
                </Button>
              )
            )
          ) : (
            <p className="text-sm text-gray-600">Please sign in to leave a review</p>
          )}
        </div>

        {session && showAddReview && !userHasReviewed && (
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating
                  </label>
                  {renderRatingSelector()}
                </div>

                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={reviewFormData.comment}
                    onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                    placeholder="Share your thoughts about this product..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 characters ({reviewFormData.comment.length}/10)
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddReview(false)
                      setReviewFormData({ rating: 0, comment: '', images: [] })
                    }}
                    disabled={submittingReview}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingReview || reviewFormData.rating === 0 || reviewFormData.comment.trim().length < 10}
                    className="min-w-[120px]"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedAndFilteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">
                {filterRating 
                  ? `No ${filterRating}-star reviews found.`
                  : 'No reviews yet. Be the first to review this product!'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedAndFilteredReviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {review.user?.image ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <Image
                                src={review.user.image}
                                alt={review.user.name || 'User'}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {(review.userName || review.user?.name || 'Anonymous User').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{review.userName || review.user?.name || 'Anonymous User'}</h4>
                          {review.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">
                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {review.comment}
                        </p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex space-x-2 mt-3">
                            {review.images.slice(0, 3).map((image, imgIndex) => (
                              <div key={imgIndex} className="relative w-16 h-16 rounded-lg overflow-hidden">
                                <Image
                                  src={image}
                                  alt={`Review image ${imgIndex + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                            {review.images.length > 3 && (
                              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-600">
                                +{review.images.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleHelpfulVote(review._id)}
                        disabled={votingReviews.has(review._id) || review.userId === session?.user?.id}
                        className={`transition-colors ${
                          review.helpfulVotes?.includes(session?.user?.id || '') 
                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                            : 'hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <ThumbsUp className={`h-4 w-4 ${
                          review.helpfulVotes?.includes(session?.user?.id || '') ? 'fill-current' : ''
                        }`} />
                        <span className="ml-1 text-sm">
                          {votingReviews.has(review._id) ? '...' : (review.helpfulCount || 0)}
                        </span>
                      </Button>
                      {session && review.userId === session.user?.id && (
                        <span className="text-xs text-gray-500">Your review</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && sortedAndFilteredReviews.length >= 5 && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={loadMoreReviews}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Reviews'}
          </Button>
        </div>
      )}
    </div>
  )
}
