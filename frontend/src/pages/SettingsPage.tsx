import { Check, Copy, LockKeyhole, ServerCog, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { apiBaseUrl } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { StaggerContainer, StaggerItem } from '../components/motion/Stagger'
import { Toggle } from '../components/ui/Toggle'
import { useUiPreferences } from '../ui/UiPreferencesContext'

export function SettingsPage() {
  const { user } = useAuth()
  const {
    richMotion,
    demoMetrics,
    showStatusBadge,
    setRichMotion,
    setDemoMetrics,
    setShowStatusBadge,
  } = useUiPreferences()
  const [copiedField, setCopiedField] = useState<'api' | 'user' | null>(null)

  async function copyValue(value: string, field: 'api' | 'user') {
    await navigator.clipboard.writeText(value)
    setCopiedField(field)
    window.setTimeout(() => {
      setCopiedField((current) => (current === field ? null : current))
    }, 1600)
  }

  return (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <section className="rounded-[24px] border border-[var(--card-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-semibold text-slate-500">Settings</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-slate-950">
            Workspace configuration
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Core environment details and interaction controls for your local DocuMind workspace.
          </p>

          <StaggerContainer className="mt-6 grid gap-4 lg:grid-cols-2" delay={0.06}>
            <StaggerItem>
              <div className="rounded-2xl border border-[var(--card-border)] bg-stone-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 text-slate-900">
                    <ServerCog className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-semibold">API base URL</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">Runtime target</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyValue(apiBaseUrl, 'api')}
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition hover:bg-stone-50 active:scale-[0.98]"
                  >
                    {copiedField === 'api' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedField === 'api' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="mt-4 break-all text-sm leading-7 text-slate-600">{apiBaseUrl}</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="rounded-2xl border border-[var(--card-border)] bg-stone-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 text-slate-900">
                    <LockKeyhole className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-semibold">Authenticated user</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">Active session</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyValue(user?.email ?? '', 'user')}
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition hover:bg-stone-50 active:scale-[0.98]"
                  >
                    {copiedField === 'user' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedField === 'user' ? 'Copied' : 'Copy email'}
                  </button>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {user?.name}
                  <br />
                  {user?.email}
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>

          <div className="mt-8 flex items-center gap-3 text-slate-900">
            <SlidersHorizontal className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-semibold">Interaction controls</p>
              <p className="mt-1 text-sm text-slate-500">These toggles change the current UI behavior immediately.</p>
            </div>
          </div>

          <StaggerContainer className="mt-4 grid gap-3 xl:grid-cols-3" delay={0.08}>
            <StaggerItem>
              <Toggle
                checked={richMotion}
                onChange={setRichMotion}
                label="Enhanced motion"
                description="Turn route transitions and animated reveals on or off."
              />
            </StaggerItem>
            <StaggerItem>
              <Toggle
                checked={demoMetrics}
                onChange={setDemoMetrics}
                label="Demo metrics"
                description="Switch recruiter-demo dashboard stats on or off."
              />
            </StaggerItem>
            <StaggerItem>
              <Toggle
                checked={showStatusBadge}
                onChange={setShowStatusBadge}
                label="Connection badge"
                description="Show or hide the backend status badge in the header."
              />
            </StaggerItem>
          </StaggerContainer>
        </section>
      </StaggerItem>

      <StaggerItem>
        <section className="rounded-[24px] border border-[var(--card-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-semibold text-slate-500">Behavior summary</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-stone-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Motion</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{richMotion ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Demo metrics</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{demoMetrics ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Status badge</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{showStatusBadge ? 'Visible' : 'Hidden'}</p>
            </div>
          </div>
        </section>
      </StaggerItem>
    </StaggerContainer>
  )
}
