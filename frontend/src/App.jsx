import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Editor from './pages/Editor';
import MyTabs from './pages/MyTabs';
import TabView from './pages/TabView';
import SharedTabs from './pages/SharedTabs';
import Users from './pages/Users';
import './App.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Загрузка...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: 'home', label: 'Главная' },
    { path: '/my-tabs', icon: 'music', label: 'Табы' },
    { path: '/editor', icon: 'plus', label: 'Новый' },
    { path: '/shared', icon: 'share', label: 'Обмен' },
    { path: '/users', icon: 'users', label: 'Люди' },
  ];

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link to="/" className="app-brand">
          <svg width="28" height="28" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="12" fill="var(--purple)"/>
            <g stroke="#fff" strokeWidth="2" fill="none">
              {[20,28,36,44].map(y => <line key={y} x1="14" y1={y} x2="50" y2={y}/>)}
            </g>
            <text x="22" y="32" fill="#FFD700" fontFamily="monospace" fontSize="12" fontWeight="bold">5</text>
          </svg>
          <span>ProfiTabs</span>
        </Link>
        <div className="app-header-right">
          <span className="app-user-name">{user?.profile?.display_name || user?.username}</span>
          <button className="btn btn-secondary btn-sm" onClick={logout}>Выйти</button>
        </div>
      </header>

      <main className="app-main">
        {children}
      </main>

      <nav className="app-nav">
        {navItems.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`app-nav-item ${isActive ? 'app-nav-active' : ''}`}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function NavIcon({ name }) {
  const props = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home': return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'music': return <svg {...props}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
    case 'plus': return <svg {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
    case 'share': return <svg {...props}><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>;
    case 'users': return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
    default: return null;
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/editor/:id" element={<Editor />} />
              <Route path="/my-tabs" element={<MyTabs />} />
              <Route path="/tab/:id" element={<TabView />} />
              <Route path="/shared" element={<SharedTabs />} />
              <Route path="/users" element={<Users />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}
