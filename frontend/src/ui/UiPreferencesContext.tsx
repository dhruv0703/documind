/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const UI_PREFERENCES_KEY = 'documind.ui.preferences'

type UiPreferences = {
  richMotion: boolean
  demoMetrics: boolean
  showStatusBadge: boolean
}

type UiPreferencesContextValue = UiPreferences & {
  setRichMotion: (value: boolean) => void
  setDemoMetrics: (value: boolean) => void
  setShowStatusBadge: (value: boolean) => void
}

const defaultPreferences: UiPreferences = {
  richMotion: true,
  demoMetrics: true,
  showStatusBadge: true,
}

const UiPreferencesContext = createContext<UiPreferencesContextValue | undefined>(undefined)

function readPreferences(): UiPreferences {
  const raw = localStorage.getItem(UI_PREFERENCES_KEY)
  if (!raw) {
    return defaultPreferences
  }

  try {
    return { ...defaultPreferences, ...(JSON.parse(raw) as Partial<UiPreferences>) }
  } catch {
    return defaultPreferences
  }
}

export function UiPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UiPreferences>(() => readPreferences())

  useEffect(() => {
    localStorage.setItem(UI_PREFERENCES_KEY, JSON.stringify(preferences))

    document.body.classList.toggle('ui-reduced-motion', !preferences.richMotion)
  }, [preferences])

  const value = useMemo<UiPreferencesContextValue>(
    () => ({
      ...preferences,
      setRichMotion: (value) =>
        setPreferences((current) => ({
          ...current,
          richMotion: value,
        })),
      setDemoMetrics: (value) =>
        setPreferences((current) => ({
          ...current,
          demoMetrics: value,
        })),
      setShowStatusBadge: (value) =>
        setPreferences((current) => ({
          ...current,
          showStatusBadge: value,
        })),
    }),
    [preferences],
  )

  return <UiPreferencesContext.Provider value={value}>{children}</UiPreferencesContext.Provider>
}

export function useUiPreferences() {
  const context = useContext(UiPreferencesContext)

  if (!context) {
    throw new Error('useUiPreferences must be used within UiPreferencesProvider')
  }

  return context
}
