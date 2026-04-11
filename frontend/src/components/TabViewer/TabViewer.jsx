import { useRef, useEffect } from 'react';
import { DRUM_LINES, BEATS_PER_MEASURE, TECHNIQUES, noteLabel } from '../TabEditor/constants';
import '../TabEditor/TabEditor.css';

export default function TabViewer({ tab, playheadMeasure, playheadBeat }) {
  if (!tab) return null;

  const isDrums = tab.instrument === 'drums';
  const measures = tab.data?.measures || [];
  const tuning = tab.tuning || tab.data?.tuning || [];

  return (
    <div className="tab-viewer">
      <div className="tab-viewer-header card" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{tab.title}</h2>
        {tab.artist && <p style={{ color: 'var(--text-dim)', marginTop: 4 }}>{tab.artist}</p>}
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 13, color: 'var(--text-dim)' }}>
          <span>BPM: {tab.tempo || 120}</span>
          <span>Размер: {tab.time_signature_top || 4}/{tab.time_signature_bottom || 4}</span>
          <span className={`badge badge-${tab.instrument}`}>
            {tab.instrument === 'guitar' ? 'Гитара' :
             tab.instrument === 'electric' ? 'Электрогитара' :
             tab.instrument === 'bass' ? 'Бас' : 'Барабаны'}
          </span>
        </div>
      </div>

      <ViewerMeasures
        measures={measures}
        isDrums={isDrums}
        tuning={tuning}
        playheadMeasure={playheadMeasure}
        playheadBeat={playheadBeat}
      />

      {measures.length === 0 && (
        <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 40 }}>
          Табулатура пуста
        </p>
      )}
    </div>
  );
}

function ViewerMeasures({ measures, isDrums, tuning, playheadMeasure, playheadBeat }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (playheadMeasure == null) return;
    const el = document.querySelector(`[data-measure="${playheadMeasure}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [playheadMeasure]);

  return (
    <div className="tab-measures-scroll" ref={scrollRef}>
      {measures.map((measure, mIdx) => (
        <div key={mIdx} className="tab-measure" data-measure={mIdx}>
          <div className="tab-measure-header">
            <span className="tab-measure-num">{mIdx + 1}</span>
          </div>

          {isDrums ? (
            <table className="tab-grid drum-grid">
              <tbody>
                {DRUM_LINES.map((line) => (
                  <tr key={line.key} className="tab-string-row drum-row">
                    <td className="tab-string-label" title={line.name}>{line.label}</td>
                    {Array.from({ length: BEATS_PER_MEASURE }, (_, bIdx) => {
                      const isHit = measure.beats?.[bIdx]?.hits?.[line.key];
                      const isPlayhead = playheadMeasure === mIdx && playheadBeat === bIdx;
                      const isQuarterBeat = bIdx % 4 === 0;
                      let className = 'tab-cell drum-cell';
                      if (isHit) className += ' drum-cell-hit';
                      if (isPlayhead) className += ' tab-cell-playhead';
                      if (isQuarterBeat) className += ' tab-cell-beat';
                      return (
                        <td key={bIdx} className={className}>
                          {isHit ? '●' : '·'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="tab-grid">
              <tbody>
                {tuning.map((note, sIdx) => (
                  <tr key={sIdx} className="tab-string-row">
                    <td className="tab-string-label">{noteLabel(note)}</td>
                    {Array.from({ length: BEATS_PER_MEASURE }, (_, bIdx) => {
                      const noteData = measure.beats?.[bIdx]?.notes?.[sIdx];
                      const isPlayhead = playheadMeasure === mIdx && playheadBeat === bIdx;
                      const isQuarterBeat = bIdx % 4 === 0;
                      let display = '—';
                      let className = 'tab-cell';
                      if (noteData && noteData.fret !== null && noteData.fret !== undefined) {
                        display = String(noteData.fret);
                        if (noteData.techniques?.length) {
                          display += noteData.techniques.map(t => {
                            const found = TECHNIQUES.find(tt => tt.key === t);
                            return found ? found.label : '';
                          }).filter(Boolean).join('');
                        }
                        className += ' tab-cell-filled';
                      }
                      if (isPlayhead) className += ' tab-cell-playhead';
                      if (isQuarterBeat) className += ' tab-cell-beat';
                      return <td key={bIdx} className={className}>{display}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
