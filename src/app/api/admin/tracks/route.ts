import { NextRequest } from 'next/server'
import { verifyAdmin, createUnauthorizedResponse } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  // Verify admin access
  const adminCheck = await verifyAdmin(request)
  if (!adminCheck.isAdmin) {
    return createUnauthorizedResponse(adminCheck.error)
  }

  try {
    const formData = await request.formData()
    
    // Extract form fields
    const title = formData.get('title') as string
    const artistId = formData.get('artistId') as string
    const albumId = formData.get('albumId') as string | null
    const genreIds = formData.get('genreIds') as string // comma-separated IDs
    const duration = parseInt(formData.get('duration') as string)
    const explicit = formData.get('explicit') === 'true'
    const audioFile = formData.get('audioFile') as File | null
    const coverFile = formData.get('coverFile') as File | null

    if (!title || !artistId || !audioFile) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create upload directories if they don't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const audioDir = path.join(uploadsDir, 'audio')
    const coverDir = path.join(uploadsDir, 'covers')

    if (!existsSync(audioDir)) {
      await mkdir(audioDir, { recursive: true })
    }
    if (!existsSync(coverDir)) {
      await mkdir(coverDir, { recursive: true })
    }

    // Save audio file
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
    const audioFileName = `${Date.now()}-${audioFile.name.replace(/\s+/g, '-')}`
    const audioPath = path.join(audioDir, audioFileName)
    await writeFile(audioPath, audioBuffer)
    const audioUrl = `/uploads/audio/${audioFileName}`

    // Save cover file if provided
    let coverUrl: string | null = null
    if (coverFile) {
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer())
      const coverFileName = `${Date.now()}-${coverFile.name.replace(/\s+/g, '-')}`
      const coverPath = path.join(coverDir, coverFileName)
      await writeFile(coverPath, coverBuffer)
      coverUrl = `/uploads/covers/${coverFileName}`
    }

    // Create track in database
    const track = await prisma.track.create({
      data: {
        title,
        artistId,
        albumId: albumId || null,
        duration,
        audioUrl,
        coverUrl,
        genres: genreIds
          ? {
              create: genreIds.split(',').map((genreId) => ({
                genre: { connect: { id: genreId.trim() } }
              }))
            }
          : undefined
      },
      include: {
        artist: true,
        album: true,
        genres: {
          include: {
            genre: true
          }
        }
      }
    })

    return Response.json({ 
      success: true, 
      track,
      message: 'Track uploaded successfully'
    })
  } catch (error) {
    console.error('Track upload error:', error)
    return Response.json(
      { error: 'Failed to upload track', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Get all tracks for admin management
export async function GET(request: NextRequest) {
  const adminCheck = await verifyAdmin(request)
  if (!adminCheck.isAdmin) {
    return createUnauthorizedResponse(adminCheck.error)
  }

  try {
    const tracks = await prisma.track.findMany({
      include: {
        artist: true,
        album: true,
        genres: {
          include: {
            genre: true
          }
        },
        _count: {
          select: {
            playHistory: true,
            likedBy: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return Response.json({ tracks })
  } catch (error) {
    console.error('Failed to fetch tracks:', error)
    return Response.json({ error: 'Failed to fetch tracks' }, { status: 500 })
  }
}
