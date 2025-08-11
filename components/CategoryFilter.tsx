'use client'

import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const categories = [
  { id: 'all', name: 'All Items', color: 'bg-gray-100 text-gray-800' },
  { id: 'shirt', name: 'Shirts', color: 'bg-blue-100 text-blue-800' },
  { id: 'pants', name: 'Pants', color: 'bg-green-100 text-green-800' },
  { id: 'jacket', name: 'Jackets', color: 'bg-purple-100 text-purple-800' },
  { id: 'dress', name: 'Dresses', color: 'bg-pink-100 text-pink-800' },
  { id: 'shoes', name: 'Shoes', color: 'bg-orange-100 text-orange-800' },
  { id: 'accessory', name: 'Accessories', color: 'bg-yellow-100 text-yellow-800' },
]

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filter by Category</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category.id
                ? `${category.color} ring-2 ring-offset-2 ring-blue-500`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
