# Soundscape Deployment Guide

## Quick Deploy to Vercel + PlanetScale

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- PlanetScale account (free tier available)

## Step 1: Prepare Database (PlanetScale)

### 1.1 Create PlanetScale Database
1. Go to [planetscale.com](https://planetscale.com) and sign up/login
2. Click "New database"
3. Name it `soundscape-prod`
4. Select region closest to your users
5. Click "Create database"

### 1.2 Get Database Connection String
1. Click on your database
2. Go to "Connect"
3. Select "Prisma" from framework dropdown
4. Copy the `DATABASE_URL` connection string
5. Save it for later (format: `mysql://username:password@host/database?sslaccept=strict`)

### 1.3 Initialize Database Schema
```bash
# Set your PlanetScale connection string
DATABASE_URL="your-planetscale-connection-string"

# Push schema to PlanetScale
npx prisma db push

# Generate Prisma client
npx prisma generate
```

## Step 2: Prepare Cloud Storage (Choose One)

### Option A: AWS S3 (Recommended for Production)

1. **Create S3 Bucket**
   - Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
   - Click "Create bucket"
   - Name: `soundscape-media-prod`
   - Region: Choose closest to your users
   - Uncheck "Block all public access" (we'll use signed URLs)
   - Create bucket

2. **Configure CORS**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://your-domain.com"],
       "ExposeHeaders": []
     }
   ]
   ```

3. **Create IAM User**
   - Go to IAM Console
   - Create new user: `soundscape-uploader`
   - Attach policy: `AmazonS3FullAccess` (or custom policy)
   - Save Access Key ID and Secret Access Key

### Option B: Cloudinary (Easier Setup)

1. **Sign up at [cloudinary.com](https://cloudinary.com)**
2. Get credentials from Dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. No additional setup needed!

## Step 3: Deploy to Vercel

### 3.1 Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/soundscape.git
git push -u origin main
```

### 3.2 Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and login
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npx prisma generate && npm run build`
   - **Output Directory**: `.next`

### 3.3 Set Environment Variables

In Vercel project settings → Environment Variables, add:

#### Required Variables
```bash
# Database
DATABASE_URL=your-planetscale-connection-string

# Authentication (generate these with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NEXTAUTH_SECRET=your-nextauth-secret-key-min-32-chars
NEXTAUTH_URL=https://your-domain.vercel.app

# Storage Provider
NEXT_PUBLIC_STORAGE_PROVIDER=s3  # or 'cloudinary'
```

#### If using AWS S3
```bash
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=soundscape-media-prod
```

#### If using Cloudinary
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Optional
```bash
NEXT_PUBLIC_APP_NAME=Soundscape
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### 3.4 Deploy
Click "Deploy" and wait for build to complete (2-5 minutes)

## Step 4: Post-Deployment Setup

### 4.1 Create Admin Account
1. Register a new account at your deployed URL
2. Access your PlanetScale database console
3. Run SQL to make user admin:
   ```sql
   UPDATE users SET isAdmin = 1 WHERE email = 'your-email@example.com';
   ```

### 4.2 Test Core Features
- ✅ User registration and login
- ✅ Upload test track (as admin)
- ✅ Create playlist
- ✅ Play audio
- ✅ Search functionality

### 4.3 Configure Custom Domain (Optional)
1. In Vercel: Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable

## Step 5: Install Cloud Storage SDK (Production)

### For AWS S3
```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
```

Then implement S3 upload logic in `src/app/api/upload/s3/route.ts` (see comments in file)

### For Cloudinary
```bash
npm install cloudinary
```

Then implement Cloudinary upload logic in `src/app/api/upload/cloudinary/route.ts` (see comments in file)

## Monitoring & Maintenance

### Performance Monitoring
- Use Vercel Analytics (free tier included)
- Monitor database queries in PlanetScale dashboard
- Set up Sentry for error tracking (optional)

### Database Management
- PlanetScale automatically handles backups
- Use branches for schema changes
- Monitor connection limits on free tier

### Cost Optimization
**Free Tier Limits:**
- Vercel: 100GB bandwidth/month
- PlanetScale: 5GB storage, 1 billion rows read/month
- Cloudinary: 25GB storage, 25GB bandwidth/month
- AWS S3: 5GB storage, 20,000 GET requests/month (first year)

### Scaling Tips
1. **Enable caching**: Use Vercel Edge Network
2. **Optimize images**: Use Next.js Image component
3. **CDN for audio**: Consider CloudFront (AWS) or Cloudinary
4. **Database indexing**: Monitor slow queries in PlanetScale

## Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run build`
- Ensure all environment variables are set
- Verify Prisma schema is valid

### Database Connection Issues
- Verify DATABASE_URL format
- Check PlanetScale database is not sleeping (free tier)
- Ensure SSL mode is set correctly

### File Upload Issues
- Check cloud storage credentials
- Verify CORS configuration
- Ensure bucket/folder has proper permissions

## Security Checklist
- [ ] JWT_SECRET is strong and unique
- [ ] Database credentials are not exposed
- [ ] Cloud storage buckets are not publicly writable
- [ ] Rate limiting is enabled (Vercel Pro)
- [ ] HTTPS is enforced (automatic on Vercel)
- [ ] Content Security Policy headers configured

## Support
- Issues: [GitHub Issues](https://github.com/yourusername/soundscape/issues)
- Email: support@your-domain.com
- Documentation: [Your docs URL]

---

## Quick Commands Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npx prisma generate       # Generate Prisma client
npx prisma db push        # Push schema to database
npx prisma studio         # Open database GUI

# Deployment
vercel                    # Deploy to Vercel
vercel --prod             # Deploy to production
```

**Your app is now live! 🎉**

Access it at: `https://your-project.vercel.app`
