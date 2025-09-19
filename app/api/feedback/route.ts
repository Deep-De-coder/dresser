import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, outfitId, decision, reason } = body

    if (!userId || !decision || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, decision, reason' },
        { status: 400 }
      )
    }

    if (!['accepted', 'rejected'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be "accepted" or "rejected".' },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    // Create feedback record
    const feedback = await db.createFeedback({
      userId,
      outfitId,
      decision: decision as 'accepted' | 'rejected',
      reason
    })

    // Update user preferences based on feedback
    await this.updatePreferencesFromFeedback(userId, decision, reason, db)

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        decision: feedback.decision,
        reason: feedback.reason,
        timestamp: feedback.createdAt
      },
      message: 'Feedback recorded successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Feedback API error:', error)
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
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const feedback = await db.getUserFeedback(userId, limit)

    // Calculate feedback statistics
    const stats = this.calculateFeedbackStats(feedback)

    return NextResponse.json({
      success: true,
      feedback,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Feedback GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updatePreferencesFromFeedback(
  userId: string, 
  decision: string, 
  reason: string, 
  db: any
): Promise<void> {
  try {
    const preferences = await db.getPreferences(userId) || {
      userId,
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
    }

    // Extract insights from feedback reason
    const reasonLower = reason.toLowerCase()

    // Color preferences
    if (decision === 'rejected' && reasonLower.includes('color')) {
      const colorKeywords = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'black', 'white', 'gray']
      const mentionedColor = colorKeywords.find(color => reasonLower.includes(color))
      if (mentionedColor && !preferences.style.avoidedColors.includes(mentionedColor)) {
        preferences.style.avoidedColors.push(mentionedColor)
      }
    }

    // Formality preferences
    if (decision === 'rejected' && reasonLower.includes('formal')) {
      if (preferences.style.formalityPreference === 'formal') {
        preferences.style.formalityPreference = 'business'
      } else if (preferences.style.formalityPreference === 'business') {
        preferences.style.formalityPreference = 'casual'
      }
    }

    if (decision === 'rejected' && reasonLower.includes('casual')) {
      if (preferences.style.formalityPreference === 'casual') {
        preferences.style.formalityPreference = 'business'
      }
    }

    // Comfort constraints
    if (decision === 'rejected' && reasonLower.includes('comfort')) {
      const comfortKeywords = ['tight', 'loose', 'uncomfortable', 'itchy', 'heavy']
      const mentionedComfort = comfortKeywords.find(keyword => reasonLower.includes(keyword))
      if (mentionedComfort && !preferences.style.comfortConstraints.includes(mentionedComfort)) {
        preferences.style.comfortConstraints.push(mentionedComfort)
      }
    }

    // Save updated preferences
    await db.updatePreferences(userId, preferences)

  } catch (error) {
    console.warn('Failed to update preferences from feedback:', error)
  }
}

function calculateFeedbackStats(feedback: any[]): any {
  const total = feedback.length
  const accepted = feedback.filter(f => f.decision === 'accepted').length
  const rejected = feedback.filter(f => f.decision === 'rejected').length

  const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0

  // Common rejection reasons
  const rejectionReasons = feedback
    .filter(f => f.decision === 'rejected')
    .map(f => f.reason.toLowerCase())
    .join(' ')
    .split(' ')
    .filter(word => word.length > 3)
    .reduce((acc: any, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {})

  const topRejectionReasons = Object.entries(rejectionReasons)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([reason, count]) => ({ reason, count }))

  return {
    total,
    accepted,
    rejected,
    acceptanceRate: Math.round(acceptanceRate * 100) / 100,
    topRejectionReasons
  }
}
