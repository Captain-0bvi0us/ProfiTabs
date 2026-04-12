import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import TabViewer from '../components/TabViewer/TabViewer';
import PlaybackBar from '../components/PlaybackBar/PlaybackBar';
import usePlayback from '../hooks/usePlayback';
import { getTab, exportTabToJSON } from '../hooks/useOfflineTabs';

export default function TabView() {
  const { id } = useParams();
  const [tab, setTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getTab(Number(id));
        if (data) setTab(data);
        else setError('Таб не найден');
      } catch {
        setError('Не удалось загрузить табулатуру');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const totalMeasures = tab?.data?.measures?.length || 0;
  const tempo = tab?.tempo || 120;
  const playback = usePlayback(totalMeasures, tempo);

  const handleExport = useCallback(() => {
    if (!tab) return;
    const json = exportTabToJSON(tab);
    const safeName = (tab.title || 'tab').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_');
    const filename = `${safeName}.profitabs.json`;

    const file = new File([json], filename, { type: 'application/json' });

    if (navigator.canShare?.({ files: [file] })) {
      navigator.share({
        title: tab.title,
        files: [file],
      }).catch(() => {});
    } else {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [tab]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)' }}>Загрузка...</div>;
  if (error) return <div className="auth-error" style={{ margin: 40, textAlign: 'center' }}>{error}</div>;

  return (
    <div className="tab-view-page">
      <div className="page-header">
        <Link to="/my-tabs" className="btn btn-secondary btn-sm">&larr; Назад</Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExport}>
            📤 Поделиться
          </button>
          <Link to={`/editor/${id}`} className="btn btn-primary btn-sm">Редактировать</Link>
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
