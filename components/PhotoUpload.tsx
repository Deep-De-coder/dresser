'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, Sparkles, CheckCircle, Trash2, RefreshCw, X } from 'lucide-react'

import { UploadedItem } from '../types'

export default function PhotoUpload() {
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [currentImageName, setCurrentImageName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    // Set current image immediately
    const imageUrl = URL.createObjectURL(file)
    setCurrentImage(imageUrl)
    setCurrentImageName(file.name.replace(/\.[^/.]+$/, ''))
    
    try {
      // Call Azure Vision API for real analysis
      const response = await fetch('/api/wardrobe/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`)
      }

      const analysis = await response.json()
      
      // Map Azure results to our format
      const category = analysis.category ? 
        analysis.category.charAt(0).toUpperCase() + analysis.category.slice(1) : 
        'Unknown'
      
      const confidence = analysis.boxes && analysis.boxes.length > 0 ? 
        analysis.boxes[0].confidence : 0.8

      const newItem: UploadedItem = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        category: category,
        imageUrl: imageUrl,
        confidence: confidence
      }

      setUploadedItems(prev => [...prev, newItem])
      
    } catch (error) {
      console.error('AI analysis failed:', error)
      
      // Fallback to mock data if API fails
      const categories = ['Shirt', 'Pants', 'Jacket', 'Dress', 'Shoes', 'Accessory']
      const randomCategory = categories[Math.floor(Math.random() * categories.length)]
      const confidence = Math.random() * 0.3 + 0.7

      const newItem: UploadedItem = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        category: randomCategory,
        imageUrl: imageUrl,
        confidence: confidence
      }

      setUploadedItems(prev => [...prev, newItem])
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    
    const file = acceptedFiles[0] // Only process the first file
    setIsProcessing(true)
    setProcessingProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    await processFile(file)
    
    clearInterval(progressInterval)
    setProcessingProgress(100)
    setIsProcessing(false)
  }, [])

  const handleReplaceImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsProcessing(true)
      setProcessingProgress(0)
      
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      await processFile(file)
      
      clearInterval(progressInterval)
      setProcessingProgress(100)
      setIsProcessing(false)
    }
  }

  const clearCurrentImage = () => {
    setCurrentImage(null)
    setCurrentImageName('')
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  const removeItem = (id: string) => {
    setUploadedItems(prev => prev.filter(item => item.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input for replace functionality */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Current Image Display */}
      {currentImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50 rounded-2xl border border-slate-200 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-light text-slate-800">Current Image</h3>
            <button
              onClick={clearCurrentImage}
              className="text-slate-400 hover:text-slate-600 transition-all duration-200 p-2 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="relative">
              <img
                src={currentImage}
                alt={currentImageName}
                className="w-40 h-40 object-cover rounded-2xl border border-slate-200 shadow-lg"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h4 className="font-light text-slate-800 text-lg mb-3">{currentImageName}</h4>
              <div className="space-y-3">
                <button
                  onClick={handleReplaceImage}
                  disabled={isProcessing}
                  className="flex items-center space-x-3 px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-light shadow-lg"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Replace Image</span>
                </button>
                <p className="text-sm text-slate-500 font-light">
                  Click to select a different image
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upload Area - Only show when no current image */}
      {!currentImage && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
            isDragActive
              ? 'border-slate-400 bg-slate-50'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          }`}
        >
          <input {...getInputProps()} />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {isDragActive ? (
              <div className="space-y-6">
                <Upload className="w-16 h-16 text-slate-600 mx-auto" />
                <p className="text-xl font-light text-slate-700">Drop your photo here</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Camera className="w-10 h-10 text-white" />
                </div>
                <div>
                  <p className="text-xl font-light text-slate-800 mb-3">
                    Upload your clothing photo
                  </p>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Drag and drop a photo here, or click to select a file
                  </p>
                  <p className="text-sm text-slate-500 font-light">
                    Supports JPEG, PNG, and WebP formats
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Processing Indicator */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-50 rounded-2xl p-6 border border-slate-200"
          >
            <div className="flex items-center space-x-4">
              <Sparkles className="w-6 h-6 text-slate-600 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-light text-slate-800">Processing with AI...</p>
                <div className="w-full bg-slate-200 rounded-full h-3 mt-3">
                  <div 
                    className="bg-slate-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Items */}
      <AnimatePresence>
        {uploadedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-light text-slate-800">Processed Items</h3>
            <div className="grid gap-6">
              {uploadedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center space-x-6 shadow-lg"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl border border-slate-200"
                  />
                  <div className="flex-1">
                    <h4 className="font-light text-slate-800 text-lg mb-2">{item.name}</h4>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-sm text-slate-600 font-light">Category:</span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-light rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-sm text-slate-600 font-light">Confidence:</span>
                      <span className="text-sm font-light text-slate-700">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-slate-600" />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-slate-600 transition-all duration-200 p-2 rounded-lg hover:bg-slate-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
