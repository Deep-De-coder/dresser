import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dresser - Smart Wardrobe Organizer',
    short_name: 'Dresser',
    description: 'A smart wardrobe organizer that helps users keep track of their clothing with AI',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0ea5e9',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
