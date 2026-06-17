import { motion, useReducedMotion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { triggerHaptic } from '../../lib/haptics'
import { useUiPreferences } from '../../ui/UiPreferencesContext'

type ButtonProps = HTMLMotionProps<'button'> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  loading?: boolean
}

const variants = {
  primary:
    'bg-[linear-gradient(135deg,#f97316_0%,#fb923c_100%)] text-white shadow-[0_14px_30px_rgba(249,115,22,0.24)] hover:bg-orange-500',
  secondary:
    'border border-[var(--card-border)] bg-white text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.04)] hover:bg-stone-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-stone-100/80',
  danger:
    'border border-rose-200 bg-rose-50 text-rose-600 shadow-[0_8px_20px_rgba(244,63,94,0.1)] hover:bg-rose-100',
}

export function Button({
  children,
  className,
  loading = false,
  type = 'button',
  variant = 'primary',
  disabled,
  onPointerDown,
  ...props
}: ButtonProps) {
  const prefersReducedMotion = useReducedMotion()
  const { richMotion } = useUiPreferences()

  return (
    <motion.button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      onPointerDown={(event) => {
        if (!disabled && !loading) {
          triggerHaptic('light')
        }
        onPointerDown?.(event)
      }}
      whileHover={prefersReducedMotion || !richMotion || disabled || loading ? undefined : { y: -1.5, scale: 1.01 }}
      whileTap={prefersReducedMotion || !richMotion || disabled || loading ? undefined : { y: 0, scale: 0.98 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {children}
    </motion.button>
  )
}
