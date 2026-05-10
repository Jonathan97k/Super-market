'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Star,
  Upload,
  Trash2,
  Replace,
  MoreVertical,
  Eye,
  Download
} from 'lucide-react'

interface UploadedImage {
  id: string
  file: File
  previewUrl: string
  variants?: {
    original: { url: string; path: string }
    optimized: { url: string; path: string }
    thumbnail: { url: string; path: string }
  }
  isPrimary: boolean
}

interface ImagePreviewGridProps {
  images: UploadedImage[]
  onRemove: (imageId: string) => void
  onSetPrimary: (imageId: string) => void
  onReplace: (imageId: string) => void
  onRetry?: (file: File) => void
}

export default function ImagePreviewGrid({
  images,
  onRemove,
  onSetPrimary,
  onReplace,
  onRetry
}: ImagePreviewGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleImageClick = (imageId: string) => {
    setSelectedImage(selectedImage === imageId ? null : imageId)
  }

  if (images.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence>
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`
                relative group rounded-xl overflow-hidden border-2 transition-all
                ${image.isPrimary
                  ? 'border-green-500 ring-2 ring-green-200'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Image */}
              <div className="aspect-square bg-gray-100 relative">
                <img
                  src={image.previewUrl}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Primary badge */}
                {image.isPrimary && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center"
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Primary
                  </motion.div>
                )}

                {/* Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-opacity"
                >
                  <div className="flex space-x-2">
                    {/* View */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => window.open(image.previewUrl, '_blank')}
                      className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                      title="View full size"
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </motion.button>

                    {/* Set Primary */}
                    {!image.isPrimary && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onSetPrimary(image.id)}
                        className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                        title="Set as primary image"
                      >
                        <Star className="w-4 h-4 text-gray-700" />
                      </motion.button>
                    )}

                    {/* Replace */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onReplace(image.id)}
                      className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                      title="Replace image"
                    >
                      <Replace className="w-4 h-4 text-gray-700" />
                    </motion.button>

                    {/* Delete */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onRemove(image.id)}
                      className="p-2 bg-red-500/90 rounded-lg hover:bg-red-500 transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                </motion.div>
              </div>

              {/* File info */}
              <div className="p-2 bg-white">
                <p className="text-xs text-gray-600 truncate">
                  {image.file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {(image.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Selected Image Details */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-xl p-4"
          >
            {(() => {
              const image = images.find(img => img.id === selectedImage)
              if (!image) return null

              return (
                <div className="flex items-start space-x-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={image.previewUrl}
                      alt="Selected image"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {image.file.name}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Size:</span>{' '}
                        {(image.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>{' '}
                        {image.file.type}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{' '}
                        {image.isPrimary ? (
                          <span className="text-green-600 font-medium">Primary Image</span>
                        ) : (
                          <span className="text-gray-500">Secondary</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Modified:</span>{' '}
                        {new Date(image.file.lastModified).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 mt-3">
                      {!image.isPrimary && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onSetPrimary(image.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Set as Primary
                        </motion.button>
                      )}
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onReplace(image.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Replace className="w-3 h-3 mr-1" />
                        Replace
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onRemove(image.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </motion.button>
                    </div>
                  </div>

                  {/* Close */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedImage(null)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          {images.length} image{images.length !== 1 ? 's' : ''} uploaded
          {images.some(img => img.isPrimary) && (
            <span className="ml-2 text-green-600">
              • Primary image set
            </span>
          )}
        </div>
        
        {!images.some(img => img.isPrimary) && images.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSetPrimary(images[0].id)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Set first image as primary
          </motion.button>
        )}
      </div>
    </div>
  )
}
