import React from 'react'
import { StatusBadge, StatusCard, StatusTimeline, StatusSelector, StatusIndicator, TicketStatus } from '../components/UI/TicketStatus'

export default function StatusDemo() {
  const [selectedStatus, setSelectedStatus] = React.useState<TicketStatus>('open')
  const testStatuses: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed']

  const samplePost = {
    id: '1',
    title: 'Sample Post with Status',
    content: 'This is a test post to demonstrate status display',
    status: selectedStatus,
    post_type: 'issue' as const,
    author: { 
      id: '1', 
      username: 'testuser', 
      display_name: 'Test User',
      avatar_url: '',
      verified: false
    },
    created_at: new Date().toISOString(),
    upvotes: 5,
    downvotes: 1,
    comment_count: 3
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Status Components Demo</h1>
      
      {/* Status Badges */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Status Badges</h2>
        <div className="flex flex-wrap gap-3">
          {testStatuses.map(status => (
            <StatusBadge key={status} status={status} size="md" />
          ))}
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Status Indicators</h2>
        <div className="flex flex-wrap gap-3">
          {testStatuses.map(status => (
            <StatusIndicator key={status} status={status} />
          ))}
        </div>
      </div>

      {/* Status Selector */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Status Selector</h2>
        <StatusSelector
          currentStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          disabled={false}
        />
        <p className="mt-2 text-sm text-gray-600">Selected: {selectedStatus}</p>
      </div>

      {/* Status Card */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Status Card</h2>
        <StatusCard 
          status={selectedStatus}
          title={samplePost.title}
          description={samplePost.content}
          updatedAt={samplePost.created_at}
          showProgress={true}
        />
      </div>

      {/* Status Timeline */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Status Timeline</h2>
        <StatusTimeline
          currentStatus={selectedStatus}
          timeline={[
            { status: 'open', timestamp: '2025-08-01T10:00:00Z', user: 'citizen' },
            { status: 'in_progress', timestamp: '2025-08-01T14:00:00Z', user: 'representative' },
            { status: 'resolved', timestamp: '2025-08-02T09:00:00Z', user: 'representative' }
          ]}
        />
      </div>

      {/* Simulated FeedCard with Status */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Feed Card with Status</h2>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div>
                <h3 className="font-medium">{samplePost.author.display_name}</h3>
                <p className="text-sm text-gray-500">Test User</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                🚨 Issue
              </span>
              <StatusBadge status={selectedStatus} size="sm" />
            </div>
          </div>
          <h2 className="font-semibold text-lg mb-2">{samplePost.title}</h2>
          <p className="text-gray-700 mb-4">{samplePost.content}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>👍 {samplePost.upvotes}</span>
            <span>👎 {samplePost.downvotes}</span>
            <span>💬 {samplePost.comment_count}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
