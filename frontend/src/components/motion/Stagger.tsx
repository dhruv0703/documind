import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useUiPreferences } from '../../ui/UiPreferencesContext'

type StaggerContainerProps = {
  children: ReactNode
  className?: string
  delay?: number
}

type StaggerItemProps = {
  children: ReactNode
  className?: string
}

export function StaggerContainer({
  children,
  className,
  delay = 0,
}: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion()
  const { richMotion } = useUiPreferences()

  if (prefersReducedMotion || !richMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            delayChildren: delay,
            staggerChildren: 0.08,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion()
  const { richMotion } = useUiPreferences()

  if (prefersReducedMotion || !richMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
        show: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: {
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
