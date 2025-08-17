import React from 'react'
import { clsx } from 'clsx'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot = false, children, ...props }, ref) => {
    const baseClasses = [
      'inline-flex items-center font-medium rounded-full',
      'transition-all duration-200 ease-in-out',
    ]

    const variants = {
      default: 'bg-gray-100 text-gray-800',
      primary: 'bg-primary-100 text-primary-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
    }

    const sizes = {
      sm: dot ? 'w-2 h-2' : 'px-2 py-0.5 text-xs',
      md: dot ? 'w-2.5 h-2.5' : 'px-2.5 py-1 text-xs',
      lg: dot ? 'w-3 h-3' : 'px-3 py-1.5 text-sm',
    }

    const classes = clsx(
      baseClasses,
      variants[variant],
      sizes[size],
      dot && 'p-0',
      className
    )

    if (dot) {
      return <span ref={ref} className={classes} {...props} />
    }

    return (
      <span ref={ref} className={classes} {...props}>
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge
