import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { ProductReview, ReviewResponse, CreateReviewRequest } from '@/types/review';

// Fetch reviews for a product
export async function fetchProductReviews(
  productId: string,
  page: number = 1,
  limit: number = 10
): Promise<ReviewResponse> {
  return apiGet<ReviewResponse>(`/api/v1/market/products/${productId}/reviews?page=${page}&limit=${limit}`);
}

// Create a new review
export async function createProductReview(
  productId: string,
  reviewData: CreateReviewRequest
): Promise<ProductReview> {
  const result = await apiPost<{ data: ProductReview }>(
    `/api/v1/market/products/${productId}/reviews`,
    reviewData
  );
  return result.data;
}

// Update an existing review
export async function updateProductReview(
  productId: string,
  reviewId: string,
  reviewData: CreateReviewRequest
): Promise<ProductReview> {
  const result = await apiPut<{ data: ProductReview }>(
    `/api/v1/market/products/${productId}/reviews/${reviewId}`,
    reviewData
  );
  return result.data;
}

// Delete a review
export async function deleteProductReview(
  productId: string,
  reviewId: string
): Promise<void> {
  await apiDelete(`/api/v1/market/products/${productId}/reviews/${reviewId}`);
}

// Check if user has already reviewed this product
export async function checkUserReview(
  productId: string
): Promise<ProductReview | null> {
  try {
    const reviews = await fetchProductReviews(productId, 1, 100);
    const user = JSON.parse(localStorage.getItem('afritrade:user') || '{}');
    const userId = user?.id || user?._id;

    if (!userId) return null;

    // Handle nested data structure
    let reviewsArray: ProductReview[] = [];
    if (reviews?.data) {
      if (Array.isArray(reviews.data)) {
        reviewsArray = reviews.data;
      } else if ((reviews.data as any).reviews && Array.isArray((reviews.data as any).reviews)) {
        reviewsArray = (reviews.data as any).reviews;
      }
    }

    const userReview = reviewsArray.find(review => review.user._id === userId);
    return userReview || null;
  } catch {
    return null;
  }
} 