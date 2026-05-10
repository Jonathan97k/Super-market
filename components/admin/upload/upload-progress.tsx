'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  CheckCircle,
  XCircle,
  RefreshCw,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'

interface UploadProgress {
  file: File
  progress: number
  status: 'idle' | 'uploading' | 'compressing' | 'success' | 'failed'
  error?: string
  result?: any
  previewUrl?: string
}

interface UploadProgressProps {
  uploads: UploadProgress[]
  onRemove: (file: File) => void
  onRetry: (file: File) => void
}

export default function UploadProgress({
  uploads,
  onRemove,
  onRetry
}: UploadProgressProps) {
  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'idle':
        return <Upload className="w-4 h-4" />
      case 'compressing':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'success':
        return <CheckCircle className="w-4 h-4" />
      case 'failed':
        return <XCircle className="w-4 h-4" />
      default:
        return <Upload className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: UploadProgress['status']) => {
    switch (status) {
      case 'idle':
        return 'text-gray-400'
      case 'compressing':
        return 'text-orange-500'
      case 'uploading':
        return 'text-blue-500'
      case 'success':
        return 'text-green-500'
      case 'failed':
        return 'text-red-500'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusText = (status: UploadProgress['status']) => {
    switch (status) {
      case 'idle':
        return 'Waiting to upload'
      case 'compressing':
        return 'Compressing image...'
      case 'uploading':
        return 'Uploading...'
      case 'success':
        return 'Upload complete'
      case 'failed':
        return 'Upload failed'
      default:
        return 'Preparing...'
    }
  }

  if (uploads.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {uploads.map((upload, index) => (
          <motion.div
            key={`${upload.file.name}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`
              bg-white rounded-xl border p-4
              ${upload.status === 'failed' 
                ? 'border-red-200 bg-red-50' 
                : upload.status === 'success'
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200'
              }
            `}
          >
            <div className="flex items-start space-x-4">
              {/* Thumbnail */}
              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {upload.previewUrl ? (
                  <img
                    src={upload.previewUrl}
                    alt={upload.file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* File name */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 truncate">
                    {upload.file.name}
                  </h4>
                  <div className={`flex items-center ${getStatusColor(upload.status)}`}>
                    {getStatusIcon(upload.status)}
                  </div>
                </div>

                {/* Status text */}
                <p className={`text-sm mb-2 ${
                  upload.status === 'failed' 
                    ? 'text-red-600' 
                    : 'text-gray-600'
                }`}>
                  {getStatusText(upload.status)}
                </p>

                {/* Progress bar */}
                {upload.status === 'compressing' || upload.status === 'uploading' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {upload.status === 'compressing' ? 'Compressing' : 'Uploading'}
                      </span>
                      <span>{Math.round(upload.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${upload.progress}%` }}
                        transition={{ duration: 0.3 }}
                        className={`
                          h-full rounded-full transition-colors
                          ${upload.status === 'compressing' 
                            ? 'bg-orange-500' 
                            : 'bg-blue-500'
                          }
                        `}
                      />
                    </div>
                  </div>
                ) : upload.status === 'failed' && upload.error ? (
                  <div className="text-sm text-red-600 bg-red-100 rounded-lg p-2">
                    {upload.error}
                  </div>
                ) : null}

                {/* File info */}
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                  <span>{(upload.file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>{upload.file.type}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {upload.status === 'failed' && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRetry(upload.file)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Retry upload"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.button>
                )}
                
                {(upload.status === 'idle' || upload.status === 'failed') && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRemove(upload.file)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove"
                  >
                    <XCircle className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Overall progress */}
      {uploads.some(u => u.status === 'compressing' || u.status === 'uploading') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">Processing images...</h4>
            <div className="flex items-center text-blue-600">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {Math.round(
                uploads.reduce((acc, u) => acc + u.progress, 0) / uploads.length
              )}%
            </div>
          </div>
          
          <div className="text-sm text-blue-700 mb-3">
            {uploads.filter(u => u.status === 'compressing').length} compressing,{' '}
            {uploads.filter(u => u.status === 'uploading').length} uploading
          </div>

          <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${uploads.reduce((acc, u) => acc + u.progress, 0) / uploads.length}%` 
              }}
              transition={{ duration: 0.3 }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
        </motion.div>
      )}

      {/* Success summary */}
      {uploads.every(u => u.status === 'success') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4"
        >
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <h4 className="font-medium text-green-900">
                All images uploaded successfully
              </h4>
              <p className="text-sm text-green-700">
                {uploads.length} image{uploads.length !== 1 ? 's' : ''} processed and ready
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
