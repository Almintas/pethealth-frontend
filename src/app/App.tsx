import { BrowserRouter } from 'react-router';
import { AppRoutes } from '../routes/AppRoutes';
import './app.css';

export default function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}
