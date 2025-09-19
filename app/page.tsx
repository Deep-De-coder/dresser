'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Sparkles, Search, Grid, Plus, Camera } from 'lucide-react'
import Header from '../components/Header'
import PhotoUpload from '../components/PhotoUpload'
import WardrobeGrid from '../components/WardrobeGrid'
import CategoryFilter from '../components/CategoryFilter'
import { AskDresser, TodaysFit, TripPacker, Insights } from '../components/agentic'

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [aiTab, setAiTab] = useState<'ask' | 'today' | 'trip' | 'insights'>('ask')
  
  // Mock userId - in real app, this would come from authentication
  const userId = 'user_123'

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Your Smart Wardrobe
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your closet into a digital inventory with AI-powered clothing recognition. 
            Upload photos and let our AI instantly categorize your wardrobe.
          </p>
        </motion.div>

        {/* Photo Upload Section - Always Visible */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8"
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Upload className="w-6 h-6 mr-3 text-blue-600" />
              Add New Items
            </h2>
            <PhotoUpload />
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Recognition</h3>
            <p className="text-gray-600">Instantly identify and categorize clothing items from photos</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Grid className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Organization</h3>
            <p className="text-gray-600">Automatically sort items into categories and collections</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Search</h3>
            <p className="text-gray-600">Find exactly what you're looking for in your digital wardrobe</p>
          </div>
        </motion.div>

        {/* AI Assistant Section */}
        <motion.div 
          id="ai-assistant"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8"
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-6 h-6 mr-3 text-purple-600" />
              AI Assistant
            </h2>
            <div className="space-y-6">
              {/* AI Sub-tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setAiTab('ask')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    aiTab === 'ask'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Ask Dresser
                </button>
                <button
                  onClick={() => setAiTab('today')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    aiTab === 'today'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Today's Fit
                </button>
                <button
                  onClick={() => setAiTab('trip')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    aiTab === 'trip'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Trip Packer
                </button>
                <button
                  onClick={() => setAiTab('insights')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    aiTab === 'insights'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Insights
                </button>
              </div>

              {/* AI Content */}
              {aiTab === 'ask' && <AskDresser userId={userId} />}
              {aiTab === 'today' && <TodaysFit userId={userId} />}
              {aiTab === 'trip' && <TripPacker userId={userId} />}
              {aiTab === 'insights' && <Insights userId={userId} />}
            </div>
          </div>
        </motion.div>

        {/* Wardrobe Grid and Search - Moved to Bottom */}
        <motion.div 
          id="my-wardrobe"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Grid className="w-6 h-6 mr-3 text-green-600" />
              My Wardrobe
            </h2>
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            <WardrobeGrid category={selectedCategory} />
          </div>
        </motion.div>
      </main>
    </div>
  )
}
