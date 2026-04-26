import { clsx } from 'clsx'
import type { MasteryLevel } from '@/types/database'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'mastered' | 'proficient' | 'developing' | 'learning' | 'info'
  size?: 'sm' | 'md'
}

const VARIANT_CLASSES: Record<string, string> = {
  default:    'bg-gray-100 text-gray-700',
  mastered:   'bg-green-100 text-green-700',
  proficient: 'bg-lime-100 text-lime-700',
  developing: 'bg-yellow-100 text-yellow-700',
  learning:   'bg-orange-100 text-orange-700',
  info:       'bg-brand-100 text-brand-700',
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center rounded-full font-medium',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      VARIANT_CLASSES[variant]
    )}>
      {children}
    </span>
  )
}

export function MasteryBadge({ level }: { level: MasteryLevel }) {
  return <Badge variant={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</Badge>
}
