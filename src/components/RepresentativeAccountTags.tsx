import React, { useState } from 'react'
import { Crown } from './Icons'
import { RepresentativeAccount } from '../types'

interface RepresentativeAccountTagsProps {
  repAccounts: RepresentativeAccount[]
  maxDisplay?: number
  size?: 'sm' | 'md' | 'lg'
  showJurisdiction?: boolean
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
}

const RepresentativeAccountTags: React.FC<RepresentativeAccountTagsProps> = ({
  repAccounts,
  maxDisplay = 3,
  size = 'md',
  showJurisdiction = true,
  className = '',
  variant = 'default'
}) => {
  const [showAll, setShowAll] = useState(false)
  
  if (!repAccounts || repAccounts.length === 0) {
    return null
  }

  const displayAccounts = showAll ? repAccounts : repAccounts.slice(0, maxDisplay)
  const remainingCount = repAccounts.length - maxDisplay

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  }

  const iconSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  // Color schemes for different position types
  const getPositionColors = (titleText: string) => {
    const title = titleText.toLowerCase()
    if (title.includes('cm') || title.includes('chief minister')) {
      return {
        bg: 'from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100',
        border: 'border-emerald-200 hover:border-emerald-300',
        text: 'text-emerald-900',
        titleText: 'text-emerald-800',
        icon: 'text-emerald-600',
        bullet: 'text-emerald-500',
        jurisdiction: 'text-emerald-700'
      }
    } else if (title.includes('gov') || title.includes('governor')) {
      return {
        bg: 'from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100',
        border: 'border-purple-200 hover:border-purple-300',
        text: 'text-purple-900',
        titleText: 'text-purple-800',
        icon: 'text-purple-600',
        bullet: 'text-purple-500',
        jurisdiction: 'text-purple-700'
      }
    } else if (title.includes('mla') || title.includes('member')) {
      return {
        bg: 'from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100',
        border: 'border-blue-200 hover:border-blue-300',
        text: 'text-blue-900',
        titleText: 'text-blue-800',
        icon: 'text-blue-600',
        bullet: 'text-blue-500',
        jurisdiction: 'text-blue-700'
      }
    } else {
      return {
        bg: 'from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100',
        border: 'border-amber-200 hover:border-amber-300',
        text: 'text-amber-900',
        titleText: 'text-amber-800',
        icon: 'text-amber-600',
        bullet: 'text-amber-500',
        jurisdiction: 'text-amber-700'
      }
    }
  }

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {displayAccounts.map((account, index) => {
        // Try to get the display text from various possible property paths
        const getDisplayText = () => {
          // Try the actual API structure (title_info instead of title)
          const accountAny = account as any;
          if (accountAny.title_info?.abbreviation) return accountAny.title_info.abbreviation;
          if (accountAny.title_info?.title_name) return accountAny.title_info.title_name;
          
          // Try the expected TypeScript structure (fallback)
          if (account.title?.abbreviation) return account.title.abbreviation;
          if (account.title?.title_name) return account.title.title_name;
          
          // Try other possible structures
          if (accountAny.abbreviation) return accountAny.abbreviation;
          if (accountAny.title_name) return accountAny.title_name;
          if (accountAny.name) return accountAny.name;
          
          // Fallback
          return 'Representative';
        };

        const titleText = getDisplayText()
        const jurisdictionName = account.jurisdiction?.name || (account as any).jurisdiction_info?.name;
        const colors = getPositionColors(titleText)

        return (
          <div
            key={account.id}
            className={`
              group relative inline-flex items-center
              bg-gradient-to-r ${colors.bg}
              ${colors.text} ${colors.border}
              rounded-full font-medium shadow-sm hover:shadow-lg
              transition-all duration-300 ease-out
              transform hover:scale-102 hover:-translate-y-0.5
              ring-0 hover:ring-2 hover:ring-opacity-20 hover:ring-current
              ${sizeClasses[size]}
              ${variant === 'compact' ? 'space-x-1.5' : 'space-x-2.5'}
            `}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Crown icon container */}
            <div className={`
              relative flex items-center justify-center rounded-full
              ${variant === 'detailed' ? 'bg-white/50 p-1' : ''}
            `}>
              <Crown className={`${iconSizeClasses[size]} ${colors.icon} drop-shadow-sm`} />
            </div>
            
            {/* Content container */}
            <div className={`
              relative flex items-center
              ${variant === 'compact' ? 'space-x-1' : 'space-x-1.5'}
            `}>
              {/* Title */}
              <span className={`font-bold ${colors.titleText} tracking-wide`}>
                {titleText}
              </span>
              
              {/* Jurisdiction */}
              {showJurisdiction && jurisdictionName && variant !== 'compact' && (
                <>
                  <span className={`${colors.bullet} font-bold text-sm`}>•</span>
                  <span className={`
                    ${colors.jurisdiction} font-semibold capitalize text-sm
                    ${variant === 'detailed' ? 'bg-white/30 px-2 py-0.5 rounded-md' : ''}
                  `}>
                    {jurisdictionName}
                  </span>
                </>
              )}
            </div>

            {/* Tooltip for compact mode */}
            {variant === 'compact' && jurisdictionName && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {jurisdictionName}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Show More Button */}
      {!showAll && remainingCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className={`
            group inline-flex items-center space-x-2
            bg-gradient-to-r from-slate-50 to-gray-50
            hover:from-slate-100 hover:to-gray-100
            text-slate-700 hover:text-slate-800
            border border-slate-300 hover:border-slate-400
            rounded-full font-semibold shadow-sm hover:shadow-md
            transition-all duration-300 ease-out
            transform hover:scale-105 active:scale-95
            ring-0 hover:ring-2 hover:ring-slate-200
            ${sizeClasses[size]}
          `}
        >
          <span className="flex items-center justify-center w-5 h-5 bg-slate-200 rounded-full text-xs font-bold group-hover:bg-slate-300 transition-colors">
            +{remainingCount}
          </span>
          <span className="text-slate-600">more</span>
        </button>
      )}
      
      {/* Show Less Button */}
      {showAll && repAccounts.length > maxDisplay && (
        <button
          onClick={() => setShowAll(false)}
          className={`
            group inline-flex items-center space-x-2
            bg-gradient-to-r from-indigo-50 to-blue-50
            hover:from-indigo-100 hover:to-blue-100
            text-indigo-700 hover:text-indigo-800
            border border-indigo-300 hover:border-indigo-400
            rounded-full font-semibold shadow-sm hover:shadow-md
            transition-all duration-300 ease-out
            transform hover:scale-105 active:scale-95
            ring-0 hover:ring-2 hover:ring-indigo-200
            ${sizeClasses[size]}
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          <span>Show less</span>
        </button>
      )}
    </div>
  )
}

export default RepresentativeAccountTags