'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'

interface AssistantResponse {
  reply: string
  plan: {
    top?: string
    bottom?: string
    shoes?: string
    outerwear?: string
    accessories?: string[]
  }
  rationale: string
  usedItems: string[]
  meta: {
    provider: string
    model: string
    latencyMs: number
  }
}

interface AskDresserProps {
  userId: string
}

export default function AskDresser({ userId }: AskDresserProps) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<AssistantResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
    setResponse(null)
    
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: prompt.trim(),
          weather: { tempC: 20, condition: 'sunny' }, // Default weather
          preferences: { style: 'casual' },
          items: [] // Empty for now - will be populated from wardrobe later
        })
      })

      const data = await response.json()
      if (response.ok) {
        setResponse(data)
      } else {
        setError(data.error || 'Failed to get outfit suggestions')
      }
    } catch (error) {
      console.error('Failed to get outfit suggestions:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = async (decision: 'accepted' | 'rejected') => {
    if (!response) return

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          outfitId: 'assistant-response',
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
              placeholder="Ask Dresser: &quot;What should I wear for a business meeting tomorrow?&quot;"
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

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assistant Response */}
      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Reply Text */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-800 leading-relaxed">{response.reply}</p>
                </div>
              </div>
            </div>

            {/* Outfit Plan */}
            {response.plan && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-light text-slate-800 mb-4">Outfit Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {response.plan.top && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <span className="text-slate-700"><strong>Top:</strong> {response.plan.top}</span>
                    </div>
                  )}
                  {response.plan.bottom && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <span className="text-slate-700"><strong>Bottom:</strong> {response.plan.bottom}</span>
                    </div>
                  )}
                  {response.plan.shoes && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <span className="text-slate-700"><strong>Shoes:</strong> {response.plan.shoes}</span>
                    </div>
                  )}
                  {response.plan.outerwear && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <span className="text-slate-700"><strong>Outerwear:</strong> {response.plan.outerwear}</span>
                    </div>
                  )}
                  {response.plan.accessories && response.plan.accessories.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <span className="text-slate-700"><strong>Accessories:</strong> {response.plan.accessories.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rationale */}
            {response.rationale && (
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <MessageSquare className="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-800 mb-1">{"Dresser's Reasoning"}</p>
                    <p className="text-sm text-slate-700">{response.rationale}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">
                {response.meta ? (
                  <>Powered by {response.meta.provider} ({response.meta.model}) • {response.meta.latencyMs}ms</>
                ) : (
                  <>Powered by AI Assistant</>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleFeedback('accepted')}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-600 transition-colors"
                >
                  <ThumbsUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleFeedback('rejected')}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <ThumbsDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isLoading && !response && !error && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-light text-slate-800 mb-2">Ask Dresser Anything</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Get personalized outfit suggestions based on your wardrobe, weather, and style preferences.
          </p>
        </div>
      )}
    </div>
  )
}
