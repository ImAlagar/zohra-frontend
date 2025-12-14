import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useWishlist } from '../../../hooks/useWishlist';
import { useEffect, useState } from 'react';
import ProductCard from '../../../components/ProductCard/ProductCard';
import { Heart, Trash2, ShoppingBag, AlertCircle } from "lucide-react";
import CartSidebar from '../../../components/layout/CartSidebar';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../../redux/slices/cartSlice';
import { toast } from 'react-hot-toast';
import placeholderimage from "../../../assets/images/placeholder.jpg";

const UserWishlist = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const { 
    wishlistItems, 
    clearAllWishlist, 
    removeItemFromWishlist,
    wishlistCount 
  } = useWishlist();

  const [showCartSidebar, setShowCartSidebar] = useState(false);

  // Dynamic styles based on theme
  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-black" : "bg-white";
  const textColor = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-400" : "text-gray-600";

  // Cart update handler
  const handleCartUpdate = () => {
    setShowCartSidebar(true);
  };

  // Remove from wishlist
  const handleRemoveFromWishlist = (productId) => {
    removeItemFromWishlist(productId);
  };

  // Handle Add to Cart from Wishlist - FIXED VERSION
  const handleAddToCartFromWishlist = (product) => {
    console.log('Adding to cart from wishlist - Full product:', product);
    console.log('Product variants:', product.variants);
    
    // Check if product has variants
    if (!product.variants || product.variants.length === 0) {
      toast.error("Product variant not available");
      return;
    }

    // Get the variant that matches the wishlist item's size and color
    // First, check the original wishlist item data
    const wishlistItem = wishlistItems.find(item => {
      const itemProductId = item.product?._id || item.product?.id;
      return itemProductId === product.id || itemProductId === product._id;
    });

    console.log('Original wishlist item:', wishlistItem);
    
    let selectedVariant = product.variants[0]; // Default to first variant
    
    // If wishlist item has variant info, try to find matching variant
    if (wishlistItem?.variant) {
      console.log('Wishlist variant data:', wishlistItem.variant);
      
      // Try to find variant by size
      if (wishlistItem.variant.size) {
        const matchingVariant = product.variants.find(variant => 
          variant.size === wishlistItem.variant.size
        );
        if (matchingVariant) {
          selectedVariant = matchingVariant;
          console.log('Found variant by size:', selectedVariant.size);
        }
      }
      
      // If not found by size, try by variant ID
      if (wishlistItem.variant._id && !selectedVariant) {
        const matchingVariant = product.variants.find(variant => 
          variant._id === wishlistItem.variant._id
        );
        if (matchingVariant) {
          selectedVariant = matchingVariant;
        }
      }
    }

    console.log('Selected variant for cart:', selectedVariant);

    // Helper function to extract numeric price
    const getNumericPrice = (priceValue) => {
      if (!priceValue && priceValue !== 0) return 0;
      if (typeof priceValue === 'string') {
        // Remove currency symbols and commas
        const cleaned = priceValue.replace(/[₹,$,£,€,]/g, '').trim();
        return parseFloat(cleaned) || 0;
      }
      if (typeof priceValue === 'number') {
        return priceValue;
      }
      return 0;
    };

    // Get price - prioritize variant price
    const variantPrice = getNumericPrice(selectedVariant.price);
    const productPrice = getNumericPrice(product.normalPrice) || 
                         getNumericPrice(product.offerPrice) || 
                         getNumericPrice(product.price) || 0;
    
    const finalPrice = variantPrice > 0 ? variantPrice : productPrice;

    // Create unique ID including size and color
    const uniqueId = `${product.id}-${selectedVariant.size || 'default'}-${selectedVariant.color || 'default'}`;

    // Prepare cart item
    const cartItem = {
      id: uniqueId,
      product: {
        _id: product.id,
        name: product.name || product.title,
        price: productPrice,
        offerPrice: getNumericPrice(product.offerPrice) || null,
        wholesalePrice: getNumericPrice(product.wholesalePrice) || null,
        images: Array.isArray(product.images) ? product.images : [product.image],
        image: product.image,
        category: product.category || 'Uncategorized'
      },
      variant: {
        _id: selectedVariant._id || uniqueId,
        size: selectedVariant.size || 'N/A',
        color: selectedVariant.color || 'Default',
        price: finalPrice,
        stock: selectedVariant.stock || product.stock || 0,
        sku: selectedVariant.sku || '',
        image: selectedVariant.image || product.image
      },
      quantity: 1
    };

    console.log('Cart item being added:', cartItem);

    // Dispatch the addToCart action
    dispatch(addToCart(cartItem));
    
    // Show success message with size info
    const sizeInfo = selectedVariant.size && selectedVariant.size !== 'N/A' 
      ? ` (Size: ${selectedVariant.size})`
      : '';
    toast.success(`${product.name || product.title}${sizeInfo} added to cart!`);
    
    // Open cart sidebar
    setShowCartSidebar(true);
  };

  // Enhanced transformation with better variant handling
  const transformWishlistItem = (wishlistItem, index) => {
    if (!wishlistItem?.product) {
      console.warn('Invalid wishlist item:', wishlistItem);
      return null;
    }

    const product = wishlistItem.product;
    const variant = wishlistItem.variant;
    
    // Get the correct product ID
    const productId = product._id || product.id;
    
    // Get all available images for the product
    const getProductImages = () => {
      const allImages = [];
      
      // Add variant image if available
      if (variant?.image) {
        allImages.push(variant.image);
      }
      
      // Add product images from images array
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((img, idx) => {
          if (typeof img === 'string') {
            allImages.push(img);
          } else if (img?.imageUrl) {
            allImages.push(img.imageUrl);
          } else if (img?.url) {
            allImages.push(img.url);
          }
        });
      }
      
      // Add main product image if available
      if (product.image && !allImages.includes(product.image)) {
        allImages.push(product.image);
      }
      
      // Remove duplicates by URL
      const uniqueImages = [...new Set(allImages)];
      
      // If no images found, use placeholder
      if (uniqueImages.length === 0) {
        uniqueImages.push(placeholderimage);
      }
      
      return uniqueImages;
    };

    const productImages = getProductImages();

    // Determine the correct price
    const getCorrectPrice = () => {
      // Try in this order: variant price -> product offer price -> product normal price -> product price -> 0
      const price = variant?.price || 
                    product?.offerPrice || 
                    product?.normalPrice || 
                    product?.price || 
                    0;
      return price;
    };

    const correctPrice = getCorrectPrice();

    // Build variants array for ProductCard
    const buildVariants = () => {
      const variants = [];
      
      // If product has existing variants, use them
      if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
        product.variants.forEach(variantItem => {
          variants.push({
            _id: variantItem._id || `${productId}-${variantItem.color || 'default'}-${variantItem.size || 'N/A'}`,
            color: variantItem.color || 'Default',
            size: variantItem.size || 'N/A',
            price: variantItem.price || correctPrice,
            stock: variantItem.stock || product.stock || 0,
            variantImages: (variantItem.variantImages || productImages).map(image => ({ imageUrl: image })),
            sku: variantItem.sku || '',
            image: variantItem.image || productImages[0]
          });
        });
      } 
      // If we have variant info from wishlist, create a variant from it
      else if (variant) {
        variants.push({
          _id: variant._id || `${productId}-${variant.color || 'default'}-${variant.size || 'N/A'}`,
          color: variant.color || 'Default',
          size: variant.size || 'N/A', // Make sure size is included
          price: variant.price || correctPrice,
          stock: variant.stock || product.stock || 0,
          variantImages: productImages.map(image => ({ imageUrl: image })),
          sku: variant.sku || '',
          image: variant.image || productImages[0]
        });
      }
      // If no variants at all, create a default one
      else {
        variants.push({
          _id: productId,
          color: product.color || 'Default',
          size: 'N/A',
          price: correctPrice,
          stock: product.stock || 0,
          variantImages: productImages.map(image => ({ imageUrl: image })),
          sku: product.sku || '',
          image: productImages[0]
        });
      }
      
      return variants;
    };

    const variants = buildVariants();
    
    // Determine if product is new
    const isNew = product.createdAt ? 
      (Date.now() - new Date(product.createdAt).getTime()) < (30 * 24 * 60 * 60 * 1000) : false;
    
    // Calculate discount percentage if applicable
    const calculateDiscount = () => {
      if (product.normalPrice && product.offerPrice && product.offerPrice < product.normalPrice) {
        const discount = ((product.normalPrice - product.offerPrice) / product.normalPrice * 100).toFixed(0);
        return `${discount}% OFF`;
      }
      return null;
    };

    // Format price for display
    const formatPriceForDisplay = (priceValue) => {
      if (!priceValue && priceValue !== 0) return '₹0';
      if (typeof priceValue === 'string') {
        return priceValue.includes('₹') ? priceValue : `₹${priceValue}`;
      }
      if (typeof priceValue === 'number') {
        return `₹${priceValue}`;
      }
      return '₹0';
    };

    const displayPrice = formatPriceForDisplay(correctPrice);
    const displayOriginalPrice = product.normalPrice && product.offerPrice && product.offerPrice < product.normalPrice 
      ? formatPriceForDisplay(product.normalPrice)
      : null;

    // Extract sizes and colors from variants
    const extractSizes = () => {
      const sizes = variants.map(variantItem => variantItem.size).filter(size => size && size !== 'N/A');
      return [...new Set(sizes)];
    };

    const extractColors = () => {
      const colors = variants.map(variantItem => variantItem.color).filter(color => color && color !== 'Default');
      return [...new Set(colors)];
    };

    const transformedProduct = {
      id: productId,
      _id: productId,
      name: product.name || 'Product Name',
      title: product.name || 'Product Name',
      category: product.category || 'Uncategorized',
      price: displayPrice, // Formatted price string
      originalPrice: displayOriginalPrice,
      discount: calculateDiscount(),
      image: productImages[0] || placeholderimage,
      images: productImages,
      variants: variants,
      colors: extractColors(),
      sizes: extractSizes(), // Added sizes array
      inStock: variants.some(variantItem => variantItem.stock > 0),
      normalPrice: product.normalPrice || 0,
      offerPrice: product.offerPrice || 0,
      wholesalePrice: product.wholesalePrice || 0,
      isWholesaleUser: user?.role === 'WHOLESALER',
      avgRating: product.avgRating || 0,
      totalRatings: product.totalRatings || 0,
      isFeatured: product.featured || false,
      isNewArrival: product.isNewArrival || false,
      isBestSeller: product.isBestSeller || false,
      isNew: isNew,
      // Store the original wishlist variant for reference
      wishlistVariant: variant,
      baseProductId: product.baseProductId || productId,
      description: product.description || '',
      stock: product.stock || 0,
      // Add raw data for debugging
      _rawProduct: product,
      _rawVariant: variant
    };

    console.log('Transformed product - Size info:', {
      productName: transformedProduct.name,
      variants: transformedProduct.variants.map(variantItem => ({ size: variantItem.size, color: variantItem.color })),
      sizes: transformedProduct.sizes
    });

    return transformedProduct;
  };

  // Filter out invalid products
  const transformedProducts = wishlistItems
    .map(transformWishlistItem)
    .filter(product => product !== null && (product.id || product._id));

  return (
    <section className={`py-12 transition-colors duration-500 ${bgColor} min-h-screen`}>
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className={`text-4xl md:text-5xl font-italiana tracking-widest font-bold ${textColor}`}>
          MY WISHLIST
        </h2>
        <div className="w-20 h-[2px] bg-red-500 mx-auto mt-2"></div>
        
        {/* Wishlist Stats */}
        <div className="mt-4 flex justify-center items-center gap-6">
          <p className={`${textColor} text-lg`}>
            {transformedProducts.length} {transformedProducts.length === 1 ? 'item' : 'items'}
          </p>
          {transformedProducts.length > 0 && (
            <button
              onClick={clearAllWishlist}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {transformedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 px-6 md:px-16">
          {transformedProducts.map((product, index) => (
            <div key={product.id || product._id || index} className="relative group">
              <ProductCard 
                product={product} 
                onCartUpdate={handleCartUpdate}
                onAddToCart={() => handleAddToCartFromWishlist(product)}
                // Add debug info as tooltip instead of customActions to avoid nesting links
                showDebugInfo={false} // Set to true to enable debug info
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <Heart size={64} className="text-gray-300" />
          </div>
          <p className={`${textColor} text-xl mb-2`}>
            {wishlistCount > 0 ? 'Some wishlist items could not be loaded' : 'Your wishlist is empty'}
          </p>
          <p className={`${subText} text-sm mb-6`}>
            {wishlistCount > 0 
              ? 'There might be issues with some products in your wishlist'
              : 'Start adding products you love to your wishlist'
            }
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <ShoppingBag size={18} />
            Browse Products
          </button>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={showCartSidebar} 
        onClose={() => setShowCartSidebar(false)} 
      />

    </section>
  );
}

export default UserWishlist;