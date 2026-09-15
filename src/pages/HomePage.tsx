import { useAuth } from '../features/auth';
import './home-page.css';

export function HomePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <section className="home-page" aria-labelledby="dashboard-title">
      <div className="home-page__card">
        <h1 id="dashboard-title">PetHealth Dashboard</h1>
        <p className="home-page__greeting">Hello, {user.firstName}.</p>

        <dl className="home-page__details">
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{user.role}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
