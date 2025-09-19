'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'

interface OutfitSuggestion {
  id: string
  items: Array<{
    id: string
    title: string
    category: string
    imageUrl: string
    colors: string[]
    formality: string
  }>
  rationale: string
  score: number
  confidence: number
}

interface AskDresserProps {
  userId: string
}

export default function AskDresser({ userId }: AskDresserProps) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([])
  const [feedback, setFeedback] = useState<{ [key: string]: 'accepted' | 'rejected' | null }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          prompt: prompt.trim(),
          constraints: {
            weather: { city: 'New York' } // Default city
          }
        })
      })

      const data = await response.json()
      if (data.success) {
        setSuggestions(data.outfits)
        setFeedback({})
      } else {
        console.error('Stylist API error:', data.error)
      }
    } catch (error) {
      console.error('Failed to get outfit suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = async (outfitId: string, decision: 'accepted' | 'rejected') => {
    setFeedback(prev => ({ ...prev, [outfitId]: decision }))

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          outfitId,
          decision,
          reason: decision === 'accepted' ? 'User approved this outfit' : 'User rejected this outfit'
        })
      })
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Chat Input */}
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Dresser: 'What should I wear for a business meeting tomorrow?'"
              className="w-full px-6 py-4 pr-14 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 placeholder-slate-500 font-light text-lg shadow-lg"
              disabled={isLoading}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Sparkles className="w-6 h-6 text-slate-400" />
            </div>
          </div>
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="px-8 py-4 bg-slate-700 text-white rounded-2xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-light text-lg shadow-lg transition-all duration-200"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 rounded-lg p-6 text-center"
          >
            <div className="flex items-center justify-center space-x-3">
              <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
              <div>
                <p className="text-blue-900 font-medium">Dresser is thinking...</p>
                <p className="text-blue-700 text-sm">Analyzing your wardrobe and preferences</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outfit Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900">Outfit Suggestions</h3>
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                {/* Outfit Items */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {suggestion.items.map((item) => (
                    <div key={item.id} className="text-center">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-600">{item.category}</p>
                    </div>
                  ))}
                </div>

                {/* Rationale */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Dresser's Reasoning</p>
                      <p className="text-sm text-gray-700">{suggestion.rationale}</p>
                    </div>
                  </div>
                </div>

                {/* Score and Feedback */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="text-gray-600">Score: </span>
                      <span className="font-medium text-gray-900">
                        {Math.round(suggestion.score * 100)}%
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Confidence: </span>
                      <span className="font-medium text-gray-900">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleFeedback(suggestion.id, 'accepted')}
                      className={`p-2 rounded-lg transition-colors ${
                        feedback[suggestion.id] === 'accepted'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                      }`}
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(suggestion.id, 'rejected')}
                      className={`p-2 rounded-lg transition-colors ${
                        feedback[suggestion.id] === 'rejected'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                      }`}
                    >
                      <ThumbsDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isLoading && suggestions.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ask Dresser Anything</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Get personalized outfit suggestions based on your wardrobe, weather, and style preferences.
          </p>
        </div>
      )}
    </div>
  )
}
