import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Неверное имя пользователя или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form card" onSubmit={handleSubmit}>
        <div className="auth-logo">
          <svg width="48" height="48" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="12" fill="var(--purple)"/>
            <g stroke="#fff" strokeWidth="1.5" fill="none">
              {[18,24,30,36,42,48].map(y => <line key={y} x1="12" y1={y} x2="52" y2={y}/>)}
            </g>
            <text x="20" y="28" fill="#FFD700" fontFamily="monospace" fontSize="10" fontWeight="bold">5</text>
            <text x="34" y="40" fill="#FFD700" fontFamily="monospace" fontSize="10" fontWeight="bold">7</text>
          </svg>
          <h1>ProfiTabs</h1>
        </div>

        <h2>Вход</h2>

        {error && <div className="auth-error">{error}</div>}

        <label>
          <span>Имя пользователя</span>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </label>

        <label>
          <span>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>

        <p className="auth-link">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  );
}
