import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded?.userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: decoded.userId }
    })

    // Return default settings if none exist
    return NextResponse.json(settings || {
      autoplayEnabled: true,
      explicitContentFilter: false,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded?.userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { autoplayEnabled, explicitContentFilter } = body

    const settings = await prisma.userSettings.upsert({
      where: { userId: decoded.userId },
      update: {
        ...(typeof autoplayEnabled === 'boolean' && { autoplayEnabled }),
        ...(typeof explicitContentFilter === 'boolean' && { explicitContentFilter }),
      },
      create: {
        userId: decoded.userId,
        autoplayEnabled: autoplayEnabled ?? true,
        explicitContentFilter: explicitContentFilter ?? false,
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
