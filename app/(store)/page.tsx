import Hero from '@/components/home/hero'

export default function StoreHomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      
      {/* Additional homepage content can go here */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop Fresh, Shop Smart</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover premium quality groceries at affordable prices. From fresh produce to pantry essentials, 
            we have everything your home needs.
          </p>
        </div>
      </div>
    </div>
  )
}
