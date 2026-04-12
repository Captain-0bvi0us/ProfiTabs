import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <h1>
          Добро пожаловать в <span style={{ color: 'var(--purple-light)' }}>ProfiTabs</span>
        </h1>
        <p>Создавайте табулатуры, сохраняйте и делитесь файлами</p>
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
          <p>Просмотр и редактирование сохранённых табулатур</p>
        </Link>
      </div>
    </div>
  );
}
