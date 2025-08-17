import React from 'react'
import { clsx } from 'clsx'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
  variant?: 'rectangular' | 'circular' | 'text'
  lines?: number
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, width, height, variant = 'rectangular', lines = 1, style, ...props }, ref) => {
    const baseClasses = [
      'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
      'bg-[length:200%_100%] animate-shimmer',
    ]

    const variants = {
      rectangular: 'rounded-lg',
      circular: 'rounded-full',
      text: 'rounded h-4',
    }

    const classes = clsx(
      baseClasses,
      variants[variant],
      className
    )

    const combinedStyle = {
      width,
      height: variant === 'text' ? '1rem' : height,
      ...style,
    }

    if (variant === 'text' && lines > 1) {
      return (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              ref={index === 0 ? ref : undefined}
              className={clsx(
                classes,
                index === lines - 1 && 'w-3/4' // Last line is shorter
              )}
              style={combinedStyle}
              {...props}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={classes}
        style={combinedStyle}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

export default Skeleton
