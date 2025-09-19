import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const endpoint = process.env.AZURE_VISION_ENDPOINT
    const key = process.env.AZURE_VISION_KEY

    return NextResponse.json({
      success: true,
      message: 'Environment variables check',
      hasEndpoint: !!endpoint,
      hasKey: !!key,
      endpoint: endpoint ? endpoint.substring(0, 50) + '...' : 'Not found',
      keyLength: key ? key.length : 0
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Environment test failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
