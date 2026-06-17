let lastHapticAt = 0

export function triggerHaptic(style: 'light' | 'medium' = 'light') {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.vibrate) {
    return
  }

  if (!window.matchMedia('(pointer: coarse)').matches) {
    return
  }

  const now = Date.now()
  if (now - lastHapticAt < 40) {
    return
  }

  lastHapticAt = now
  navigator.vibrate(style === 'medium' ? [10] : [6])
}
