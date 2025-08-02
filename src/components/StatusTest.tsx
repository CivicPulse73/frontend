import React from 'react'
import { StatusBadge, StatusIndicator, TicketStatus } from './UI/TicketStatus'

// Add this component to test the status UI quickly
// You can import and use this in any existing page to verify it works

export const StatusTestComponent = () => {
  const testStatuses: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed']
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">🎫 Status Components Test</h3>
      
      {/* Status Badges */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Status Badges:</h4>
        <div className="flex flex-wrap gap-2">
          {testStatuses.map(status => (
            <StatusBadge key={status} status={status} size="sm" />
          ))}
        </div>
      </div>
      
      {/* Status Indicators */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Status Indicators:</h4>
        <div className="space-y-2">
          {testStatuses.map(status => (
            <div key={status} className="flex items-center space-x-2">
              <StatusIndicator status={status} showLabel />
              <span className="text-sm text-gray-600">
                Sample ticket with {status.replace('_', ' ')} status
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Sample Post Card with Status */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Issue Post:</h4>
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium">Pothole on Main Street</h5>
            <p className="text-sm text-gray-600">Large pothole causing traffic delays</p>
          </div>
          <StatusBadge status="in_progress" size="sm" />
        </div>
      </div>
    </div>
  )
}

export default StatusTestComponent
