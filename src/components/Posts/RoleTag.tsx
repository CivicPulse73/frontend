import React, { useMemo } from 'react';
import { Tooltip } from '../UI/Tooltip';
import { Role } from '../../services/roleService';

interface RoleTagProps {
  role: Role;
  className?: string;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Sanitize text content to prevent XSS and display issues
 */
const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .trim()
    .substring(0, 100); // Limit length
};

/**
 * Get color scheme based on role type with fallback
 */
const getRoleTypeColor = (roleType: string): string => {
  const normalizedType = (roleType || '').toLowerCase();
  
  const colorMap: Record<string, string> = {
    'executive': 'bg-blue-100 text-blue-800 border-blue-200',
    'legislative': 'bg-green-100 text-green-800 border-green-200',
    'judicial': 'bg-purple-100 text-purple-800 border-purple-200',
    'administrative': 'bg-gray-100 text-gray-800 border-gray-200',
    'elected': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'appointed': 'bg-orange-100 text-orange-800 border-orange-200',
  };
  
  return colorMap[normalizedType] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Get size classes based on size prop
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  const sizeMap = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };
  
  return sizeMap[size] || sizeMap.md;
};

export const RoleTag: React.FC<RoleTagProps> = ({ 
  role, 
  className = '', 
  showTooltip = true,
  size = 'md'
}) => {
  // Memoize sanitized content for performance
  const sanitizedRole = useMemo(() => {
    if (!role) return null;
    
    return {
      ...role,
      role_name: sanitizeText(role.role_name),
      abbreviation: sanitizeText(role.abbreviation),
      description: sanitizeText(role.description || ''),
      role_type: sanitizeText(role.role_type || ''),
      level: sanitizeText(role.level || '')
    };
  }, [role]);

  // Don't render if role is invalid
  if (!sanitizedRole || !sanitizedRole.role_name) {
    return null;
  }

  const colorClasses = getRoleTypeColor(sanitizedRole.role_type);
  const sizeClasses = getSizeClasses(size);
  
  const tagElement = (
    <span 
      className={`inline-flex items-center rounded-full font-medium border ${colorClasses} ${sizeClasses} ${className}`}
      title={showTooltip ? undefined : sanitizedRole.role_name}
    >
      {sanitizedRole.abbreviation || sanitizedRole.role_name}
    </span>
  );

  // Return plain tag if tooltip is disabled
  if (!showTooltip) {
    return tagElement;
  }

  // Return tag with tooltip
  return (
    <Tooltip
      content={
        <div className="p-2 max-w-xs">
          <p className="font-semibold text-white">{sanitizedRole.role_name}</p>
          {sanitizedRole.description && (
            <p className="text-sm text-gray-200 mt-1">{sanitizedRole.description}</p>
          )}
          <div className="mt-2 text-xs text-gray-300 space-y-1">
            {sanitizedRole.level && (
              <p><span className="font-medium">Level:</span> {sanitizedRole.level}</p>
            )}
            {sanitizedRole.role_type && (
              <p><span className="font-medium">Type:</span> {sanitizedRole.role_type}</p>
            )}
            {sanitizedRole.is_elected && (
              <p className="text-yellow-200">
                <span className="font-medium">Elected Position</span>
                {sanitizedRole.term_length > 0 && ` (${sanitizedRole.term_length} years)`}
              </p>
            )}
          </div>
        </div>
      }
      className="z-50"
    >
      {tagElement}
    </Tooltip>
  );
};
