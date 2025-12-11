import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';
import { useCreateProductMutation } from '../../../../redux/services/productService';
import { useGetAllCategoriesQuery } from '../../../../redux/services/categoryService';
import { useGetSubcategoriesByCategoryQuery } from '../../../../redux/services/subcategoryService';
import { toast } from 'react-toastify';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/Common/Button';

const AddProduct = () => {
  const [loading, setLoading] = useState(false);
  const [showCustomColor, setShowCustomColor] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();

  // NEW STATE: Track if product has colors or not
  const [hasColors, setHasColors] = useState(false); // false = Without Colors is default

  // Redux queries and mutations
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
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
    
    if (data.data && data.data.categories && Array.isArray(data.data.categories)) {
      return data.data.categories;
    }
    
    if (data.categories && Array.isArray(data.categories)) {
      return data.categories;
    }
    
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  };

  const extractSubcategories = (data) => {
    if (!data) {
      return [];
    }
    
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

  const categories = categoriesLoading ? [] : extractCategories(categoriesData);
  const subcategories = subcategoriesLoading ? [] : extractSubcategories(subcategoriesData);

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
  const [product, setProduct] = useState({
    name: '',
    productCode: '',
    description: '',
    normalPrice: '',
    offerPrice: '',
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

  const commonSizes = ['M', 'L', 'XL', 'XXL', 'XXXL'];
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
      button: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white',
        ghost: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
      }
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
      button: {
        primary: 'bg-blue-500 hover:bg-blue-600 text-white',
        secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        success: 'bg-green-500 hover:bg-green-600 text-white',
        ghost: 'border border-gray-600 text-gray-300 hover:bg-gray-700'
      }
    }
  };

  const currentTheme = themeClasses[theme] || themeClasses.light;

  // =============== FUNCTIONS FOR PRODUCTS WITH COLORS ===============

  // Handle basic product input changes
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'categoryId') {
      setSelectedCategoryId(value);
      setProduct(prev => ({ ...prev, subcategoryId: '' }));
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

  // Color Variant Management (for products with colors)
  const addColorVariant = (colorName = '') => {
    const color = colorName.trim() || `Color${Object.keys(variants).length + 1}`;

    if (variants[color]) {
      toast.error(`Color "${color}" already exists!`);
      return;
    }

    const newVariant = {
      sizes: commonSizes.map(size => ({
        size,
        stock: 0,
        sku: product.productCode ? `${product.productCode}-${color}-${size}` : `${color}-${size}`
      })),
      images: [],
      imagePreviews: []
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

    if (variants[color].images.length + fileList.length > 10) {
      toast.error('Maximum 10 images per color allowed');
      return;
    }

    setVariants(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        images: [...prev[color].images, ...fileList],
        imagePreviews: [
          ...prev[color].imagePreviews,
          ...fileList.map(file => URL.createObjectURL(file))
        ]
      }
    }));
  };

  // Remove color image
  const removeColorImage = (color, imageIndex) => {
    setVariants(prev => {
      const updatedColor = { ...prev[color] };

      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(updatedColor.imagePreviews[imageIndex]);

      updatedColor.images = updatedColor.images.filter((_, i) => i !== imageIndex);
      updatedColor.imagePreviews = updatedColor.imagePreviews.filter((_, i) => i !== imageIndex);

      return {
        ...prev,
        [color]: updatedColor
      };
    });
  };

  // Remove color variant
  const removeColorVariant = (color) => {
    // Clean up all image URLs to prevent memory leaks
    variants[color].imagePreviews.forEach(url => URL.revokeObjectURL(url));

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
            sku: product.productCode ? `${product.productCode}-${color}-${size}` : `${color}-${size}`
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
    if (field === 'size' && product.productCode) {
      newSizes[index].sku = `${product.productCode}-${value}`;
    }
    
    setSimpleSizes(newSizes);
  };

  const addSimpleSize = () => {
    setSimpleSizes([...simpleSizes, { size: '', stock: 0, sku: product.productCode ? `${product.productCode}-` : '' }]);
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
    URL.revokeObjectURL(simpleProductImages[index]);

    setSimpleProductImageFiles(prev => prev.filter((_, i) => i !== index));
    setSimpleProductImages(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all simple product images
  const clearSimpleImages = () => {
    simpleProductImages.forEach(url => URL.revokeObjectURL(url));
    setSimpleProductImageFiles([]);
    setSimpleProductImages([]);
  };

  // =============== COMMON FUNCTIONS ===============

  // Generate product code
  const generateProductCode = () => {
    // If category is selected, use category code, otherwise use generic
    const category = categories.find(cat => cat.id === product.categoryId);
    const categoryCode = category ? category.name.substring(0, 3).toUpperCase() : 'GEN';
    const randomNum = Math.floor(100 + Math.random() * 900);
    const code = `${categoryCode}${randomNum}`;

    setProduct(prev => ({
      ...prev,
      productCode: code
    }));

    updateAllSKUs(code);
    updateSimpleSKUs(code);
  };

  // Generate variants data for API (for products with colors)
  const generateVariantsData = () => {
    return Object.entries(variants)
      .filter(([color, data]) => data.images.length > 0) // Only colors with images
      .map(([color, data]) => ({
        color,
        sizes: data.sizes.filter(size => size.stock >= 0) // Only valid stock sizes
      }));
  };

  // Form validation for BOTH types
  const validateForm = () => {
    if (!product.name.trim()) {
      toast.error('Product name is required');
      return false;
    }
    if (!product.productCode.trim()) {
      toast.error('Product code is required');
      return false;
    }
    if (!product.normalPrice || parseFloat(product.normalPrice) <= 0) {
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
        toast.error('At least one color variant with images is required');
        return false;
      }

      // Check that each color has at least one size with stock
      for (let variant of variantsData) {
        const validSizes = variant.sizes.filter(size => size.stock > 0);
        if (validSizes.length === 0) {
          toast.error(`Color "${variant.color}" must have at least one size with stock`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // 1. Add basic product data
      Object.entries(product).forEach(([key, value]) => {
        // Only add categoryId if it has a value
        if (key === 'categoryId' || key === 'subcategoryId') {
          if (value && value !== '') {
            formData.append(key, value.toString());
          }
        } else if (value !== null && value !== undefined && value !== '') {
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
            sku: s.sku || `${product.productCode}-${s.size}`
          }));
        
        formData.append('variants', JSON.stringify(simpleVariants));

        // 5. Add simple product images
        simpleProductImageFiles.forEach((image) => {
          formData.append('variantImages', image);
          // No variantColors needed for simple products
        });
      }

      // Use Redux mutation (toast will be handled by the mutation)
      const response = await createProduct(formData).unwrap();

      if (response.success) {
        resetForm();
      }
    } catch (error) {
      // Error toast is handled by the mutation
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setProduct({
      name: '',
      productCode: '',
      description: '',
      normalPrice: '',
      offerPrice: '',
      categoryId: '',
      subcategoryId: '',
      status: 'ACTIVE',
    });

    setProductDetails([{ title: '', description: '' }]);

    // Clean up all image URLs for products with colors
    Object.values(variants).forEach(data => {
      data.imagePreviews.forEach(url => URL.revokeObjectURL(url));
    });

    // Clean up simple product images
    simpleProductImages.forEach(url => URL.revokeObjectURL(url));

    setVariants({});
    setSimpleSizes([{ size: '', stock: 0, sku: '' }]);
    setSimpleProductImages([]);
    setSimpleProductImageFiles([]);
    setSelectedCategoryId('');
    setHasColors(true);
    setShowCustomColor(false);
  };

  // Calculate statistics for products with colors
  const getColorProductStats = () => {
    const colors = Object.keys(variants);
    const totalVariants = Object.values(variants).reduce(
      (sum, data) => sum + data.sizes.filter(size => size.stock > 0).length, 0
    );
    const totalImages = Object.values(variants).reduce(
      (sum, data) => sum + data.images.length, 0
    );
    const colorsWithImages = colors.filter(color => variants[color].images.length > 0);

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
  const isLoading = loading || isCreating;

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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      
                      {/* Back Button */}
                      <button
                        onClick={() => navigate(-1)}
                        className={`p-2 rounded-lg ${currentTheme.bg.secondary} ${currentTheme.text.primary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                      >
                        <ArrowLeft size={20} />
                      </button>
                      
                      {/* Header Text */}
                      <div>
                        <h1 className="text-xl sm:text-2xl font-bold font-italiana">
                          Create New Product
                        </h1>
                        <p className={`${currentTheme.text.muted} font-instrument text-sm sm:text-base`}>
                          Add a new product to your inventory
                        </p>
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
                        <motion.div variants={itemVariants}>
                          <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                            Product Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={product.name}
                            onChange={handleProductChange}
                            required
                            className={`w-full px-4 py-3 border ${currentTheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                            placeholder="Enter product name"
                          />
                        </motion.div>
                      </div>

                      {/* Product Code */}
                      <motion.div variants={itemVariants}>
                        <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                          Product Code *
                        </label>
                        <div className="flex flex-col md:flex-row gap-2">
                          <input
                            type="text"
                            name="productCode"
                            value={product.productCode}
                            onChange={handleProductChange}
                            required
                            className={`flex-1 px-4 py-3 border ${currentTheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                            placeholder="e.g., TS001"
                          />
                          <Button
                            type="button"
                            onClick={generateProductCode}
                            variant="secondary"
                            className="whitespace-nowrap"
                          >
                            Generate
                          </Button>
                        </div>
                      </motion.div>

                      {/* Category */}
                      <motion.div variants={itemVariants}>
                        <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                          Category
                        </label>
                        <select
                          name="categoryId"
                          value={product.categoryId}
                          onChange={handleProductChange}
                          className={`w-full px-4 py-3 border ${currentTheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                        >
                          <option value="">Select Category (Optional)</option>
                          {categoriesLoading ? (
                            <option value="" disabled>Loading categories...</option>
                          ) : (
                            categories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))
                          )}
                        </select>
                        <p className={`text-xs ${currentTheme.text.muted} mt-1`}>
                          Optional - You can categorize later
                        </p>
                      </motion.div>

                      {/* Subcategory */}
                      <motion.div variants={itemVariants}>
                        <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                          Subcategory
                        </label>
                        <select
                          name="subcategoryId"
                          value={product.subcategoryId}
                          onChange={handleProductChange}
                          disabled={!selectedCategoryId}
                          className={`w-full px-4 py-3 border ${currentTheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${currentTheme.bg.input} ${currentTheme.text.primary} ${!selectedCategoryId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <option value="">Select Subcategory (Optional)</option>
                          {subcategoriesLoading ? (
                            <option value="" disabled>Loading subcategories...</option>
                          ) : (
                            subcategories.map(subcategory => (
                              <option key={subcategory.id} value={subcategory.id}>
                                {subcategory.name}
                              </option>
                            ))
                          )}
                        </select>
                        {!selectedCategoryId && (
                          <p className={`text-xs ${currentTheme.text.muted} mt-1`}>
                            Select a category first
                          </p>
                        )}
                      </motion.div>

                      {/* Normal Price */}
                      <motion.div variants={itemVariants}>
                        <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                          Normal Price *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="number"
                            name="normalPrice"
                            value={product.normalPrice}
                            onChange={handleProductChange}
                            required
                            min="0"
                            step="0.01"
                            className={`w-full pl-10 pr-4 py-3 border ${currentTheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                            placeholder="0.00"
                          />
                        </div>
                      </motion.div>

                      {/* Offer Price */}
                      <motion.div variants={itemVariants}>
                        <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                          Offer Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="number"
                            name="offerPrice"
                            value={product.offerPrice}
                            onChange={handleProductChange}
                            min="0"
                            step="0.01"
                            className={`w-full pl-10 pr-4 py-3 border ${currentTheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                            placeholder="0.00"
                          />
                        </div>
                      </motion.div>

                      {/* Status */}
                      <motion.div variants={itemVariants}>
                        <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                          Status
                        </label>
                        <select
                          name="status"
                          value={product.status}
                          onChange={handleProductChange}
                          className={`w-full px-4 py-3 border ${currentTheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="OUT_OF_STOCK">Out of Stock</option>
                        </select>
                      </motion.div>
                    </motion.div>

                    {/* Product Type Toggle */}
                    <motion.div variants={itemVariants} className="mt-6">
                      <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-3`}>
                        Product Type *
                      </label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setHasColors(false)}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${!hasColors 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                            : 'border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300'}`}
                        >
                          <div className="font-medium">Without Colors</div>
                          <div className="text-sm mt-1">Single product with sizes (e.g., Nighties)</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setHasColors(true)}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${hasColors 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                            : 'border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300'}`}
                        >
                          <div className="font-medium">With Colors</div>
                          <div className="text-sm mt-1">Multiple color variants (e.g., T-shirts)</div>
                        </button>
                      </div>
                    </motion.div>

                    {/* Description */}
                    <motion.div variants={itemVariants} className="mt-6">
                      <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={product.description}
                        onChange={handleProductChange}
                        rows={4}
                        className={`w-full px-4 py-3 border ${currentTheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                        placeholder="Describe your product features, benefits, and specifications..."
                      />
                    </motion.div>
                  </motion.section>

                  {/* Product Details Section */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
                      <h2 className="text-xl font-semibold font-instrument flex items-center">
                        <span className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
                        Product Details
                      </h2>
                      <Button
                        type="button"
                        onClick={addProductDetail}
                        variant="success"
                      >
                        + Add Detail
                      </Button>
                    </motion.div>

                    <AnimatePresence>
                      <motion.div variants={containerVariants} className="space-y-4">
                        {productDetails.map((detail, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg ${currentTheme.bg.secondary} ${currentTheme.border}`}
                          >
                            <div>
                              <label className="block text-sm font-medium font-instrument mb-2">Title</label>
                              <input
                                type="text"
                                value={detail.title}
                                onChange={(e) => handleDetailChange(index, 'title', e.target.value)}
                                className={`w-full px-3 py-2 border ${currentTheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                                placeholder="e.g., Material"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium font-instrument mb-2">Description</label>
                              <input
                                type="text"
                                value={detail.description}
                                onChange={(e) => handleDetailChange(index, 'description', e.target.value)}
                                className={`w-full px-3 py-2 border ${currentTheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                                placeholder="e.g., 100% Premium Cotton"
                              />
                            </div>
                            <div className="flex items-end">
                              {productDetails.length > 1 && (
                                <Button
                                  type="button"
                                  onClick={() => removeProductDetail(index)}
                                  variant="danger"
                                  className="w-full"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </motion.section>


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
                            Color Variant
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
                                + {color}
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
                              + Custom Color
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
                                  <h3 className="text-base sm:text-lg font-semibold font-instrument capitalize">{color}</h3>
                                  <p className="text-xs sm:text-sm font-instrument mt-1">
                                    {data.sizes.filter((size) => size.stock > 0).length} sizes with stock • {data.images.length} images
                                  </p>
                                </div>
                                <Button type="button" onClick={() => removeColorVariant(color)} variant="danger" className="text-xs sm:text-sm">
                                  Remove Color
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
                                      onClick={() => addCustomSize(color, document.querySelector(`input[placeholder="Custom size (e.g., 28, 30)"]`)?.value)}
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
                                    Color Images ({data.images.length}/10)
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
                        Size & Stock Details
                      </motion.h2>

                      {/* Sizes Section */}
                      <motion.div variants={itemVariants} className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium font-instrument"></h3>
                          <Button
                            type="button"
                            onClick={addSimpleSize}
                            variant="success"
                          >
                            + Add Size
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
                                    className="mt-2 sm:mt-0"
                                  >
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
                            >
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
                        <h3 className="text-lg font-semibold font-instrument">Ready to Create Product</h3>
                        <p className={currentTheme.text.muted}>
                          {hasColors
                            ? colorStats.totalVariants > 0
                              ? `This will create a product with ${colorStats.colorsWithImages} colors and ${colorStats.totalVariants} variants`
                              : 'Add color variants to continue'
                            : simpleStats.sizes > 0
                            ? `This will create a simple product with ${simpleStats.sizes} sizes and ${simpleStats.totalImages} images`
                            : 'Add sizes and images to continue'
                          }
                        </p>
                      </div>

                      <div className="flex flex-col lg:flex-row gap-4">
                        <Button
                          type="button"
                          onClick={resetForm}
                          variant="ghost"
                        >
                          Reset Form
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading || 
                            (hasColors && colorStats.totalVariants === 0) || 
                            (!hasColors && (simpleStats.sizes === 0 || simpleStats.totalImages === 0))
                          }
                          variant="primary"
                          className="min-w-[200px]"
                        >
                          {isLoading ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Creating Product...
                            </span>
                          ) : (
                            `Create Product ${
                              hasColors 
                                ? `(${colorStats.totalVariants} Variants)` 
                                : `(${simpleStats.sizes} Sizes)`
                            }`
                          )}
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

export default AddProduct;