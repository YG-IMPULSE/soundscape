import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface TokenPayload {
  userId: string
  email: string
}

// GET /api/artists/me - Get current user's artist profile
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'No authorization token' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload

    // Find artist profile linked to this user
    const artist = await prisma.artist.findFirst({
      where: { userId: decoded.userId },
      include: {
        _count: {
          select: {
            tracks: true,
            albums: true,
            followers: true
          }
        }
      }
    })

    if (!artist) {
      return Response.json({ error: 'Artist profile not found', hasProfile: false }, { status: 404 })
    }

    return Response.json({ artist, hasProfile: true })
  } catch (error) {
    console.error('Error fetching artist profile:', error)
    return Response.json({ error: 'Failed to fetch artist profile' }, { status: 500 })
  }
}

// PATCH /api/artists/me - Update artist profile
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'No authorization token' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload

    const body = await request.json()
    const { name, bio, image, instagramUrl, tiktokUrl, soundcloudUrl, twitterUrl, spotifyUrl, websiteUrl } = body

    // Find existing artist profile
    const existingArtist = await prisma.artist.findFirst({
      where: { userId: decoded.userId }
    })

    if (!existingArtist) {
      return Response.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    // Update artist profile
    const updatedArtist = await prisma.artist.update({
      where: { id: existingArtist.id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(image !== undefined && { image }),
        ...(instagramUrl !== undefined && { instagramUrl }),
        ...(tiktokUrl !== undefined && { tiktokUrl }),
        ...(soundcloudUrl !== undefined && { soundcloudUrl }),
        ...(twitterUrl !== undefined && { twitterUrl }),
        ...(spotifyUrl !== undefined && { spotifyUrl }),
        ...(websiteUrl !== undefined && { websiteUrl })
      },
      include: {
        _count: {
          select: {
            tracks: true,
            albums: true,
            followers: true
          }
        }
      }
    })

    return Response.json({ artist: updatedArtist, message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Error updating artist profile:', error)
    return Response.json({ error: 'Failed to update artist profile' }, { status: 500 })
  }
}

// POST /api/artists/me - Create artist profile
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'No authorization token' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload

    // Check if artist profile already exists
    const existingArtist = await prisma.artist.findFirst({
      where: { userId: decoded.userId }
    })

    if (existingArtist) {
      return Response.json({ error: 'Artist profile already exists' }, { status: 400 })
    }

    const body = await request.json()
    const { name } = body

    if (!name) {
      return Response.json({ error: 'Artist name is required' }, { status: 400 })
    }

    // Create new artist profile
    const artist = await prisma.artist.create({
      data: {
        name,
        userId: decoded.userId
      },
      include: {
        _count: {
          select: {
            tracks: true,
            albums: true,
            followers: true
          }
        }
      }
    })

    return Response.json({ artist, message: 'Artist profile created successfully' })
  } catch (error) {
    console.error('Error creating artist profile:', error)
    return Response.json({ error: 'Failed to create artist profile' }, { status: 500 })
  }
}
