export default function FeaturedProducts() {
  const products = [
    { name: 'Organic Apples', price: 4.99, unit: 'per lb' },
    { name: 'Fresh Milk', price: 3.49, unit: '1 gallon' },
    { name: 'Whole Wheat Bread', price: 2.99, unit: 'per loaf' },
    { name: 'Free-Range Eggs', price: 5.99, unit: '1 dozen' },
  ]

  return (
    <section className="py-8 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Featured Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {products.map((product) => (
            <div key={product.name} className="bg-white rounded-lg shadow hover:shadow-lg transition p-3 md:p-4">
              <div className="h-24 md:h-32 bg-gray-200 rounded mb-3 md:mb-4"></div>
              <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2">{product.name}</h3>
              <p className="text-base md:text-lg font-bold text-blue-600">MK {product.price}</p>
              <p className="text-xs md:text-sm text-gray-500">{product.unit}</p>
              <button className="mt-3 md:mt-4 w-full bg-blue-600 text-white py-2 md:py-2 rounded text-xs md:text-sm hover:bg-blue-700 transition">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
