'use client'

import { motion } from 'framer-motion'
import { Store, ShoppingCart, TrendingUp, Users, Shield, CheckCircle, ArrowRight } from 'lucide-react'
import LoginForm from '@/components/admin/login-form'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
      {/* Left Side - Brand Showcase (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
        <div className="absolute inset-0 bg-[url('/images/patterns/grid.svg')] opacity-10" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Store className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold">VELOX MART</h1>
            </div>
            <p className="text-xl text-blue-200">Supermarket Management Platform</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6 mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">
              Manage Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {' '}Supermarket
              </span>
            </h2>
            <p className="text-lg text-blue-200 max-w-md">
              Complete control over inventory, orders, promotions, and customer management in one powerful dashboard.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Features */}
            <div className="grid grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <ShoppingCart className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="font-semibold mb-1">Inventory</h3>
                <p className="text-sm text-blue-200">Real-time stock management</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <Users className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="font-semibold mb-1">Orders</h3>
                <p className="text-sm text-blue-200">Complete order tracking</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="font-semibold mb-1">Analytics</h3>
                <p className="text-sm text-blue-200">Business insights</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <Shield className="w-8 h-8 text-yellow-400 mb-3" />
                <h3 className="font-semibold mb-1">Security</h3>
                <p className="text-sm text-blue-200">Protected admin access</p>
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm">256-bit SSL encryption</span>
              </div>
              <div className="flex items-center space-x-4">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm">GDPR compliant</span>
              </div>
              <div className="flex items-center space-x-4">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm">24/7 monitoring</span>
              </div>
            </div>
          </motion.div>

          {/* Analytics Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">Live Analytics Preview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-200">Today's Orders</span>
                  <span className="text-lg font-bold text-green-400">+24.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-200">Revenue</span>
                  <span className="text-lg font-bold text-blue-400">MK 45,230</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-200">Active Users</span>
                  <span className="text-lg font-bold text-purple-400">1,234</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-20 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 blur-xl"
        />
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full opacity-20 blur-xl"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Store className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-white">VELOX MART</h1>
            </div>
            <p className="text-blue-200">Admin Dashboard</p>
          </div>

          {/* Glassmorphism Login Card */}
          <div className="relative">
            {/* Background Blur */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-2xl" />
            
            {/* Card Content */}
            <div className="relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
              <LoginForm />
            </div>

            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-50" />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Need help?{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                Contact Support
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Mobile Background Pattern */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
      <div className="lg:hidden absolute inset-0 bg-[url('/images/patterns/grid.svg')] opacity-10" />
    </div>
  )
}
