export const GUITAR_TUNINGS = {
  standard: ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'],
  dropD: ['E4', 'B3', 'G3', 'D3', 'A2', 'D2'],
  openG: ['D4', 'B3', 'G3', 'D3', 'G2', 'D2'],
  dadgad: ['D4', 'A3', 'G3', 'D3', 'A2', 'D2'],
};

export const BASS_TUNINGS = {
  standard: ['G2', 'D2', 'A1', 'E1'],
  dropD: ['G2', 'D2', 'A1', 'D1'],
  five: ['G2', 'D2', 'A1', 'E1', 'B0'],
};

export const TUNING_LABELS = {
  standard: 'Стандарт',
  dropD: 'Drop D',
  openG: 'Open G',
  dadgad: 'DADGAD',
  five: '5-струнный',
};

export const DRUM_LINES = [
  { key: 'crash', label: 'CC', name: 'Crash' },
  { key: 'ride', label: 'RD', name: 'Ride' },
  { key: 'hihat', label: 'HH', name: 'Hi-Hat' },
  { key: 'tom1', label: 'T1', name: 'Tom 1' },
  { key: 'tom2', label: 'T2', name: 'Tom 2' },
  { key: 'snare', label: 'SD', name: 'Snare' },
  { key: 'kick', label: 'BD', name: 'Kick' },
];

export const TECHNIQUES = [
  { key: 'h', label: 'h', name: 'Hammer-on' },
  { key: 'p', label: 'p', name: 'Pull-off' },
  { key: 'b', label: 'b', name: 'Bend' },
  { key: 'r', label: 'r', name: 'Release' },
  { key: '/', label: '/', name: 'Slide вверх' },
  { key: '\\', label: '\\', name: 'Slide вниз' },
  { key: '~', label: '~', name: 'Vibrato' },
  { key: 'x', label: 'x', name: 'Mute' },
  { key: 'pm', label: 'PM', name: 'Palm mute' },
  { key: 't', label: 'T', name: 'Tapping' },
  { key: '<>', label: '<>', name: 'Harmonic' },
];

export const DURATIONS = [
  { value: 1, label: 'Целая' },
  { value: 2, label: 'Половинная' },
  { value: 4, label: 'Четвертная' },
  { value: 8, label: 'Восьмая' },
  { value: 16, label: 'Шестнадцатая' },
];

export const BEATS_PER_MEASURE = 16;

export function noteLabel(noteStr) {
  return noteStr.replace(/\d/, '');
}

export function createEmptyMeasure(stringCount) {
  const beats = [];
  for (let i = 0; i < BEATS_PER_MEASURE; i++) {
    const notes = {};
    for (let s = 0; s < stringCount; s++) {
      notes[s] = null;
    }
    beats.push({ notes });
  }
  return { beats };
}

export function createEmptyDrumMeasure() {
  const beats = [];
  for (let i = 0; i < BEATS_PER_MEASURE; i++) {
    const hits = {};
    for (const line of DRUM_LINES) {
      hits[line.key] = false;
    }
    beats.push({ hits });
  }
  return { beats };
}
