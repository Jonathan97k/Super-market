'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, AlertCircle, CheckCircle, XCircle, RefreshCw, Copy, ExternalLink } from 'lucide-react'
import { getPocketBaseStatus, isPocketBaseConfigured } from '@/lib/pocketbase/client'

export default function SetupScreen() {
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading')
  const [configStatus, setConfigStatus] = useState<any>(null)
  const [copiedText, setCopiedText] = useState<string>('')

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = () => {
    try {
      const status = getPocketBaseStatus()
      setConfigStatus(status)
      
      if (status.isConfigured) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
      setConfigStatus({
        isConfigured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        hasUrl: false,
        hasAdminEmail: false,
        hasAdminPassword: false
      })
    }
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(''), 2000)
  }

  const handleRefresh = () => {
    setStatus('loading')
    setTimeout(() => {
      checkConfiguration()
    }, 1000)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Checking Configuration</h2>
          <p className="text-gray-600">Verifying your PocketBase setup...</p>
        </motion.div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full mx-4"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h1>
            <p className="text-gray-600 mb-6">
              Your supermarket is ready to launch. All systems are configured and working properly.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">Configuration Status</h3>
              <div className="text-left space-y-2 text-sm">
                <div className="flex items-center text-green-800">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  PocketBase URL: {configStatus?.urlPreview || 'Configured'}
                </div>
                <div className="flex items-center text-green-800">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Admin Email: Configured
                </div>
                <div className="flex items-center text-green-800">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Database Connection: Active
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/'}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Go to Store
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/admin/setup'}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Configure Store Settings
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full mx-4"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Database className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Setup Required</h1>
            <p className="text-gray-600">
              Please connect your PocketBase instance to continue with your supermarket setup.
            </p>
          </div>

          {configStatus?.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Configuration Error</h3>
                  <p className="text-red-800 text-sm">{configStatus.error}</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-6 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Required Environment Variables</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <XCircle className={`w-5 h-5 mr-3 ${configStatus?.hasUrl ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                      <code className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">NEXT_PUBLIC_POCKETBASE_URL</code>
                      <p className="text-xs text-gray-600 mt-1">Your PocketBase instance URL</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard('NEXT_PUBLIC_POCKETBASE_URL')}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <XCircle className={`w-5 h-5 mr-3 ${configStatus?.hasAdminEmail ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                      <code className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">POCKETBASE_ADMIN_EMAIL</code>
                      <p className="text-xs text-gray-600 mt-1">PocketBase admin email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard('POCKETBASE_ADMIN_EMAIL')}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <XCircle className={`w-5 h-5 mr-3 ${configStatus?.hasAdminPassword ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                      <code className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">POCKETBASE_ADMIN_PASSWORD</code>
                      <p className="text-xs text-gray-600 mt-1">PocketBase admin password</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard('POCKETBASE_ADMIN_PASSWORD')}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Setup Instructions</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Set Up PocketBase</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Download and run PocketBase, or deploy it to a server.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Get Your Credentials</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Note your PocketBase URL, admin email, and admin password.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Add Environment Variables</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Add the variables to your deployment platform (Vercel, Netlify, etc.).
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Configure Collections</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Set up the required collections in PocketBase admin panel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-6">
            <div className="flex items-center">
              <ExternalLink className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-blue-900">Need Help?</h4>
                <p className="text-sm text-blue-800">
                  Check our documentation for detailed setup instructions.
                </p>
              </div>
            </div>
            <a
              href="/docs/setup"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View Docs →
            </a>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Check Configuration
            </motion.button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                After adding environment variables, click "Check Configuration" to verify your setup.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
