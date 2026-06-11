import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useUiPreferences } from '../../ui/UiPreferencesContext'

export function ScrollToTop() {
  const location = useLocation()
  const { richMotion } = useUiPreferences()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: richMotion ? 'smooth' : 'auto',
    })
  }, [location.pathname, location.search, richMotion])

  return null
}
