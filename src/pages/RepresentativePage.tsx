import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Mail, Phone, ExternalLink, Calendar, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar'

interface Representative {
  id: string
  name: string
  designation: string
  constituency?: string
  party?: string
  contact_info?: {
    email?: string
    phone?: string
    office_address?: string
  }
  avatar_url?: string
  verified: boolean
  bio?: string
  website?: string
  social_media?: {
    twitter?: string
    facebook?: string
    instagram?: string
  }
}

export default function RepresentativePage() {
  const { representativeId } = useParams<{ representativeId: string }>()
  const navigate = useNavigate()
  const [representative, setRepresentative] = useState<Representative | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Fetch representative data from API
    // For now, showing a placeholder
    const fetchRepresentative = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for demonstration
        setRepresentative({
          id: representativeId || '1',
          name: 'John Smith',
          designation: 'City Council Member',
          constituency: 'District 5',
          party: 'Independent',
          contact_info: {
            email: 'john.smith@city.gov',
            phone: '(555) 123-4567',
            office_address: '123 City Hall, Downtown'
          },
          avatar_url: `https://ui-avatars.com/api/?name=John+Smith&background=3b82f6&color=fff`,
          verified: true,
          bio: 'Dedicated to serving the community and advocating for local issues including infrastructure, education, and public safety.',
          website: 'https://johnsmith.gov',
          social_media: {
            twitter: '@johnsmith_council',
            facebook: 'johnsmithcouncil'
          }
        })
      } catch (err) {
        setError('Failed to load representative information')
      } finally {
        setLoading(false)
      }
    }

    if (representativeId) {
      fetchRepresentative()
    }
  }, [representativeId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading representative information...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !representative) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Representative Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The representative you are looking for could not be found.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Representative Profile</h1>
        </div>

        {/* Representative Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Header Section */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <Avatar
                  src={representative.avatar_url}
                  alt={representative.name}
                  size="xl"
                  className="ring-4 ring-white shadow-lg"
                />
                {representative.verified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-gray-900">{representative.name}</h2>
                  {representative.verified && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Verified Official
                    </span>
                  )}
                </div>
                
                <p className="text-lg text-gray-700 mt-1">{representative.designation}</p>
                
                <div className="flex items-center space-x-4 mt-2">
                  {representative.constituency && (
                    <span className="flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{representative.constituency}</span>
                    </span>
                  )}
                  
                  {representative.party && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      representative.party.toLowerCase().includes('democrat') ? 'bg-blue-100 text-blue-700' :
                      representative.party.toLowerCase().includes('republican') ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {representative.party}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {representative.bio && (
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-700 leading-relaxed">{representative.bio}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              {representative.contact_info?.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <a
                    href={`mailto:${representative.contact_info.email}`}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {representative.contact_info.email}
                  </a>
                </div>
              )}
              
              {representative.contact_info?.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a
                    href={`tel:${representative.contact_info.phone}`}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {representative.contact_info.phone}
                  </a>
                </div>
              )}
              
              {representative.contact_info?.office_address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{representative.contact_info.office_address}</span>
                </div>
              )}
              
              {representative.website && (
                <div className="flex items-center space-x-3">
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                  <a
                    href={representative.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Official Website
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Social Media */}
          {representative.social_media && Object.keys(representative.social_media).length > 0 && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
              <div className="flex space-x-4">
                {representative.social_media.twitter && (
                  <a
                    href={`https://twitter.com/${representative.social_media.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    Twitter
                  </a>
                )}
                
                {representative.social_media.facebook && (
                  <a
                    href={`https://facebook.com/${representative.social_media.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    Facebook
                  </a>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 flex space-x-4"
        >
          {representative.contact_info?.email && (
            <button
              onClick={() => window.location.href = `mailto:${representative.contact_info?.email}`}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Send Email
            </button>
          )}
          
          <button
            onClick={() => navigate('/search')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Find More Representatives
          </button>
        </motion.div>
      </div>
    </div>
  )
}
