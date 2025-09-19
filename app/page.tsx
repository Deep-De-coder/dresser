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
      
      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-light tracking-tight bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-4">
            Your Smart Wardrobe
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
            Transform your closet into a sophisticated digital inventory with AI-powered clothing recognition. 
            Upload photos and let our intelligent system instantly categorize and organize your wardrobe.
          </p>
        </motion.div>

        {/* Photo Upload Section - Always Visible */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-8"
        >
          <div className="p-6">
            <h2 className="text-2xl font-light text-slate-800 mb-4 flex items-center">
              <Upload className="w-7 h-7 mr-4 text-slate-600" />
              Add New Items
            </h2>
            <PhotoUpload />
          </div>
        </motion.div>


          {/* AI Assistant Section */}
          <motion.div 
            id="ai-assistant"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-8"
          >
            <div className="p-6">
              <h2 className="text-2xl font-light text-slate-800 mb-4 flex items-center">
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
                  Today&apos;s Fit
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

        {/* Wardrobe Grid and Search */}
        <motion.div 
          id="my-wardrobe"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-8"
        >
          <div className="p-6">
            <h2 className="text-2xl font-light text-slate-800 mb-4 flex items-center">
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

        {/* Feature Cards - Moved to Bottom */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-slate-700" />
            </div>
            <h3 className="text-lg font-light text-slate-800 mb-2">AI Recognition</h3>
            <p className="text-slate-600 leading-relaxed text-sm">Instantly identify and categorize clothing items from photos with advanced computer vision technology</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-4">
              <Grid className="w-6 h-6 text-slate-700" />
            </div>
            <h3 className="text-lg font-light text-slate-800 mb-2">Smart Organization</h3>
            <p className="text-slate-600 leading-relaxed text-sm">Automatically sort items into categories and collections with intelligent classification algorithms</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-slate-700" />
            </div>
            <h3 className="text-lg font-light text-slate-800 mb-2">Intelligent Search</h3>
            <p className="text-slate-600 leading-relaxed text-sm">Find exactly what you&apos;re looking for in your digital wardrobe with semantic search capabilities</p>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div 
          id="contact"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
        >
          <div className="p-6 text-center">
            <h2 className="text-3xl font-light text-slate-800 mb-6">Get In Touch</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Have questions about Dresser or want to collaborate? I&apos;d love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <a 
                href="mailto:deepshahane@gmail.com"
                className="flex items-center space-x-3 bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 transition-all duration-200 font-light"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>deepshahane@gmail.com</span>
              </a>
              <a 
                href="https://www.linkedin.com/in/deep-shahane/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-light"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
                <span>LinkedIn Profile</span>
              </a>
            </div>
            
            {/* Copyright */}
            <div className="border-t border-slate-200 pt-6">
              <p className="text-sm text-slate-500 text-center">
                © 2024 Dresser. All rights reserved. Built with Next.js, TypeScript, and AI-powered styling.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
