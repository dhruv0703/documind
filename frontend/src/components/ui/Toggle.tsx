import { motion, useReducedMotion } from 'framer-motion'
import { triggerHaptic } from '../../lib/haptics'
import { cn } from '../../lib/utils'
import { useUiPreferences } from '../../ui/UiPreferencesContext'

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description: string
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  const prefersReducedMotion = useReducedMotion()
  const { richMotion } = useUiPreferences()

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      onPointerDown={() => triggerHaptic('light')}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[var(--card-border)] bg-stone-50 px-4 py-4 text-left shadow-[0_6px_18px_rgba(15,23,42,0.03)] active:scale-[0.99]"
      whileHover={prefersReducedMotion || !richMotion ? undefined : { y: -1 }}
      whileTap={prefersReducedMotion || !richMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <motion.span
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition',
          checked ? 'bg-[linear-gradient(135deg,#f97316_0%,#fb923c_100%)]' : 'bg-slate-300',
        )}
      >
        <motion.span
          className="absolute left-1 h-5 w-5 rounded-full bg-white shadow-[0_4px_10px_rgba(15,23,42,0.18)]"
          animate={prefersReducedMotion || !richMotion ? { x: checked ? 20 : 0 } : { x: checked ? 20 : 0, scale: checked ? 1.02 : 1 }}
          transition={{ type: 'spring', stiffness: 480, damping: 30 }}
        />
      </motion.span>
    </motion.button>
  )
}
