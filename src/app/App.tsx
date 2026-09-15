import './app.css';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/HomePage';

export default function App() {
  return (
    <div className="app">
      <MainLayout>
        <HomePage />
      </MainLayout>
    </div>
  );
}
