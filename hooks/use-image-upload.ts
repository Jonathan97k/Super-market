'use client'

import { useState, useCallback, useRef } from 'react'
import { storageService, UploadProgress, ImageVariants, generatePreviewUrl, revokePreviewUrl } from '@/lib/storage'

interface UseImageUploadOptions {
  productId?: string
  maxFiles?: number
  onUploadComplete?: (results: ImageVariants[]) => void
  onError?: (error: string) => void
}

interface UploadedImage {
  id: string
  file: File
  previewUrl: string
  variants?: ImageVariants
  isPrimary: boolean
}

export function useImageUpload({
  productId = '',
  maxFiles = 10,
  onUploadComplete,
  onError
}: UseImageUploadOptions = {}) {
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add files to upload queue
  const addFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      const validation = storageService.validateFile(file)
      if (!validation.valid) {
        onError?.(validation.error || 'Invalid file')
        return false
      }
      return true
    })

    // Check max files limit
    const totalFiles = uploadedImages.length + uploads.length + validFiles.length
    if (totalFiles > maxFiles) {
      onError?.(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Create upload progress objects
    const newUploads: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'idle',
      previewUrl: generatePreviewUrl(file)
    }))

    setUploads(prev => [...prev, ...newUploads])
  }, [uploadedImages.length, uploads.length, maxFiles, onError])

  // Start upload process
  const startUpload = useCallback(async () => {
    const pendingUploads = uploads.filter(u => u.status === 'idle')
    
    for (const upload of pendingUploads) {
      try {
        // Update status to compressing
        setUploads(prev => prev.map(u => 
          u.file === upload.file 
            ? { ...u, status: 'compressing', progress: 0 }
            : u
        ))

        // Simulate image processing
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Update status to uploading
        setUploads(prev => prev.map(u => 
          u.file === upload.file 
            ? { ...u, status: 'uploading', progress: 0 }
            : u
        ))

        // Process and upload image
        const variants = await storageService.processImage(upload.file, productId)

        // Update status to success
        setUploads(prev => prev.map(u => 
          u.file === upload.file 
            ? { ...u, status: 'success', progress: 100, result: variants }
            : u
        ))

        // Add to uploaded images
        const newImage: UploadedImage = {
          id: variants.original.path,
          file: upload.file,
          previewUrl: variants.thumbnail.url,
          variants,
          isPrimary: uploadedImages.length === 0 // First image is primary
        }

        setUploadedImages(prev => [...prev, newImage])

      } catch (error) {
        // Update status to failed
        setUploads(prev => prev.map(u => 
          u.file === upload.file 
            ? { ...u, status: 'failed', error: error instanceof Error ? error.message : 'Upload failed' }
            : u
        ))
        onError?.(error instanceof Error ? error.message : 'Upload failed')
      }
    }

    // Clean up successful uploads
    setUploads(prev => prev.filter(u => u.status !== 'success'))
    
    // Notify completion
    const successfulUploads = uploadedImages.filter(img => img.variants)
    if (successfulUploads.length > 0) {
      onUploadComplete?.(successfulUploads.map(img => img.variants!))
    }
  }, [uploads, uploadedImages, productId, onUploadComplete, onError])

  // Remove upload
  const removeUpload = useCallback((file: File) => {
    setUploads(prev => prev.filter(u => u.file !== file))
  }, [])

  // Retry failed upload
  const retryUpload = useCallback((file: File) => {
    setUploads(prev => prev.map(u => 
      u.file === file 
        ? { ...u, status: 'idle', progress: 0, error: undefined }
        : u
    ))
  }, [])

  // Remove uploaded image
  const removeImage = useCallback(async (imageId: string) => {
    const image = uploadedImages.find(img => img.id === imageId)
    
    if (image?.variants) {
      try {
        // Delete from storage
        await Promise.all([
          storageService.deleteFile(image.variants.original.path),
          storageService.deleteFile(image.variants.optimized.path),
          storageService.deleteFile(image.variants.thumbnail.path)
        ])
      } catch (error) {
        console.error('Failed to delete image:', error)
      }
    }

    // Revoke preview URL
    if (image) {
      revokePreviewUrl(image.previewUrl)
    }

    // Remove from state
    setUploadedImages(prev => prev.filter(img => img.id !== imageId))
  }, [uploadedImages])

  // Set primary image
  const setPrimaryImage = useCallback((imageId: string) => {
    setUploadedImages(prev => prev.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    })))
  }, [])

  // Replace existing image
  const replaceImage = useCallback((imageId: string, newFile: File) => {
    const validation = storageService.validateFile(newFile)
    if (!validation.valid) {
      onError?.(validation.error || 'Invalid file')
      return
    }

    // Remove old image
    removeImage(imageId)

    // Add new file to uploads
    addFiles([newFile])
  }, [removeImage, addFiles, onError])

  // Clear all images
  const clearAll = useCallback(async () => {
    // Delete all from storage
    await Promise.all(
      uploadedImages.map(img => removeImage(img.id))
    )

    // Clear uploads
    setUploads([])
  }, [uploadedImages, removeImage])

  // Get all image URLs
  const getImageUrls = useCallback(() => {
    return uploadedImages.map(img => ({
      id: img.id,
      url: img.variants?.optimized.url || img.previewUrl,
      thumbnail: img.variants?.thumbnail.url || img.previewUrl,
      isPrimary: img.isPrimary
    }))
  }, [uploadedImages])

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    addFiles(files)
  }, [addFiles])

  // Handle file input
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    addFiles(files)

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [addFiles])

  // Trigger file input
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Get upload statistics
  const getStats = useCallback(() => {
    const completed = uploadedImages.length
    const uploading = uploads.filter(u => u.status === 'uploading' || u.status === 'compressing').length
    const failed = uploads.filter(u => u.status === 'failed').length
    const pending = uploads.filter(u => u.status === 'idle').length

    return {
      total: completed + uploading + failed + pending,
      completed,
      uploading,
      failed,
      pending,
      progress: uploads.length > 0 
        ? uploads.reduce((acc, u) => acc + u.progress, 0) / uploads.length 
        : 0
    }
  }, [uploadedImages, uploads])

  // Cleanup preview URLs on unmount
  useState(() => {
    return () => {
      uploadedImages.forEach(img => revokePreviewUrl(img.previewUrl))
      uploads.forEach(u => {
        if ('previewUrl' in u) {
          revokePreviewUrl((u as any).previewUrl)
        }
      })
    }
  })

  return {
    // State
    uploads,
    uploadedImages,
    isDragging,
    
    // Actions
    addFiles,
    startUpload,
    removeUpload,
    retryUpload,
    removeImage,
    setPrimaryImage,
    replaceImage,
    clearAll,
    triggerFileInput,
    
    // Event handlers
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    
    // Utilities
    getImageUrls,
    getStats,
    
    // Refs
    fileInputRef
  }
}
