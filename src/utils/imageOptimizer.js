export const getOptimizedImageUrl = (url, width = 800) => {
  if (!url) return '';
  
  if (url.includes('unsplash.com')) {
    return `${url}?w=${width}&q=80&auto=format&fit=crop`;
  }
  
  if (url.includes('cloudinary.com') || url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},q_80,f_auto/`);
  }
  
  return url;
};

export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(url);
    img.onerror = reject;
  });
};