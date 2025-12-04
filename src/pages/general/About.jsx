import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import { 
  Moon, 
  Sun, 
  Star, 
  Sparkles, 
  Shield, 
  Heart, 
  Leaf, 
  Package,
  ChevronRight,
  Sparkle,
  BedDouble,
  Users
} from 'lucide-react' // Import specific icons[citation:1]

const About = () => {
  const { theme, toggleTheme } = useTheme()

  const features = [
    {
      icon: <Sparkles size={28} className="text-purple-500 dark:text-purple-400" />,
      title: "Luxurious Fabrics",
      description: "Premium materials for ultimate comfort"
    },
    {
      icon: <Leaf size={28} className="text-green-500 dark:text-green-400" />,
      title: "Eco-Friendly",
      description: "Sustainable and responsibly sourced"
    },
    {
      icon: <Heart size={28} className="text-pink-500 dark:text-pink-400" />,
      title: "Designed with Love",
      description: "Every piece crafted with care"
    },
    {
      icon: <Shield size={28} className="text-blue-500 dark:text-blue-400" />,
      title: "Quality Assured",
      description: "Built to last with premium craftsmanship"
    }
  ]

  const values = [
    {
      icon: <Sparkle size={24} />,
      text: "Comfort as a priority"
    },
    {
      icon: <BedDouble size={24} />,
      text: "Restful sleep guaranteed"
    },
    {
      icon: <Users size={24} />,
      text: "Community focused"
    },
    {
      icon: <Package size={24} />,
      text: "Ethical packaging"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/30 via-white to-primary/10 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-300">
      {/* Header with Theme Toggle */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-8">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-primary dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <>
                <Moon size={20} className="text-gray-700 dark:text-gray-200" />
                <span className="font-ui text-sm text-gray-700 dark:text-gray-200 hidden sm:inline">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun size={20} className="text-gray-200" />
                <span className="font-ui text-sm text-gray-200 hidden sm:inline">Light Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <Star className="w-12 h-12 text-purple-400/30 dark:text-purple-500/30 animate-pulse" />
          </div>
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-gray-900 dark:text-white mb-6 tracking-tight">
            About <span className="text-purple-600 dark:text-purple-400">Zohra</span>
          </h1>
          <p className="font-subheading text-xl md:text-2xl text-gray-600 dark:text-gray-300 italic max-w-3xl mx-auto">
            Where dreams are woven into the fabric of night
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Mission Section */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 mb-12 transition-all duration-300 hover:shadow-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-purple-500 dark:text-purple-400" />
              <h2 className="font-heading text-3xl md:text-4xl text-gray-900 dark:text-white">
                Our Mission
              </h2>
            </div>
            <p className="font-body text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              At Zohra, we believe that the night is a sacred time for restoration and dreams. 
              We craft nightwear that transforms bedtime into a luxurious ritual, combining 
              elegant design with unparalleled comfort. Each piece is thoughtfully designed 
              to make you feel beautiful, comfortable, and truly yourself.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {values.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="text-purple-500 dark:text-purple-400">
                    {value.icon}
                  </div>
                  <span className="font-ui text-sm text-gray-600 dark:text-gray-400">
                    {value.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="font-heading text-3xl md:text-4xl text-center text-gray-900 dark:text-white mb-12">
              Why Choose Zohra
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-subheading text-xl text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="font-body text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Story Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <div className="space-y-4">
                <p className="font-body text-gray-700 dark:text-gray-300">
                  Founded with a vision to redefine nighttime luxury, Zohra began as a simple 
                  idea: why should beautiful, comfortable nightwear be a luxury?
                </p>
                <p className="font-body text-gray-700 dark:text-gray-300">
                  We started with locally sourced fabrics and a small collection, growing 
                  through word-of-mouth recommendations from customers who experienced 
                  the difference quality sleepwear makes.
                </p>
                <button className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-ui rounded-full transition-colors duration-300">
                  Explore Collections
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-3xl"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-yellow-500 dark:to-orange-500 rounded-2xl flex items-center justify-center">
                <Heart className="w-12 h-12 text-white" fill="white" />
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Star className="w-6 h-6 text-purple-500 dark:text-purple-400" fill="currentColor" />
              <Star className="w-6 h-6 text-purple-500 dark:text-purple-400" />
              <Star className="w-6 h-6 text-purple-500 dark:text-purple-400" fill="currentColor" />
            </div>
            <h3 className="font-heading text-2xl md:text-3xl text-gray-900 dark:text-white mb-4">
              Experience the Zohra Difference
            </h3>
            <p className="font-body text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Join thousands of women who have transformed their sleep experience 
              with our thoughtfully designed nightwear collection.
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 text-white font-ui rounded-full transition-all duration-300 hover:shadow-2xl">
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About