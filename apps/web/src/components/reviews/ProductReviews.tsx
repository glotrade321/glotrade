"use client";
import { useEffect, useState } from "react";
import { Star, Camera, CheckCircle, Plus, Edit, MessageSquare } from "lucide-react";
import { ProductReview } from "@/types/review";
import { fetchProductReviews, checkUserReview } from "@/utils/reviewApi";
import { apiGet } from "@/utils/api";
import ReviewForm from "./ReviewForm";
import { toast } from "@/components/common/Toast";

import { translate, Locale } from "@/utils/i18n";

interface ProductReviewsProps {
  productId: string;
  productTitle: string;
  locale: Locale;
}

export default function ProductReviews({ productId, productTitle, locale }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState<ProductReview | null>(null);
  const [userHasPurchased, setUserHasPurchased] = useState(false);
  const [visible, setVisible] = useState(5);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  // Ensure reviews is always an array with comprehensive safety
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  // Check if current user has purchased this product
  const checkUserPurchase = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('afritrade:user') || '{}');
      const userId = user?.id || user?._id;

      if (!userId) {
        setUserHasPurchased(false);
        return;
      }

      // Check user's orders for this product
      const ordersData = await apiGet<any>(`/api/v1/orders?userId=${userId}`);

      // Handle different possible data structures
      let orders: any[] = [];
      if (ordersData?.data) {
        if (Array.isArray(ordersData.data)) {
          orders = ordersData.data;
        } else if (ordersData.data.orders && Array.isArray(ordersData.data.orders)) {
          orders = ordersData.data.orders;
        } else if (ordersData.data.items && Array.isArray(ordersData.data.items)) {
          orders = ordersData.data.items;
        }
      }

      // Ensure orders is an array before using .some()
      if (Array.isArray(orders)) {
        // Check if user has any delivered orders containing this product
        const hasPurchased = orders.some((order: any) => {
          if (order.status !== 'delivered') return false;

          return order.lineItems?.some((item: any) =>
            String(item.productId) === productId
          );
        });

        setUserHasPurchased(hasPurchased);
      } else {
        console.error('Orders is not an array:', orders);
        setUserHasPurchased(false);
      }
    } catch (error) {
      console.error('Failed to check user purchase:', error);
      setUserHasPurchased(false);
    }
  };

  // Fetch reviews and check user's existing review
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const [reviewsData, existingUserReview] = await Promise.all([
          fetchProductReviews(productId, 1, 100), // Get all reviews for now
          checkUserReview(productId)
        ]);

        // Ensure we have valid data before setting state
        // console.log('Reviews API response:', reviewsData);

        // Handle nested data structure: data.reviews instead of data directly
        let reviewsArray: ProductReview[] = [];
        let totalCount = 0;

        if (reviewsData?.data) {
          if (Array.isArray(reviewsData.data)) {
            // Old structure: data is directly an array
            reviewsArray = reviewsData.data;
            totalCount = reviewsData.total || 0;
          } else if ((reviewsData.data as any).reviews && Array.isArray((reviewsData.data as any).reviews)) {
            // New structure: data.reviews is the array
            reviewsArray = (reviewsData.data as any).reviews;
            totalCount = (reviewsData.data as any).total || 0;
          }
        }

        if (Array.isArray(reviewsArray)) {
          setReviews(reviewsArray);
          setTotalReviews(totalCount);

          // Calculate average rating
          if (reviewsArray.length > 0) {
            const totalRating = reviewsArray.reduce((sum, review) => sum + review.rating, 0);
            setAverageRating(Math.round((totalRating / reviewsArray.length) * 10) / 10);
          }
        } else {
          console.error('Invalid reviews data structure:', reviewsData);
          setReviews([]);
          setTotalReviews(0);
          setAverageRating(0);
        }

        setUserReview(existingUserReview);

        // Check if user has purchased this product
        await checkUserPurchase();
      } catch (error) {
        console.error("Failed to load reviews:", error);
        toast("Failed to load reviews", "error");
        // Ensure reviews is always an array even on error
        setReviews([]);
        setTotalReviews(0);
        setAverageRating(0);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      // Check if user is logged in before fetching reviews to avoid 401s
      const token = localStorage.getItem('afritrade:auth');
      if (token) {
        loadReviews();
      } else {
        setLoading(false);
      }
    }
  }, [productId]);

  const handleReviewSubmitted = () => {
    // Refresh reviews after submission
    window.location.reload(); // Simple refresh for now, can be optimized later
  };

  const canShowMore = visible < safeReviews.length;
  const toRender = safeReviews.slice(0, visible);

  // Rating distribution for tags
  const ratingDistribution = safeReviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return translate(locale, "reviews.date.yesterday");
    if (diffDays < 7) return translate(locale, "reviews.date.daysAgo").replace("{count}", diffDays.toString());
    if (diffDays < 30) return translate(locale, "reviews.date.weeksAgo").replace("{count}", Math.ceil(diffDays / 7).toString());
    if (diffDays < 365) return translate(locale, "reviews.date.monthsAgo").replace("{count}", Math.ceil(diffDays / 30).toString());
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <section className="animate-pulse">
        <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-48 mb-4"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-32 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-24"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      {/* Header: count and rating */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex flex sm:items-center justify-between sm:gap-3">
          <div className="text-lg sm:text-xl font-semibold">
            {totalReviews} {translate(locale, totalReviews !== 1 ? "reviews.plural" : "reviews.singular")}
          </div>
          {averageRating > 0 && (
            <>
              <span className="hidden sm:inline text-neutral-300">|</span>
              <div className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                <span>{averageRating}</span>
                <div className="flex items-center text-neutral-900 dark:text-neutral-100">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`sm:w-[18px] sm:h-[18px] ${i <= Math.round(averageRating) ? "fill-current" : "text-neutral-300 dark:text-neutral-600"}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Review Button - Only show for users who purchased the product */}
        {userHasPurchased ? (
          userReview ? (
            // User has already reviewed - show edit button
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
            >
              <Edit size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{translate(locale, "reviews.editReview")}</span>
              <span className="sm:hidden">{translate(locale, "reviews.edit")}</span>
            </button>
          ) : (
            // User hasn't reviewed yet - show write review button
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
            >
              <Plus size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{translate(locale, "reviews.writeReview")}</span>
              <span className="sm:hidden">{translate(locale, "reviews.review")}</span>
            </button>
          )
        ) : (
          // User hasn't purchased - show purchase required message
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-100 text-neutral-500 rounded-lg border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700 text-xs sm:text-sm">
            <CheckCircle size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{translate(locale, "reviews.purchaseRequired")}</span>
            <span className="sm:hidden">{translate(locale, "reviews.purchaseRequiredMobile")}</span>
          </div>
        )}
      </div>

      {/* Tags row */}
      {safeReviews.length > 0 && (
        <div className="mt-4 flex flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {Object.entries(ratingDistribution)
              .sort(([a], [b]) => Number(b) - Number(a))
              .slice(0, 3)
              .map(([rating, count]) => (
                <span key={rating} className="inline-flex items-center rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                  {rating} {translate(locale, "reviews.stars")} ({count})
                </span>
              ))}
          </div>
          <div className="w-fit inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs sm:text-sm font-medium">
            <CheckCircle size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{translate(locale, "reviews.allVerified")}</span>
            <span className="sm:hidden">{translate(locale, "reviews.verified")}</span>
          </div>
        </div>
      )}

      {/* Review items */}
      <div className="mt-6 space-y-6 sm:space-y-8">
        {toRender.map((review) => (
          <div key={review._id} className="border-b border-neutral-200 dark:border-neutral-800 pb-4 sm:pb-6 last:border-b-0">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 flex-shrink-0">
                {review.user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="font-semibold text-sm sm:text-base">{review.user.username}</span>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="text-neutral-500">• {formatDate(review.createdAt)}</span>
                    {review.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs">
                        <CheckCircle size={10} className="sm:w-3 sm:h-3" />
                        <span className="hidden sm:inline">{translate(locale, "reviews.verifiedPurchase")}</span>
                        <span className="sm:hidden">{translate(locale, "reviews.verified")}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={`sm:w-4 sm:h-4 ${star <= review.rating
                          ? "fill-neutral-900 text-neutral-900 dark:fill-neutral-100 dark:text-neutral-100"
                          : "text-neutral-300 dark:text-neutral-600"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                    {review.rating}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Comment */}
            {review.comment && (
              <div className="mt-3 text-sm sm:text-[15px] leading-6 sm:leading-7 text-neutral-800 dark:text-neutral-300">
                <p className="flex items-start gap-2">
                  <MessageSquare size={14} className="mt-0.5 sm:mt-1 text-neutral-400 flex-shrink-0 sm:w-4 sm:h-4" />
                  <span>{review.comment}</span>
                </p>
              </div>
            )}

            {/* Images */}
            {review.images && review.images.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {review.images.map((image, idx) => (
                  <div key={idx} className="relative flex-shrink-0">
                    <Camera size={14} className="absolute top-1 left-1 text-white drop-shadow sm:w-4 sm:h-4" />
                    <img
                      src={image}
                      alt={`Review image ${idx + 1}`}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {canShowMore && (
          <button
            onClick={() => setVisible((v) => Math.min(v + 5, safeReviews.length))}
            className="mx-auto block rounded-full border px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            {translate(locale, "reviews.seeMore")}
          </button>
        )}

        {safeReviews.length === 0 && (
          <div className="text-center py-6 sm:py-8 text-neutral-500 dark:text-neutral-400">
            <MessageSquare size={40} className="mx-auto mb-3 sm:mb-4 text-neutral-300 dark:text-neutral-600 sm:w-12 sm:h-12" />
            <p className="text-base sm:text-lg font-medium">{translate(locale, "reviews.noReviews")}</p>
            <p className="text-xs sm:text-sm">{translate(locale, "reviews.beFirst")}</p>
          </div>
        )}
      </div>

      {!localStorage.getItem('afritrade:auth') && (
        <div className="mt-6 text-center p-6 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-600 dark:text-neutral-400 mb-2">
            {translate(locale, "reviews.loginRequired")} <a href="/auth/login" className="text-blue-600 hover:underline">{translate(locale, "usermenu.login")}</a>.
          </p>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          productId={productId}
          productTitle={productTitle}
          onReviewSubmitted={handleReviewSubmitted}
          onClose={() => setShowReviewForm(false)}
          existingReview={userReview ? {
            id: userReview._id,
            rating: userReview.rating,
            comment: userReview.comment
          } : undefined}
          locale={locale}
        />
      )}
    </section>
  );
}

