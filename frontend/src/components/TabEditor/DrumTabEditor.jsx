import { useState, useCallback, useEffect, useRef } from 'react';
import { DRUM_LINES, BEATS_PER_MEASURE, createEmptyDrumMeasure } from './constants';
import './TabEditor.css';

export default function DrumTabEditor({ tabData, onChange, playheadMeasure, playheadBeat }) {
  const measures = tabData.measures?.length
    ? tabData.measures
    : [createEmptyDrumMeasure()];

  const [selectedCell, setSelectedCell] = useState(null);
  const hiddenInputRef = useRef(null);

  const update = useCallback((newMeasures) => {
    onChange({ ...tabData, measures: newMeasures });
  }, [tabData, onChange]);

  const toggleHit = (mIdx, bIdx, drumKey) => {
    const newMeasures = JSON.parse(JSON.stringify(measures));
    const beat = newMeasures[mIdx].beats[bIdx];
    beat.hits[drumKey] = !beat.hits[drumKey];
    update(newMeasures);
    setSelectedCell({ m: mIdx, b: bIdx, d: drumKey });
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus({ preventScroll: true });
    }
  };

  const handleKeyDown = useCallback((e) => {
    if (!selectedCell) return;

    const tag = e.target?.tagName;
    if ((tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') && !e._fromHiddenInput) return;

    const { m, b, d } = selectedCell;
    const lineIdx = DRUM_LINES.findIndex(l => l.key === d);

    if (e.key === ' ' || e.key === 'x') {
      e.preventDefault();
      const newMeasures = JSON.parse(JSON.stringify(measures));
      newMeasures[m].beats[b].hits[d] = !newMeasures[m].beats[b].hits[d];
      update(newMeasures);
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      let nb = b + 1, nm = m;
      if (nb >= BEATS_PER_MEASURE) { nb = 0; nm++; }
      if (nm < measures.length) setSelectedCell({ m: nm, b: nb, d });
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      let nb = b - 1, nm = m;
      if (nb < 0) { nb = BEATS_PER_MEASURE - 1; nm--; }
      if (nm >= 0) setSelectedCell({ m: nm, b: nb, d });
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (lineIdx > 0) setSelectedCell({ m, b, d: DRUM_LINES[lineIdx - 1].key });
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (lineIdx < DRUM_LINES.length - 1) setSelectedCell({ m, b, d: DRUM_LINES[lineIdx + 1].key });
    }
  }, [selectedCell, measures, update]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const addMeasure = () => {
    update([...measures, createEmptyDrumMeasure()]);
  };

  const removeMeasure = (idx) => {
    if (measures.length <= 1) return;
    update(measures.filter((_, i) => i !== idx));
    setSelectedCell(null);
  };

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (playheadMeasure == null) return;
    const measureEl = document.querySelector(`[data-measure="${playheadMeasure}"]`);
    if (measureEl) {
      measureEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [playheadMeasure]);

  const handleHiddenKeyDown = useCallback((e) => {
    if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', ' ', 'x'].includes(e.key)) {
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
      if (char === 'x' || char === 'X' || char === ' ') {
        const evt = new KeyboardEvent('keydown', { key: char.toLowerCase(), bubbles: true });
        evt._fromHiddenInput = true;
        window.dispatchEvent(evt);
      }
    }
  }, []);

  return (
    <div className="drum-tab-editor">
      <input
        ref={hiddenInputRef}
        className="tab-hidden-input"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        onKeyDown={handleHiddenKeyDown}
        onInput={handleHiddenInput}
        aria-hidden="true"
        tabIndex={-1}
      />
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
            <table className="tab-grid drum-grid">
              <tbody>
                {DRUM_LINES.map((line) => (
                  <tr key={line.key} className="tab-string-row drum-row">
                    <td className="tab-string-label" title={line.name}>{line.label}</td>
                    {Array.from({ length: BEATS_PER_MEASURE }, (_, bIdx) => {
                      const isHit = measure.beats[bIdx]?.hits?.[line.key];
                      const isSelected =
                        selectedCell?.m === mIdx &&
                        selectedCell?.b === bIdx &&
                        selectedCell?.d === line.key;
                      const isPlayhead = playheadMeasure === mIdx && playheadBeat === bIdx;
                      const isQuarterBeat = bIdx % 4 === 0;

                      let className = 'tab-cell drum-cell';
                      if (isHit) className += ' drum-cell-hit';
                      if (isSelected) className += ' tab-cell-selected';
                      if (isPlayhead) className += ' tab-cell-playhead';
                      if (isQuarterBeat) className += ' tab-cell-beat';

                      return (
                        <td
                          key={bIdx}
                          className={className}
                          onClick={() => toggleHit(mIdx, bIdx, line.key)}
                        >
                          {isHit ? '●' : '·'}
                        </td>
                      );
                    })}
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
