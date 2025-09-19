import { NextRequest, NextResponse } from 'next/server'
import { AgentOrchestrator } from '@/lib/agents'
import { getDatabase } from '@/lib/db'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const orchestrator = new AgentOrchestrator()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const itemId = formData.get('itemId') as string

    if (!file || !userId || !itemId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, userId, itemId' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Process with Perception Agent
    const result = await orchestrator.executePerceptionRequest(file, userId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    const { analysis, duplicateDetection, shouldUpload } = result.result

    // Store item in database
    const db = await getDatabase()
    const item = await db.createItem({
      userId,
      title: file.name.replace(/\.[^/.]+$/, ''),
      category: analysis.category,
      colors: analysis.colors,
      patterns: analysis.patterns,
      fabric: analysis.fabric,
      seasons: ['Spring', 'Summer', 'Fall', 'Winter'], // TODO: Implement season inference
      formality: analysis.formality,
      imageUrl: shouldUpload ? `uploads/${itemId}` : '', // In local-first mode, don't store URL
      wearCount: 0,
      isClean: true,
      embedding: analysis.embedding
    })

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        title: item.title,
        category: item.category,
        colors: item.colors,
        patterns: item.patterns,
        fabric: item.fabric,
        formality: item.formality,
        confidence: analysis.confidence
      },
      duplicateDetection,
      shouldUpload,
      analysis: {
        confidence: analysis.confidence,
        perceptualHash: analysis.perceptualHash
      },
      metadata: result.metadata,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Items ingest API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function inferSeasons(analysis: any): string[] {
  // Simple season inference based on colors and formality
  const seasons = []
  
  if (analysis.colors.some((color: string) => ['white', 'light blue', 'yellow'].includes(color))) {
    seasons.push('Spring', 'Summer')
  }
  
  if (analysis.colors.some((color: string) => ['orange', 'brown', 'red'].includes(color))) {
    seasons.push('Fall')
  }
  
  if (analysis.colors.some((color: string) => ['black', 'navy', 'gray'].includes(color))) {
    seasons.push('Winter')
  }
  
  // If no specific colors, assume all seasons
  if (seasons.length === 0) {
    seasons.push('Spring', 'Summer', 'Fall', 'Winter')
  }
  
  return seasons
}
