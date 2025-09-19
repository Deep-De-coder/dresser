import { NextRequest, NextResponse } from 'next/server'
import { ComputerVisionClient } from '@azure/cognitiveservices-computervision'
import { ApiKeyCredentials } from '@azure/ms-rest-js'

export async function GET(request: NextRequest) {
  try {
    const endpoint = process.env.AZURE_VISION_ENDPOINT
    const key = process.env.AZURE_VISION_KEY

    if (!endpoint || !key) {
      return NextResponse.json(
        { error: 'Azure Vision credentials not found in environment variables' },
        { status: 500 }
      )
    }

    // Create Azure Vision client
    const credentials = new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } })
    const client = new ComputerVisionClient(credentials, endpoint)

    // Test with a sample image URL (a shirt image from Unsplash)
    const testImageUrl = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop'
    
    console.log('Testing Azure Vision API with endpoint:', endpoint)
    
    // Analyze the image
    const result = await client.analyzeImage(testImageUrl, {
      visualFeatures: ['Categories', 'Tags', 'Description', 'Color'],
      details: ['Celebrities', 'Landmarks']
    })

    return NextResponse.json({
      success: true,
      message: 'Azure Vision API is working!',
      endpoint: endpoint,
      testResult: {
        categories: result.categories?.slice(0, 3), // Top 3 categories
        tags: result.tags?.slice(0, 5), // Top 5 tags
        description: result.description,
        dominantColors: result.color?.dominantColors
      }
    })

  } catch (error) {
    console.error('Azure Vision API test failed:', error)
    return NextResponse.json(
      { 
        error: 'Azure Vision API test failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
