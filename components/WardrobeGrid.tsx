'use client'

import { motion } from 'framer-motion'
import { Heart, MoreVertical, Tag } from 'lucide-react'
import { useState } from 'react'

interface WardrobeItem {
  id: string
  name: string
  category: string
  imageUrl: string
  color: string
  season: string[]
  favorite: boolean
}

interface WardrobeGridProps {
  category: string
}

// Mock data for demonstration
const mockItems: WardrobeItem[] = [
  {
    id: '1',
    name: 'Blue Denim Jacket',
    category: 'jacket',
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop',
    color: 'Blue',
    season: ['Spring', 'Fall'],
    favorite: true
  },
  {
    id: '2',
    name: 'White T-Shirt',
    category: 'shirt',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    color: 'White',
    season: ['Spring', 'Summer', 'Fall', 'Winter'],
    favorite: false
  },
  {
    id: '3',
    name: 'Black Jeans',
    category: 'pants',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
    color: 'Black',
    season: ['Fall', 'Winter'],
    favorite: true
  },
  {
    id: '4',
    name: 'Red Summer Dress',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
    color: 'Red',
    season: ['Spring', 'Summer'],
    favorite: false
  },
  {
    id: '5',
    name: 'Brown Leather Shoes',
    category: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    color: 'Brown',
    season: ['Fall', 'Winter'],
    favorite: true
  },
  {
    id: '6',
    name: 'Silver Watch',
    category: 'accessory',
    imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop',
    color: 'Silver',
    season: ['Spring', 'Summer', 'Fall', 'Winter'],
    favorite: false
  }
]

export default function WardrobeGrid({ category }: WardrobeGridProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['1', '3', '5']))

  const filteredItems = category === 'all' 
    ? mockItems 
    : mockItems.filter(item => item.category === category)

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  if (filteredItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Tag className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
        <p className="text-gray-600">Try uploading some clothing photos to get started!</p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            
            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(item.id)}
              className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                favorites.has(item.id)
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorites.has(item.id) ? 'fill-current' : ''}`} />
            </button>

            {/* More Options */}
            <button className="absolute top-3 left-3 p-2 rounded-full bg-white/80 text-gray-600 hover:bg-white transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Category Badge */}
            <div className="absolute bottom-3 left-3">
              <span className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded-full">
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </span>
            </div>
          </div>

          {/* Item Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
              {item.name}
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Color:</span>
                <span className="font-medium text-gray-900">{item.color}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Season:</span>
                <div className="flex flex-wrap gap-1">
                  {item.season.map((season, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {season}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
