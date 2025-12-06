# Admin Dashboard Setup Guide

## Phase 5 Complete: Admin & Creator Tools ✅

### Features Implemented

1. **Admin Role System**
   - Added `isAdmin` boolean field to User model
   - Admin protection middleware for API routes
   - Admin-only navigation link in navbar

2. **Track Upload System**
   - Complete file upload functionality (audio + cover art)
   - Support for metadata: title, artist, album, genres, duration, explicit flag
   - Files stored in `public/uploads/audio` and `public/uploads/covers`

3. **Admin Dashboard**
   - **Overview Statistics**:
     - Total users (with weekly signups)
     - Total streams (with active users)
     - Total tracks (with monthly uploads)
     - Total artists
   
   - **Top Tracks Table**:
     - Rank by play count
     - Shows cover art, title, artist
     - Displays plays and likes
   
   - **Top Artists Grid**:
     - Artist profiles with images
     - Total plays and followers
     - Track count

4. **Upload Interface**
   - Track title input
   - Artist selection dropdown
   - Genre checkboxes (multi-select)
   - Duration input (seconds)
   - Explicit content toggle
   - Audio file upload
   - Cover art upload (optional)
   - Success/error messaging

### How to Make Yourself Admin

#### Option 1: MySQL Command Line
```bash
mysql -u root -p soundscape
```
Then run:
```sql
UPDATE users SET isAdmin = 1 WHERE email = 'your@email.com';
```

#### Option 2: Using the SQL File
```bash
# Edit make-admin.sql and replace 'your@email.com' with your email
# Then run:
mysql -u root -p soundscape < make-admin.sql
```

#### Option 3: Prisma Studio
```bash
npx prisma studio
```
- Navigate to the `users` table
- Find your user record
- Set `isAdmin` to `true`
- Save changes

### Accessing the Admin Dashboard

1. Make yourself an admin (see above)
2. Log out and log back in (to refresh your session)
3. You'll see an "Admin" link in the navbar (with shield icon)
4. Click it to access `/admin`

### Admin Dashboard Features

#### Dashboard Tab
- View platform statistics
- See top-performing tracks and artists
- Monitor user growth and engagement

#### Upload Track Tab
- Upload new music to the platform
- Fill in all track metadata
- Select audio file (MP3, WAV, etc.)
- Optionally add cover artwork
- Tracks are immediately available platform-wide

### API Endpoints

#### Admin Stats
```
GET /api/admin/stats
Authorization: Bearer <admin-token>
```

Returns:
- Overview metrics
- Top 10 tracks by plays
- Top 10 artists by total plays
- Signup trends by day

#### Track Upload
```
POST /api/admin/tracks
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

FormData fields:
- `title` (required)
- `artistId` (required)
- `albumId` (optional)
- `genreIds` (comma-separated)
- `duration` (seconds, required)
- `explicit` (boolean)
- `audioFile` (required)
- `coverFile` (optional)

#### Track Management
```
PATCH /api/admin/tracks/[id]
Authorization: Bearer <admin-token>
```

Update track metadata

```
DELETE /api/admin/tracks/[id]
Authorization: Bearer <admin-token>
```

Delete a track

### File Storage

Uploaded files are stored in:
- Audio: `public/uploads/audio/`
- Covers: `public/uploads/covers/`

Files are named with timestamp prefix to avoid conflicts:
- `1234567890-track-name.mp3`
- `1234567890-cover-image.jpg`

### Security

- All admin endpoints verify the user's `isAdmin` status
- Non-admin users receive 403 Forbidden responses
- JWT tokens are required for all admin operations
- File uploads are validated (audio/* and image/* mime types)

### Testing

1. **Make yourself admin**
   ```sql
   UPDATE users SET isAdmin = 1 WHERE email = 'your@email.com';
   ```

2. **Log out and log back in**

3. **Visit `/admin`**

4. **Try uploading a track**:
   - Select an artist from dropdown
   - Choose genres
   - Upload an audio file
   - Optionally upload cover art
   - Submit

5. **Check dashboard metrics**:
   - View total counts
   - See top tracks
   - Review top artists

### Next Steps

You can now:
- Upload your own music as an artist
- Monitor platform performance
- Track user engagement
- See trending content
- Manage your music library

### Troubleshooting

**Issue**: Admin link not showing in navbar
- **Solution**: Log out and log back in after making yourself admin

**Issue**: 403 Forbidden on admin pages
- **Solution**: Verify your user's `isAdmin` field is set to `1` (true)

**Issue**: File upload fails
- **Solution**: Check that `public/uploads` directory exists and is writable

**Issue**: Track doesn't appear after upload
- **Solution**: Refresh the page or check browser console for errors

### Future Enhancements

Potential additions for Phase 5.5:
- Bulk track upload
- Edit track metadata in dashboard
- Delete tracks interface
- User management (ban/promote)
- Content moderation tools
- Analytics charts and graphs
- Export data reports
