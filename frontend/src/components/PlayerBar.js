import React from 'react';
import { usePlayer } from '../context/PlayerContext';

const fmt = (s) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const Btn = ({ onClick, active, children, title }) => (
  <button className={`player-btn${active ? ' active' : ''}`} onClick={onClick} title={title}>{children}</button>
);

export default function PlayerBar() {
  const {
    currentSong, isPlaying, isRepeat, isShuffle, progress, duration, volume,
    togglePlay, playNext, playPrev, seek, setVolume, setIsRepeat, setIsShuffle,
  } = usePlayer();

  if (!currentSong) return null;

  const artistNames = currentSong.artistId?.map(a => a.artistName).join(', ') || '';
  const pct = duration ? (progress / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  };

  return (
    <div className="player-bar">
      
      <div className="player-song-info">
        <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <path d="M9 18V5l12-2v13 M6 21a3 3 0 100-6 3 3 0 000 6zm12-2a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="player-song-name">{currentSong.songName}</div>
          <div className="player-song-artist">{artistNames || currentSong.albumId?.albumName || '—'}</div>
        </div>
      </div>

     
      <div className="player-controls">
        <div className="player-btns">
          <Btn onClick={() => setIsShuffle(s => !s)} active={isShuffle} title="Shuffle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
            </svg>
          </Btn>
          <Btn onClick={playPrev} title="Previous">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 20L9 12l10-8v16z M5 19V5" />
            </svg>
          </Btn>
          <button className="player-play-btn" onClick={togglePlay}>
            {isPlaying
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            }
          </button>
          <Btn onClick={playNext} title="Next">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 4l10 8-10 8V4z M19 5v14" />
            </svg>
          </Btn>
          <Btn onClick={() => setIsRepeat(r => !r)} active={isRepeat} title="Repeat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />
            </svg>
          </Btn>
        </div>
        <div className="player-progress">
          <span className="player-time">{fmt(progress)}</span>
          <div className="progress-bar" onClick={handleProgressClick}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="player-time">{fmt(duration)}</span>
        </div>
      </div>

     
      <div className="player-right">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
        </svg>
        <input
          type="range" className="volume-slider"
          min="0" max="1" step="0.02"
          value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}
