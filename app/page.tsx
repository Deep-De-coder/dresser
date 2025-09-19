'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Sparkles, Search, Grid, Plus, Camera } from 'lucide-react'
import Header from '../components/Header'
import PhotoUpload from '../components/PhotoUpload'
import WardrobeGrid from '../components/WardrobeGrid'
import CategoryFilter from '../components/CategoryFilter'
import { AskDresser, TodaysFit, TripPacker, Insights } from '../components/agentic'
import WardrobeAnalyzer from '../components/WardrobeAnalyzer'

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
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-light tracking-tight bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-6">
            Your Smart Wardrobe
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
            Transform your closet into a sophisticated digital inventory with AI-powered clothing recognition. 
            Upload photos and let our intelligent system instantly categorize and organize your wardrobe.
          </p>
        </motion.div>

        {/* Photo Upload Section - Always Visible */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden mb-12"
        >
          <div className="p-8">
            <h2 className="text-3xl font-light text-slate-800 mb-6 flex items-center">
              <Upload className="w-7 h-7 mr-4 text-slate-600" />
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
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6">
              <Camera className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-xl font-light text-slate-800 mb-3">AI Recognition</h3>
            <p className="text-slate-600 leading-relaxed">Instantly identify and categorize clothing items from photos with advanced computer vision technology</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6">
              <Grid className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-xl font-light text-slate-800 mb-3">Smart Organization</h3>
            <p className="text-slate-600 leading-relaxed">Automatically sort items into categories and collections with intelligent classification algorithms</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-xl font-light text-slate-800 mb-3">Intelligent Search</h3>
            <p className="text-slate-600 leading-relaxed">Find exactly what you're looking for in your digital wardrobe with semantic search capabilities</p>
          </div>
        </motion.div>

          {/* Azure Vision API Test Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden mb-12"
          >
            <div className="p-8">
              <h2 className="text-3xl font-light text-slate-800 mb-6 flex items-center">
                <Sparkles className="w-7 h-7 mr-4 text-slate-600" />
                Azure Vision API Test
              </h2>
              <WardrobeAnalyzer />
            </div>
          </motion.div>

          {/* AI Assistant Section */}
          <motion.div 
            id="ai-assistant"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden mb-12"
          >
            <div className="p-8">
              <h2 className="text-3xl font-light text-slate-800 mb-6 flex items-center">
                <Sparkles className="w-7 h-7 mr-4 text-slate-600" />
                AI Assistant
              </h2>
            <div className="space-y-6">
              {/* AI Sub-tabs */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setAiTab('ask')}
                  className={`px-6 py-3 text-sm font-light transition-all duration-200 ${
                    aiTab === 'ask'
                      ? 'text-slate-800 border-b-2 border-slate-600'
                      : 'text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300'
                  }`}
                >
                  Ask Dresser
                </button>
                <button
                  onClick={() => setAiTab('today')}
                  className={`px-6 py-3 text-sm font-light transition-all duration-200 ${
                    aiTab === 'today'
                      ? 'text-slate-800 border-b-2 border-slate-600'
                      : 'text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300'
                  }`}
                >
                  Today's Fit
                </button>
                <button
                  onClick={() => setAiTab('trip')}
                  className={`px-6 py-3 text-sm font-light transition-all duration-200 ${
                    aiTab === 'trip'
                      ? 'text-slate-800 border-b-2 border-slate-600'
                      : 'text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300'
                  }`}
                >
                  Trip Packer
                </button>
                <button
                  onClick={() => setAiTab('insights')}
                  className={`px-6 py-3 text-sm font-light transition-all duration-200 ${
                    aiTab === 'insights'
                      ? 'text-slate-800 border-b-2 border-slate-600'
                      : 'text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300'
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
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        >
          <div className="p-8">
            <h2 className="text-3xl font-light text-slate-800 mb-6 flex items-center">
              <Grid className="w-7 h-7 mr-4 text-slate-600" />
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
