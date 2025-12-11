import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

// Import reusable components
import { useTheme } from '../../../../context/ThemeContext';
import { 
  useGetProductByIdQuery, 
  useUpdateProductMutation,
} from '../../../../redux/services/productService';
import { useGetSubcategoriesByCategoryQuery } from '../../../../redux/services/subcategoryService';
import { useGetAllCategoriesQuery } from '../../../../redux/services/categoryService';
import InputField from '../../../../components/Common/InputField';
import SelectField from '../../../../components/Common/SelectField';
import TextArea from '../../../../components/Common/TextArea';
import Button from '../../../../components/Common/Button';
import { ArrowLeft, View, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCustomColor, setShowCustomColor] = useState(false);
  const { theme } = useTheme();

  // NEW: Track if product has colors or not
  const [hasColors, setHasColors] = useState(false); // Default to false (without colors)

  // Redux queries and mutations
  const { data: productData, isLoading: productLoading, refetch: refetchProduct } = useGetProductByIdQuery(productId);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const { data: subcategoriesData, isLoading: subcategoriesLoading } = 
    useGetSubcategoriesByCategoryQuery(selectedCategoryId, { skip: !selectedCategoryId });

  // NEW STATES FOR PRODUCTS WITHOUT COLORS
  const [simpleSizes, setSimpleSizes] = useState([{ size: '', stock: 0, sku: '' }]);
  const [simpleProductImages, setSimpleProductImages] = useState([]);
  const [simpleProductImageFiles, setSimpleProductImageFiles] = useState([]);

  const extractCategories = (data) => {
    if (!data) {
      return [];
    }
    
    // Based on your Redux structure, categories are in data.data.categories
    if (data.data && data.data.categories && Array.isArray(data.data.categories)) {
      return data.data.categories;
    }
    
    // Fallback: try data.categories
    if (data.categories && Array.isArray(data.categories)) {
      return data.categories;
    }
    
    // Fallback: try data.data as array
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    // Fallback: data itself might be array
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  };

  const extractSubcategories = (data) => {
    if (!data) {
      return [];
    }
    
    // Subcategories likely follow similar structure
    if (data.data && data.data.subcategories && Array.isArray(data.data.subcategories)) {
      return data.data.subcategories;
    }
    
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  };

  const safeMapOptions = (array, valueKey = 'id', labelKey = 'name') => {
    if (!Array.isArray(array)) return [];
    
    return array
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        value: item[valueKey] || item._id || item.id,
        label: item[labelKey] || item.title || item.name || 'Unnamed'
      }))
      .filter(option => option.value && option.label);
  };

  const categories = categoriesLoading ? [] : extractCategories(categoriesData);
  const subcategories = subcategoriesLoading ? [] : extractSubcategories(subcategoriesData);
  const product = productData?.data;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const slideInVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Product basic information
  const [productForm, setProductForm] = useState({
    name: '',
    productCode: '',
    description: '',
    normalPrice: '',
    offerPrice: '',
    wholesalePrice: '',
    categoryId: '',
    subcategoryId: '',
    status: 'ACTIVE',
  });

  // Product details (features, specifications)
  const [productDetails, setProductDetails] = useState([
    { title: '', description: '' },
  ]);

  // Professional variant structure: color -> sizes + images (FOR PRODUCTS WITH COLORS)
  const [variants, setVariants] = useState({});

  const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const commonColors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Gray', 'Navy', 'Maroon', 'Olive'];

  // Theme-based styling
  const themeClasses = {
    light: {
      bg: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        gradient: 'from-blue-600 to-blue-800',
        card: 'bg-white',
        input: 'bg-white'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-700',
        muted: 'text-gray-600',
        inverse: 'text-white'
      },
      border: 'border-gray-200',
      shadow: 'shadow-lg',
    },
    dark: {
      bg: {
        primary: 'bg-gray-900',
        secondary: 'bg-gray-800',
        gradient: 'from-gray-800 to-gray-900',
        card: 'bg-gray-800',
        input: 'bg-gray-700'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-200',
        muted: 'text-gray-400',
        inverse: 'text-gray-900'
      },
      border: 'border-gray-700',
      shadow: 'shadow-lg shadow-gray-900',
    }
  };

  const currentTheme = themeClasses[theme] || themeClasses.light;

  useEffect(() => {
    return () => {
      // Clean up all blob URLs when component unmounts
      Object.values(variants).forEach(variantData => {
        variantData.imagePreviews.forEach(url => {
          if (url?.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      });
      
      // Clean up simple product image URLs
      simpleProductImages.forEach(url => {
        if (url?.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setProductForm({
        name: product.name || '',
        productCode: product.productCode || '',
        description: product.description || '',
        normalPrice: product.normalPrice || '',
        offerPrice: product.offerPrice || '',
        wholesalePrice: product.wholesalePrice || '',
        categoryId: product.categoryId || '',
        subcategoryId: product.subcategoryId || '',
        status: product.status || 'ACTIVE',
      });

      setSelectedCategoryId(product.categoryId || '');

      // Set product details
      if (product.productDetails && product.productDetails.length > 0) {
        const details = product.productDetails.map(detail => {
          if (detail && typeof detail === 'object') {
            return {
              title: detail.title || detail.Title || detail.name || '',
              description: detail.description || detail.Description || detail.desc || detail.value || ''
            };
          }
          return { title: '', description: '' };
        }).filter(detail => detail.title || detail.description);
        
        setProductDetails(details.length > 0 ? details : [{ title: '', description: '' }]);
      } else {
        setProductDetails([{ title: '', description: '' }]);
      }

      // Check if product has colors
      if (product.variants && product.variants.length > 0) {
        // Check if any variant has a color (not null)
        const hasColorVariants = product.variants.some(variant => variant.color);
        
        setHasColors(hasColorVariants);
        
        if (hasColorVariants) {
          // ========== PRODUCT WITH COLORS ==========
          const variantsObj = {};
          
          product.variants.forEach(variant => {
            if (variant.color) {
              if (!variantsObj[variant.color]) {
                variantsObj[variant.color] = {
                  variantId: variant.id,
                  sizes: [],
                  images: [],
                  imagePreviews: [],
                  existingImages: []
                };
              }
              
              // Add sizes
              variantsObj[variant.color].sizes.push({
                size: variant.size,
                stock: variant.stock,
                sku: variant.sku,
                variantId: variant.id
              });

              // Add existing images without duplicates
              if (variant.variantImages && variant.variantImages.length > 0) {
                variant.variantImages.forEach(image => {
                  if (!variantsObj[variant.color].existingImages.includes(image.imageUrl)) {
                    variantsObj[variant.color].existingImages.push(image.imageUrl);
                    variantsObj[variant.color].imagePreviews.push(image.imageUrl);
                  }
                });
              }
            }
          });
          setVariants(variantsObj);
        } else {
          // ========== PRODUCT WITHOUT COLORS ==========
          const sizeSet = new Set();
          const sizeObjects = [];
          
          product.variants.forEach(variant => {
            // Check if this size is already added
            const size = variant.size;
            if (!sizeSet.has(size)) {
              sizeSet.add(size);
              sizeObjects.push({
                size: variant.size,
                stock: variant.stock,
                sku: variant.sku,
                variantId: variant.id
              });
            }
            
            // Collect images from all variants (should be same for all sizes)
            if (variant.variantImages && variant.variantImages.length > 0) {
              variant.variantImages.forEach(image => {
                if (!simpleProductImages.includes(image.imageUrl)) {
                  setSimpleProductImages(prev => [...prev, image.imageUrl]);
                }
              });
            }
          });
          
          setSimpleSizes(sizeObjects.length > 0 ? sizeObjects : [{ size: '', stock: 0, sku: '' }]);
        }
      }
    }
  }, [product]);

  // Handle basic product input changes
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'categoryId') {
      setSelectedCategoryId(value);
      setProductForm(prev => ({ ...prev, subcategoryId: '' }));
    }

    // Update SKUs when product code changes
    if (name === 'productCode' && value) {
      updateAllSKUs(value);
      updateSimpleSKUs(value);
    }
  };

  // Update all SKUs when product code changes (for products with colors)
  const updateAllSKUs = (productCode) => {
    setVariants(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(color => {
        updated[color] = {
          ...updated[color],
          sizes: updated[color].sizes.map(size => ({
            ...size,
            sku: `${productCode}-${color}-${size.size}`
          }))
        };
      });
      return updated;
    });
  };

  // Update simple product SKUs
  const updateSimpleSKUs = (productCode) => {
    setSimpleSizes(prev => prev.map(size => ({
      ...size,
      sku: `${productCode}-${size.size}`
    })));
  };

  // Handle product details changes
  const handleDetailChange = (index, field, value) => {
    const newDetails = [...productDetails];
    newDetails[index][field] = value;
    setProductDetails(newDetails);
  };

  const addProductDetail = () => {
    setProductDetails([...productDetails, { title: '', description: '' }]);
  };

  const removeProductDetail = (index) => {
    if (productDetails.length > 1) {
      const newDetails = productDetails.filter((_, i) => i !== index);
      setProductDetails(newDetails);
    }
  };

  // =============== FUNCTIONS FOR PRODUCTS WITH COLORS ===============

  // Color Variant Management (for products with colors)
  const addColorVariant = (colorName = '') => {
    const color = colorName.trim() || `Color${Object.keys(variants).length + 1}`;

    if (variants[color]) {
      toast.error(`Color "${color}" already exists!`);
      return;
    }

    const newVariant = {
      variantId: null,
      sizes: commonSizes.map(size => ({
        size,
        stock: 0,
        sku: productForm.productCode ? `${productForm.productCode}-${color}-${size}` : `${color}-${size}`,
        variantId: null
      })),
      images: [],
      imagePreviews: [],
      existingImages: []
    };

    setVariants(prev => ({
      ...prev,
      [color]: newVariant
    }));
  };

  // Update size stock for a color
  const updateSizeStock = (color, sizeIndex, stock) => {
    setVariants(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        sizes: prev[color].sizes.map((size, index) =>
          index === sizeIndex ? { ...size, stock: parseInt(stock) || 0 } : size
        )
      }
    }));
  };

  // Handle color image upload
  const handleColorImages = (color, files) => {
    const fileList = Array.from(files);
    
    // Calculate total images properly (only count unique images)
    const currentNewImagesCount = variants[color].images.length;
    const currentExistingImagesCount = variants[color].existingImages.length;
    const totalCurrentImages = currentNewImagesCount + currentExistingImagesCount;
    
    if (totalCurrentImages + fileList.length > 10) {
      toast.error('Maximum 10 images per color allowed');
      return;
    }

    // Filter out duplicate files by name and size
    const uniqueNewFiles = fileList.filter(newFile => {
      return !variants[color].images.some(existingFile => 
        existingFile.name === newFile.name && 
        existingFile.size === newFile.size
      );
    });

    if (uniqueNewFiles.length === 0) {
      toast.info('Some images are already added');
      return;
    }

    setVariants(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        images: [...prev[color].images, ...uniqueNewFiles],
        imagePreviews: [
          ...prev[color].imagePreviews,
          ...uniqueNewFiles.map(file => URL.createObjectURL(file))
        ]
      }
    }));
  };

  // Remove color image
  const removeColorImage = (color, imageIndex) => {
    setVariants(prev => {
      const updatedColor = { ...prev[color] };
      
      // Check if it's an existing image or new image
      const totalExistingImages = updatedColor.existingImages.length;
      
      if (imageIndex < totalExistingImages) {
        // Removing existing image - just remove from previews
        updatedColor.existingImages = updatedColor.existingImages.filter((_, i) => i !== imageIndex);
      } else {
        // Removing new image - remove from both images and previews
        const newImageIndex = imageIndex - totalExistingImages;
        updatedColor.images = updatedColor.images.filter((_, i) => i !== newImageIndex);
        
        // Revoke object URL
        if (updatedColor.imagePreviews[imageIndex]?.startsWith('blob:')) {
          URL.revokeObjectURL(updatedColor.imagePreviews[imageIndex]);
        }
      }
      
      // Remove from previews
      updatedColor.imagePreviews = updatedColor.imagePreviews.filter((_, i) => i !== imageIndex);
      
      return {
        ...prev,
        [color]: updatedColor
      };
    });
  };

  // Remove color variant
  const removeColorVariant = (color) => {
    const variant = variants[color];
    
    // Clean up all image URLs to prevent memory leaks
    variant.imagePreviews.forEach(url => {
      if (url?.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    setVariants(prev => {
      const updated = { ...prev };
      delete updated[color];
      return updated;
    });
  };

  // Add custom size to a color
  const addCustomSize = (color, sizeName = '') => {
    const size = sizeName.trim().toUpperCase();
    if (!size) return;

    // Check if size already exists
    if (variants[color].sizes.some(s => s.size === size)) {
      toast.error(`Size "${size}" already exists for ${color}`);
      return;
    }

    setVariants(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        sizes: [
          ...prev[color].sizes,
          {
            size,
            stock: 0,
            sku: productForm.productCode ? `${productForm.productCode}-${color}-${size}` : `${color}-${size}`,
            variantId: prev[color].variantId
          }
        ].sort((a, b) => commonSizes.indexOf(a.size) - commonSizes.indexOf(b.size))
      }
    }));
  };

  // Remove size from color
  const removeSize = (color, sizeIndex) => {
    if (variants[color].sizes.length <= 1) {
      toast.error('At least one size is required per color');
      return;
    }

    setVariants(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        sizes: prev[color].sizes.filter((_, index) => index !== sizeIndex)
      }
    }));
  };

  // =============== FUNCTIONS FOR PRODUCTS WITHOUT COLORS ===============

  // Handle simple size changes
  const handleSimpleSizeChange = (index, field, value) => {
    const newSizes = [...simpleSizes];
    newSizes[index][field] = value;
    
    // Auto-generate SKU if product code exists
    if (field === 'size' && productForm.productCode) {
      newSizes[index].sku = `${productForm.productCode}-${value}`;
    }
    
    setSimpleSizes(newSizes);
  };

  const addSimpleSize = () => {
    setSimpleSizes([...simpleSizes, { size: '', stock: 0, sku: productForm.productCode ? `${productForm.productCode}-` : '' }]);
  };

  const removeSimpleSize = (index) => {
    if (simpleSizes.length > 1) {
      setSimpleSizes(simpleSizes.filter((_, i) => i !== index));
    }
  };

  // Handle simple product images
  const handleSimpleProductImages = (files) => {
    const fileList = Array.from(files);

    if (simpleProductImages.length + fileList.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    const newImageFiles = [...simpleProductImageFiles, ...fileList];
    const newPreviews = [...simpleProductImages, ...fileList.map(file => URL.createObjectURL(file))];

    setSimpleProductImageFiles(newImageFiles);
    setSimpleProductImages(newPreviews);
  };

  // Remove simple product image
  const removeSimpleImage = (index) => {
    // Revoke object URL to prevent memory leaks
    if (simpleProductImages[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(simpleProductImages[index]);
    }

    setSimpleProductImageFiles(prev => prev.filter((_, i) => i !== index));
    setSimpleProductImages(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all simple product images
  const clearSimpleImages = () => {
    simpleProductImages.forEach(url => {
      if (url?.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setSimpleProductImageFiles([]);
    setSimpleProductImages([]);
  };

  // =============== COMMON FUNCTIONS ===============

  // Generate variants data for API (for products with colors)
  const generateVariantsData = () => {
    return Object.entries(variants)
      .filter(([color, data]) => data.imagePreviews.length > 0 || data.sizes.length > 0)
      .map(([color, data]) => ({
        color,
        sizes: data.sizes.filter(size => size.stock >= 0)
      }));
  };

  // Form validation for BOTH types
  const validateForm = () => {
    if (!productForm.name.trim()) {
      toast.error('Product name is required');
      return false;
    }
    if (!productForm.productCode.trim()) {
      toast.error('Product code is required');
      return false;
    }
    if (!productForm.normalPrice || parseFloat(productForm.normalPrice) <= 0) {
      toast.error('Valid normal price is required');
      return false;
    }

    // Validate product details
    for (let detail of productDetails) {
      if (!detail.title.trim() || !detail.description.trim()) {
        toast.error('All product details must have both title and description');
        return false;
      }
    }

    if (hasColors) {
      // Validate products WITH colors
      const variantsData = generateVariantsData();
      if (variantsData.length === 0) {
        toast.error('At least one color variant is required');
        return false;
      }

      // Check that each color has at least one size
      for (let variant of variantsData) {
        if (variant.sizes.length === 0) {
          toast.error(`Color "${variant.color}" must have at least one size`);
          return false;
        }
      }
    } else {
      // Validate products WITHOUT colors
      const validSizes = simpleSizes.filter(s => s.size.trim() !== '');
      if (validSizes.length === 0) {
        toast.error('At least one size is required');
        return false;
      }

      // Check stock for simple sizes
      for (let size of validSizes) {
        if (size.stock < 0) {
          toast.error(`Stock cannot be negative for size "${size.size}"`);
          return false;
        }
      }

      if (simpleProductImages.length === 0) {
        toast.error('At least one product image is required');
        return false;
      }
    }

    return true;
  };

  // Save product (both types)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // 1. Add basic product data
      Object.entries(productForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value.toString());
        }
      });

      // 2. Add hasColors flag
      formData.append('hasColors', hasColors.toString());

      // 3. Add product details
      formData.append('productDetails', JSON.stringify(productDetails));

      if (hasColors) {
        // 4. Add variants structure for products WITH colors
        const variantsData = generateVariantsData();
        formData.append('variants', JSON.stringify(variantsData));

        // 5. Add images with proper field names
        Object.entries(variants).forEach(([color, data]) => {
          // Only add images for colors that are being submitted
          if (variantsData.some(v => v.color === color)) {
            data.images.forEach((image, index) => {
              // Use consistent field name format that backend expects
              formData.append('variantImages', image);
              // Also add color as a separate field for grouping
              formData.append('variantColors', color);
            });
          }
        });
      } else {
        // 4. Add variants for products WITHOUT colors
        const simpleVariants = simpleSizes
          .filter(s => s.size.trim() !== '')
          .map(s => ({
            size: s.size.trim(),
            stock: parseInt(s.stock) || 0,
            sku: s.sku || `${productForm.productCode}-${s.size}`
          }));
        
        formData.append('variants', JSON.stringify(simpleVariants));

        // 5. Add simple product images
        simpleProductImageFiles.forEach((image) => {
          formData.append('variantImages', image);
          // No variantColors needed for simple products
        });
      }

      const response = await updateProduct({
        productId,
        productData: formData
      }).unwrap();

      if (response.success) {
        toast.success('Product updated successfully!');
        await refetchProduct();
      }
    } catch (error) {
      console.error('Update product error:', error);
      toast.error(error?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics for products with colors
  const getColorProductStats = () => {
    const colors = Object.keys(variants);
    const totalVariants = Object.values(variants).reduce(
      (sum, data) => sum + data.sizes.filter(size => size.stock > 0).length, 0
    );
    const totalImages = Object.values(variants).reduce(
      (sum, data) => sum + data.imagePreviews.length, 0
    );
    const colorsWithImages = colors.filter(color => variants[color].imagePreviews.length > 0);

    return {
      colors: colors.length,
      colorsWithImages: colorsWithImages.length,
      totalVariants,
      totalImages
    };
  };

  // Calculate statistics for simple products
  const getSimpleProductStats = () => {
    const validSizes = simpleSizes.filter(s => s.size.trim() !== '');
    const totalStock = validSizes.reduce((sum, size) => sum + (parseInt(size.stock) || 0), 0);
    
    return {
      sizes: validSizes.length,
      totalStock,
      totalImages: simpleProductImages.length
    };
  };

  const colorStats = getColorProductStats();
  const simpleStats = getSimpleProductStats();
  const isLoading = loading || isUpdating || productLoading;

  if (productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h2>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex"
    >
      {/* Main Content Area */}
      <div className="flex-1">
        <div className={`${currentTheme.text.primary}`}>
          <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
              <motion.div
                variants={slideInVariants}
                className={`rounded-lg ${currentTheme.shadow} overflow-hidden ${currentTheme.bg.secondary}`}
              >
                {/* Header */}
                <div className={`border-b ${currentTheme.border} ${currentTheme.bg.primary}`}>
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                      
                      {/* Left Section: Back Button + Product Info */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <button
                          onClick={() => navigate(-1)}
                          className={`p-2 rounded-lg ${currentTheme.bg.secondary} ${currentTheme.text.primary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                        >
                          <ArrowLeft size={20} />
                        </button>
                        <div>
                          <h1 className="text-xl sm:text-2xl font-bold font-italiana">{product.name}</h1>
                          <p className={`${currentTheme.text.muted} font-instrument text-sm sm:text-base`}>
                            Product Code: {product.productCode}
                          </p>
                        </div>
                      </div>

                      {/* Right Section: View Button */}
                      <div className="flex sm:flex-row flex-col sm:space-x-3 space-y-2 sm:space-y-0">
                        <Link
                          to={`/dashboard/products/view/${product.id}`}
                          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <View size={16} className="mr-2" />
                          View
                        </Link>
                      </div>

                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                  {/* Basic Information Section */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    <motion.h2 
                      variants={itemVariants}
                      className="text-xl font-semibold font-instrument mb-6 flex items-center"
                    >
                      <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
                      Basic Information
                    </motion.h2>

                    <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Product Name - Full width */}
                      <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <InputField
                          label="Product Name"
                          name="name"
                          value={productForm.name}
                          onChange={handleProductChange}
                          required
                          placeholder="Enter product name"
                        />
                      </div>

                      {/* Product Code */}
                      <InputField
                        label="Product Code"
                        name="productCode"
                        value={productForm.productCode}
                        onChange={handleProductChange}
                        required
                        placeholder="e.g., TS001"
                      />

                      {/* Category */}
                      <SelectField
                        label="Category"
                        name="categoryId"
                        value={productForm.categoryId}
                        onChange={handleProductChange}
                        options={safeMapOptions(categories, 'id', 'name')}
                        loading={categoriesLoading}
                      />

                      {/* Subcategory */}
                      <SelectField
                        label="Subcategory"
                        name="subcategoryId"
                        value={productForm.subcategoryId}
                        onChange={handleProductChange}
                        options={safeMapOptions(subcategories, 'id', 'name')}
                        loading={subcategoriesLoading}
                        disabled={!selectedCategoryId}
                      />

                      {/* Normal Price */}
                      <InputField
                        label="Normal Price"
                        name="normalPrice"
                        value={productForm.normalPrice}
                        onChange={handleProductChange}
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />

                      {/* Offer Price */}
                      <InputField
                        label="Offer Price"
                        name="offerPrice"
                        value={productForm.offerPrice}
                        onChange={handleProductChange}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />

                      {/* Wholesale Price */}
                      <InputField
                        label="Wholesale Price"
                        name="wholesalePrice"
                        value={productForm.wholesalePrice}
                        onChange={handleProductChange}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />

                      {/* Status */}
                      <SelectField
                        label="Status"
                        name="status"
                        value={productForm.status}
                        onChange={handleProductChange}
                        options={[
                          { value: 'ACTIVE', label: 'Active' },
                          { value: 'INACTIVE', label: 'Inactive' },
                          { value: 'OUT_OF_STOCK', label: 'Out of Stock' }
                        ]}
                      />
                    </motion.div>



                    {/* Description */}
                    <motion.div variants={itemVariants} className="mt-6">
                      <TextArea
                        label="Description"
                        name="description"
                        value={productForm.description}
                        onChange={handleProductChange}
                        placeholder="Describe your product features, benefits, and specifications..."
                        rows={4}
                      />
                    </motion.div>
                  </motion.section>

                  {/* Product Details Section */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-4 sm:p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    {/* Header */}
                    <motion.div
                      variants={itemVariants}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6"
                    >
                      <h2 className="text-lg sm:text-xl font-semibold font-instrument flex items-center">
                        <span className="bg-green-100 text-green-800 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mr-2 sm:mr-3 text-sm sm:text-base">
                          2
                        </span>
                        Product Details
                      </h2>

                      <Button
                        type="button"
                        onClick={addProductDetail}
                        variant="success"
                        className="flex items-center justify-center gap-2 min-w-[50px] sm:min-w-[140px] text-sm sm:text-base"
                      >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add Detail</span>
                      </Button>
                    </motion.div>

                    {/* Product Detail Items */}
                    <AnimatePresence>
                      <motion.div variants={containerVariants} className="space-y-4">
                        <div className="space-y-4">
                          {productDetails.map((detail, index) => (
                            <div
                              key={index}
                              className={`grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 border rounded-lg ${currentTheme.bg.secondary} ${currentTheme.border}`}
                            >
                              <div>
                                <InputField
                                  label="Title"
                                  value={detail.title}
                                  onChange={(e) => handleDetailChange(index, 'title', e.target.value)}
                                  placeholder="e.g., Material"
                                  required
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <InputField
                                  label="Description"
                                  value={detail.description}
                                  onChange={(e) => handleDetailChange(index, 'description', e.target.value)}
                                  placeholder="e.g., 100% Premium Cotton"
                                  required
                                />
                              </div>

                              <div className="flex items-end">
                                {productDetails.length > 1 && (
                                  <Button
                                    type="button"
                                    onClick={() => removeProductDetail(index)}
                                    variant="danger"
                                    className="w-full sm:w-auto text-sm sm:text-base flex items-center justify-center gap-1"
                                  >
                                    <Trash2 size={16} />
                                    <span className="hidden sm:inline">Remove</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </motion.section>

                  {/* CONDITIONAL SECTIONS BASED ON PRODUCT TYPE */}

                  {/* SECTION FOR PRODUCTS WITH COLORS */}
                  {hasColors && (
                    <motion.section
                      variants={containerVariants}
                      className={`border rounded-xl p-4 sm:p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                    >
                      {/* Header and Buttons */}
                      <motion.div
                        variants={itemVariants}
                        className="flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-start mb-6"
                      >
                        {/* Left: Title + Stats */}
                        <div className="w-full lg:w-1/2">
                          <h2 className="text-lg sm:text-xl font-semibold font-instrument flex items-center mb-2">
                            <span className="bg-purple-100 text-purple-800 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mr-3 text-sm sm:text-base">
                              3
                            </span>
                            Color Variants
                          </h2>

                          {/* Stats Pills */}
                          <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                              {colorStats.colors} Colors
                            </span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                              {colorStats.colorsWithImages} With Images
                            </span>
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                              {colorStats.totalVariants} Variants
                            </span>
                            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                              {colorStats.totalImages} Images
                            </span>
                          </div>
                        </div>

                        {/* Right: Color Buttons */}
                        <div className="w-full lg:w-1/2 flex flex-col gap-3">
                          {/* Common Colors */}
                          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                            {commonColors.map((color) => (
                              <Button
                                key={color}
                                type="button"
                                onClick={() => addColorVariant(color)}
                                variant="primary"
                                className="text-xs sm:text-sm px-3 py-2"
                              >
                                <Plus size={14} className="mr-1" />
                                {color}
                              </Button>
                            ))}
                          </div>

                          {/* Custom Color Button */}
                          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                            <Button
                              type="button"
                              onClick={() => setShowCustomColor(true)}
                              variant="secondary"
                              className="text-xs sm:text-sm px-3 py-2"
                            >
                              <Plus size={14} className="mr-1" />
                              Custom Color
                            </Button>
                          </div>

                          {/* Custom Color Input */}
                          <AnimatePresence>
                            {showCustomColor && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2"
                              >
                                <input
                                  type="text"
                                  id="customColorInput"
                                  placeholder="Enter color name"
                                  className={`flex-1 px-3 py-2 border ${currentTheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                                />
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      const input = document.getElementById("customColorInput");
                                      const colorName = input.value.trim();
                                      if (!colorName) {
                                        toast.error("Please enter a color name");
                                        return;
                                      }
                                      addColorVariant(colorName);
                                      input.value = "";
                                      setShowCustomColor(false);
                                    }}
                                    variant="primary"
                                    className="text-xs sm:text-sm px-3 py-2"
                                  >
                                    Add Color
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() => setShowCustomColor(false)}
                                    variant="danger"
                                    className="text-xs sm:text-sm px-3 py-2"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>

                      {/* Color Variants List */}
                      <AnimatePresence>
                        <motion.div variants={containerVariants} className="space-y-6">
                          {Object.entries(variants).map(([color, data]) => (
                            <motion.div
                              key={color}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className={`border-2 rounded-xl p-4 sm:p-6 ${currentTheme.bg.card} ${currentTheme.border}`}
                            >
                              {/* Header */}
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                                <div>
                                  <h3 className="text-base sm:text-lg font-semibold font-instrument capitalize">
                                    {color}
                                  </h3>
                                  <p className="text-xs sm:text-sm font-instrument mt-1">
                                    {data.sizes.filter((size) => size.stock > 0).length} sizes with stock • {data.imagePreviews.length} images
                                  </p>
                                </div>

                                <Button 
                                  type="button" 
                                  onClick={() => removeColorVariant(color)}
                                  variant="danger"
                                  className="flex items-center justify-center gap-1 text-xs sm:text-sm"
                                >
                                  <Trash2 size={14} />
                                  <span className="hidden sm:inline">Remove</span>
                                </Button>
                              </div>

                              {/* Sizes */}
                              <div className="mb-6">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
                                  <h4 className="text-sm sm:text-md font-medium font-instrument">Sizes & Stock</h4>
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                      type="text"
                                      placeholder="Custom size (e.g., 28, 30)"
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                          addCustomSize(color, e.target.value);
                                          e.target.value = "";
                                        }
                                      }}
                                      className={`px-3 py-1 border ${currentTheme.border} rounded text-sm ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                                    />
                                    <Button
                                      type="button"
                                      onClick={() => {
                                        const input = document.querySelector(`input[placeholder="Custom size (e.g., 28, 30)"]`);
                                        addCustomSize(color, input?.value);
                                        if (input) input.value = "";
                                      }}
                                      variant="primary"
                                      className="text-xs sm:text-sm px-3 py-1"
                                    >
                                      Add Size
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                  {data.sizes.map((size, index) => (
                                    <motion.div
                                      key={size.size}
                                      whileHover={{ scale: 1.05 }}
                                      className={`border rounded-lg p-3 ${currentTheme.bg.secondary} ${currentTheme.border}`}
                                    >
                                      <div className="text-center mb-2">
                                        <span className="font-medium text-sm sm:text-base">{size.size}</span>
                                      </div>
                                      <input
                                        type="number"
                                        value={size.stock}
                                        onChange={(e) => updateSizeStock(color, index, e.target.value)}
                                        min="0"
                                        className={`w-full px-2 py-1 border ${currentTheme.border} rounded text-center text-xs sm:text-sm mb-2 ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                                        placeholder="Stock"
                                      />
                                      <div className="text-[10px] sm:text-xs text-center truncate" title={size.sku}>
                                        SKU: {size.sku}
                                      </div>

                                      {data.sizes.length > 1 && (
                                        <Button
                                          type="button"
                                          onClick={() => removeSize(color, index)}
                                          variant="danger"
                                          className="w-full mt-2 text-[10px] sm:text-xs px-2 py-1"
                                        >
                                          Remove
                                        </Button>
                                      )}
                                    </motion.div>
                                  ))}
                                </div>
                              </div>

                              {/* Images */}
                              <div>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                                  <h4 className="text-sm sm:text-md font-medium font-instrument">
                                    Color Images ({data.imagePreviews.length}/10)
                                  </h4>
                                  <span className="text-xs sm:text-sm text-gray-600">
                                    First image will be set as primary
                                  </span>
                                </div>

                                <div className="mb-4">
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleColorImages(color, e.target.files)}
                                    className={`w-full px-3 py-2 border ${currentTheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentTheme.bg.input}`}
                                  />
                                  <p className="text-xs sm:text-sm font-instrument mt-1">
                                    Upload high-quality images for {color}. These images will be used for all sizes of this color.
                                  </p>
                                </div>

                                {/* Previews */}
                                {data.imagePreviews.length > 0 && (
                                  <div>
                                    <label className="block text-xs sm:text-sm font-medium mb-2">Image Previews</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                      {data.imagePreviews.map((preview, index) => (
                                        <motion.div
                                          key={index}
                                          whileHover={{ scale: 1.05 }}
                                          className="relative group"
                                        >
                                          <img
                                            src={preview}
                                            alt={`${color} ${index + 1}`}
                                            className="w-full h-20 sm:h-24 object-cover rounded-lg border-2 border-gray-300 group-hover:border-blue-500 transition-colors"
                                          />
                                          <Button
                                            type="button"
                                            onClick={() => removeColorImage(color, index)}
                                            variant="danger"
                                            className="absolute -top-2 -right-2 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] sm:text-xs p-0"
                                          >
                                            ×
                                          </Button>
                                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-[10px] sm:text-xs p-1 text-center rounded-b-lg">
                                            {index === 0 ? "Primary" : `Image ${index + 1}`}
                                          </div>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    </motion.section>
                  )}

                  {/* SECTION FOR PRODUCTS WITHOUT COLORS */}
                  {!hasColors && (
                    <motion.section
                      variants={containerVariants}
                      className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                    >
                      <motion.h2 variants={itemVariants} className="text-xl font-semibold font-instrument mb-6 flex items-center">
                        <span className="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                          3
                        </span>
                        Product Details
                      </motion.h2>

                      {/* Sizes Section */}
                      <motion.div variants={itemVariants} className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium font-instrument">Sizes & Stock</h3>
                          <Button
                            type="button"
                            onClick={addSimpleSize}
                            variant="success"
                            className="flex items-center gap-2"
                          >
                            <Plus size={16} />
                            Add Size
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {simpleSizes.map((size, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-4 items-center p-4 border rounded-lg">
                              <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">Size *</label>
                                <input
                                  type="text"
                                  value={size.size}
                                  onChange={(e) => handleSimpleSizeChange(index, 'size', e.target.value)}
                                  placeholder="e.g., M, L, ONE SIZE"
                                  className={`w-full px-4 py-2 border ${currentTheme.border} rounded-lg ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                                />
                              </div>
                              <div className="w-full sm:w-32">
                                <label className="block text-sm font-medium mb-1">Stock *</label>
                                <input
                                  type="number"
                                  value={size.stock}
                                  onChange={(e) => handleSimpleSizeChange(index, 'stock', e.target.value)}
                                  min="0"
                                  placeholder="0"
                                  className={`w-full px-4 py-2 border ${currentTheme.border} rounded-lg ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                                />
                              </div>
                              <div className="w-full sm:w-48">
                                <label className="block text-sm font-medium mb-1">SKU</label>
                                <input
                                  type="text"
                                  value={size.sku}
                                  readOnly
                                  className={`w-full px-4 py-2 border ${currentTheme.border} rounded-lg bg-gray-50 dark:bg-gray-800 ${currentTheme.text.primary}`}
                                  placeholder="Auto-generated"
                                />
                              </div>
                              <div className="flex items-end">
                                {simpleSizes.length > 1 && (
                                  <Button
                                    type="button"
                                    onClick={() => removeSimpleSize(index)}
                                    variant="danger"
                                    className="mt-2 sm:mt-0 flex items-center gap-1"
                                  >
                                    <Trash2 size={16} />
                                    Remove
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Images Section */}
                      <motion.div variants={itemVariants}>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium font-instrument">Product Images</h3>
                          {simpleProductImages.length > 0 && (
                            <Button
                              type="button"
                              onClick={clearSimpleImages}
                              variant="danger"
                              className="flex items-center gap-1"
                            >
                              <Trash2 size={16} />
                              Clear All
                            </Button>
                          )}
                        </div>

                        <div className="mb-6">
                          <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleSimpleProductImages(e.target.files)}
                              className="hidden"
                              id="simpleProductImagesInput"
                            />
                            <label
                              htmlFor="simpleProductImagesInput"
                              className={`cursor-pointer flex flex-col items-center justify-center p-6 ${currentTheme.bg.secondary} rounded-lg hover:${currentTheme.bg.input} transition-colors`}
                            >
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                <ImageIcon className="text-blue-600" size={24} />
                              </div>
                              <p className="font-medium mb-1">Click to upload product images</p>
                              <p className={`text-sm ${currentTheme.text.muted}`}>
                                Upload up to 10 images. First image will be the primary product image.
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {simpleProductImages.length}/10 images uploaded
                              </p>
                            </label>
                          </div>
                        </div>

                        {/* Image Previews */}
                        {simpleProductImages.length > 0 && (
                          <div>
                            <h4 className="text-md font-medium mb-3">Image Previews ({simpleProductImages.length})</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                              {simpleProductImages.map((preview, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={preview}
                                    alt={`Product image ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-300 group-hover:border-blue-500 transition-colors"
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => removeSimpleImage(index)}
                                    variant="danger"
                                    className="absolute -top-2 -right-2 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs p-0"
                                  >
                                    ×
                                  </Button>
                                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 text-center rounded-b-lg">
                                    {index === 0 ? "Primary Image" : `Image ${index + 1}`}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>

                      {/* Stats */}
                      <motion.div variants={itemVariants} className="mt-6 pt-6 border-t">
                        <div className="flex flex-wrap gap-3">
                          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                            <div className="text-sm text-blue-700 dark:text-blue-300">Sizes</div>
                            <div className="text-lg font-semibold">{simpleStats.sizes}</div>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                            <div className="text-sm text-green-700 dark:text-green-300">Total Stock</div>
                            <div className="text-lg font-semibold">{simpleStats.totalStock}</div>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg">
                            <div className="text-sm text-purple-700 dark:text-purple-300">Images</div>
                            <div className="text-lg font-semibold">{simpleStats.totalImages}</div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.section>
                  )}

                  {/* Submit Section */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-5 justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold font-instrument">Ready to Update Product</h3>
                        <p className={currentTheme.text.muted}>
                          {hasColors
                            ? colorStats.totalVariants > 0
                              ? `This will update product with ${colorStats.colorsWithImages} colors and ${colorStats.totalVariants} variants`
                              : 'Add color variants to continue'
                            : simpleStats.sizes > 0
                            ? `This will update product with ${simpleStats.sizes} sizes and ${simpleStats.totalImages} images`
                            : 'Add sizes and images to continue'
                          }
                        </p>
                      </div>

                      <div className="flex flex-col lg:flex-row gap-4">
                        <Button
                          type="submit"
                          disabled={isLoading || 
                            (hasColors && colorStats.totalVariants === 0) || 
                            (!hasColors && (simpleStats.sizes === 0 || simpleStats.totalImages === 0))
                          }
                          variant="primary"
                          className="min-w-[200px] flex items-center justify-center gap-2"
                          loading={isLoading}
                        >
                          <Save size={18} />
                          {isLoading ? 'Updating...' : 'Update Product'}
                        </Button>
                      </div>
                    </motion.div>
                  </motion.section>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default EditProduct;