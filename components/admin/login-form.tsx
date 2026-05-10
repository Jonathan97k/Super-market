'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isForgotPassword, setIsForgotPassword] = useState(false)

  const { login, resetPassword, loading, error, clearError } = useAuth()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Clear global error
    if (error) {
      clearError()
    }
    
    // Clear success message
    if (successMessage) {
      setSuccessMessage('')
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        // Success is handled by the auth hook (redirects to dashboard)
        setSuccessMessage('Login successful! Redirecting...')
      } else {
        // Error is handled by the auth hook
        if (result.error?.message) {
          setErrors({ submit: result.error.message })
        }
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email) {
      setErrors({ email: 'Email is required for password reset' })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' })
      return
    }

    setIsSubmitting(true)
    
    try {
      const result = await resetPassword(formData.email)
      
      if (result.success) {
        setSuccessMessage('Password reset link sent to your email!')
        setIsForgotPassword(false)
      } else {
        setErrors({ submit: result.error?.message || 'Failed to send reset link' })
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Form Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <Lock className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {isForgotPassword ? 'Reset Password' : 'Welcome Back'}
        </h2>
        <p className="text-gray-300 text-sm">
          {isForgotPassword 
            ? 'Enter your email to receive a password reset link'
            : 'Sign in to access your admin dashboard'
          }
        </p>
      </div>

      {/* Form */}
      <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-10 pr-3 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all ${
                errors.email ? 'border-red-500' : 'border-white/20'
              }`}
              placeholder="admin@example.com"
              disabled={isSubmitting || loading}
              aria-label="Email address"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-400 flex items-center"
              id="email-error"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.email}
            </motion.p>
          )}
        </div>

        {/* Password Field (only for login) */}
        {!isForgotPassword && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-10 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all ${
                  errors.password ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="••••••••"
                disabled={isSubmitting || loading}
                aria-label="Password"
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isSubmitting || loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-300 transition-colors" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400 hover:text-gray-300 transition-colors" />
                )}
              </button>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-400 flex items-center"
                id="password-error"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.password}
              </motion.p>
            )}
          </div>
        )}

        {/* Global Error */}
        {(errors.submit || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm flex items-center"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {errors.submit || error?.message}
          </motion.div>
        )}

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-300 text-sm flex items-center"
            role="status"
          >
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {successMessage}
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || loading}
          whileHover={{ scale: isSubmitting || loading ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting || loading ? 1 : 0.98 }}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
        >
          <AnimatePresence mode="wait">
            {(isSubmitting || loading) ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center"
              >
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isForgotPassword ? 'Sending...' : 'Signing in...'}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center"
              >
                {isForgotPassword ? 'Send Reset Link' : 'Sign In'}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Forgot Password Link */}
        {!isForgotPassword && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(true)
                setErrors({})
                setSuccessMessage('')
              }}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              disabled={isSubmitting || loading}
            >
              Forgot your password?
            </button>
          </div>
        )}

        {/* Back to Login Link */}
        {isForgotPassword && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false)
                setErrors({})
                setSuccessMessage('')
              }}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              disabled={isSubmitting || loading}
            >
              Back to sign in
            </button>
          </div>
        )}
      </form>

      {/* Security Notice */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
          <Lock className="w-3 h-3" />
          <span>Secure authentication powered by Supabase</span>
        </div>
      </div>
    </div>
  )
}
