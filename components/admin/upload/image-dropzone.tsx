'use client'

import { motion } from 'framer-motion'
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react'

interface ImageDropzoneProps {
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  triggerFileInput: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  disabled?: boolean
  maxFiles?: number
  currentFiles?: number
}

export default function ImageDropzone({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInput,
  triggerFileInput,
  fileInputRef,
  disabled = false,
  maxFiles = 10,
  currentFiles = 0
}: ImageDropzoneProps) {
  const isMaxFilesReached = currentFiles >= maxFiles

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        relative w-full rounded-2xl border-2 border-dashed transition-all duration-200
        ${isDragging
          ? 'border-green-500 bg-green-50 shadow-lg shadow-green-500/20'
          : isMaxFilesReached
          ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
          : disabled
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
          : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
        }
      `}
      onDragOver={disabled ? undefined : onDragOver}
      onDragLeave={disabled ? undefined : onDragLeave}
      onDrop={disabled ? undefined : onDrop}
      onClick={disabled || isMaxFilesReached ? undefined : triggerFileInput}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={onFileInput}
        className="hidden"
        disabled={disabled || isMaxFilesReached}
      />

      {/* Content */}
      <div className="p-8 text-center">
        {/* Icon */}
        <motion.div
          animate={{
            scale: isDragging ? 1.1 : 1,
            rotate: isDragging ? 5 : 0
          }}
          transition={{ duration: 0.2 }}
          className={`
            w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
            ${isDragging
              ? 'bg-green-500 text-white'
              : isMaxFilesReached
              ? 'bg-gray-300 text-gray-500'
              : disabled
              ? 'bg-gray-200 text-gray-400'
              : 'bg-blue-100 text-blue-600'
            }
          `}
        >
          {isMaxFilesReached ? (
            <AlertCircle className="w-8 h-8" />
          ) : (
            <Upload className="w-8 h-8" />
          )}
        </motion.div>

        {/* Text */}
        <div className="mb-4">
          <h3 className={`text-lg font-semibold mb-2 ${
            isMaxFilesReached
              ? 'text-gray-500'
              : disabled
              ? 'text-gray-400'
              : 'text-gray-900'
          }`}>
            {isMaxFilesReached
              ? 'Maximum files reached'
              : isDragging
              ? 'Drop images here'
              : 'Upload product images'
            }
          </h3>
          
          <p className={`text-sm ${
            isMaxFilesReached
              ? 'text-gray-400'
              : disabled
              ? 'text-gray-300'
              : 'text-gray-600'
          }`}>
            {isMaxFilesReached
              ? `You've reached the maximum of ${maxFiles} files`
              : isDragging
              ? 'Release to upload'
              : 'Drag and drop images here, or click to browse'
            }
          </p>
        </div>

        {/* File requirements */}
        {!isMaxFilesReached && !disabled && (
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center">
              <ImageIcon className="w-3 h-3 mr-1" />
              JPG, PNG, WebP
            </div>
            <div className="flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Max 5MB per file
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              {maxFiles} files max
            </div>
          </div>
        )}

        {/* Upload button */}
        {!isDragging && !disabled && !isMaxFilesReached && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              triggerFileInput()
            }}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Choose Images
          </motion.button>
        )}

        {/* File count indicator */}
        {currentFiles > 0 && !isMaxFilesReached && (
          <div className="mt-4 text-sm text-gray-600">
            {currentFiles} of {maxFiles} files uploaded
          </div>
        )}
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-green-500/10 rounded-2xl pointer-events-none"
        />
      )}
    </motion.div>
  )
}
