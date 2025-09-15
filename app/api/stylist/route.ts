import { NextRequest, NextResponse } from 'next/server'
import { AgentOrchestrator } from '@/lib/agents'
import { getDatabase } from '@/lib/db'

const orchestrator = new AgentOrchestrator()

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

    // Get user preferences for context
    const db = await getDatabase()
    const preferences = await db.getPreferences(userId)
    const feedbackHistory = await db.getUserFeedback(userId, 10)

    const context = {
      userId,
      goal: prompt,
      constraints: {
        ...constraints,
        weather: constraints.weather || { city: 'New York' }
      },
      preferences: preferences || {
        style: {
          preferredColors: [],
          avoidedColors: [],
          preferredSilhouettes: [],
          comfortConstraints: [],
          formalityPreference: 'casual'
        },
        constraints: {
          budget: 0,
          climate: '',
          lifestyle: []
        }
      },
      feedbackHistory
    }

    const result = await orchestrator.executeStylistRequest(context)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // Log the request for learning
    await db.createFeedback({
      userId,
      decision: 'generated',
      reason: `Generated ${result.suggestions.length} outfit suggestions for: ${prompt}`
    })

    return NextResponse.json({
      success: true,
      outfits: result.suggestions,
      rationale: result.suggestions.map(s => s.rationale),
      logs: result.metadata,
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
