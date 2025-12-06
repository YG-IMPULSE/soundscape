# Soundscape - Music Streaming Web App Instructions

## Project Overview
Soundscape is a modern music streaming web application built with React/Next.js. This is the core product - a serious web app that provides music streaming, user management, and playlist functionality.

## Tech Stack
- **Frontend**: Next.js 13+ (App Router) + TypeScript
- **Backend**: Next.js API routes
- **Database**: MySQL with Prisma ORM
- **Storage**: AWS S3 or local storage (audio files + cover art)
- **Authentication**: Custom JWT-based auth
- **Styling**: CSS Modules + Tailwind (likely)

## Architecture & Core Features

### Phase 1 Features (Current Focus)
1. **Authentication System**: Sign up, login, logout
2. **User Profiles**: Basic user management and preferences
3. **Music Library**: Browse tracks, albums, artists
4. **Track Pages**: Individual track view with artwork and playback
5. **Global Audio Player**: Persistent bottom player across pages
6. **Playlists**: Starting with "Liked Songs" functionality

### Project Structure
```
src/
├── app/                 # Next.js 13 App Router pages
│   ├── auth/           # Login/register pages
│   ├── tracks/         # Track browsing and details
│   ├── artists/        # Artist pages
│   ├── playlists/      # Playlist management
│   ├── me/             # User profile/account
│   └── api/            # API routes (auth, tracks, playlists)
├── components/
│   ├── layout/         # Navbar, Sidebar, Footer
│   ├── player/         # Global audio player components
│   ├── tracks/         # Track cards and lists
│   ├── artists/        # Artist components
│   ├── playlists/      # Playlist components
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
└── styles/             # Global and component styles
```

## Development Workflow

### Setup
```bash
npm install
# Set up environment variables in .env
# DATABASE_URL, JWT_SECRET, etc.
npx prisma generate
npx prisma db push      # or prisma migrate dev
npm run dev
```

### Key Commands
```bash
npm run dev              # Development server
npm run build            # Production build
npm run test             # Run tests
npx prisma studio        # Database GUI
npx prisma generate      # Regenerate Prisma client
npx prisma db push       # Push schema changes to DB
```

## Project Conventions

### File Organization
- Use kebab-case for component files: `audio-player.tsx`
- Group related components in feature folders
- Keep API routes in `/api/` directory
- Store types in `/types/` or co-locate with components

### Audio Player Patterns
- Global player state management (Context/Zustand)
- Persistent playback across page navigation
- Queue management for track sequences
- Audio caching and preloading strategies

### API Routes Structure
```javascript
// Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

// Tracks
GET    /api/tracks           # List tracks
GET    /api/tracks/[id]      # Get track details
PATCH  /api/tracks/[id]      # Update track
DELETE /api/tracks/[id]      # Delete track

// Artists
GET /api/artists
GET /api/artists/[id]

// Playlists
GET    /api/playlists        # User playlists
POST   /api/playlists        # Create playlist
GET    /api/playlists/[id]
PUT    /api/playlists/[id]
DELETE /api/playlists/[id]
POST   /api/playlists/[id]/tracks    # Add track to playlist
DELETE /api/playlists/[id]/tracks   # Remove track

// Analytics
POST /api/stats/plays        # Log track play
```

## Database Schema (Prisma)
```prisma
// Core models in prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  playlists Playlist[]
  // ... other fields
}

model Track {
  id       String @id @default(cuid())
  title    String
  artistId String
  artist   Artist @relation(fields: [artistId], references: [id])
  audioUrl String
  coverUrl String?
  // ... other fields
}

model Artist {
  id     String  @id @default(cuid())
  name   String
  tracks Track[]
  // ... other fields
}

model Playlist {
  id     String @id @default(cuid())
  name   String
  userId String
  user   User   @relation(fields: [userId], references: [id])
  tracks PlaylistTrack[]
  // ... other fields
}
```

## Key Files & Directories
- `src/app/layout.tsx` - Root layout with global player shell
- `src/components/player/PlayerBar.tsx` - Fixed bottom audio player
- `src/hooks/usePlayer.ts` - Global player state management
- `src/hooks/useAuth.ts` - Authentication state and helpers
- `src/lib/db.ts` - Prisma client configuration
- `src/lib/auth.ts` - JWT helpers and session management
- `src/lib/api-client.ts` - Client-side API wrapper
- `prisma/schema.prisma` - Database schema definitions
- `public/audio-demo/` - Demo audio files (development only)

## Critical Integration Points
- **Next.js App Router**: Server/Client component patterns
- **Prisma ORM**: Type-safe database queries and migrations
- **Global Player State**: Persistent across route changes
- **JWT Authentication**: Session management in API routes and client
- **Audio Streaming**: Efficient file serving and caching
- **TypeScript**: Strict typing for components, API routes, and database models

## Common Tasks & Patterns

### Next.js App Router Patterns
```typescript
// Server Components for data fetching
export default async function TracksPage() {
  const tracks = await fetchTracks()
  return <TrackList tracks={tracks} />
}

// Client Components for interactivity
'use client'
export default function PlayerControls() {
  const { currentTrack, play, pause } = usePlayer()
  // ...
}
```

### Authentication Implementation
```typescript
// API route example: src/app/api/auth/login/route.ts
export async function POST(request: Request) {
  const { email, password } = await request.json()
  // Validate credentials with Prisma
  // Return JWT token
}

// Client-side auth check
const { user, login, logout } = useAuth()
```

### Global Player State
```typescript
// usePlayer.ts hook pattern
export const usePlayer = () => {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const playTrack = (track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
    // Audio element logic
  }
  
  return { currentTrack, isPlaying, playTrack, pause }
}
```

### Prisma Usage Patterns
```typescript
// In API routes or Server Components
import { prisma } from '@/lib/db'

// Fetch tracks with artist relation
const tracks = await prisma.track.findMany({
  include: { artist: true },
  orderBy: { createdAt: 'desc' }
})

// Create playlist
const playlist = await prisma.playlist.create({
  data: {
    name: 'My Playlist',
    userId: user.id
  }
})
```

## Performance Considerations
- **Audio Preloading**: Buffer next tracks in queue
- **Image Optimization**: Lazy load album artwork
- **Route Transitions**: Maintain player state during navigation
- **Database Queries**: Efficient joins for track/album/artist data

## Debugging Guidelines
- Use browser dev tools for audio debugging
- Monitor network requests for streaming performance
- Check MySQL query logs and performance
- Test audio playback across different browsers/devices

---

*This file should be updated as new patterns emerge and the codebase grows. Focus on documenting actual implementation patterns rather than aspirational code.*