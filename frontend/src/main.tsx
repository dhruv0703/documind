import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import { ScrollToTop } from './components/motion/ScrollToTop.tsx'
import { UiPreferencesProvider } from './ui/UiPreferencesContext.tsx'
import { WorkspaceProvider } from './workspace/WorkspaceContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <UiPreferencesProvider>
        <ScrollToTop />
        <AuthProvider>
          <WorkspaceProvider>
            <App />
          </WorkspaceProvider>
        </AuthProvider>
      </UiPreferencesProvider>
    </BrowserRouter>
  </StrictMode>,
)
