export function AnswerSkeleton() {
  return (
    <div className="mt-6 space-y-4 animate-pulse">
      <div className="rounded-2xl border border-[var(--card-border)] bg-stone-50 p-5">
        <div className="h-3 w-24 rounded-full bg-stone-200" />
        <div className="mt-4 h-4 w-full rounded-full bg-stone-200" />
        <div className="mt-3 h-4 w-11/12 rounded-full bg-stone-200" />
        <div className="mt-3 h-4 w-9/12 rounded-full bg-stone-200" />
      </div>
      <div className="rounded-2xl border border-[var(--card-border)] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="h-4 w-28 rounded-full bg-stone-200" />
          <div className="h-7 w-20 rounded-full bg-orange-100" />
        </div>
        <div className="mt-4 h-3 w-full rounded-full bg-stone-200" />
        <div className="mt-3 h-3 w-10/12 rounded-full bg-stone-200" />
        <div className="mt-3 h-3 w-8/12 rounded-full bg-stone-200" />
      </div>
    </div>
  )
}
