import HeroBannerSlideshow from '@/components/layout/HeroBannerSlideshow'
import TShirtCategories from '@/components/layout/TShirtCategories'
import FlashSale from '@/components/layout/FlashSale'
import TShirtProductGrid from '@/components/product/TShirtProductGrid'
import BestSellingStore from '@/components/layout/BestSellingStore'
import { Sparkles, TrendingUp, Award, Star } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner Slideshow */}
      <HeroBannerSlideshow />
      
      {/* Category Navigation */}
      <TShirtCategories />
      
      {/* Flash Sale Section */}
      <FlashSale />
      
      {/* Today's For You Section */}
      <TShirtProductGrid
        title="Today's For You!"
        subtitle="Personalized recommendations"
        icon={
          <div className="bg-blue-500 text-white p-2 rounded-lg">
            <Star className="h-5 w-5" />
          </div>
        }
        fetchUrl="/api/products?category=tshirts&featured=true"
        limit={4}
        className="bg-white"
      />
      
      {/* Featured Products Section */}
      <TShirtProductGrid
        title="Featured T-Shirts"
        subtitle="Hand-picked by our fashion experts"
        icon={
          <div className="bg-purple-500 text-white p-2 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
        }
        fetchUrl="/api/products?category=tshirts&featured=true&sortBy=rating"
        limit={8}
        className="bg-gray-50"
      />
      
      {/* Trending Section */}
      <TShirtProductGrid
        title="Trending Now"
        subtitle="What everyone's buying"
        icon={
          <div className="bg-green-500 text-white p-2 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
        }
        fetchUrl="/api/products?category=tshirts&sortBy=popular"
        limit={4}
        className="bg-white"
      />
      
      {/* Best Sellers Section */}
      <TShirtProductGrid
        title="Best Selling T-Shirts"
        subtitle="Top-rated by customers"
        icon={
          <div className="bg-orange-500 text-white p-2 rounded-lg">
            <Award className="h-5 w-5" />
          </div>
        }
        fetchUrl="/api/products?category=tshirts&sortBy=reviewCount"
        limit={8}
        className="bg-gray-50"
      />
      
      {/* Best Selling Store Section */}
      <BestSellingStore />
    </div>
  )
}
