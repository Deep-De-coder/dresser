'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'

interface UploadedItem {
  id: string
  name: string
  category: string
  imageUrl: string
  confidence: number
}

export default function PhotoUpload() {
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true)
    setProcessingProgress(0)

    // Simulate AI processing
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i]
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProcessingProgress(((i + 1) / acceptedFiles.length) * 100)

      // Simulate AI categorization
      const categories = ['Shirt', 'Pants', 'Jacket', 'Dress', 'Shoes', 'Accessory']
      const randomCategory = categories[Math.floor(Math.random() * categories.length)]
      const confidence = Math.random() * 0.3 + 0.7 // 70-100% confidence

      const newItem: UploadedItem = {
        id: Date.now().toString() + i,
        name: file.name.replace(/\.[^/.]+$/, ''),
        category: randomCategory,
        imageUrl: URL.createObjectURL(file),
        confidence: confidence
      }

      setUploadedItems(prev => [...prev, newItem])
    }

    setIsProcessing(false)
    setProcessingProgress(0)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  })

  const removeItem = (id: string) => {
    setUploadedItems(prev => prev.filter(item => item.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isDragActive ? (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-blue-500 mx-auto" />
              <p className="text-lg font-medium text-blue-600">Drop your photos here</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Upload your clothing photos
                </p>
                <p className="text-gray-600 mb-4">
                  Drag and drop photos here, or click to select files
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPEG, PNG, and WebP formats
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Processing Indicator */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Processing with AI...</p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900">Processed Items</h3>
            <div className="grid gap-4">
              {uploadedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg border border-gray-200 p-4 flex items-center space-x-4"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <span className="text-sm font-medium text-green-600">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <AlertCircle className="w-5 h-5" />
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
