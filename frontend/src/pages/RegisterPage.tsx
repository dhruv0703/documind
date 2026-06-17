import { ArrowRight, ShieldPlus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
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
      await register({ name, email, password })
      navigate('/dashboard', { replace: true })
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Unable to register.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-[var(--app-shell)] lg:grid-cols-[0.95fr_1.05fr]">
      <section className="flex items-center justify-center px-6 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-[24px] border border-[var(--card-border)] bg-white p-8 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Create account</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.05em] text-slate-950">
            Start with a secure DocuMind account
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Set up access before uploading files, reviewing sources, or drafting answers.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <Input
              id="name"
              label="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Dhruv Shah"
              required
            />
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
              Create account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Already registered?{' '}
            <Link className="font-semibold text-orange-600 hover:text-orange-500" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      <section className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(249,115,22,0.24),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(96,165,250,0.16),transparent_28%),linear-gradient(160deg,#1f2027_0%,#2a2d38_55%,#373a4a_100%)]" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <div className="max-w-xl rounded-[24px] border border-white/10 bg-white/8 p-8 backdrop-blur">
            <ShieldPlus className="h-6 w-6 text-orange-200" />
            <h3 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.05em]">
              Build a private workspace for your important documents.
            </h3>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Keep uploads, document history, and question workflows together in one clean operating view.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
