import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TabViewer from '../components/TabViewer/TabViewer';
import PlaybackBar from '../components/PlaybackBar/PlaybackBar';
import usePlayback from '../hooks/usePlayback';
import { api } from '../api/client';
import { getTabOffline, saveTabOffline } from '../hooks/useOfflineTabs';

export default function TabView() {
  const { id } = useParams();
  const [tab, setTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        if (navigator.onLine) {
          const data = await api(`/tabs/${id}/`);
          setTab(data);
          saveTabOffline(data).catch(() => {});
        } else {
          const cached = await getTabOffline(Number(id));
          if (cached) setTab(cached);
          else setError('Таб не найден в офлайн-хранилище');
        }
      } catch {
        const cached = await getTabOffline(Number(id));
        if (cached) setTab(cached);
        else setError('Не удалось загрузить табулатуру');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const totalMeasures = tab?.data?.measures?.length || 0;
  const tempo = tab?.tempo || 120;
  const playback = usePlayback(totalMeasures, tempo);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)' }}>Загрузка...</div>;
  if (error) return <div className="auth-error" style={{ margin: 40, textAlign: 'center' }}>{error}</div>;

  return (
    <div className="tab-view-page">
      <div className="page-header">
        <Link to="/my-tabs" className="btn btn-secondary btn-sm">&larr; Назад</Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/editor/${id}`} className="btn btn-primary btn-sm">Редактировать</Link>
          <ShareButton tabId={id} />
        </div>
      </div>

      <TabViewer
        tab={tab}
        playheadMeasure={playback.isPlaying ? playback.currentMeasure : undefined}
        playheadBeat={playback.isPlaying ? playback.currentBeat : undefined}
      />

      {totalMeasures > 0 && (
        <PlaybackBar
          isPlaying={playback.isPlaying}
          onTogglePlay={playback.togglePlay}
          onStop={playback.stop}
        />
      )}
    </div>
  );
}

function ShareButton({ tabId }) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState('');

  const handleSearch = async (q) => {
    setSearch(q);
    if (q.length < 2) { setUsers([]); return; }
    try {
      const data = await api(`/auth/users/?search=${encodeURIComponent(q)}`);
      setUsers(data.results || data);
    } catch { setUsers([]); }
  };

  const handleShare = async (userId) => {
    setSending(true);
    try {
      await api('/shares/', {
        method: 'POST',
        body: JSON.stringify({ tab: Number(tabId), to_user: userId }),
      });
      setSent('Таб отправлен!');
      setTimeout(() => { setSent(''); setOpen(false); }, 1500);
    } catch (err) {
      setSent('Ошибка: ' + (err.message || 'не удалось'));
    } finally {
      setSending(false);
    }
  };

  if (!open) {
    return <button className="btn btn-secondary btn-sm" onClick={() => setOpen(true)}>Поделиться</button>;
  }

  return (
    <div className="share-popup card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <strong>Отправить таб</strong>
        <button className="btn-icon btn-sm" onClick={() => setOpen(false)}>×</button>
      </div>
      <input
        type="text"
        value={search}
        onChange={e => handleSearch(e.target.value)}
        placeholder="Поиск пользователя..."
        style={{ width: '100%', marginBottom: 8 }}
        autoFocus
      />
      {sent && <div style={{ color: 'var(--success)', marginBottom: 8, fontSize: 13 }}>{sent}</div>}
      <div className="share-users-list">
        {users.map(u => (
          <div key={u.id} className="share-user-item">
            <span>{u.profile?.display_name || u.username}</span>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleShare(u.id)}
              disabled={sending}
            >
              Отправить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
