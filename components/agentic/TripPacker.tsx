'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Activity, Luggage, CheckCircle } from 'lucide-react'
import Image from 'next/image'

interface TripPackerProps {
  userId: string
}

interface TripDetails {
  destination: string
  startDate: string
  endDate: string
  activities: string[]
  weather: {
    temperature: number
    condition: string
  }
}

interface PackingList {
  outfits: Array<{
    id: string
    items: Array<{
      id: string
      title: string
      category: string
      imageUrl: string
    }>
    occasion: string
    day: string
  }>
  essentials: string[]
  laundrySchedule: Array<{
    day: string
    items: string[]
  }>
}

export default function TripPacker({ userId }: TripPackerProps) {
  const [step, setStep] = useState<'details' | 'generating' | 'results'>('details')
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    destination: '',
    startDate: '',
    endDate: '',
    activities: [],
    weather: {
      temperature: 20,
      condition: 'sunny'
    }
  })
  const [packingList, setPackingList] = useState<PackingList | null>(null)

  const activityOptions = [
    'Business meetings',
    'Casual dining',
    'Formal events',
    'Outdoor activities',
    'Sightseeing',
    'Beach/Water activities',
    'Nightlife',
    'Shopping',
    'Cultural events',
    'Sports/Exercise'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep('generating')

    try {
      const response = await fetch('/api/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          prompt: `Create a packing list for a trip to ${tripDetails.destination} from ${tripDetails.startDate} to ${tripDetails.endDate}. Activities: ${tripDetails.activities.join(', ')}`,
          constraints: {
            weather: { city: tripDetails.destination },
            activities: tripDetails.activities,
            duration: Math.ceil((new Date(tripDetails.endDate).getTime() - new Date(tripDetails.startDate).getTime()) / (1000 * 60 * 60 * 24))
          }
        })
      })

      const data = await response.json()
      if (data.success) {
        // Mock packing list generation - in real implementation, this would be more sophisticated
        const mockPackingList: PackingList = {
          outfits: [
            {
              id: 'outfit_1',
              items: [
                { id: 'item_1', title: 'Blue Shirt', category: 'shirt', imageUrl: '/placeholder.jpg' },
                { id: 'item_2', title: 'Black Pants', category: 'pants', imageUrl: '/placeholder.jpg' }
              ],
              occasion: 'Business meeting',
              day: 'Day 1'
            },
            {
              id: 'outfit_2',
              items: [
                { id: 'item_3', title: 'White T-Shirt', category: 'shirt', imageUrl: '/placeholder.jpg' },
                { id: 'item_4', title: 'Jeans', category: 'pants', imageUrl: '/placeholder.jpg' }
              ],
              occasion: 'Casual sightseeing',
              day: 'Day 2'
            }
          ],
          essentials: ['Toiletries', 'Phone charger', 'Travel documents', 'Comfortable shoes'],
          laundrySchedule: [
            { day: 'Day 3', items: ['Blue Shirt', 'Black Pants'] }
          ]
        }
        
        setPackingList(mockPackingList)
        setStep('results')
      }
    } catch (error) {
      console.error('Failed to generate packing list:', error)
      setStep('details')
    }
  }

  const toggleActivity = (activity: string) => {
    setTripDetails(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }))
  }

  if (step === 'generating') {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating Your Packing List</h3>
        <p className="text-gray-600">Analyzing your wardrobe and trip requirements...</p>
      </div>
    )
  }

  if (step === 'results' && packingList) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Your Packing List</h3>
          <button
            onClick={() => setStep('details')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Edit Trip Details
          </button>
        </div>

        {/* Outfits */}
        <div className="bg-white rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Luggage className="w-5 h-5 mr-2" />
            Outfits by Day
          </h4>
          <div className="space-y-4">
            {packingList.outfits.map((outfit, index) => (
              <div key={outfit.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">{outfit.day}</h5>
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {outfit.occasion}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {outfit.items.map((item) => (
                    <div key={item.id} className="text-center">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden relative">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-600">{item.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Essentials */}
        <div className="bg-white rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Travel Essentials</h4>
          <div className="grid grid-cols-2 gap-2">
            {packingList.essentials.map((essential, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">{essential}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Laundry Schedule */}
        {packingList.laundrySchedule.length > 0 && (
          <div className="bg-white rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Laundry Schedule</h4>
            <div className="space-y-2">
              {packingList.laundrySchedule.map((schedule, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <span className="font-medium text-gray-900">{schedule.day}</span>
                  <span className="text-sm text-gray-600">{schedule.items.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Trip Details</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Destination
            </label>
            <input
              type="text"
              value={tripDetails.destination}
              onChange={(e) => setTripDetails(prev => ({ ...prev, destination: e.target.value }))}
              placeholder="e.g., New York, Paris, Tokyo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Dates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Travel Dates
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={tripDetails.startDate}
                onChange={(e) => setTripDetails(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="date"
                value={tripDetails.endDate}
                onChange={(e) => setTripDetails(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Activities */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Activity className="w-4 h-4 inline mr-1" />
            Planned Activities
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {activityOptions.map((activity) => (
              <button
                key={activity}
                type="button"
                onClick={() => toggleActivity(activity)}
                className={`p-2 text-sm rounded-lg border transition-colors ${
                  tripDetails.activities.includes(activity)
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {activity}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Generate Packing List
        </button>
      </div>
    </form>
  )
}
