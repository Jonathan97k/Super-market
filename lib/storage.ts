import { createClient } from './supabase/client'

export interface UploadResult {
  url: string
  path: string
  size: number
  contentType: string
}

export interface ImageVariants {
  original: UploadResult
  optimized: UploadResult
  thumbnail: UploadResult
}

export interface UploadProgress {
  file: File
  progress: number
  status: 'idle' | 'uploading' | 'compressing' | 'success' | 'failed'
  error?: string
  result?: ImageVariants
}

const BUCKET_NAME = 'product-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

class StorageService {
  private supabase = createClient()

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPG, PNG, and WebP are supported.'
      }
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File size too large. Maximum size is 5MB.'
      }
    }

    return { valid: true }
  }

  /**
   * Generate unique filename
   */
  generateFileName(file: File): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2)
    const extension = file.name.split('.').pop()
    return `${timestamp}-${random}.${extension}`
  }

  /**
   * Get file paths for different variants
   */
  getFilePaths(productId: string, fileName: string) {
    return {
      original: `products/${productId}/original/${fileName}`,
      optimized: `products/${productId}/optimized/${fileName.replace(/\.[^/.]+$/, '.webp')}`,
      thumbnail: `products/${productId}/thumbnails/${fileName.replace(/\.[^/.]+$/, '.webp')}`
    }
  }

  /**
   * Upload file to Supabase Storage
   */
  async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    const { data, error } = await this.supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          if (onProgress) {
            onProgress((progress.loaded / progress.total) * 100)
          }
        }
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    const { data: publicUrl } = this.supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path)

    return {
      url: publicUrl.publicUrl,
      path: data.path,
      size: file.size,
      contentType: file.type
    }
  }

  /**
   * Delete file from Supabase Storage
   */
  async deleteFile(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(BUCKET_NAME)
      .remove([path])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  }

  /**
   * Delete all product images
   */
  async deleteProductImages(productId: string): Promise<void> {
    const { data: files } = await this.supabase.storage
      .from(BUCKET_NAME)
      .list(`products/${productId}`, {
        limit: 100
      })

    if (files && files.length > 0) {
      const paths = files.map(file => `products/${productId}/${file.name}`)
      const { error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .remove(paths)

      if (error) {
        throw new Error(`Delete failed: ${error.message}`)
      }
    }
  }

  /**
   * Process image with Sharp (server-side)
   * This would be implemented as a server action or API route
   */
  async processImage(file: File, productId: string): Promise<ImageVariants> {
    // In a real implementation, this would call a server action
    // that uses Sharp to process the image
    
    const fileName = this.generateFileName(file)
    const paths = this.getFilePaths(productId, fileName)

    try {
      // Upload original
      const original = await this.uploadFile(file, paths.original)

      // For demo purposes, we'll use the same file for all variants
      // In production, these would be processed by Sharp
      const optimized = await this.uploadFile(file, paths.optimized)
      const thumbnail = await this.uploadFile(file, paths.thumbnail)

      return {
        original,
        optimized,
        thumbnail
      }
    } catch (error) {
      // Clean up any uploaded files on error
      await this.cleanupUpload(paths)
      throw error
    }
  }

  /**
   * Clean up files on upload failure
   */
  private async cleanupUpload(paths: { original: string; optimized: string; thumbnail: string }) {
    try {
      await Promise.allSettled([
        this.deleteFile(paths.original),
        this.deleteFile(paths.optimized),
        this.deleteFile(paths.thumbnail)
      ])
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(path: string): string {
    const { data } = this.supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path)
    
    return data.publicUrl
  }

  /**
   * Check if bucket exists and create if needed
   */
  async ensureBucket(): Promise<void> {
    try {
      const { data: buckets } = await this.supabase.storage.listBuckets()
      const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME)

      if (!bucketExists) {
        const { error } = await this.supabase.storage.createBucket(BUCKET_NAME, {
          public: true,
          allowedMimeTypes: ALLOWED_TYPES,
          fileSizeLimit: MAX_FILE_SIZE
        })

        if (error) {
          throw new Error(`Failed to create bucket: ${error.message}`)
        }
      }
    } catch (error) {
      console.error('Bucket check failed:', error)
    }
  }
}

export const storageService = new StorageService()

/**
 * Client-side image processing simulation
 * In production, this would be done server-side with Sharp
 */
export function simulateImageProcessing(file: File): Promise<{
  optimized: Blob
  thumbnail: Blob
}> {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // In a real implementation, this would use Sharp or similar
      // For now, we'll just return the original file as blobs
      file.arrayBuffer().then(buffer => {
        resolve({
          optimized: new Blob([buffer], { type: 'image/webp' }),
          thumbnail: new Blob([buffer], { type: 'image/webp' })
        })
      })
    }, 1500) // Simulate 1.5 seconds of processing
  })
}

/**
 * Generate image preview URL
 */
export function generatePreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Revoke preview URL to prevent memory leaks
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url)
}
