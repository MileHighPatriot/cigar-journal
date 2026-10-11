/** Stands in for screens that come later in the Phase 1 build order. */
export function Placeholder({ title }: { title: string }) {
  return (
    <div className="page">
      <header className="page-head">
        <h1>{title}</h1>
      </header>
      <p className="muted">This screen is next in the build.</p>
    </div>
  )
}
