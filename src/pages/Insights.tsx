import { BarChart3, TrendingUp, Calendar, MapPin } from 'lucide-react'

export default function Insights() {
  const stats = {
    totalIssues: 156,
    resolvedIssues: 98,
    averageResolutionTime: 4.2,
    userRating: 4.1
  }

  const topCategories = [
    { name: 'Infrastructure', count: 45, percentage: 29 },
    { name: 'Public Safety', count: 32, percentage: 21 },
    { name: 'Transportation', count: 28, percentage: 18 },
    { name: 'Environment', count: 25, percentage: 16 },
    { name: 'Other', count: 26, percentage: 16 }
  ]

  const areaPerformance = [
    { area: 'Downtown District', rating: 4.5, issuesCount: 34 },
    { area: 'Riverside', rating: 4.2, issuesCount: 28 },
    { area: 'Oak Hills', rating: 3.9, issuesCount: 22 },
    { area: 'Sunset Valley', rating: 4.1, issuesCount: 19 }
  ]

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      {/* Stats Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Civic Insights
        </h1>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalIssues}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.resolvedIssues}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.averageResolutionTime}d</div>
            <div className="text-sm text-gray-600">Avg Resolution</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.userRating}★</div>
            <div className="text-sm text-gray-600">User Rating</div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Top Issue Categories
        </h2>
        
        <div className="space-y-3">
          {topCategories.map((category) => (
            <div key={category.name} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  <span className="text-sm text-gray-500">{category.count} issues</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Area Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Area Performance
        </h2>
        
        <div className="space-y-4">
          {areaPerformance.map((area) => (
            <div key={area.area} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{area.area}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium text-gray-700">{area.rating}</span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {area.issuesCount} issues reported
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trends */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Recent Trends
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm text-green-800">Resolution rate increased by 15%</span>
            <span className="text-xs text-green-600">This month</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-800">New issues down by 8%</span>
            <span className="text-xs text-blue-600">Last week</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <span className="text-sm text-yellow-800">Community engagement up 22%</span>
            <span className="text-xs text-yellow-600">This quarter</span>
          </div>
        </div>
      </div>
    </div>
  )
}
