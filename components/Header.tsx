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
    <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-light bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">
              Dresser
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <button 
              onClick={() => scrollToSection('ai-assistant')}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-all duration-200 font-light"
            >
              <Bot className="w-5 h-5" />
              <span>AI Assistant</span>
            </button>
            <button 
              onClick={() => scrollToSection('my-wardrobe')}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-all duration-200 font-light"
            >
              <Grid3X3 className="w-5 h-5" />
              <span>My Wardrobe</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 rounded-xl hover:bg-slate-100 transition-all duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-600" />
            ) : (
              <Menu className="w-6 h-6 text-slate-600" />
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
            className="md:hidden border-t border-slate-200 py-6"
          >
            <nav className="flex flex-col space-y-6">
              <button 
                onClick={() => scrollToSection('ai-assistant')}
                className="flex items-center space-x-3 text-slate-600 hover:text-slate-800 transition-all duration-200 text-left font-light"
              >
                <Bot className="w-5 h-5" />
                <span>AI Assistant</span>
              </button>
              <button 
                onClick={() => scrollToSection('my-wardrobe')}
                className="flex items-center space-x-3 text-slate-600 hover:text-slate-800 transition-all duration-200 text-left font-light"
              >
                <Grid3X3 className="w-5 h-5" />
                <span>My Wardrobe</span>
              </button>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  )
}
