export default function PromoBanner() {
  return (
    <section className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Limited Time Offer!</h2>
        <p className="text-xl mb-6">Get 20% off on all fresh produce this week</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Shop Sale
          </button>
          <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition">
            View Details
          </button>
        </div>
      </div>
    </section>
  )
}
