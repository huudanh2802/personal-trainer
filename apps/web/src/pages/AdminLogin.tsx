import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { isAdmin, saveSession } from '../lib/auth';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@personal-trainer.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(email, password);
      const session = {
        token: res.token,
        email: res.email,
        roles: res.roles,
        expiresAt: res.expiresAt,
      };
      if (!isAdmin(session)) {
        setError('This account is not an administrator.');
        return;
      }
      saveSession(session);
      navigate('/admin/exercises');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-screen" style={{ maxWidth: 420 }}>
      <h1 className="title">Admin sign in</h1>
      <p className="subtitle">Manage exercises and weekly plans stored in the database.</p>
      <form className="glass-card" style={{ marginTop: 16 }} onSubmit={(e) => void onSubmit(e)}>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />
        <label className="label" htmlFor="password" style={{ marginTop: 12 }}>
          Password
        </label>
        <input
          id="password"
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error ? (
          <p style={{ color: 'var(--danger)', marginTop: 12, fontSize: 14 }}>{error}</p>
        ) : null}
        <button type="submit" className="btn-primary" style={{ marginTop: 16 }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
