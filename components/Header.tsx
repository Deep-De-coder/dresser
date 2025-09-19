'use client'

import { motion } from 'framer-motion'
import { Sparkles, Menu, X, Bot, Grid3X3 } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dresser
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('ai-assistant')}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span>AI Assistant</span>
            </button>
            <button 
              onClick={() => scrollToSection('my-wardrobe')}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Grid3X3 className="w-4 h-4" />
              <span>My Wardrobe</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-gray-200 py-4"
          >
            <nav className="flex flex-col space-y-4">
              <button 
                onClick={() => scrollToSection('ai-assistant')}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors text-left"
              >
                <Bot className="w-4 h-4" />
                <span>AI Assistant</span>
              </button>
              <button 
                onClick={() => scrollToSection('my-wardrobe')}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors text-left"
              >
                <Grid3X3 className="w-4 h-4" />
                <span>My Wardrobe</span>
              </button>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  )
}
