import React from 'react';
import { Check, Star, ChevronRightCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductTabs = ({ product, activeTab, setActiveTab, availableSizes }) => {
  const totalRatings = product.totalRatings || 0;
  const avgRating = product.avgRating || 0;

  return (
    <div className="mb-12 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto">
          {['description', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-6 py-4 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'reviews' && ` (${totalRatings})`}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'description' && (
          <DescriptionTab product={product} />
        )}
        {activeTab === 'specifications' && (
          <SpecificationsTab product={product} availableSizes={availableSizes} />
        )}
        {activeTab === 'reviews' && (
          <ReviewsTab 
            totalRatings={totalRatings} 
            avgRating={avgRating} 
            productId={product._id || product.id}
          />
        )}
      </div>
    </div>
  );
};

const DescriptionTab = ({ product }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
      About this product
    </h3>
    <p className="text-gray-600 dark:text-gray-400">
      {product.fullDescription || product.description || 'No description available.'}
    </p>
    <ul className="mt-4 space-y-2">
      {[
        'Premium quality fabric for ultimate comfort',
        'Breathable material for all-night comfort',
        'Easy care - machine washable',
        'Perfect fit with adjustable features'
      ].map((feature, index) => (
        <li key={index} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

const SpecificationsTab = ({ product, availableSizes }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Material & Care</h4>
      <table className="w-full">
        <tbody>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <td className="py-2 text-gray-600 dark:text-gray-400">Material</td>
            <td className="py-2 text-gray-900 dark:text-white font-medium">100% Cotton</td>
          </tr>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <td className="py-2 text-gray-600 dark:text-gray-400">Care Instructions</td>
            <td className="py-2 text-gray-900 dark:text-white font-medium">Machine Wash</td>
          </tr>
          <tr>
            <td className="py-2 text-gray-600 dark:text-gray-400">Fit</td>
            <td className="py-2 text-gray-900 dark:text-white font-medium">Regular Fit</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div>
      <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Product Details</h4>
      <table className="w-full">
        <tbody>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <td className="py-2 text-gray-600 dark:text-gray-400">Product Code</td>
            <td className="py-2 text-gray-900 dark:text-white font-medium">{product.productCode || 'N/A'}</td>
          </tr>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <td className="py-2 text-gray-600 dark:text-gray-400">Category</td>
            <td className="py-2 text-gray-900 dark:text-white font-medium">{product.category}</td>
          </tr>
          <tr>
            <td className="py-2 text-gray-600 dark:text-gray-400">Available Sizes</td>
            <td className="py-2 text-gray-900 dark:text-white font-medium">
              {availableSizes.length > 0 ? availableSizes.join(', ') : 'One Size'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const ReviewsTab = ({ totalRatings, avgRating, productId }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h3 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          {avgRating.toFixed(1)}
          <span className="text-lg font-normal ml-1">/5</span>
        </h3>
        <div className="flex items-center mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= Math.floor(avgRating)
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Based on {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 md:col-span-2">
        <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Rating Distribution</h4>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center">
              <div className="flex items-center w-16">
                <span className="text-sm mr-2 text-gray-600 dark:text-gray-400">{star}</span>
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-3">
                <div 
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${Math.random() * 100}%` }}
                />
              </div>
              <span className="text-sm w-10 text-gray-500 dark:text-gray-400">
                {Math.round(totalRatings * 0.2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            Share Your Experience
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
            Help other customers by sharing your thoughts about this product
          </p>
        </div>
        <Link
          to={`/product/${productId}/reviews`}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <span>Write a Review</span>
          <ChevronRightCircle className="w-5 h-5" />
        </Link>
      </div>
    </div>

    <div className="text-center">
      <Link
        to={`/product/${productId}/reviews`}
        className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <span>View All Reviews</span>
        <ExternalLink className="w-4 h-4" />
      </Link>
    </div>
  </div>
);

export default ProductTabs;