import { NextRequest } from 'next/server'
import { verifyAdmin, createUnauthorizedResponse } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await verifyAdmin(request)
  if (!adminCheck.isAdmin) {
    return createUnauthorizedResponse(adminCheck.error)
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { title, artistId, albumId, duration, explicit, genreIds } = body

    // Update track
    const track = await prisma.track.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(artistId && { artistId }),
        ...(albumId !== undefined && { albumId }),
        ...(duration && { duration }),
        ...(explicit !== undefined && { explicit }),
        ...(genreIds && {
          genres: {
            deleteMany: {},
            create: genreIds.map((genreId: string) => ({
              genre: { connect: { id: genreId } }
            }))
          }
        })
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
      message: 'Track updated successfully'
    })
  } catch (error) {
    console.error('Track update error:', error)
    return Response.json(
      { error: 'Failed to update track' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await verifyAdmin(request)
  if (!adminCheck.isAdmin) {
    return createUnauthorizedResponse(adminCheck.error)
  }

  try {
    const { id } = await params

    // Delete track (will cascade to related records based on schema)
    await prisma.track.delete({
      where: { id }
    })

    return Response.json({ 
      success: true,
      message: 'Track deleted successfully'
    })
  } catch (error) {
    console.error('Track deletion error:', error)
    return Response.json(
      { error: 'Failed to delete track' },
      { status: 500 }
    )
  }
}
