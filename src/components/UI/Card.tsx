import React from 'react'
import { clsx } from 'clsx'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', interactive = false, children, ...props }, ref) => {
    const baseClasses = [
      'rounded-xl transition-all duration-200 ease-in-out',
    ]

    const variants = {
      default: 'bg-white shadow-sm border border-gray-100',
      elevated: 'bg-white shadow-md border border-gray-100',
      outlined: 'bg-white border-2 border-gray-200',
    }

    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    }

    const interactiveClasses = interactive
      ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
      : ''

    const classes = clsx(
      baseClasses,
      variants[variant],
      paddingClasses[padding],
      interactiveClasses,
      className
    )

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
