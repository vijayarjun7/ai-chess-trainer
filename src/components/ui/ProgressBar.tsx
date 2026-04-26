import { clsx } from 'clsx'

interface ProgressBarProps {
  value: number   // 0–100
  label?: string
  showValue?: boolean
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'adaptive'
  size?: 'sm' | 'md'
}

function adaptiveColor(value: number): string {
  if (value >= 85) return 'bg-green-500'
  if (value >= 65) return 'bg-lime-500'
  if (value >= 40) return 'bg-yellow-400'
  return 'bg-orange-400'
}

const COLOR_MAP = {
  blue:     'bg-brand-500',
  green:    'bg-green-500',
  yellow:   'bg-yellow-400',
  red:      'bg-red-500',
  adaptive: '',
}

export function ProgressBar({ value, label, showValue = true, color = 'adaptive', size = 'md' }: ProgressBarProps) {
  const barColor = color === 'adaptive' ? adaptiveColor(value) : COLOR_MAP[color]
  const clamped  = Math.max(0, Math.min(100, value))

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showValue && <span className="text-sm font-semibold text-gray-800">{Math.round(clamped)}</span>}
        </div>
      )}
      <div className={clsx('w-full bg-gray-100 rounded-full overflow-hidden', size === 'sm' ? 'h-2' : 'h-3')}>
        <div
          className={clsx('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
