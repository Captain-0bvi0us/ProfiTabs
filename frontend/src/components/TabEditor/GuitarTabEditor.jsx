import { useState, useCallback, useEffect, useRef } from 'react';
import {
  BEATS_PER_MEASURE, TECHNIQUES, noteLabel,
  createEmptyMeasure, GUITAR_TUNINGS, BASS_TUNINGS,
} from './constants';
import './TabEditor.css';

export default function GuitarTabEditor({ tabData, onChange, instrument, playheadMeasure, playheadBeat }) {
  const isBass = instrument === 'bass';
  const defaultTuning = isBass ? BASS_TUNINGS.standard : GUITAR_TUNINGS.standard;
  const tuning = tabData.tuning?.length ? tabData.tuning : defaultTuning;
  const stringCount = tuning.length;

  const measures = tabData.measures?.length
    ? tabData.measures
    : [createEmptyMeasure(stringCount)];

  const [selectedCell, setSelectedCell] = useState(null);
  const [activeTechnique, setActiveTechnique] = useState(null);

  const activeTechniqueRef = useRef(activeTechnique);
  activeTechniqueRef.current = activeTechnique;

  const advanceTimerRef = useRef(null);
  const pendingAdvanceRef = useRef(null);
  const hiddenInputRef = useRef(null);

  const update = useCallback((newMeasures) => {
    onChange({ ...tabData, measures: newMeasures, tuning });
  }, [tabData, onChange, tuning]);

  const cancelPendingAdvance = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    pendingAdvanceRef.current = null;
  }, []);

  const handleCellClick = (mIdx, bIdx, sIdx) => {
    cancelPendingAdvance();
    setSelectedCell({ m: mIdx, b: bIdx, s: sIdx });
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus({ preventScroll: true });
    }
  };

  const handleHiddenKeyDown = useCallback((e) => {
    if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Delete', 'Backspace'].includes(e.key)) {
      e.preventDefault();
      const evt = new KeyboardEvent('keydown', { key: e.key, bubbles: true });
      evt._fromHiddenInput = true;
      window.dispatchEvent(evt);
    }
  }, []);

  const handleHiddenInput = useCallback((e) => {
    const value = e.target.value;
    e.target.value = '';
    for (const char of value) {
      const evt = new KeyboardEvent('keydown', { key: char, bubbles: true });
      evt._fromHiddenInput = true;
      window.dispatchEvent(evt);
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!selectedCell) return;

    const tag = e.target?.tagName;
    if ((tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') && !e._fromHiddenInput) return;

    const { m, b, s } = selectedCell;
    const newMeasures = JSON.parse(JSON.stringify(measures));
    const beat = newMeasures[m].beats[b];

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      beat.notes[s] = null;
      update(newMeasures);
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      cancelPendingAdvance();
      let nb = b + 1, nm = m;
      if (nb >= BEATS_PER_MEASURE) { nb = 0; nm++; }
      if (nm < newMeasures.length) setSelectedCell({ m: nm, b: nb, s });
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      cancelPendingAdvance();
      let nb = b - 1, nm = m;
      if (nb < 0) { nb = BEATS_PER_MEASURE - 1; nm--; }
      if (nm >= 0) setSelectedCell({ m: nm, b: nb, s });
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      cancelPendingAdvance();
      if (s > 0) setSelectedCell({ m, b, s: s - 1 });
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      cancelPendingAdvance();
      if (s < stringCount - 1) setSelectedCell({ m, b, s: s + 1 });
      return;
    }

    const num = parseInt(e.key);
    if (!isNaN(num)) {
      e.preventDefault();
      const current = beat.notes[s];
      let fret;
      const canCombine = current && current.fret !== null && current.fret >= 1 && current.fret <= 9;
      if (canCombine) {
        fret = current.fret * 10 + num;
        if (fret > 24) fret = num;
      } else {
        fret = num;
      }
      const technique = activeTechniqueRef.current;
      beat.notes[s] = { fret, techniques: current?.techniques || [] };
      if (technique && !beat.notes[s].techniques.includes(technique)) {
        beat.notes[s].techniques.push(technique);
      }
      update(newMeasures);

      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);

      const shouldWait = fret >= 1 && fret <= 9 && !canCombine;
      if (shouldWait) {
        pendingAdvanceRef.current = { m, b, s };
        advanceTimerRef.current = setTimeout(() => {
          pendingAdvanceRef.current = null;
          advanceTimerRef.current = null;
          let nb = b + 1, nm = m;
          if (nb >= BEATS_PER_MEASURE) { nb = 0; nm++; }
          if (nm < newMeasures.length) setSelectedCell({ m: nm, b: nb, s });
        }, 10000);
      } else {
        pendingAdvanceRef.current = null;
        advanceTimerRef.current = null;
        let nb = b + 1, nm = m;
        if (nb >= BEATS_PER_MEASURE) { nb = 0; nm++; }
        if (nm < newMeasures.length) setSelectedCell({ m: nm, b: nb, s });
      }
    }
  }, [selectedCell, measures, stringCount, update, cancelPendingAdvance]);

  const addMeasure = () => {
    update([...measures, createEmptyMeasure(stringCount)]);
  };

  const removeMeasure = (idx) => {
    if (measures.length <= 1) return;
    const newMeasures = measures.filter((_, i) => i !== idx);
    update(newMeasures);
    setSelectedCell(null);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    return () => cancelPendingAdvance();
  }, [cancelPendingAdvance]);

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (playheadMeasure == null) return;
    const measureEl = document.querySelector(`[data-measure="${playheadMeasure}"]`);
    if (measureEl) {
      measureEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [playheadMeasure]);

  const renderCell = (mIdx, bIdx, sIdx) => {
    const beat = measures[mIdx]?.beats[bIdx];
    const note = beat?.notes?.[sIdx];
    const isSelected = selectedCell?.m === mIdx && selectedCell?.b === bIdx && selectedCell?.s === sIdx;
    const isPlayhead = playheadMeasure === mIdx && playheadBeat === bIdx;
    const isQuarterBeat = bIdx % 4 === 0;

    let display = '—';
    let className = 'tab-cell';
    if (note && note.fret !== null && note.fret !== undefined) {
      display = String(note.fret);
      if (note.techniques?.length) {
        const techStr = note.techniques.map(t => {
          const found = TECHNIQUES.find(tt => tt.key === t);
          return found ? found.label : '';
        }).filter(Boolean).join('');
        if (techStr) display += techStr;
      }
      className += ' tab-cell-filled';
    }
    if (isSelected) className += ' tab-cell-selected';
    if (isPlayhead) className += ' tab-cell-playhead';
    if (isQuarterBeat) className += ' tab-cell-beat';

    return (
      <td
        key={`${mIdx}-${bIdx}-${sIdx}`}
        className={className}
        onClick={() => handleCellClick(mIdx, bIdx, sIdx)}
      >
        <span className="tab-cell-text">{display}</span>
      </td>
    );
  };

  return (
    <div className="guitar-tab-editor">
      <input
        ref={hiddenInputRef}
        className="tab-hidden-input"
        inputMode="numeric"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        onKeyDown={handleHiddenKeyDown}
        onInput={handleHiddenInput}
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="tab-techniques">
        {TECHNIQUES.map(t => (
          <button
            key={t.key}
            className={`btn btn-sm ${activeTechnique === t.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTechnique(activeTechnique === t.key ? null : t.key)}
            title={t.name}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="tab-measures-scroll" ref={scrollContainerRef}>
        {measures.map((measure, mIdx) => (
          <div key={mIdx} className="tab-measure" data-measure={mIdx}>
            <div className="tab-measure-header">
              <span className="tab-measure-num">{mIdx + 1}</span>
              {measures.length > 1 && (
                <button
                  className="btn-icon btn-sm"
                  onClick={() => removeMeasure(mIdx)}
                  title="Удалить такт"
                >
                  ×
                </button>
              )}
            </div>
            <table className="tab-grid">
              <tbody>
                {tuning.map((note, sIdx) => (
                  <tr key={sIdx} className="tab-string-row">
                    <td className="tab-string-label">{noteLabel(note)}</td>
                    {Array.from({ length: BEATS_PER_MEASURE }, (_, bIdx) =>
                      renderCell(mIdx, bIdx, sIdx)
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <button className="btn btn-secondary" onClick={addMeasure}>
        + Добавить такт
      </button>
    </div>
  );
}
