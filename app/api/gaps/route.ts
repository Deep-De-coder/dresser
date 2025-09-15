import { NextRequest, NextResponse } from 'next/server'
import { AgentOrchestrator } from '@/lib/agents'
import { getDatabase } from '@/lib/db'

const orchestrator = new AgentOrchestrator()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const capsuleGoal = searchParams.get('capsuleGoal') || 'versatile'

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // Execute inventory analysis
    const result = await orchestrator.executeInventoryRequest(
      userId,
      'analyze_wardrobe_gaps',
      { capsuleGoal }
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // Extract gaps from the execution result
    const gaps = result.execution?.steps
      ?.find(step => step.toolName === 'detectGaps' && step.status === 'completed')
      ?.result?.gaps || []

    // Get additional insights
    const db = await getDatabase()
    const wearFrequency = await db.getWearFrequency(userId, 30)
    const mostUsedColors = await db.getMostUsedColors(userId)

    // Prioritize gaps based on usage patterns
    const prioritizedGaps = this.prioritizeGaps(gaps, wearFrequency, mostUsedColors)

    return NextResponse.json({
      success: true,
      gaps: prioritizedGaps,
      insights: {
        totalGaps: gaps.length,
        highPriorityGaps: gaps.filter(g => g.priority === 'high').length,
        mediumPriorityGaps: gaps.filter(g => g.priority === 'medium').length,
        lowPriorityGaps: gaps.filter(g => g.priority === 'low').length
      },
      usage: {
        wearFrequency: wearFrequency.slice(0, 5),
        mostUsedColors: mostUsedColors.slice(0, 5)
      },
      metadata: result.metadata,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Gaps API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, capsuleGoal = 'versatile', preferences = {} } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // Execute comprehensive gap analysis with custom preferences
    const result = await orchestrator.executeInventoryRequest(
      userId,
      'comprehensive_gap_analysis',
      { 
        capsuleGoal,
        preferences,
        includeOptimizations: true
      }
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // Extract comprehensive results
    const gaps = result.execution?.steps
      ?.find(step => step.toolName === 'detectGaps' && step.status === 'completed')
      ?.result?.gaps || []

    const optimizations = result.execution?.steps
      ?.find(step => step.toolName === 'suggestOptimizations' && step.status === 'completed')
      ?.result?.suggestions || []

    return NextResponse.json({
      success: true,
      gaps,
      optimizations,
      plan: result.plan,
      execution: {
        status: result.execution.status,
        steps: result.execution.steps.map(step => ({
          toolName: step.toolName,
          status: step.status,
          executionTime: step.result?.metadata?.executionTime
        }))
      },
      critique: result.critique,
      metadata: result.metadata,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Gaps POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function prioritizeGaps(gaps: any[], wearFrequency: any[], mostUsedColors: any[]): any[] {
  return gaps.map(gap => {
    let priority = gap.priority
    let reasoning = gap.reasoning

    // Boost priority for categories that are frequently worn
    const categoryWearCount = wearFrequency
      .filter(wf => wf.itemId.includes(gap.category))
      .reduce((sum, wf) => sum + wf.count, 0)

    if (categoryWearCount > 5 && priority === 'medium') {
      priority = 'high'
      reasoning += ' (High usage category)'
    }

    // Boost priority for colors that are commonly used
    const isCommonColor = mostUsedColors.some(muc => 
      gap.suggestedSpecs.colors.includes(muc.color)
    )

    if (isCommonColor && priority === 'low') {
      priority = 'medium'
      reasoning += ' (Matches your color preferences)'
    }

    return {
      ...gap,
      priority,
      reasoning,
      confidence: this.calculateGapConfidence(gap, wearFrequency, mostUsedColors)
    }
  }).sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
  })
}

function calculateGapConfidence(gap: any, wearFrequency: any[], mostUsedColors: any[]): number {
  let confidence = 0.5 // Base confidence

  // Increase confidence if category is frequently used
  const categoryUsage = wearFrequency.filter(wf => wf.itemId.includes(gap.category)).length
  if (categoryUsage > 0) confidence += 0.2

  // Increase confidence if suggested colors match user preferences
  const colorMatch = mostUsedColors.some(muc => 
    gap.suggestedSpecs.colors.includes(muc.color)
  )
  if (colorMatch) confidence += 0.2

  // Increase confidence for high priority gaps
  if (gap.priority === 'high') confidence += 0.1

  return Math.min(1, confidence)
}
