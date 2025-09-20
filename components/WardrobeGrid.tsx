'use client'

import { motion } from 'framer-motion'
import { Heart, MoreVertical, Tag } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

import { WardrobeItem } from '../types'

interface WardrobeGridProps {
  category: string
}

// Mock data for demonstration
const mockItems: WardrobeItem[] = [
  {
    id: '1',
    name: 'Blue Denim Jeans',
    category: 'pants',
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
    name: 'White Summer Dress',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
    color: 'White',
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
        className="text-center py-16"
      >
        <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Tag className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-light text-slate-800 mb-3">No items found</h3>
        <p className="text-slate-600 font-light">Try uploading some clothing photos to get started!</p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {filteredItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
            
            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(item.id)}
              className={`absolute top-2 sm:top-4 right-2 sm:right-4 p-2 sm:p-3 rounded-xl transition-all duration-200 ${
                favorites.has(item.id)
                  ? 'bg-slate-700 text-white shadow-lg'
                  : 'bg-white/90 text-slate-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${favorites.has(item.id) ? 'fill-current' : ''}`} />
            </button>

            {/* More Options */}
            <button className="absolute top-2 sm:top-4 left-2 sm:left-4 p-2 sm:p-3 rounded-xl bg-white/90 text-slate-600 hover:bg-white transition-all duration-200">
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Category Badge */}
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4">
              <span className="px-2 sm:px-3 py-1 bg-slate-800/80 text-white text-xs sm:text-sm font-light rounded-xl">
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </span>
            </div>
          </div>

          {/* Item Info */}
          <div className="p-3 sm:p-4 lg:p-6">
            <h3 className="font-light text-slate-800 text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 line-clamp-1">
              {item.name}
            </h3>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="text-xs sm:text-sm">
                <span className="text-slate-600 font-light">Color:</span>
                <span className="font-light text-slate-800 ml-1 sm:ml-2">{item.color}</span>
              </div>
              
              <div className="text-xs sm:text-sm">
                <span className="text-slate-600 font-light">Season:</span>
                <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                  {item.season.map((season, idx) => (
                    <span
                      key={idx}
                      className="px-2 sm:px-3 py-1 bg-slate-100 text-slate-600 text-xs font-light rounded-xl"
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
