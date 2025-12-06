# 🎵 Soundscape - Modern Music Streaming Platform

A full-featured music streaming web application built with Next.js, featuring real-time playback, personalized recommendations, and artist management.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1)

## ✨ Features

### For Listeners
- 🎧 **High-Quality Streaming** - Stream music with persistent playback across pages
- 🔍 **Smart Search** - Find tracks, artists, and albums instantly
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile
- 🎨 **Theming** - Dark/light modes with 5 accent color options
- ❤️ **Playlists** - Create, manage, and collaborate on playlists
- 🎯 **Personalized Recommendations** - AI-powered music discovery
- 📊 **Listening History** - Track your music journey
- 👥 **Social Features** - Follow artists and other users

### For Artists
- 🎤 **Artist Portal** - Dedicated dashboard for managing content
- 📤 **Track Upload** - Upload and manage your music library
- 💿 **Album Management** - Organize tracks into albums
- 📈 **Analytics** - View plays, likes, and follower statistics
- 🌐 **Social Links** - Connect Instagram, TikTok, SoundCloud, and more

### For Admins
- 👑 **Admin Dashboard** - Comprehensive platform management
- 📊 **Analytics** - Real-time platform statistics
- 👥 **User Management** - Manage users and permissions

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

**Ready to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions for Vercel + PlanetScale.

**Quick deploy checklist:**
- ✅ Push code to GitHub
- ✅ Connect to Vercel
- ✅ Set up PlanetScale database
- ✅ Configure environment variables
- ✅ Choose cloud storage (AWS S3 or Cloudinary)

## 📁 Project Structure

```
src/
├── app/                   # Next.js pages & API routes
├── components/            # Reusable React components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities & configurations
└── styles/                # Global styles
```

## 🔒 Security & Legal

- ✅ JWT authentication with bcrypt password hashing
- ✅ Protected API routes
- ✅ **Terms of Service**: [/terms](./src/app/terms/page.tsx)
- ✅ **Privacy Policy**: [/privacy](./src/app/privacy/page.tsx)

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL (PlanetScale for production)
- **Storage**: AWS S3 / Cloudinary
- **Styling**: Tailwind CSS

## 📝 Environment Variables

Required variables (see `.env.example`):
```env
DATABASE_URL=              # MySQL connection string
JWT_SECRET=                # JWT signing secret
NEXT_PUBLIC_STORAGE_PROVIDER=  # 'local', 's3', or 'cloudinary'
```

## 🐛 Troubleshooting

**Build errors?**
- Run `npm run build` to check TypeScript errors
- Clear `.next` folder and rebuild

**Database issues?**
- Check `DATABASE_URL` format
- Run `npx prisma studio` to inspect database

## 📧 Support

- **Documentation**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/soundscape/issues)

---

**Built with ❤️ using Next.js**

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
