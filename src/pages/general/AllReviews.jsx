import React, { useState } from 'react';
import { useGetAllRatingsQuery } from '../../redux/services/ratingService';
import { useTheme } from '../../context/ThemeContext';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Package,
  ThumbsUp,
  MessageCircle,
  Eye
} from 'lucide-react';

const AllReviews = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, refetch } = useGetAllRatingsQuery(filters);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters(prev => ({
        ...prev,
        page: newPage
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          />
        ))}
        <span className="ml-1 text-sm font-semibold text-gray-700 dark:text-gray-300 font-body">
          {rating}.0
        </span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} font-ui`}>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-block relative">
              <div className="w-12 h-12 border-4 border-purple-200 dark:border-purple-800 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-body">
              Loading reviews...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} font-ui`}>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-subheading">
              Something went wrong
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-body">
              We couldn't load reviews.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-ui"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const reviews = data?.data?.ratings || [];
  const pagination = data?.data?.pagination || {};
  const totalPages = pagination.pages || 1;
  const currentPage = pagination.page || 1;
  const totalReviews = pagination.total || 0;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} font-ui`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
            All Reviews
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-body">
            {totalReviews} total reviews
          </p>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 font-subheading">
              No reviews found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-body">
              There are no reviews to display.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {reviews.map((review) => {
                const primaryImage = review.primaryDisplayImage || 
                                   review.variantInfo?.primaryImage || 
                                   review.product?.images?.[0] || 
                                   review.displayImages?.[0];

                return (
                  <div 
                    key={review.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:shadow-md transition-shadow duration-200`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Left: Product Image and Info */}
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                            {primaryImage ? (
                              <img 
                                src={primaryImage.imageUrl} 
                                alt={review.product?.name || 'Product'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = '/images/placeholder-product.jpg';
                                  e.target.className = 'w-full h-full object-contain p-2 bg-gray-100 dark:bg-gray-700';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                              </div>
                            )}
                            {review.isVariantSpecific && (
                              <div className="absolute top-1 right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <Eye className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
    {/* Product Name */}
    <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white line-clamp-2 sm:line-clamp-1 font-subheading">
        {review.product?.name || 'Product'}
    </h3>

    {/* Rating + Date */}
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
        {renderStars(review.rating)}
        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded font-body whitespace-nowrap">
        {formatDate(review.createdAt)}
        </span>
    </div>
    </div>`


                          {/* Review Title */}
                          {review.title && (
                            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2 font-subheading">
                              {review.title}
                            </h4>
                          )}

                          {/* Review Text */}
                          <p className={`text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 font-body`}>
                            {review.review || 'No review text provided.'}
                          </p>

                          {/* Footer Info */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300 font-body">
                                  {review.userName || 'User'}
                                </span>
                              </div>
                              
                              {review.isVariantSpecific && review.variantInfo && (
                                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 font-body">
                                  <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                    {review.variantInfo.color && review.variantInfo.color !== 'null' && `Color: ${review.variantInfo.color}`}
                                    {review.variantInfo.color && review.variantInfo.color !== 'null' && review.variantInfo.size && ' • '}
                                    {review.variantInfo.size && `Size: ${review.variantInfo.size}`}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 font-body">
                                <ThumbsUp className="w-4 h-4" />
                                <span>{review.helpfulCount || 0}</span>
                              </div>
                              <div className={`text-xs px-2 py-1 rounded font-body ${review.isApproved ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                                {review.isApproved ? 'Published' : 'Pending'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-body">
                  Showing {((currentPage - 1) * filters.limit) + 1}-{Math.min(currentPage * filters.limit, totalReviews)} of {totalReviews} reviews
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg font-ui ${currentPage === 1
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400'
                        : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      if (pageNum < 1 || pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium font-ui ${
                            currentPage === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg font-ui ${currentPage === totalPages
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400'
                        : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllReviews;