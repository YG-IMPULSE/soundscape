/**
 * Cloud Storage Configuration for Soundscape
 * 
 * This module handles file uploads to cloud storage services.
 * Supports AWS S3 and Cloudinary for production deployments.
 * Falls back to local storage for development.
 */

export interface UploadResult {
  url: string
  publicId?: string
  filename?: string
}

/**
 * Upload audio file to cloud storage
 * @param file - Audio file to upload
 * @param folder - Destination folder in storage
 * @returns Upload result with public URL
 */
export async function uploadAudio(file: File, folder: string = 'audio'): Promise<UploadResult> {
  const storageProvider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'local'

  switch (storageProvider) {
    case 's3':
      return uploadToS3(file, folder, 'audio')
    case 'cloudinary':
      return uploadToCloudinary(file, folder, 'audio')
    default:
      return uploadToLocal(file, folder)
  }
}

/**
 * Upload image file to cloud storage
 * @param file - Image file to upload
 * @param folder - Destination folder in storage
 * @returns Upload result with public URL
 */
export async function uploadImage(file: File, folder: string = 'images'): Promise<UploadResult> {
  const storageProvider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'local'

  switch (storageProvider) {
    case 's3':
      return uploadToS3(file, folder, 'image')
    case 'cloudinary':
      return uploadToCloudinary(file, folder, 'image')
    default:
      return uploadToLocal(file, folder)
  }
}

/**
 * Upload file to AWS S3
 */
async function uploadToS3(file: File, folder: string, type: 'audio' | 'image'): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)
  formData.append('type', type)

  const response = await fetch('/api/upload/s3', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to upload to S3')
  }

  return response.json()
}

/**
 * Upload file to Cloudinary
 */
async function uploadToCloudinary(file: File, folder: string, type: 'audio' | 'image'): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)
  formData.append('type', type)

  const response = await fetch('/api/upload/cloudinary', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to upload to Cloudinary')
  }

  return response.json()
}

/**
 * Upload file to local storage (development only)
 */
async function uploadToLocal(file: File, folder: string): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const response = await fetch('/api/upload/local', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to upload file')
  }

  return response.json()
}

/**
 * Delete file from cloud storage
 */
export async function deleteFile(url: string): Promise<void> {
  const storageProvider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'local'

  const response = await fetch('/api/upload/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ url, provider: storageProvider })
  })

  if (!response.ok) {
    throw new Error('Failed to delete file')
  }
}

/**
 * Generate signed URL for private files (S3 only)
 */
export async function getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const response = await fetch('/api/upload/signed-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ key, expiresIn })
  })

  if (!response.ok) {
    throw new Error('Failed to generate signed URL')
  }

  const data = await response.json()
  return data.url
}
