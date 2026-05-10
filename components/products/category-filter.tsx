export default function CategoryFilter() {
  const categories = [
    { name: 'Fresh Produce', count: 156 },
    { name: 'Dairy & Eggs', count: 89 },
    { name: 'Meat & Seafood', count: 124 },
    { name: 'Bakery', count: 67 },
    { name: 'Pantry', count: 234 },
    { name: 'Frozen Foods', count: 98 },
    { name: 'Beverages', count: 145 },
    { name: 'Snacks', count: 178 },
  ]

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-4">Categories</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <label key={category.name} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
            <div className="flex items-center">
              <input type="checkbox" className="mr-2 text-blue-600" />
              <span className="text-sm">{category.name}</span>
            </div>
            <span className="text-xs text-gray-500">({category.count})</span>
          </label>
        ))}
      </div>
    </div>
  )
}
