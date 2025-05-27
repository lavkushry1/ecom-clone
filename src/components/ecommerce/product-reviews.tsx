'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormValidation } from '@/hooks/use-form-validation';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Filter,
  ChevronDown,
  Verified,
  Flag,
  Share2,
  Image as ImageIcon,
  Video,
  X,
  Calendar,
  Award,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { z } from 'zod';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userBadge?: 'verified' | 'top-reviewer' | 'early-adopter';
  rating: number;
  title: string;
  content: string;
  images?: string[];
  videos?: string[];
  date: string;
  helpful: number;
  notHelpful: number;
  replies?: ReviewReply[];
  isVerifiedPurchase: boolean;
  productVariant?: string;
  pros?: string[];
  cons?: string[];
  recommendedFor?: string[];
}

interface ReviewReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  date: string;
  isFromSeller?: boolean;
  isFromBrand?: boolean;
}

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recommendationPercentage: number;
  featuredAspects: {
    quality: number;
    value: number;
    design: number;
    delivery: number;
  };
}

interface ProductReviewsProps {
  productId: string;
  reviews?: Review[];
  reviewSummary?: ReviewSummary;
  allowReviews?: boolean;
  showWriteReview?: boolean;
  maxReviewsToShow?: number;
  className?: string;
  onReviewSubmit?: (review: Omit<Review, 'id' | 'date' | 'helpful' | 'notHelpful'>) => void;
  onReviewHelpful?: (reviewId: string, helpful: boolean) => void;
  onReviewReport?: (reviewId: string, reason: string) => void;
}

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  content: z.string().min(20, 'Review must be at least 20 characters').max(2000),
  pros: z.string().optional(),
  cons: z.string().optional(),
  recommendedFor: z.string().optional(),
  productVariant: z.string().optional()
});

export function ProductReviews({
  productId,
  reviews = [],
  reviewSummary = {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    recommendationPercentage: 0,
    featuredAspects: { quality: 0, value: 0, design: 0, delivery: 0 }
  },
  allowReviews = true,
  showWriteReview = true,
  maxReviewsToShow = 10,
  className = '',
  onReviewSubmit,
  onReviewHelpful,
  onReviewReport
}: ProductReviewsProps) {
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(reviews);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful' | 'rating-high' | 'rating-low'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showWriteReviewDialog, setShowWriteReviewDialog] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const { values, errors, setValue, validate, reset } = useFormValidation({ schema: reviewSchema });

  // Helper function to get error message for a field
  const getFieldError = (fieldName: string) => {
    const error = errors.find(e => e.field === fieldName);
    return error?.message;
  };

  // Sort and filter reviews
  useEffect(() => {
    let filtered = [...reviews];

    // Filter by rating
    if (filterRating) {
      filtered = filtered.filter(review => review.rating === filterRating);
    }

    // Sort reviews
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'helpful':
          return b.helpful - a.helpful;
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  }, [reviews, sortBy, filterRating]);

  const handleReviewSubmit = () => {
    if (validate() && onReviewSubmit) {
      const reviewData = {
        ...values,
        userId: 'guest',
        userName: 'Guest User',
        isVerifiedPurchase: false,
        pros: values.pros ? values.pros.split(',').map((p: string) => p.trim()) : [],
        cons: values.cons ? values.cons.split(',').map((p: string) => p.trim()) : [],
        recommendedFor: values.recommendedFor ? values.recommendedFor.split(',').map((p: string) => p.trim()) : [],
        images: selectedImages
      } as Omit<Review, 'id' | 'date' | 'helpful' | 'notHelpful'>;

      onReviewSubmit(reviewData);
      reset();
      setSelectedImages([]);
      setShowWriteReviewDialog(false);
    }
  };

  const toggleReviewExpansion = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const renderRatingStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    const total = reviewSummary.totalReviews;
    if (total === 0) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = reviewSummary.ratingDistribution[rating as keyof typeof reviewSummary.ratingDistribution];
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={rating} className="flex items-center space-x-3">
              <Button
                variant={filterRating === rating ? "default" : "ghost"}
                size="sm"
                className="w-12 h-6 p-0 text-xs"
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
              >
                {rating}★
              </Button>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const displayedReviews = showAll ? filteredReviews : filteredReviews.slice(0, maxReviewsToShow);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Reviews</span>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-gray-500" />
              <Badge variant="secondary">{reviewSummary.totalReviews} reviews</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Rating */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{reviewSummary.averageRating.toFixed(1)}</div>
              {renderRatingStars(reviewSummary.averageRating)}
              <p className="text-sm text-gray-600 mt-1">Based on {reviewSummary.totalReviews} reviews</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Rating Distribution</h4>
              {renderRatingDistribution()}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Would recommend</span>
                <span className="font-medium">{reviewSummary.recommendationPercentage}%</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Featured Aspects</h4>
                {Object.entries(reviewSummary.featuredAspects).map(([aspect, score]) => (
                  <div key={aspect} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{aspect}</span>
                    <div className="flex items-center space-x-2">
                      {renderRatingStars(score)}
                      <span className="text-gray-600">{score.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
              <SelectItem value="rating-high">Highest Rating</SelectItem>
              <SelectItem value="rating-low">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>

          {filterRating && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>{filterRating} Stars</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilterRating(null)}
              />
            </Badge>
          )}
        </div>

        {showWriteReview && allowReviews && (
          <Dialog open={showWriteReviewDialog} onOpenChange={setShowWriteReviewDialog}>
            <DialogTrigger asChild>
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Write Your Review</DialogTitle>
                <DialogDescription>
                  Share your experience with this product to help other customers
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium mb-2">Overall Rating *</label>
                  {renderRatingStars(values.rating || 0, true, (rating) => setValue('rating', rating))}
                  {getFieldError('rating') && <p className="text-red-500 text-sm mt-1">{getFieldError('rating')}</p>}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">Review Title *</label>
                  <Input
                    placeholder="Summarize your experience"
                    value={values.title || ''}
                    onChange={(e) => setValue('title', e.target.value)}
                  />
                  {getFieldError('title') && <p className="text-red-500 text-sm mt-1">{getFieldError('title')}</p>}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium mb-2">Your Review *</label>
                  <Textarea
                    placeholder="Tell us about your experience with this product..."
                    rows={4}
                    value={values.content || ''}
                    onChange={(e) => setValue('content', e.target.value)}
                  />
                  {getFieldError('content') && <p className="text-red-500 text-sm mt-1">{getFieldError('content')}</p>}
                </div>

                {/* Optional fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Pros (comma separated)</label>
                    <Input
                      placeholder="Great quality, fast shipping..."
                      value={values.pros || ''}
                      onChange={(e) => setValue('pros', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cons (comma separated)</label>
                    <Input
                      placeholder="Expensive, small size..."
                      value={values.cons || ''}
                      onChange={(e) => setValue('cons', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Recommended For (comma separated)</label>
                  <Input
                    placeholder="Professionals, students, daily use..."
                    value={values.recommendedFor || ''}
                    onChange={(e) => setValue('recommendedFor', e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowWriteReviewDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleReviewSubmit}>
                    Submit Review
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {displayedReviews.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-500 mb-4">
                {filterRating ? 'No reviews match your filter criteria' : 'Be the first to review this product'}
              </p>
              {showWriteReview && allowReviews && !filterRating && (
                <Button onClick={() => setShowWriteReviewDialog(true)}>
                  Write the First Review
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {displayedReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Review Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{review.userName}</span>
                            {review.userBadge === 'verified' && (
                              <Badge variant="secondary" className="text-xs">
                                <Verified className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {review.userBadge === 'top-reviewer' && (
                              <Badge variant="secondary" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                Top Reviewer
                              </Badge>
                            )}
                            {review.isVerifiedPurchase && (
                              <Badge variant="outline" className="text-xs text-green-600">
                                ✓ Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {renderRatingStars(review.rating)}
                            <span className="text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Flag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="space-y-3">
                      <h4 className="font-medium">{review.title}</h4>
                      
                      <div className={expandedReviews.has(review.id) ? '' : 'line-clamp-3'}>
                        <p className="text-gray-700">{review.content}</p>
                      </div>
                      
                      {review.content.length > 200 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleReviewExpansion(review.id)}
                          className="p-0 h-auto font-normal text-blue-600"
                        >
                          {expandedReviews.has(review.id) ? 'Show less' : 'Read more'}
                        </Button>
                      )}

                      {/* Pros and Cons */}
                      {(review.pros?.length || review.cons?.length) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {review.pros && review.pros.length > 0 && (
                            <div>
                              <h5 className="font-medium text-green-600 mb-2">Pros</h5>
                              <ul className="text-sm space-y-1">
                                {review.pros.map((pro, index) => (
                                  <li key={index} className="flex items-center space-x-2">
                                    <ThumbsUp className="h-3 w-3 text-green-500" />
                                    <span>{pro}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {review.cons && review.cons.length > 0 && (
                            <div>
                              <h5 className="font-medium text-red-600 mb-2">Cons</h5>
                              <ul className="text-sm space-y-1">
                                {review.cons.map((con, index) => (
                                  <li key={index} className="flex items-center space-x-2">
                                    <ThumbsDown className="h-3 w-3 text-red-500" />
                                    <span>{con}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Review Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {review.images.map((image, index) => (
                            <div
                              key={index}
                              className="w-16 h-16 bg-gray-100 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setImagePreview(image)}
                            >
                              <img
                                src={image}
                                alt={`Review image ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Review Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReviewHelpful?.(review.id, true)}
                          className="flex items-center space-x-2"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>Helpful ({review.helpful})</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReviewHelpful?.(review.id, false)}
                          className="flex items-center space-x-2"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span>Not Helpful ({review.notHelpful})</span>
                        </Button>
                      </div>
                      
                      {review.productVariant && (
                        <Badge variant="outline" className="text-xs">
                          Variant: {review.productVariant}
                        </Badge>
                      )}
                    </div>

                    {/* Replies */}
                    {review.replies && review.replies.length > 0 && (
                      <div className="ml-12 space-y-3 pt-4 border-t">
                        {review.replies.map((reply) => (
                          <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                {reply.userName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-sm">{reply.userName}</span>
                              {reply.isFromSeller && (
                                <Badge variant="outline" className="text-xs">Seller</Badge>
                              )}
                              {reply.isFromBrand && (
                                <Badge variant="outline" className="text-xs">Brand</Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                {new Date(reply.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load More Button */}
            {!showAll && filteredReviews.length > maxReviewsToShow && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAll(true)}
                  className="flex items-center space-x-2"
                >
                  <span>Show All {filteredReviews.length} Reviews</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Image Preview Modal */}
      {imagePreview && (
        <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
          <DialogContent className="max-w-4xl">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Review image preview"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setImagePreview(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
