'use client'

import { motion } from 'framer-motion'
import {
  Upload,
  Trash2,
  Pause,
  Play,
  RefreshCw,
  Download,
  Grid3X3,
  List,
  Settings
} from 'lucide-react'

interface ImageToolbarProps {
  hasPendingUploads: boolean
  hasUploadedImages: boolean
  isUploading: boolean
  canStartUpload: boolean
  onStartUpload: () => void
  onPauseUpload: () => void
  onClearAll: () => void
  onRetryAll: () => void
  onDownloadAll: () => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  stats: {
    total: number
    completed: number
    uploading: number
    failed: number
    pending: number
    progress: number
  }
}

export default function ImageToolbar({
  hasPendingUploads,
  hasUploadedImages,
  isUploading,
  canStartUpload,
  onStartUpload,
  onPauseUpload,
  onClearAll,
  onRetryAll,
  onDownloadAll,
  viewMode,
  onViewModeChange,
  stats
}: ImageToolbarProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left side - Upload controls */}
        <div className="flex items-center space-x-3">
          {/* Start/Pause Upload */}
          {canStartUpload && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={isUploading ? onPauseUpload : onStartUpload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              {isUploading ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Start Upload
                </>
              )}
            </motion.button>
          )}

          {/* Retry Failed */}
          {stats.failed > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRetryAll}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry ({stats.failed})
            </motion.button>
          )}

          {/* Clear All */}
          {(hasPendingUploads || hasUploadedImages) && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </motion.button>
          )}
        </div>

        {/* Center - Progress indicator */}
        {stats.total > 0 && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600">
                {stats.completed}/{stats.total} uploaded
              </div>
              {stats.uploading > 0 && (
                <div className="text-sm text-blue-600 font-medium">
                  {stats.uploading} processing
                </div>
              )}
              {stats.failed > 0 && (
                <div className="text-sm text-red-600 font-medium">
                  {stats.failed} failed
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
              />
            </div>

            <div className="text-sm font-medium text-gray-700">
              {Math.round(stats.progress)}%
            </div>
          </div>
        )}

        {/* Right side - Actions */}
        <div className="flex items-center space-x-3">
          {/* Download All */}
          {stats.completed > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDownloadAll}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All
            </motion.button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewModeChange('grid')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewModeChange('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Upload settings"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Additional info */}
      {stats.total > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Processing: {stats.uploading}
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Completed: {stats.completed}
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              Pending: {stats.pending}
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Failed: {stats.failed}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
