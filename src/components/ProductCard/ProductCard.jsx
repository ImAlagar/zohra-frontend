import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { addToCart } from '../../redux/slices/cartSlice';

const ProductCard = ({
  product,
  onCartUpdate,
  selectedColor,
  onAddToCart // Add this prop
}) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const user = useSelector((state) => state.auth.user);

  // Destructure with fallbacks for both name formats
  const {
    _id,
    id,
    name,
    title, // Add title for RelatedProducts
    price,
    originalPrice,
    discount,
    image,
    isNew,
    variants = [],
    colors = [],
    baseProductId = null
  } = product;

  // Use _id for navigation (MongoDB uses _id)
  const productId = _id || id;

  // Use title if available, otherwise name
  const displayName = title || name || "Unnamed Product";

  // Check if product is in wishlist
  const isLiked = wishlistItems.some(item => 
    item.product._id === productId || item.product.id === productId
  );

  // Get all unique variant images
  const getAllVariantImages = () => {
    const allImages = [];
    
    // Add main image if available
    if (image) {
      allImages.push(image);
    }
    
    // Collect all variant images
    variants.forEach(variant => {
      if (variant.variantImages && variant.variantImages.length > 0) {
        variant.variantImages.forEach(img => {
          allImages.push(img.imageUrl);
        });
      }
      
      // Add variant image if available
      if (variant.image) {
        allImages.push(variant.image);
      }
    });
    
    // Remove duplicate images by URL
    const uniqueImages = [...new Set(allImages.filter(Boolean))];
    
    // Fallback placeholder
    if (uniqueImages.length === 0) {
      uniqueImages.push('https://via.placeholder.com/400x500?text=Product+Image');
    }
    
    return uniqueImages;
  };

  const variantImages = getAllVariantImages();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [localSelectedColor, setLocalSelectedColor] = useState(
    selectedColor || (colors.length > 0 ? colors[0] : null)
  );

  // Auto cycle images on hover
  useEffect(() => {
    let interval;
    if (isHovered && variantImages.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % variantImages.length);
      }, 2000); // Change image every 2 seconds
    }
    return () => clearInterval(interval);
  }, [isHovered, variantImages.length]);

  // Reset to first image when mouse leaves
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0);
  };

  // Handle like button click
  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!productId) return;

    const wishlistItem = {
      product: {
        _id: productId,
        name: displayName,
        image: variantImages[0] || '',
        price: price || 0,
        category: product.category || 'Uncategorized'
      },
      addedAt: new Date().toISOString()
    };

    if (isLiked) {
      dispatch(removeFromWishlist(productId));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(wishlistItem));
      toast.success('Added to wishlist');
    }
  };

  // FIXED: Handle add to cart click
  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If parent component provided onAddToCart prop, use it
    if (onAddToCart) {
      onAddToCart(product); // Pass product to parent
      return;
    }

    // Otherwise use local logic
    // Find the variant for selected color
    let variant;
    if (localSelectedColor && variants.length > 0) {
      variant = variants.find(v => v.color === localSelectedColor);
    }

    // If no variant found, use first available variant
    if (!variant && variants.length > 0) {
      variant = variants[0];
    }

    if (!variant) {
      toast.error('Please select options on product page');
      return;
    }

    if (variant.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    // Helper function to extract numeric price
    const getNumericPrice = (priceValue) => {
      if (!priceValue) return 0;
      if (typeof priceValue === 'string') {
        // Remove currency symbols and commas
        return parseFloat(priceValue.replace(/[₹,]/g, ''));
      }
      if (typeof priceValue === 'number') {
        return priceValue;
      }
      return 0;
    };

    const cartPayload = {
      product: {
        _id: productId,
        name: displayName,
        description: product.description || '',
        category: product.category || 'Uncategorized',
        images: variantImages,
        image: variantImages[0] || '',
        normalPrice: getNumericPrice(originalPrice),
        offerPrice: getNumericPrice(price)
      },
      variant: {
        _id: variant._id,
        color: variant.color || localSelectedColor,
        size: variant.size || 'N/A',
        price: variant.price || getNumericPrice(price) || 0,
        stock: variant.stock || 0,
        sku: variant.sku || '',
        image: variant.variantImages?.[0]?.imageUrl || variantImages[0] || ''
      },
      quantity: 1
    };

    dispatch(addToCart(cartPayload));
    toast.success('Added to cart');
    
    // Notify parent component about cart update
    if (onCartUpdate) {
      onCartUpdate();
    }
  };

  // Build the product URL with color parameter
  const getProductUrl = () => {
    if (!productId) return '#';
    
    let url = `/product/${productId}`;
    
    // Add color parameter if available
    if (localSelectedColor) {
      url += `?color=${encodeURIComponent(localSelectedColor)}`;
    }
    
    return url;
  };

  // Get available colors from variants if not provided in props
  const availableColors = colors.length > 0 ? colors : 
    [...new Set(variants.map(v => v.color).filter(Boolean))];

  const currentImage = variantImages[currentImageIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Use product ID in the URL with color parameter */}
      <Link 
        to={getProductUrl()}
        className="block relative rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
      >
        {/* Image Container with Auto-Cycle */}
        <div className="relative w-full h-[500px] overflow-hidden">
          <motion.img
            key={currentImageIndex}
            src={currentImage}
            alt={`${displayName} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x500?text=Image+Error';
            }}
          />
          
          {/* Image Counter (only show if multiple images) */}
          {variantImages.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className="text-xs text-white">
                {currentImageIndex + 1}/{variantImages.length}
              </span>
            </div>
          )}
        </div>

        {/* Badges (NEW, SALE) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isNew && (
            <span className="px-3 py-1 bg-black text-white text-xs font-bold rounded-sm">
              # NEW
            </span>
          )}
          {discount && (
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-sm flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {discount}
            </span>
          )}
        </div>



        {/* Product Info Overlay (inside image) */}
        <div className="absolute bottom-0 left-0 w-full p-4 
          bg-gradient-to-t from-black/90 to-transparent text-white z-10">
          
          {/* FIXED: Use displayName instead of name */}
          <h3 className="text-base font-medium mb-1 line-clamp-1">
            {displayName}
          </h3>

          <div className="flex items-center justify-between">
            <div>
              {originalPrice && originalPrice !== price && (
                <div className="text-sm line-through text-gray-300">
                  {originalPrice}
                </div>
              )}
              <div className="text-lg font-bold text-white">
                {price}
              </div>
            </div>

            <button
              onClick={handleAddToCartClick}
              className="p-2 bg-white/20 backdrop-blur-md rounded hover:bg-white/30 transition-colors z-20"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;