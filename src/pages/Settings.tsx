import { useState } from 'react'
import { useUser } from '../contexts/UserContext'
import { Card, Button } from '../components/UI'
import RepresentativeSettings from '../components/RepresentativeSettings'
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
  Settings as SettingsIcon
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
  const { user } = useUser()
  const [activeSection, setActiveSection] = useState<SettingsSection>('main')

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
      comingSoon: true
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
          </div>
          <div className="text-xs text-gray-500">
            Member since {new Date(user.created_at).getFullYear()}
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
      {activeSection === 'privacy' && renderComingSoonSection('Privacy Settings', 'Control your privacy settings', Eye)}
      {activeSection === 'notifications' && renderComingSoonSection('Notification Settings', 'Manage notification preferences', Bell)}
      {activeSection === 'security' && renderComingSoonSection('Security Settings', 'Password and security settings', Lock)}
      {activeSection === 'accessibility' && renderComingSoonSection('Accessibility Settings', 'Accessibility and display options', Smartphone)}
      {activeSection === 'about' && renderComingSoonSection('About', 'App version and support', HelpCircle)}
    </div>
  )
}
