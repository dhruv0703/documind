import {
  ArrowRight,
  BrainCircuit,
  CloudCog,
  DatabaseZap,
  FileUp,
  Github,
  LockKeyhole,
  MessageSquareQuote,
  ShieldCheck,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { triggerHaptic } from '../lib/haptics'

const featureCards = [
  {
    title: 'PDF Upload',
    description: 'Drop in long-form documents and move them through a clean ingestion pipeline.',
    icon: FileUp,
  },
  {
    title: 'Document Q&A',
    description: 'Ask natural-language questions and get answers shaped around the strongest matching passages.',
    icon: MessageSquareQuote,
  },
  {
    title: 'Flexible storage',
    description: 'Keep source files separate from the app runtime with a storage layer built for deployment.',
    icon: CloudCog,
  },
  {
    title: 'Fast document search',
    description: 'Surface the most relevant passages quickly so answers stay anchored to source material.',
    icon: DatabaseZap,
  },
  {
    title: 'JWT Security',
    description: 'Protect documents, chat routes, and user-specific retrieval with authenticated sessions.',
    icon: LockKeyhole,
  },
  {
    title: 'Source-Grounded Answers',
    description: 'Return answer snippets with similarity cues so the response stays tied to evidence.',
    icon: ShieldCheck,
  },
]

const architectureSteps = [
  'PDF Upload',
  'Storage',
  'Text extraction',
  'Search preparation',
  'PostgreSQL',
  'Source-backed answer',
]

const techBadges = [
  'Java 21',
  'Spring Boot 3',
  'Spring AI',
  'PostgreSQL',
  'pgvector',
  'AWS S3',
  'Docker',
  'React',
  'TypeScript',
]

export function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_10%,rgba(59,130,246,0.14),transparent_22%),radial-gradient(circle_at_82%_12%,rgba(139,92,246,0.16),transparent_22%),linear-gradient(180deg,#f7f8fc_0%,#eef2ff_100%)]">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/75 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#4f46e5_55%,#7c3aed_100%)] text-lg font-black text-white shadow-[0_16px_28px_rgba(79,70,229,0.28)]">
              D
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg font-bold text-slate-950">DocuMind AI</p>
              <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Document workspace</p>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <Link
              to="/login"
              onPointerDown={() => triggerHaptic('light')}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Login
            </Link>
            <button
              type="button"
              onPointerDown={() => triggerHaptic('light')}
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#2563eb_0%,#4f46e5_55%,#7c3aed_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(79,70,229,0.22)] transition hover:translate-y-[-1px]"
            >
              Launch Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1240px] flex-col gap-8 px-5 py-10 sm:px-8 lg:py-14">
        <section className="overflow-hidden rounded-[36px] border border-white/60 bg-[linear-gradient(135deg,#0f172a_0%,#172554_34%,#312e81_70%,#6d28d9_100%)] px-7 py-10 text-white shadow-[0_30px_100px_rgba(15,23,42,0.24)] sm:px-10 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.34em] text-sky-200">AI document workspace</p>
              <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-bold tracking-[-0.06em] sm:text-6xl">
                Review, search, and question your documents from one focused workspace
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
                Bring PDFs into a clean operating view, find the right passages quickly, and draft answers without losing the source context.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onPointerDown={() => triggerHaptic('light')}
                  onClick={() => navigate(user ? '/dashboard' : '/login')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_28px_rgba(255,255,255,0.14)] transition hover:translate-y-[-1px]"
                >
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="https://github.com/dhruv0703/Mental-Bot"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
                >
                  <Github className="h-4 w-4" />
                  View GitHub
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Search layer', value: 'Passage-first retrieval' },
                { label: 'Response engine', value: 'Spring AI + Groq' },
                { label: 'Storage', value: 'Cloud-ready document storage' },
                { label: 'Security', value: 'Protected account sessions' },
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-slate-300">{item.label}</p>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-[var(--card-border)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-500">Core capabilities</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.05em] text-slate-950">
              Built for secure document review and answer workflows
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon

              return (
                <article
                  key={feature.title}
                  className="rounded-[24px] border border-[var(--card-border)] bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.03)] transition hover:-translate-y-1"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#dbeafe_0%,#e0e7ff_60%,#ede9fe_100%)] text-indigo-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[30px] border border-[var(--card-border)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-500">Architecture flow</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.05em] text-slate-950">
              From upload to source-backed answer
            </h2>

            <div className="mt-8 flex flex-col gap-3">
              {architectureSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-stone-50 px-4 py-4">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,#2563eb_0%,#7c3aed_100%)] text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <p className="truncate text-sm font-semibold text-slate-900">{step}</p>
                  </div>
                  {index < architectureSteps.length - 1 ? (
                    <ArrowRight className="hidden h-4 w-4 text-slate-400 lg:block" />
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] border border-[var(--card-border)] bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-500">Tech stack</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.05em] text-slate-950">
              Full-stack build surface
            </h2>

            <div className="mt-8 flex flex-wrap gap-3">
              {techBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_6px_18px_rgba(15,23,42,0.03)]"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="mt-8 rounded-[24px] border border-indigo-100 bg-[linear-gradient(135deg,#eef2ff_0%,#f5f3ff_50%,#eff6ff_100%)] p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#7c3aed_100%)] text-white">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Built for demo clarity</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Clear document intake, secure auth, focused search, and answer drafting from one polished workspace.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>

      <footer className="border-t border-white/60 bg-white/70 py-6 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 text-sm text-slate-500 sm:px-8">
          <span>DocuMind AI</span>
          <span>Built by Dhruv Shah</span>
        </div>
      </footer>
    </div>
  )
}
