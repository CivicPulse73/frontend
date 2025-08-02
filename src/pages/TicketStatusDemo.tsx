import React, { useState } from 'react'
import { 
  StatusBadge, 
  StatusCard, 
  StatusTimeline, 
  StatusSelector, 
  StatusIndicator,
  TicketStatus 
} from '../components/UI/TicketStatus'

export default function TicketStatusDemo() {
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>('in_progress')

  const sampleTimeline = [
    {
      status: 'open' as TicketStatus,
      timestamp: '2 hours ago',
      user: 'John Citizen',
      note: 'Issue reported: Pothole on Main Street causing traffic delays'
    },
    {
      status: 'in_progress' as TicketStatus,
      timestamp: '1 hour ago', 
      user: 'City Representative',
      note: 'Maintenance crew assigned and en route to location'
    }
  ]

  const sampleTickets = [
    {
      id: '1',
      title: 'Pothole on Main Street',
      description: 'Large pothole causing traffic delays and potential vehicle damage',
      status: 'in_progress' as TicketStatus,
      assignee: 'Public Works Dept',
      updatedAt: '2 hours ago'
    },
    {
      id: '2', 
      title: 'Broken Street Light',
      description: 'Street light out on Elm Avenue creating safety concerns',
      status: 'open' as TicketStatus,
      assignee: 'Electrical Services',
      updatedAt: '4 hours ago'
    },
    {
      id: '3',
      title: 'Park Maintenance Completed',
      description: 'Playground equipment repairs and new safety surfacing installed',
      status: 'resolved' as TicketStatus,
      assignee: 'Parks & Recreation',
      updatedAt: '1 day ago'
    },
    {
      id: '4',
      title: 'Noise Complaint Investigation',
      description: 'Construction noise complaint resolved with contractor compliance',
      status: 'closed' as TicketStatus,
      assignee: 'Code Enforcement',
      updatedAt: '3 days ago'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎫 Ticket Status UI Components
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Modern, accessible, and interactive ticket status displays for civic engagement platforms
          </p>
        </div>

        {/* 1. Status Badges Section */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Status Badges</h2>
          
          <div className="space-y-6">
            {/* Default badges */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Default Style</h3>
              <div className="flex flex-wrap gap-3">
                <StatusBadge status="open" />
                <StatusBadge status="in_progress" />
                <StatusBadge status="resolved" />
                <StatusBadge status="closed" />
              </div>
            </div>

            {/* Different sizes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status="in_progress" size="sm" />
                <StatusBadge status="in_progress" size="md" />
                <StatusBadge status="in_progress" size="lg" />
              </div>
            </div>

            {/* Different variants */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <StatusBadge status="resolved" variant="default" />
                <StatusBadge status="resolved" variant="outline" />
                <StatusBadge status="resolved" variant="subtle" />
              </div>
            </div>

            {/* Without icons */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Without Icons</h3>
              <div className="flex flex-wrap gap-3">
                <StatusBadge status="open" showIcon={false} />
                <StatusBadge status="in_progress" showIcon={false} />
                <StatusBadge status="resolved" showIcon={false} />
                <StatusBadge status="closed" showIcon={false} />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Status Cards Section */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Status Cards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleTickets.map((ticket) => (
              <StatusCard
                key={ticket.id}
                status={ticket.status}
                title={ticket.title}
                description={ticket.description}
                assignee={ticket.assignee}
                updatedAt={ticket.updatedAt}
                onClick={() => console.log(`Clicked ticket ${ticket.id}`)}
              />
            ))}
          </div>
        </section>

        {/* 3. Status Timeline Section */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Status Timeline</h2>
          
          <div className="max-w-md">
            <StatusTimeline 
              currentStatus={selectedStatus}
              timeline={sampleTimeline}
            />
          </div>
        </section>

        {/* 4. Status Selector Section */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Interactive Status Selector</h2>
          
          <div className="max-w-md">
            <StatusSelector
              currentStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />
          </div>
        </section>

        {/* 5. Status Indicators Section */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Compact Status Indicators</h2>
          
          <div className="space-y-6">
            {/* Different sizes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Sizes</h3>
              <div className="flex items-center space-x-6">
                <StatusIndicator status="in_progress" size="xs" showLabel />
                <StatusIndicator status="in_progress" size="sm" showLabel />
                <StatusIndicator status="in_progress" size="md" showLabel />
              </div>
            </div>

            {/* All statuses */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">All Statuses</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <StatusIndicator status="open" showLabel />
                  <span className="text-gray-600">Critical infrastructure issue reported</span>
                </div>
                <div className="flex items-center space-x-3">
                  <StatusIndicator status="in_progress" showLabel />
                  <span className="text-gray-600">Maintenance crew working on site</span>
                </div>
                <div className="flex items-center space-x-3">
                  <StatusIndicator status="resolved" showLabel />
                  <span className="text-gray-600">Issue fixed and verified</span>
                </div>
                <div className="flex items-center space-x-3">
                  <StatusIndicator status="closed" showLabel />
                  <span className="text-gray-600">Case closed with resident satisfaction</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Integration Examples */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-world Usage Examples</h2>
          
          <div className="space-y-8">
            {/* Feed Card Integration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">In Feed Cards</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">Broken Streetlight on Oak Avenue</h4>
                    <p className="text-sm text-gray-600">Reported by John Smith • 2 hours ago</p>
                  </div>
                  <StatusBadge status="in_progress" size="sm" />
                </div>
                <p className="text-gray-700 text-sm mb-3">
                  The streetlight at the intersection of Oak Avenue and 5th Street has been out for 3 days...
                </p>
                <div className="flex items-center justify-between">
                  <StatusIndicator status="in_progress" showLabel />
                  <span className="text-xs text-gray-500">Assigned to Electrical Services</span>
                </div>
              </div>
            </div>

            {/* List View Integration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">In List Views</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3">Issue</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Assignee</th>
                      <th className="text-left p-3">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleTickets.slice(0, 3).map((ticket, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="p-3 font-medium">{ticket.title}</td>
                        <td className="p-3">
                          <StatusBadge status={ticket.status} size="sm" />
                        </td>
                        <td className="p-3 text-gray-600">{ticket.assignee}</td>
                        <td className="p-3 text-gray-500">{ticket.updatedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dashboard Stats */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Dashboard Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-700">23</div>
                  <div className="flex items-center justify-center mt-1">
                    <StatusIndicator status="open" size="xs" />
                    <span className="ml-1 text-sm text-red-700">Open Issues</span>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-amber-700">15</div>
                  <div className="flex items-center justify-center mt-1">
                    <StatusIndicator status="in_progress" size="xs" />
                    <span className="ml-1 text-sm text-amber-700">In Progress</span>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">89</div>
                  <div className="flex items-center justify-center mt-1">
                    <StatusIndicator status="resolved" size="xs" />
                    <span className="ml-1 text-sm text-green-700">Resolved</span>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">156</div>
                  <div className="flex items-center justify-center mt-1">
                    <StatusIndicator status="closed" size="xs" />
                    <span className="ml-1 text-sm text-gray-700">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Design Guidelines */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎨 Design Guidelines</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Color Psychology</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>🔴 <strong>Red (Open):</strong> Urgent attention needed, immediate action required</li>
                <li>🟡 <strong>Amber (In Progress):</strong> Active work, progress being made</li>
                <li>🟢 <strong>Green (Resolved):</strong> Success, completion, positive outcome</li>
                <li>⚫ <strong>Gray (Closed):</strong> Finalized, archived, no further action needed</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Accessibility Features</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ High contrast color ratios (WCAG AA compliant)</li>
                <li>✅ Icons paired with text for clarity</li>
                <li>✅ Consistent sizing and spacing</li>
                <li>✅ Keyboard navigation support</li>
                <li>✅ Screen reader friendly labels</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-white rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Best Practices</h3>
            <p className="text-sm text-blue-800">
              Use status indicators consistently across your application. The "In Progress" status includes 
              subtle animations to draw attention to active items. Consider user permissions when showing 
              interactive status selectors - only authorized users should be able to change ticket status.
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
