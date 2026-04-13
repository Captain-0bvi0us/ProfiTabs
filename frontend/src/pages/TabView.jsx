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

  const handleExport = useCallback(async () => {
    if (!tab) return;
    const json = exportTabToJSON(tab);
    const safeName = (tab.title || 'tab').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_');
    const filename = `${safeName}.profitabs.json`;
    const blob = new Blob([json], { type: 'application/json' });
    const file = new File([blob], filename, { type: 'application/json' });

    // 1) «Поделиться» с файлом — не проверять canShare (на мобильных часто false, хотя share работает)
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: tab.title || 'ProfiTabs',
          files: [file],
        });
        return;
      } catch (e) {
        if (e?.name === 'AbortError') return;
      }
    }

    const isIOS =
      /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // 2) На iOS / Safari скачивание через <a download> часто молча не работает — сначала буфер
    if (isIOS && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(json);
        alert('Таб скопирован в буфер как JSON. Вставь в «Файлы» или заметки и сохрани с расширением .json');
        return;
      } catch {
        /* ниже */
      }
    }

    // 3) Скачивание (на Android и десктопе обычно ок)
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.rel = 'noopener';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      return;
    } catch {
      /* ниже */
    }

    // 4) Буфер, если не iOS или iOS-clipboard не сработал
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(json);
        alert('Таб скопирован в буфер как JSON. Сохрани как файл с расширением .json');
        return;
      }
    } catch {
      /* ниже */
    }

    alert('Не удалось поделиться или скачать. Открой сайт в Chrome/Safari или сохрани таб из редактора.');
  }, [tab]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)' }}>Загрузка...</div>;
  if (error) return <div className="auth-error" style={{ margin: 40, textAlign: 'center' }}>{error}</div>;

  return (
    <div className="tab-view-page">
      <div className="page-header tab-view-header">
        <Link to="/my-tabs" className="btn btn-secondary btn-sm tab-view-header-back">
          &larr; Назад
        </Link>
        <div className="tab-view-header-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleExport}>
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
