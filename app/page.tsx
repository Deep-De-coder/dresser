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
  const [activeTab, setActiveTab] = useState<'upload' | 'wardrobe' | 'ai'>('upload')
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

        {/* Feature Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
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

        {/* Main Content Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="w-5 h-5 inline mr-2" />
              Add Items
            </button>
            <button
              onClick={() => setActiveTab('wardrobe')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'wardrobe'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid className="w-5 h-5 inline mr-2" />
              My Wardrobe
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'ai'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles className="w-5 h-5 inline mr-2" />
              AI Assistant
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'upload' ? (
              <PhotoUpload />
            ) : activeTab === 'wardrobe' ? (
              <div>
                <CategoryFilter 
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
                <WardrobeGrid category={selectedCategory} />
              </div>
            ) : (
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
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
