import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', email: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.username, form.password, form.email, form.displayName);
      navigate('/');
    } catch (err) {
      const data = err.data;
      if (data?.username) setError(`Имя: ${data.username.join(', ')}`);
      else if (data?.password) setError(`Пароль: ${data.password.join(', ')}`);
      else setError('Ошибка регистрации');
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

        <h2>Регистрация</h2>

        {error && <div className="auth-error">{error}</div>}

        <label>
          <span>Имя пользователя *</span>
          <input type="text" value={form.username} onChange={set('username')} required autoComplete="username" />
        </label>

        <label>
          <span>Отображаемое имя</span>
          <input type="text" value={form.displayName} onChange={set('displayName')} placeholder="Как вас называть" />
        </label>

        <label>
          <span>Email</span>
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" />
        </label>

        <label>
          <span>Пароль *</span>
          <input type="password" value={form.password} onChange={set('password')} required minLength={4} autoComplete="new-password" />
        </label>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>

        <p className="auth-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
}
