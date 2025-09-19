import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { AgentOrchestrator } from '@/lib/agents'

const orchestrator = new AgentOrchestrator()

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, prompt, constraints = {} } = body

    if (!userId || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, prompt' },
        { status: 400 }
      )
    }

    // Mock outfit suggestions with proper image URLs
    const mockSuggestions = [
      {
        id: 'outfit_1',
        name: 'Casual Professional',
        items: [
          { 
            id: 'item_1',
            title: 'Blue Cotton Shirt', 
            category: 'tops', 
            color: 'blue',
            imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop&crop=center',
            colors: ['blue'],
            formality: 'business-casual'
          },
          { 
            id: 'item_2',
            title: 'Khaki Chinos', 
            category: 'bottoms', 
            color: 'khaki',
            imageUrl: 'https://images.unsplash.com/photo-1506629905607-1b1b1b1b1b1b?w=300&h=300&fit=crop&crop=center',
            colors: ['khaki'],
            formality: 'casual'
          },
          { 
            id: 'item_3',
            title: 'White Sneakers', 
            category: 'shoes', 
            color: 'white',
            imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop&crop=center',
            colors: ['white'],
            formality: 'casual'
          }
        ],
        rationale: 'Perfect for casual Friday at the office. The blue shirt provides professionalism while khaki chinos keep it relaxed.',
        score: 0.92,
        confidence: 0.85,
        weatherAppropriate: true
      },
      {
        id: 'outfit_2', 
        name: 'Smart Casual',
        items: [
          { 
            id: 'item_4',
            title: 'Navy Blazer', 
            category: 'tops', 
            color: 'navy',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center',
            colors: ['navy'],
            formality: 'business'
          },
          { 
            id: 'item_5',
            title: 'White T-Shirt', 
            category: 'tops', 
            color: 'white',
            imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center',
            colors: ['white'],
            formality: 'casual'
          },
          { 
            id: 'item_6',
            title: 'Dark Jeans', 
            category: 'bottoms', 
            color: 'dark blue',
            imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop&crop=center',
            colors: ['dark blue'],
            formality: 'casual'
          },
          { 
            id: 'item_7',
            title: 'Brown Loafers', 
            category: 'shoes', 
            color: 'brown',
            imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=300&fit=crop&crop=center',
            colors: ['brown'],
            formality: 'business-casual'
          }
        ],
        rationale: 'Elevated casual look that works for client meetings or dinner. Navy blazer adds sophistication.',
        score: 0.88,
        confidence: 0.82,
        weatherAppropriate: true
      }
    ]

    return NextResponse.json({
      success: true,
      outfits: mockSuggestions,
      rationale: mockSuggestions.map(s => s.rationale),
      logs: {
        agent: 'stylist',
        timestamp: new Date(),
        executionTime: Date.now()
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Stylist API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // Get recent outfit suggestions
    const db = await getDatabase()
    const recentOutfits = await db.getUserOutfits(userId, 10)

    return NextResponse.json({
      success: true,
      recentOutfits,
      agentStatus: orchestrator.getAgentStatus(),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Stylist GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
