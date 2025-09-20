'use client'

import { motion } from 'framer-motion'
import { Sparkles, Menu, X, Bot, Grid3X3, Mail } from 'lucide-react'
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
    <header className="bg-white/60 backdrop-blur-2xl border-b border-white/30 sticky top-0 z-50 shadow-lg shadow-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/20">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-light bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent tracking-tight">
              Dresser
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <button 
              onClick={() => scrollToSection('ai-assistant')}
              className="flex items-center space-x-3 px-6 py-3 text-slate-700 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all duration-300 font-light group backdrop-blur-sm"
            >
              <Bot className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>AI Assistant</span>
            </button>
            <button 
              onClick={() => scrollToSection('my-wardrobe')}
              className="flex items-center space-x-3 px-6 py-3 text-slate-700 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all duration-300 font-light group backdrop-blur-sm"
            >
              <Grid3X3 className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>My Wardrobe</span>
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="flex items-center space-x-3 px-6 py-3 text-slate-700 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all duration-300 font-light group backdrop-blur-sm"
            >
              <Mail className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>Contact</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 sm:p-3 rounded-xl hover:bg-white/50 transition-all duration-300 group backdrop-blur-sm"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-700 group-hover:scale-110 transition-transform duration-200" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700 group-hover:scale-110 transition-transform duration-200" />
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
            className="md:hidden border-t border-white/20 py-6"
          >
            <nav className="flex flex-col space-y-4">
              <button 
                onClick={() => scrollToSection('ai-assistant')}
                className="flex items-center space-x-4 px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all duration-300 text-left font-light group backdrop-blur-sm"
              >
                <Bot className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>AI Assistant</span>
              </button>
              <button 
                onClick={() => scrollToSection('my-wardrobe')}
                className="flex items-center space-x-4 px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all duration-300 text-left font-light group backdrop-blur-sm"
              >
                <Grid3X3 className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>My Wardrobe</span>
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="flex items-center space-x-4 px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all duration-300 text-left font-light group backdrop-blur-sm"
              >
                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>Contact</span>
              </button>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  )
}
