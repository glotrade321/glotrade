"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, ArrowLeft, PackageSearch } from "lucide-react";
import { apiGet } from "@/utils/api";

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  product: {
    _id: string;
    title: string;
    images?: string[];
  };
}

export default function ProfileReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const json = await apiGet<any>(`/api/v1/market/reviews?limit=100`);

        const reviewsData = json?.data || {};
        const reviewsArray = reviewsData.reviews || [];
        setReviews(reviewsArray);
      } catch (error) {
        setError("Error loading reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-[95%] px-2 md:px-6 py-4 sm:py-6">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 text-sm text-neutral-500">
          <Link href="/" className="hover:underline text-neutral-600 dark:text-neutral-400">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/profile" className="hover:underline text-neutral-600 dark:text-neutral-400">User Profile</Link>
          <span className="mx-2">›</span>
          <span className="text-neutral-700 dark:text-neutral-300">Reviews</span>
        </nav>

        <div className="mb-4 sm:mb-6">
          <Link href="/profile" className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">
            <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Back to Profile
          </Link>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 sm:h-24 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-[95%] px-2 md:px-6 py-4 sm:py-6">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 text-sm text-neutral-500">
          <Link href="/" className="hover:underline text-neutral-600 dark:text-neutral-400">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/profile" className="hover:underline text-neutral-600 dark:text-neutral-400">User Profile</Link>
          <span className="mx-2">›</span>
          <span className="text-neutral-700 dark:text-neutral-300">Reviews</span>
        </nav>

        <div className="mb-4 sm:mb-6">
          <Link href="/profile" className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">
            <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Back to Profile
          </Link>
        </div>
        <div className="text-center py-8 sm:py-12">
          <div className="text-red-500 mb-4 text-sm sm:text-base">{error}</div>
          <button onClick={() => window.location.reload()} className="rounded-full border px-3 sm:px-4 py-2 text-xs sm:text-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto md:w-[95%] w-full px-2 md:px-6 py-4 sm:py-6">
      {/* Breadcrumb Navigation */}
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:underline text-neutral-600 dark:text-neutral-400">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/profile" className="hover:underline text-neutral-600 dark:text-neutral-400">User Profile</Link>
        <span className="mx-2">›</span>
        <span className="text-neutral-700 dark:text-neutral-300">Reviews</span>
      </nav>

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Link href="/profile" className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">
          <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Back to Profile
        </Link>
        <h1 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-semibold">My Reviews</h1>
        <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''} • All from verified purchases
        </p>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <PackageSearch size={40} className="mx-auto mb-3 sm:mb-4 text-neutral-300 dark:text-neutral-600 sm:w-12 sm:h-12" />
          <h3 className="text-base sm:text-lg font-medium mb-2">No reviews yet</h3>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-4 sm:mb-6">
            Start shopping to leave reviews for products you purchase
          </p>
          <Link href="/marketplace" className="rounded-full bg-neutral-900 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="rounded-xl border border-neutral-200 bg-white p-3 sm:p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    {review.product.images && review.product.images.length > 0 ? (
                      <img
                        src={review.product.images[0]}
                        alt={review.product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-neutral-400">
                        <PackageSearch size={20} className="sm:w-6 sm:h-6" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2 sm:gap-0">
                    <h3 className="text-base text-center sm:text-left sm:text-lg font-semibold line-clamp-2">
                      {review.product.title}
                    </h3>
                    <div className="flex items-center justify-center sm:justify-end gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={`sm:w-4 sm:h-4 ${i < review.rating
                            ? "text-neutral-900 fill-current dark:text-neutral-100"
                            : "text-neutral-300 dark:text-neutral-600"
                            }`}
                        />
                      ))}
                      <span className="ml-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 mb-3 line-clamp-3">
                      {review.comment}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 text-center sm:text-left">
                      Reviewed on {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <Link
                      href={`/marketplace/${review.product._id}`}
                      className="rounded-full border border-neutral-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800 text-center"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 