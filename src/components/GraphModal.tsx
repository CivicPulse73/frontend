import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { evotesService } from '../services/evotes'
import { EVoteTrends } from '../types'

interface GraphModalProps {
  userId: string
  onClose: () => void
}

export default function GraphModal({ userId, onClose }: GraphModalProps) {
  const [evoteTrends, setEvoteTrends] = useState<EVoteTrends | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEvoteTrends = async () => {
      try {
        setIsLoading(true)
        setError(null)
        // Note: This assumes userId is actually a representative ID
        // You might need to get the rep ID from the user profile data
        const data = await evotesService.getRepresentativeEvoteTrends(userId, 7)
        setEvoteTrends(data)
      } catch (err) {
        console.error('Failed to load evote trends:', err)
        setError('Failed to load evote trends')
      } finally {
        setIsLoading(false)
      }
    }

    loadEvoteTrends()
  }, [userId])

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Format data for chart
  const formatDataForChart = (trends: EVoteTrends) => {
    return trends.trends.map(item => ({
      day: new Date(item.date).toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      total_evotes: item.total_evotes,
      date: item.date,
      fullDate: new Date(item.date).toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }))
  }

  const chartData = evoteTrends ? formatDataForChart(evoteTrends) : []

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">eVote Trends</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading && (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 text-sm">Loading eVote trends...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <p className="text-red-600 text-sm mb-2">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && evoteTrends && (
            <div>
              {/* Simple eVote Trend Line Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        fontSize: '14px',
                        padding: '16px 20px',
                        minWidth: '220px',
                        backdropFilter: 'blur(10px)',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderLeft: '4px solid #3b82f6'
                      }}
                      wrapperStyle={{
                        outline: 'none',
                        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05))'
                      }}
                      cursor={{
                        stroke: '#3b82f6',
                        strokeWidth: 2,
                        strokeDasharray: '5 5'
                      }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div style={{
                              backgroundColor: '#ffffff',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                              padding: '16px 20px',
                              minWidth: '220px',
                              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                              borderLeft: '4px solid #3b82f6'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px'
                              }}>
                                <div style={{
                                  width: '8px',
                                  height: '8px',
                                  backgroundColor: '#3b82f6',
                                  borderRadius: '50%',
                                  marginRight: '8px'
                                }}></div>
                                <span style={{
                                  fontSize: '16px',
                                  fontWeight: '700',
                                  color: '#1f2937'
                                }}>
                                  {payload[0].value} eVotes
                                </span>
                              </div>
                              <div style={{
                                fontSize: '13px',
                                color: '#6b7280',
                                fontWeight: '500',
                                letterSpacing: '0.025em'
                              }}>
                                {data.fullDate}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total_evotes" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
