import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface TokenPayload {
  userId: string
  email: string
}

export async function verifyAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return { isAdmin: false, error: 'No authorization token provided' }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload

    // Check if user exists and is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isAdmin: true }
    })

    if (!user) {
      return { isAdmin: false, error: 'User not found' }
    }

    if (!user.isAdmin) {
      return { isAdmin: false, error: 'Insufficient permissions' }
    }

    return { isAdmin: true, userId: user.id }
  } catch (error) {
    return { isAdmin: false, error: 'Invalid or expired token' }
  }
}

export function createUnauthorizedResponse(message: string = 'Unauthorized') {
  return Response.json({ error: message }, { status: 403 })
}
