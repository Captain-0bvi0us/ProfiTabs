import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GuitarTabEditor from '../components/TabEditor/GuitarTabEditor';
import DrumTabEditor from '../components/TabEditor/DrumTabEditor';
import PlaybackBar from '../components/PlaybackBar/PlaybackBar';
import usePlayback from '../hooks/usePlayback';
import { GUITAR_TUNINGS, BASS_TUNINGS, createEmptyMeasure, createEmptyDrumMeasure } from '../components/TabEditor/constants';
import { api } from '../api/client';
import { saveTabOffline } from '../hooks/useOfflineTabs';

const INSTRUMENT_OPTIONS = [
  { value: 'guitar', label: 'Гитара' },
  { value: 'electric', label: 'Электрогитара' },
  { value: 'bass', label: 'Бас-гитара' },
  { value: 'drums', label: 'Барабаны' },
];

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [meta, setMeta] = useState({
    title: '',
    artist: '',
    instrument: 'guitar',
    tempo: 120,
    time_signature_top: 4,
    time_signature_bottom: 4,
  });
  const [tabData, setTabData] = useState({
    tuning: GUITAR_TUNINGS.standard,
    measures: [createEmptyMeasure(6)],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadingTab, setLoadingTab] = useState(isEdit);

  const totalMeasures = tabData.measures?.length || 0;
  const playback = usePlayback(totalMeasures, meta.tempo);

  useEffect(() => {
    if (isEdit) {
      api(`/tabs/${id}/`)
        .then(data => {
          setMeta({
            title: data.title,
            artist: data.artist,
            instrument: data.instrument,
            tempo: data.tempo,
            time_signature_top: data.time_signature_top,
            time_signature_bottom: data.time_signature_bottom,
          });
          setTabData({
            tuning: data.tuning || [],
            measures: data.data?.measures || [],
          });
        })
        .catch(() => setError('Не удалось загрузить таб'))
        .finally(() => setLoadingTab(false));
    }
  }, [id, isEdit]);

  const handleInstrumentChange = (instrument) => {
    setMeta({ ...meta, instrument });
    const isDrums = instrument === 'drums';
    const isBass = instrument === 'bass';
    if (isDrums) {
      setTabData({ measures: [createEmptyDrumMeasure()] });
    } else {
      const tuning = isBass ? BASS_TUNINGS.standard : GUITAR_TUNINGS.standard;
      setTabData({ tuning, measures: [createEmptyMeasure(tuning.length)] });
    }
  };

  const handleSave = async () => {
    if (!meta.title.trim()) {
      setError('Введите название');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...meta,
        tuning: tabData.tuning || [],
        data: { measures: tabData.measures },
      };
      let saved;
      if (isEdit) {
        saved = await api(`/tabs/${id}/`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        saved = await api('/tabs/', { method: 'POST', body: JSON.stringify(payload) });
      }
      await saveTabOffline(saved);
      navigate(`/tab/${saved.id}`);
    } catch (err) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loadingTab) {
    return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)' }}>Загрузка...</div>;
  }

  const isDrums = meta.instrument === 'drums';

  return (
    <div className="editor-page">
      <div className="editor-toolbar">
        <h2>{isEdit ? 'Редактирование' : 'Новый таб'}</h2>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="editor-meta card">
        <div className="editor-meta-grid">
          <label>
            <span>Название *</span>
            <input
              type="text"
              value={meta.title}
              onChange={e => setMeta({ ...meta, title: e.target.value })}
              placeholder="Название композиции"
            />
          </label>
          <label>
            <span>Исполнитель</span>
            <input
              type="text"
              value={meta.artist}
              onChange={e => setMeta({ ...meta, artist: e.target.value })}
              placeholder="Группа или автор"
            />
          </label>
          <label>
            <span>Инструмент</span>
            <select
              value={meta.instrument}
              onChange={e => handleInstrumentChange(e.target.value)}
              disabled={isEdit}
            >
              {INSTRUMENT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>BPM</span>
            <input
              type="number"
              value={meta.tempo}
              onChange={e => setMeta({ ...meta, tempo: parseInt(e.target.value) || 120 })}
              min={20}
              max={300}
            />
          </label>
          <label>
            <span>Размер</span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input
                type="number"
                value={meta.time_signature_top}
                onChange={e => setMeta({ ...meta, time_signature_top: parseInt(e.target.value) || 4 })}
                min={1} max={16}
                style={{ width: 60 }}
              />
              <span>/</span>
              <input
                type="number"
                value={meta.time_signature_bottom}
                onChange={e => setMeta({ ...meta, time_signature_bottom: parseInt(e.target.value) || 4 })}
                min={1} max={16}
                style={{ width: 60 }}
              />
            </div>
          </label>
        </div>
      </div>

      <div className="editor-content">
        {isDrums ? (
          <DrumTabEditor
            tabData={tabData}
            onChange={setTabData}
            playheadMeasure={playback.isPlaying ? playback.currentMeasure : undefined}
            playheadBeat={playback.isPlaying ? playback.currentBeat : undefined}
          />
        ) : (
          <GuitarTabEditor
            tabData={tabData}
            onChange={setTabData}
            instrument={meta.instrument}
            playheadMeasure={playback.isPlaying ? playback.currentMeasure : undefined}
            playheadBeat={playback.isPlaying ? playback.currentBeat : undefined}
          />
        )}
      </div>

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
