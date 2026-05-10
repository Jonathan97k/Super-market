export default function DashboardStats() {
  const stats = [
    { title: 'Total Sales', value: '$12,345', change: '+12%', color: 'text-green-600' },
    { title: 'Orders Today', value: '234', change: '+8%', color: 'text-blue-600' },
    { title: 'Active Products', value: '1,234', change: '+5%', color: 'text-purple-600' },
    { title: 'New Customers', value: '45', change: '+15%', color: 'text-orange-600' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
          <p className={`text-sm mt-2 ${stat.color}`}>{stat.change} from last period</p>
        </div>
      ))}
    </div>
  )
}
