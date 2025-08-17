// Debug Helper Component for checking user representative accounts
// Add this to your frontend to debug the issue

import React, { useEffect, useState } from 'react'
import { useUser } from '../contexts/UserContext'
import { userService } from '../services/users'
import { representativeService } from '../services/representatives'

const UserRepDebugger = () => {
  const { user } = useUser()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkUserRepStatus = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      console.log('🔍 Current user from context:', user)
      
      // Get fresh user data
      const freshUser = await userService.getCurrentUser()
      console.log('🔍 Fresh user data:', freshUser)
      
      // Get representative settings
      const repSettings = await representativeService.getRepresentativeSettings()
      console.log('🔍 Representative settings:', repSettings)
      
      // Get available representatives
      const availableReps = await representativeService.getAvailableRepresentatives()
      console.log('🔍 Available representatives:', availableReps)
      
      setDebugInfo({
        contextUser: user,
        freshUser: freshUser,
        repSettings: repSettings,
        availableReps: availableReps
      })
      
    } catch (error) {
      console.error('❌ Debug failed:', error)
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      checkUserRepStatus()
    }
  }, [user])

  if (!user) {
    return <div className="p-4 border border-red-200 rounded-lg bg-red-50">
      <h3 className="font-bold text-red-800">No User Logged In</h3>
      <p className="text-red-600">Please log in to debug representative status</p>
    </div>
  }

  return (
    <div className="p-6 border border-blue-200 rounded-lg bg-blue-50 max-w-4xl mx-auto my-4">
      <h2 className="text-xl font-bold text-blue-900 mb-4">🔍 User Representative Debug Info</h2>
      
      <button 
        onClick={checkUserRepStatus}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
      >
        {loading ? 'Checking...' : 'Refresh Debug Info'}
      </button>

      {debugInfo && (
        <div className="space-y-4 text-sm">
          {debugInfo.error ? (
            <div className="bg-red-100 border border-red-300 rounded p-3">
              <strong className="text-red-800">Error:</strong>
              <pre className="text-red-700 mt-2">{debugInfo.error}</pre>
            </div>
          ) : (
            <>
              {/* Current User Info */}
              <div className="bg-white rounded p-3 border">
                <h3 className="font-semibold text-gray-900 mb-2">Context User Info</h3>
                <pre className="text-xs text-gray-700 overflow-auto max-h-32">
                  {JSON.stringify(debugInfo.contextUser, null, 2)}
                </pre>
                <div className="mt-2">
                  <strong>Rep Accounts:</strong> {debugInfo.contextUser?.rep_accounts?.length || 0}
                  {debugInfo.contextUser?.rep_accounts?.map((rep: any, idx: number) => (
                    <div key={idx} className="ml-4 text-xs text-gray-600">
                      • {rep.title?.title_name} - {rep.jurisdiction?.name} (ID: {rep.id})
                    </div>
                  ))}
                </div>
              </div>

              {/* Fresh User Data */}
              <div className="bg-white rounded p-3 border">
                <h3 className="font-semibold text-gray-900 mb-2">Fresh User Data</h3>
                <div className="text-xs">
                  <strong>Rep Accounts:</strong> {debugInfo.freshUser?.rep_accounts?.length || 0}
                  {debugInfo.freshUser?.rep_accounts?.map((rep: any, idx: number) => (
                    <div key={idx} className="ml-4 text-gray-600">
                      • {rep.title?.title_name} - {rep.jurisdiction?.name} (ID: {rep.id})
                    </div>
                  ))}
                </div>
              </div>

              {/* Representative Settings */}
              <div className="bg-white rounded p-3 border">
                <h3 className="font-semibold text-gray-900 mb-2">Representative Settings</h3>
                <div className="text-xs">
                  <strong>Linked Rep:</strong> {debugInfo.repSettings?.linked_representative ? 'Yes' : 'None'}
                  {debugInfo.repSettings?.linked_representative && (
                    <div className="ml-4 text-gray-600">
                      • {debugInfo.repSettings.linked_representative.title_name} - {debugInfo.repSettings.linked_representative.jurisdiction_name}
                    </div>
                  )}
                </div>
              </div>

              {/* Available Representatives */}
              <div className="bg-white rounded p-3 border">
                <h3 className="font-semibold text-gray-900 mb-2">Available Representatives</h3>
                <div className="text-xs">
                  <strong>Count:</strong> {debugInfo.availableReps?.representatives?.length || 0}
                  <div className="max-h-32 overflow-auto">
                    {debugInfo.availableReps?.representatives?.slice(0, 5).map((rep: any, idx: number) => (
                      <div key={idx} className="ml-4 text-gray-600">
                        • {rep.title_name} - {rep.jurisdiction_name} (ID: {rep.id})
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
                <h3 className="font-semibold text-yellow-900 mb-2">🔧 Diagnosis</h3>
                <div className="text-sm space-y-2">
                  {!debugInfo.contextUser?.rep_accounts?.length && !debugInfo.freshUser?.rep_accounts?.length ? (
                    <div className="text-yellow-800">
                      ❌ <strong>Issue Found:</strong> Your user account has no linked representative accounts.
                      <br />
                      ✅ <strong>Solution:</strong> You need to link your account to a representative to update assigned issues.
                    </div>
                  ) : (
                    <div className="text-green-800">
                      ✅ <strong>Good:</strong> Your account has {debugInfo.contextUser?.rep_accounts?.length || debugInfo.freshUser?.rep_accounts?.length} linked representative account(s).
                      <br />
                      You should be able to update posts assigned to these representatives.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default UserRepDebugger
