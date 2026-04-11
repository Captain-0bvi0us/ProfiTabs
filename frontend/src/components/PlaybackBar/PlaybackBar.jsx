import './PlaybackBar.css';

export default function PlaybackBar({
  isPlaying,
  onTogglePlay, onStop,
}) {
  return (
    <div className="playback-mini">
      <button className="playback-mini-btn" onClick={onStop} title="В начало">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="5" width="3" height="14" rx="1" />
          <path d="M20 5.14v13.72a1 1 0 01-1.5.86l-9-5.86a1 1 0 010-1.72l9-5.86A1 1 0 0120 5.14z" />
        </svg>
      </button>
      <button
        className={`playback-mini-btn playback-mini-play ${isPlaying ? 'is-playing' : ''}`}
        onClick={onTogglePlay}
        title={isPlaying ? 'Пауза' : 'Играть'}
      >
        {isPlaying ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86A1 1 0 008 5.14z" />
          </svg>
        )}
      </button>
    </div>
  );
}
