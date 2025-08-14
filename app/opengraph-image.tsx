import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'Dresser - Smart Wardrobe Organizer'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          backgroundImage: 'linear-gradient(135deg, #f0f9ff 0%, #fdf4ff 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 32,
              fontWeight: 'bold',
              marginRight: 20,
            }}
          >
            D
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Dresser
          </div>
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#374151',
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Smart Wardrobe Organizer with AI-Powered Clothing Recognition
        </div>
        <div
          style={{
            fontSize: 20,
            color: '#6b7280',
            marginTop: 20,
            textAlign: 'center',
          }}
        >
          Transform your closet into a digital inventory
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
