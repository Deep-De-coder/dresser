export const APP_NAME = 'Dresser'
export const APP_DESCRIPTION = 'Smart Wardrobe Organizer with AI-Powered Clothing Recognition'

export const CATEGORIES = [
  { id: 'all', name: 'All Items', color: 'bg-gray-100 text-gray-800' },
  { id: 'shirt', name: 'Shirts', color: 'bg-blue-100 text-blue-800' },
  { id: 'pants', name: 'Pants', color: 'bg-green-100 text-green-800' },
  { id: 'jacket', name: 'Jackets', color: 'bg-purple-100 text-purple-800' },
  { id: 'dress', name: 'Dresses', color: 'bg-pink-100 text-pink-800' },
  { id: 'shoes', name: 'Shoes', color: 'bg-orange-100 text-orange-800' },
  { id: 'accessory', name: 'Accessories', color: 'bg-yellow-100 text-yellow-800' },
]

export const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'] as const

export const OCCASIONS = [
  'Casual',
  'Business',
  'Formal',
  'Sport',
  'Party',
  'Outdoor',
] as const

export const COLORS = [
  'Black',
  'White',
  'Blue',
  'Red',
  'Green',
  'Yellow',
  'Purple',
  'Pink',
  'Orange',
  'Brown',
  'Gray',
  'Navy',
  'Beige',
  'Cream',
] as const

export const SUPPORTED_IMAGE_FORMATS = ['.jpeg', '.jpg', '.png', '.webp']
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_FILES_PER_UPLOAD = 10

export const API_ENDPOINTS = {
  UPLOAD: '/api/upload',
  CATEGORIZE: '/api/categorize',
  WARDROBE: '/api/wardrobe',
  OUTFITS: '/api/outfits',
} as const
