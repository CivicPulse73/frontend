// Component to explain the status update permissions
import React from 'react'
import { useUser } from '../contexts/UserContext'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

const StatusUpdateExplanation = () => {
  const { user } = useUser()

  return (
    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 mb-4">
      <div className="flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-2">Status Update Permissions</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-green-800">Created Issues:</strong>
                <span className="text-green-700 ml-1">
                  You can update the status of issues you created
                </span>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              {user?.rep_accounts?.length ? (
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <strong className={user?.rep_accounts?.length ? "text-green-800" : "text-orange-800"}>
                  Assigned Issues:
                </strong>
                <span className={user?.rep_accounts?.length ? "text-green-700 ml-1" : "text-orange-700 ml-1"}>
                  {user?.rep_accounts?.length ? (
                    `You can update issues assigned to your representative role (${user.rep_accounts[0]?.title?.title_name})`
                  ) : (
                    "You cannot update these - only assigned representatives can update assigned issues"
                  )}
                </span>
              </div>
            </div>
          </div>
          
          {!user?.rep_accounts?.length && (
            <div className="mt-3 p-3 bg-white rounded border-l-4 border-orange-400">
              <p className="text-sm text-gray-700">
                <strong>This is the correct behavior!</strong> On a civic platform:
              </p>
              <ul className="text-sm text-gray-600 mt-1 ml-4 list-disc space-y-1">
                <li>Citizens manage their own reported issues</li>
                <li>Government representatives manage assigned issues</li>
                <li>This maintains proper accountability and separation of responsibilities</li>
              </ul>
            </div>
          )}
          
          {user?.rep_accounts?.length && (
            <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
              <p className="text-sm text-green-700">
                <strong>Representative Account Active:</strong> You can update both your created issues 
                and issues assigned to your representative role.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatusUpdateExplanation
