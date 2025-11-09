/**
 * ReviewsPage renders the nearby restaurants experience.
 * The full UI composition is implemented in the UI Composition task.
 */
export function ReviewsPage(): JSX.Element {
  return (
    <>
      <header className="mobile-shell__header">
        <h1 className="mobile-shell__title">Reviews</h1>
        <p className="mobile-shell__subtitle">Discover nearby restaurants</p>
      </header>
      <section className="mobile-shell__content">
        <p>Loading nearby restaurants...</p>
      </section>
      <footer className="mobile-shell__footer">
        <span className="muted">Navigation coming soon</span>
      </footer>
    </>
  )
}
