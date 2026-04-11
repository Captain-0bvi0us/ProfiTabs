import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { saveTabOffline } from '../hooks/useOfflineTabs';

const INSTR_LABEL = {
  guitar: 'Гитара',
  electric: 'Электрогитара',
  bass: 'Бас',
  drums: 'Барабаны',
};

export default function SharedTabs() {
  const [tab, setTab] = useState('received');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const endpoint = tab === 'received' ? '/shares/received/' : '/shares/sent/';
    api(endpoint)
      .then(data => setItems(data.results || data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const handleSaveOffline = async (share) => {
    try {
      const fullTab = await api(`/tabs/${share.tab}/`);
      await saveTabOffline(fullTab);
      alert('Таб сохранён для офлайн-доступа!');
    } catch {
      alert('Ошибка сохранения');
    }
  };

  const markRead = async (shareId) => {
    try {
      await api(`/shares/${shareId}/read/`, { method: 'POST' });
      setItems(items.map(i => i.id === shareId ? { ...i, is_read: true } : i));
    } catch { /* ignore */ }
  };

  return (
    <div className="shared-tabs-page">
      <h2>Обмен табами</h2>

      <div className="tab-switcher">
        <button
          className={`btn ${tab === 'received' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('received')}
        >
          Полученные
        </button>
        <button
          className={`btn ${tab === 'sent' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('sent')}
        >
          Отправленные
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>Загрузка...</div>
      ) : items.length === 0 ? (
        <div className="empty-state card">
          <p>{tab === 'received' ? 'Нет полученных табов' : 'Вы пока ничего не отправляли'}</p>
        </div>
      ) : (
        <div className="tabs-list">
          {items.map(share => (
            <div key={share.id} className={`tab-item card ${!share.is_read && tab === 'received' ? 'tab-item-unread' : ''}`}>
              <div className="tab-item-main">
                <Link
                  to={`/tab/${share.tab}`}
                  className="tab-item-title"
                  onClick={() => !share.is_read && tab === 'received' && markRead(share.id)}
                >
                  {share.tab_detail?.title || `Таб #${share.tab}`}
                </Link>
                {share.tab_detail?.artist && (
                  <span className="tab-item-artist">{share.tab_detail.artist}</span>
                )}
              </div>
              <div className="tab-item-meta">
                {share.tab_detail?.instrument && (
                  <span className={`badge badge-${share.tab_detail.instrument}`}>
                    {INSTR_LABEL[share.tab_detail.instrument]}
                  </span>
                )}
                <span className="tab-item-date">
                  {tab === 'received' ? `от ${share.from_username}` : `для ${share.to_username}`}
                </span>
                <span className="tab-item-date">
                  {new Date(share.created_at).toLocaleDateString('ru')}
                </span>
              </div>
              {tab === 'received' && (
                <div className="tab-item-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => handleSaveOffline(share)}>
                    Сохранить офлайн
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
