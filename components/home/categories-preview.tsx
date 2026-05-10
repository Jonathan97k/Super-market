export default function CategoriesPreview() {
  const categories = [
    { name: 'Fresh Produce', count: 156, color: 'bg-green-100 text-green-800' },
    { name: 'Dairy & Eggs', count: 89, color: 'bg-blue-100 text-blue-800' },
    { name: 'Meat & Seafood', count: 124, color: 'bg-red-100 text-red-800' },
    { name: 'Bakery', count: 67, color: 'bg-yellow-100 text-yellow-800' },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.name} className="text-center cursor-pointer hover:shadow-lg transition p-6 rounded-lg">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full ${category.color} flex items-center justify-center`}>
                <span className="text-2xl font-bold">{category.count}</span>
              </div>
              <h3 className="font-semibold">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
