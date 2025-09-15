'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface TodaysFitProps {
  userId: string
}

interface QuickSuggestion {
  id: string
  items: Array<{
    id: string
    title: string
    category: string
    imageUrl: string
    colors: string[]
  }>
  rationale: string
  weather: {
    temperature: number
    condition: string
  }
}

export default function TodaysFit({ userId }: TodaysFitProps) {
  const [suggestion, setSuggestion] = useState<QuickSuggestion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMarkedWorn, setIsMarkedWorn] = useState(false)

  const getTodaysSuggestion = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          prompt: 'Quick outfit suggestion for today',
          constraints: {
            weather: { city: 'New York' },
            formality: 'casual',
            isClean: true
          }
        })
      })

      const data = await response.json()
      if (data.success && data.outfits.length > 0) {
        setSuggestion({
          id: data.outfits[0].id,
          items: data.outfits[0].items,
          rationale: data.outfits[0].rationale,
          weather: {
            temperature: 22,
            condition: 'partly cloudy'
          }
        })
      }
    } catch (error) {
      console.error('Failed to get today\'s suggestion:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsWorn = async () => {
    if (!suggestion) return

    try {
      // Mark each item as worn
      for (const item of suggestion.items) {
        await fetch('/api/wardrobe/mark-worn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            itemId: item.id
          })
        })
      }

      setIsMarkedWorn(true)
      
      // Submit positive feedback
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          outfitId: suggestion.id,
          decision: 'accepted',
          reason: 'Wore this outfit today'
        })
      })
    } catch (error) {
      console.error('Failed to mark as worn:', error)
    }
  }

  useEffect(() => {
    getTodaysSuggestion()
  }, [userId])

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Today's Fit</h3>
        </div>
        <button
          onClick={getTodaysSuggestion}
          disabled={isLoading}
          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Finding your perfect outfit...</p>
        </div>
      ) : suggestion ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Weather Context */}
          <div className="flex items-center justify-between bg-white rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">
                  {suggestion.weather.temperature}°
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Today's Weather</p>
                <p className="text-xs text-gray-600 capitalize">
                  {suggestion.weather.condition}
                </p>
              </div>
            </div>
          </div>

          {/* Outfit Items */}
          <div className="grid grid-cols-2 gap-3">
            {suggestion.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-3">
                <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                <p className="text-xs text-gray-600 capitalize">{item.category}</p>
              </div>
            ))}
          </div>

          {/* Rationale */}
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm text-gray-700">{suggestion.rationale}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={markAsWorn}
              disabled={isMarkedWorn}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-colors ${
                isMarkedWorn
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isMarkedWorn ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Worn Today</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Mark as Worn</span>
                </>
              )}
            </button>
            
            <button
              onClick={getTodaysSuggestion}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-8">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No outfit suggestion available</p>
          <p className="text-sm text-gray-500">Try uploading some clothing items first</p>
        </div>
      )}
    </div>
  )
}
