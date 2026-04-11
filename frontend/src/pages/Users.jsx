import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function Users() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    api('/tabs/').then(data => setTabs(data.results || data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (search.length < 2) { setUsers([]); return; }
    const timer = setTimeout(() => {
      api(`/auth/users/?search=${encodeURIComponent(search)}`)
        .then(data => setUsers(data.results || data))
        .catch(() => setUsers([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleShare = async () => {
    if (!selectedUser || !selectedTab) {
      setStatus('Выберите пользователя и таб');
      return;
    }
    setSending(true);
    setStatus('');
    try {
      await api('/shares/', {
        method: 'POST',
        body: JSON.stringify({
          tab: Number(selectedTab),
          to_user: selectedUser.id,
          message,
        }),
      });
      setStatus('Таб успешно отправлен!');
      setSelectedUser(null);
      setSelectedTab('');
      setMessage('');
    } catch (err) {
      setStatus('Ошибка: ' + (err.message || 'не удалось отправить'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="users-page">
      <h2>Пользователи</h2>

      <div className="card" style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по имени..."
          style={{ width: '100%' }}
        />
      </div>

      {users.length > 0 && (
        <div className="users-list">
          {users.map(u => (
            <div
              key={u.id}
              className={`user-item card ${selectedUser?.id === u.id ? 'user-item-selected' : ''}`}
              onClick={() => setSelectedUser(u)}
            >
              <div className="user-avatar">
                {(u.profile?.display_name || u.username).charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="user-name">{u.profile?.display_name || u.username}</div>
                <div className="user-username">@{u.username}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {search.length >= 2 && users.length === 0 && (
        <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 20 }}>
          Пользователи не найдены
        </p>
      )}

      {selectedUser && (
        <div className="card share-form" style={{ marginTop: 20 }}>
          <h3>
            Отправить таб для{' '}
            <span style={{ color: 'var(--purple-light)' }}>
              {selectedUser.profile?.display_name || selectedUser.username}
            </span>
          </h3>

          <label>
            <span>Выберите таб</span>
            <select value={selectedTab} onChange={e => setSelectedTab(e.target.value)} style={{ width: '100%' }}>
              <option value="">— Выберите —</option>
              {tabs.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.artist || 'без автора'})</option>
              ))}
            </select>
          </label>

          <label>
            <span>Сообщение (необязательно)</span>
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Послушай это!"
              style={{ width: '100%' }}
            />
          </label>

          {status && (
            <div style={{ color: status.startsWith('Ошибка') ? 'var(--danger)' : 'var(--success)', fontSize: 13, marginTop: 8 }}>
              {status}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleShare}
            disabled={sending || !selectedTab}
            style={{ marginTop: 12 }}
          >
            {sending ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      )}
    </div>
  );
}
