import './home-page.css';

export function HomePage() {
  return (
    <section className="home-page" aria-labelledby="home-page-title">
      <h1 id="home-page-title">PetHealth</h1>
      <p className="home-page__message">Application started successfully.</p>
    </section>
  );
}
