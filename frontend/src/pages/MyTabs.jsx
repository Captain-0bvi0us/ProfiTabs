import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { syncTabsToOffline, getAllTabsOffline } from '../hooks/useOfflineTabs';

const INSTR_LABEL = {
  guitar: 'Гитара',
  electric: 'Электрогитара',
  bass: 'Бас',
  drums: 'Барабаны',
};

export default function MyTabs() {
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (navigator.onLine) {
          const data = await api('/tabs/');
          const items = data.results || data;
          setTabs(items);
          syncTabsToOffline(items).catch(() => {});
        } else {
          const offlineTabs = await getAllTabsOffline();
          setTabs(offlineTabs);
        }
      } catch {
        const offlineTabs = await getAllTabsOffline();
        setTabs(offlineTabs);
      } finally {
        setLoading(false);
      }
    })();
  }, [offline]);

  const handleDelete = async (id) => {
    if (!confirm('Удалить эту табулатуру?')) return;
    try {
      await api(`/tabs/${id}/`, { method: 'DELETE' });
      setTabs(tabs.filter(t => t.id !== id));
    } catch (err) {
      alert('Ошибка удаления: ' + err.message);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)' }}>Загрузка...</div>;
  }

  return (
    <div className="my-tabs-page">
      <div className="page-header">
        <h2>Мои табы</h2>
        <Link to="/editor" className="btn btn-primary">+ Новый</Link>
      </div>

      {offline && (
        <div className="offline-banner">Офлайн-режим — показаны сохранённые табы</div>
      )}

      {tabs.length === 0 ? (
        <div className="empty-state card">
          <p>У вас пока нет табулатур</p>
          <Link to="/editor" className="btn btn-primary" style={{ marginTop: 12 }}>Создать первый таб</Link>
        </div>
      ) : (
        <div className="tabs-list">
          {tabs.map(tab => (
            <div key={tab.id} className="tab-item card">
              <div className="tab-item-main">
                <Link to={`/tab/${tab.id}`} className="tab-item-title">{tab.title}</Link>
                {tab.artist && <span className="tab-item-artist">{tab.artist}</span>}
              </div>
              <div className="tab-item-meta">
                <span className={`badge badge-${tab.instrument}`}>{INSTR_LABEL[tab.instrument]}</span>
                <span className="tab-item-date">
                  {new Date(tab.updated_at || tab.created_at).toLocaleDateString('ru')}
                </span>
              </div>
              <div className="tab-item-actions">
                <Link to={`/editor/${tab.id}`} className="btn btn-secondary btn-sm">Ред.</Link>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tab.id)}>Уд.</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
