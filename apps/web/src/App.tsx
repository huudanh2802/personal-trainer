import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import HomePage from './pages/Home';
import WorkoutPage from './pages/Workout';
import TutorialsPage from './pages/Tutorials';
import ChallengesPage from './pages/Challenges';
import PerformanceCalendarPage from './pages/PerformanceCalendar';

function AppLayout() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('webTheme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('webTheme', theme);
  }, [theme]);

  return (
    <div className="web-shell">
      <aside className="web-sidebar">
        <h2 className="web-brand">Personal Trainer</h2>
        <p className="web-brand-subtitle">Web dashboard</p>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        >
          {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
        </button>
        <nav className="web-nav">
          <NavLink className={({ isActive }) => `web-nav-link ${isActive ? 'active' : ''}`} to="/" end>
            Home
          </NavLink>
          <NavLink className={({ isActive }) => `web-nav-link ${isActive ? 'active' : ''}`} to="/workout">
            Workout
          </NavLink>
          <NavLink className={({ isActive }) => `web-nav-link ${isActive ? 'active' : ''}`} to="/calendar">
            Calendar
          </NavLink>
          <NavLink className={({ isActive }) => `web-nav-link ${isActive ? 'active' : ''}`} to="/challenges">
            Challenges
          </NavLink>
          <NavLink className={({ isActive }) => `web-nav-link ${isActive ? 'active' : ''}`} to="/tutorials">
            Tutorials
          </NavLink>
        </nav>
      </aside>
      <main className="web-content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/workout" element={<WorkoutPage />} />
        <Route path="/tutorials" element={<TutorialsPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/calendar" element={<PerformanceCalendarPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
