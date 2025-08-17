import { useState } from 'react'
import { useUser } from '../contexts/UserContext'
import { Card, Button } from '../components/UI'
import RepresentativeSettings from '../components/RepresentativeSettings'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  Crown, 
  Shield, 
  Bell, 
  Eye, 
  Lock, 
  Smartphone, 
  Globe, 
  HelpCircle,
  ChevronRight,
  ArrowLeft,
  Settings as SettingsIcon,
  LogOut,
  AlertTriangle
} from 'lucide-react'

type SettingsSection = 
  | 'main'
  | 'profile'
  | 'representative'
  | 'privacy'
  | 'notifications'
  | 'security'
  | 'accessibility'
  | 'about'

export default function Settings() {
  const { user, logout } = useUser()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<SettingsSection>('main')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      // Navigate to home page after successful logout
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Still navigate even if logout fails
      navigate('/')
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in required</h2>
          <p className="text-gray-600">Please sign in to access settings.</p>
        </div>
      </div>
    )
  }

  const settingsItems = [
    {
      id: 'profile' as const,
      icon: User,
      title: 'Profile',
      description: 'Manage your personal information',
      comingSoon: false
    },
    {
      id: 'representative' as const,
      icon: Crown,
      title: 'Representative Account',
      description: 'Link to a representative position',
      comingSoon: false,
      highlight: true
    },
    {
      id: 'privacy' as const,
      icon: Eye,
      title: 'Privacy',
      description: 'Control your privacy settings',
      comingSoon: true
    },
    {
      id: 'notifications' as const,
      icon: Bell,
      title: 'Notifications',
      description: 'Manage notification preferences',
      comingSoon: true
    },
    {
      id: 'security' as const,
      icon: Lock,
      title: 'Security',
      description: 'Password and security settings',
      comingSoon: false
    },
    {
      id: 'accessibility' as const,
      icon: Smartphone,
      title: 'Accessibility',
      description: 'Accessibility and display options',
      comingSoon: true
    },
    {
      id: 'about' as const,
      icon: HelpCircle,
      title: 'About',
      description: 'App version and support',
      comingSoon: true
    }
  ]

  const renderMainSettings = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
      </div>

      {/* Settings List */}
      <div className="space-y-2">
        {settingsItems.map((item) => {
          const IconComponent = item.icon
          
          return (
            <button
              key={item.id}
              onClick={() => item.comingSoon ? null : setActiveSection(item.id)}
              disabled={item.comingSoon}
              className={`w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                item.highlight ? 'ring-2 ring-primary-100 border-primary-200' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item.highlight 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                      <span>{item.title}</span>
                      {item.highlight && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                          New
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.comingSoon && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      Coming Soon
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* User Info */}
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {(user.display_name || user.username).charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{user.display_name || user.username}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <div className="text-xs text-gray-500 mt-1">
              Member since {new Date(user.created_at).getFullYear()}
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <Button
              onClick={() => setActiveSection('security')}
              variant="outline"
              className="flex-1 text-sm"
            >
              <Lock className="w-4 h-4 mr-2" />
              Security
            </Button>
            <Button
              onClick={handleLogout}
              loading={isLoggingOut}
              variant="outline"
              className="flex-1 text-sm border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderProfileSettings = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => setActiveSection('main')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>
      </div>

      {/* Profile form would go here */}
      <Card className="p-6">
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Editor</h3>
          <p className="text-gray-600 mb-4">
            Profile editing functionality will be available soon. For now, you can edit your profile from the Profile page.
          </p>
          <Button
            onClick={() => window.location.href = '/profile'}
            variant="primary"
          >
            Go to Profile Page
          </Button>
        </div>
      </Card>
    </div>
  )

  const renderRepresentativeSettings = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => setActiveSection('main')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Representative Settings</h1>
          <p className="text-gray-600">Manage your representative account</p>
        </div>
      </div>

      {/* Representative Settings Component */}
      <RepresentativeSettings embedded />
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => setActiveSection('main')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600">Manage your account security</p>
        </div>
      </div>

      {/* Security Options */}
      <div className="space-y-4">
        {/* Password Section */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              Coming Soon
            </span>
          </div>
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              Coming Soon
            </span>
          </div>
        </Card>

        {/* Logout Section */}
        <Card className="p-4 border-red-200">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Sign Out</h3>
                <p className="text-sm text-gray-600">Sign out of your account on this device</p>
              </div>
            </div>
            
            <div className="pt-2">
              <Button
                onClick={handleLogout}
                loading={isLoggingOut}
                variant="outline"
                className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
              >
                {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Account Deletion Warning */}
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-orange-900">Account Deletion</h3>
              <p className="text-sm text-orange-800 mt-1">
                Need to delete your account? Contact support for assistance with account deletion. 
                This action cannot be undone and will permanently remove all your data.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )

  const renderComingSoonSection = (title: string, description: string, icon: any) => {
    const IconComponent = icon
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={() => setActiveSection('main')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>

        {/* Coming Soon */}
        <Card className="p-6">
          <div className="text-center py-8">
            <IconComponent className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600">
              This feature is currently under development and will be available in a future update.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      {activeSection === 'main' && renderMainSettings()}
      {activeSection === 'profile' && renderProfileSettings()}
      {activeSection === 'representative' && renderRepresentativeSettings()}
      {activeSection === 'security' && renderSecuritySettings()}
      {activeSection === 'privacy' && renderComingSoonSection('Privacy Settings', 'Control your privacy settings', Eye)}
      {activeSection === 'notifications' && renderComingSoonSection('Notification Settings', 'Manage notification preferences', Bell)}
      {activeSection === 'accessibility' && renderComingSoonSection('Accessibility Settings', 'Accessibility and display options', Smartphone)}
      {activeSection === 'about' && renderComingSoonSection('About', 'App version and support', HelpCircle)}
    </div>
  )
}
