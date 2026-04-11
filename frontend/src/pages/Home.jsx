import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="home-hero">
        <h1>
          Добро пожаловать, <span style={{ color: 'var(--purple-light)' }}>
            {user?.profile?.display_name || user?.username}
          </span>
        </h1>
        <p>Создавайте табулатуры и делитесь ими с друзьями</p>
      </section>

      <div className="home-grid">
        <Link to="/editor" className="home-card card">
          <div className="home-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <h3>Новый таб</h3>
          <p>Создать табулатуру для гитары, баса или барабанов</p>
        </Link>

        <Link to="/my-tabs" className="home-card card">
          <div className="home-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <h3>Мои табы</h3>
          <p>Просмотр и редактирование ваших табулатур</p>
        </Link>

        <Link to="/shared" className="home-card card">
          <div className="home-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </div>
          <h3>Входящие</h3>
          <p>Табы, которыми с вами поделились</p>
        </Link>

        <Link to="/users" className="home-card card">
          <div className="home-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <h3>Пользователи</h3>
          <p>Найти музыкантов и поделиться табами</p>
        </Link>
      </div>
    </div>
  );
}
