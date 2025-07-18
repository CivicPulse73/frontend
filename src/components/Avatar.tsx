import { useState } from 'react'
import { User } from 'lucide-react'

interface AvatarProps {
  src?: string
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  onClick?: () => void
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6', 
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20'
}

const iconSizes = {
  xs: 'w-2 h-2',
  sm: 'w-3 h-3',
  md: 'w-4 h-4', 
  lg: 'w-5 h-5',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10'
}

export default function Avatar({ src, alt, size = 'lg', className = '', onClick }: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const showFallback = !src || imageError

  const Component = onClick ? 'button' : 'div'
  const baseClasses = `${sizeClasses[size]} rounded-full flex-shrink-0 ${className}`
  const clickableClasses = onClick ? 'cursor-pointer hover:ring-2 hover:ring-primary-500 hover:ring-offset-2 transition-all' : ''

  if (showFallback) {
    return (
      <Component 
        onClick={onClick}
        className={`${baseClasses} bg-gray-300 flex items-center justify-center ${clickableClasses}`}
        type={onClick ? 'button' : undefined}
      >
        <User className={`${iconSizes[size]} text-gray-600`} />
      </Component>
    )
  }

  return (
    <div className={`${baseClasses} relative ${clickableClasses}`}>
      {imageLoading && (
        <div className={`absolute inset-0 bg-gray-300 rounded-full flex items-center justify-center`}>
          <User className={`${iconSizes[size]} text-gray-600`} />
        </div>
      )}
      <Component
        onClick={onClick}
        className={onClick ? 'cursor-pointer' : ''}
        type={onClick ? 'button' : undefined}
      >
        <img
          src={src}
          alt={alt}
          className={`${baseClasses} object-cover`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </Component>
    </div>
  )
}
