import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create a demo artist
  const artist = await prisma.artist.upsert({
    where: { id: 'demo-artist-1' },
    update: {},
    create: {
      id: 'demo-artist-1',
      name: 'Demo Artist',
      bio: 'A sample artist for testing',
      image: null,
    },
  })

  console.log('✅ Created artist:', artist.name)

  // Create a demo track with a free sample audio URL
  const track = await prisma.track.upsert({
    where: { id: 'demo-track-1' },
    update: {},
    create: {
      id: 'demo-track-1',
      title: 'Sample Track',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      coverUrl: 'https://picsum.photos/seed/music1/400/400',
      duration: 360,
      releaseYear: 2024,
      plays: 1234,
      artistId: artist.id,
    },
  })

  console.log('✅ Created track:', track.title)

  // Create another track
  const track2 = await prisma.track.upsert({
    where: { id: 'demo-track-2' },
    update: {},
    create: {
      id: 'demo-track-2',
      title: 'Electronic Dreams',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      coverUrl: 'https://picsum.photos/seed/music2/400/400',
      duration: 420,
      releaseYear: 2023,
      plays: 5678,
      artistId: artist.id,
    },
  })

  console.log('✅ Created track:', track2.title)

  // Create a third track
  const track3 = await prisma.track.upsert({
    where: { id: 'demo-track-3' },
    update: {},
    create: {
      id: 'demo-track-3',
      title: 'Ambient Waves',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      coverUrl: 'https://picsum.photos/seed/music3/400/400',
      duration: 300,
      releaseYear: 2024,
      plays: 9876,
      artistId: artist.id,
    },
  })

  console.log('✅ Created track:', track3.title)

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
