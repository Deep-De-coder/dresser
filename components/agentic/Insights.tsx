'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, AlertCircle, Lightbulb, Clock } from 'lucide-react'

interface InsightsProps {
  userId: string
}

interface InsightData {
  wearFrequency: Array<{
    itemId: string
    count: number
  }>
  mostUsedColors: Array<{
    color: string
    count: number
  }>
  gaps: Array<{
    category: string
    priority: 'high' | 'medium' | 'low'
    description: string
    reasoning: string
  }>
  stats: {
    totalItems: number
    avgWearCount: number
    mostWornItem: any
    leastWornItem: any
  }
}

export default function Insights({ userId }: InsightsProps) {
  const [insights, setInsights] = useState<InsightData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchInsights = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/gaps?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setInsights({
          wearFrequency: data.usage.wearFrequency,
          mostUsedColors: data.usage.mostUsedColors,
          gaps: data.gaps,
          stats: {
            totalItems: data.usage.wearFrequency.length,
            avgWearCount: data.usage.wearFrequency.reduce((sum: number, item: any) => sum + item.count, 0) / data.usage.wearFrequency.length,
            mostWornItem: data.usage.wearFrequency[0],
            leastWornItem: data.usage.wearFrequency[data.usage.wearFrequency.length - 1]
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Analyzing your wardrobe...</p>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No insights available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{insights.stats.totalItems}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(insights.stats.avgWearCount)}
          </div>
          <div className="text-sm text-gray-600">Avg Wears</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {insights.gaps.filter(g => g.priority === 'high').length}
          </div>
          <div className="text-sm text-gray-600">High Priority Gaps</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {insights.mostUsedColors.length}
          </div>
          <div className="text-sm text-gray-600">Color Variety</div>
        </div>
      </div>

      {/* Most Worn Items */}
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Most Worn Items
        </h3>
        <div className="space-y-3">
          {insights.wearFrequency.slice(0, 5).map((item, index) => (
            <div key={item.itemId} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Item {item.itemId.slice(-4)}</p>
                  <p className="text-sm text-gray-600">{item.count} wears</p>
                </div>
              </div>
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(item.count / insights.wearFrequency[0].count) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Usage */}
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Preferences</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {insights.mostUsedColors.slice(0, 6).map((colorData) => (
            <div key={colorData.color} className="text-center">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-gray-200"
                style={{ backgroundColor: colorData.color }}
              />
              <p className="text-sm font-medium text-gray-900 capitalize">{colorData.color}</p>
              <p className="text-xs text-gray-600">{colorData.count} wears</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wardrobe Gaps */}
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2" />
          Wardrobe Gaps
        </h3>
        <div className="space-y-4">
          {insights.gaps.map((gap, index) => (
            <motion.div
              key={gap.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-l-4 ${
                gap.priority === 'high'
                  ? 'bg-red-50 border-red-400'
                  : gap.priority === 'medium'
                  ? 'bg-yellow-50 border-yellow-400'
                  : 'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900 capitalize">{gap.category}</h4>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        gap.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : gap.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {gap.priority} priority
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{gap.description}</p>
                  <p className="text-xs text-gray-600">{gap.reasoning}</p>
                </div>
                {gap.priority === 'high' && (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Smart Recommendations
        </h3>
        <div className="space-y-3">
          {insights.stats.mostWornItem && insights.stats.mostWornItem.count > 10 && (
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <strong>Consider replacing:</strong> Your most-worn item has been used {insights.stats.mostWornItem.count} times and may need refreshing.
              </p>
            </div>
          )}
          
          {insights.gaps.filter(g => g.priority === 'high').length > 0 && (
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <strong>Priority shopping:</strong> Focus on {insights.gaps.filter(g => g.priority === 'high').map(g => g.category).join(', ')} to complete your wardrobe.
              </p>
            </div>
          )}
          
          {insights.mostUsedColors.length < 3 && (
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <strong>Color variety:</strong> Consider adding more color variety to increase outfit combinations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
