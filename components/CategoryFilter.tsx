'use client'

import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

import { CATEGORIES } from '../constants'

const categories = CATEGORIES

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
        <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
        <h3 className="text-lg sm:text-xl font-light text-slate-800">Filter by Category</h3>
      </div>
      
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onCategoryChange(category.id)}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-2xl text-xs sm:text-sm font-light transition-all duration-300 ${
              selectedCategory === category.id
                ? 'bg-slate-700 text-white shadow-lg'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
            }`}
          >
            {category.name}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
