import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding genres...')

  // Create genres
  const genres = [
    { name: 'Pop', slug: 'pop' },
    { name: 'Rock', slug: 'rock' },
    { name: 'Hip Hop', slug: 'hip-hop' },
    { name: 'R&B', slug: 'r-n-b' },
    { name: 'Electronic', slug: 'electronic' },
    { name: 'Jazz', slug: 'jazz' },
    { name: 'Classical', slug: 'classical' },
    { name: 'Country', slug: 'country' },
    { name: 'Indie', slug: 'indie' },
    { name: 'Alternative', slug: 'alternative' },
  ]

  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: genre,
    })
  }

  console.log('✅ Genres created')

  // Get all albums and update with descriptions
  const albums = await prisma.album.findMany({
    include: {
      artist: true,
      tracks: true,
    },
  })

  console.log(`📀 Updating ${albums.length} albums with descriptions...`)

  for (const album of albums) {
    await prisma.album.update({
      where: { id: album.id },
      data: {
        description: `A collection of amazing tracks by ${album.artist.name}. This album features ${album.tracks.length} tracks that showcase the artist's unique style and musical prowess.`,
      },
    })
  }

  console.log('✅ Albums updated with descriptions')

  // Assign genres to existing tracks
  const tracks = await prisma.track.findMany()
  const allGenres = await prisma.genre.findMany()

  console.log(`🎵 Assigning genres to ${tracks.length} tracks...`)

  for (const track of tracks) {
    // Randomly assign 1-3 genres to each track
    const numGenres = Math.floor(Math.random() * 3) + 1
    const shuffled = [...allGenres].sort(() => 0.5 - Math.random())
    const selectedGenres = shuffled.slice(0, numGenres)

    for (const genre of selectedGenres) {
      // Check if relation already exists
      const existing = await prisma.trackGenre.findUnique({
        where: {
          trackId_genreId: {
            trackId: track.id,
            genreId: genre.id,
          },
        },
      })

      if (!existing) {
        await prisma.trackGenre.create({
          data: {
            trackId: track.id,
            genreId: genre.id,
          },
        })
      }
    }
  }

  console.log('✅ Genres assigned to tracks')
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
