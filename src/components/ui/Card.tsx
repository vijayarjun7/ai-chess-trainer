import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'none'
  shadow?: boolean
}

const PADDING = { sm: 'p-4', md: 'p-6', lg: 'p-8', none: '' }

export function Card({ children, className, padding = 'md', shadow = true }: CardProps) {
  return (
    <div className={clsx(
      'bg-white rounded-2xl border border-gray-100',
      shadow && 'shadow-sm',
      PADDING[padding],
      className
    )}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={clsx('text-lg font-bold text-gray-900 mb-1', className)}>{children}</h2>
  )
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={clsx('text-sm text-gray-500', className)}>{children}</p>
  )
}
