import { ArrowRight, KeyRound, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setPasswordError('Password should be at least 8 characters long.')
      return
    }

    setPasswordError(null)
    setLoading(true)

    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-[var(--app-shell)] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(249,115,22,0.28),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(96,165,250,0.16),transparent_24%),linear-gradient(160deg,#1f2027_0%,#292b36_54%,#36394a_100%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,#fb923c_0%,#f97316_100%)] text-xl font-black shadow-[0_16px_30px_rgba(249,115,22,0.28)]">D</div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-2xl font-bold">DocuMind AI</p>
              <p className="text-sm text-slate-300">Private document workspace</p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-[0.35em] text-orange-200">Private workspace</p>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl font-bold tracking-[-0.05em]">
              Review important documents and ask clear questions in one secure place.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Keep reports, contracts, and research notes in one workspace built for fast answers and clean handoffs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[22px] border border-white/10 bg-white/8 p-5 backdrop-blur">
              <ShieldCheck className="h-5 w-5 text-orange-200" />
              <p className="mt-4 text-sm font-semibold">Protected access</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Private sessions for your documents and account activity.</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/8 p-5 backdrop-blur">
              <KeyRound className="h-5 w-5 text-sky-200" />
              <p className="mt-4 text-sm font-semibold">Source-backed answers</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Responses stay tied to the passages found in your library.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-[24px] border border-[var(--card-border)] bg-white p-8 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Welcome back</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.05em] text-slate-950">
            Sign in to DocuMind AI
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Continue to your document workspace and recent activity.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="test@example.com"
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(event) => {
                const nextPassword = event.target.value
                setPassword(nextPassword)
                if (nextPassword.length >= 8) {
                  setPasswordError(null)
                }
              }}
              placeholder="password123"
              helperText="Password must be at least 8 characters long."
              error={passwordError}
              minLength={8}
              required
            />
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <Button type="submit" className="w-full" loading={loading}>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            New to DocuMind?{' '}
            <Link className="font-semibold text-orange-600 hover:text-orange-500" to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
