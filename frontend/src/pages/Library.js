import React, { useState, useEffect, useCallback } from 'react';
import { songsAPI, playlistsAPI } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import toast from 'react-hot-toast';

const fmt = (s) => { if (!s) return ''; const m = Math.floor(s / 60), sec = s % 60; return `${m}:${sec.toString().padStart(2,'0')}`; };

function AddToPlaylistModal({ song, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    playlistsAPI.getAll().then(r => { setPlaylists(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const add = async (plId) => {
    try {
      await playlistsAPI.addSong(plId, song._id);
      toast.success(`Added to playlist!`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add to Playlist</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>Adding: <strong>{song.songName}</strong></p>
        {loading ? <div className="spinner" /> :
          playlists.length === 0
            ? <div style={{ color: 'var(--text2)', fontSize: 14 }}>No playlists yet. Create one first.</div>
            : playlists.map(pl => (
              <div key={pl._id} onClick={() => add(pl._id)}
                style={{ padding: '12px 14px', borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{pl.playlistName}</span>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{pl.songs?.length || 0} songs</span>
              </div>
            ))
        }
      </div>
    </div>
  );
}

export default function Library() {
  const { playSong, playQueue, currentSong, isPlaying } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterArtist, setFilterArtist] = useState('');
  const [filterAlbum, setFilterAlbum] = useState('');
  const [filterDirector, setFilterDirector] = useState('');
  const [addToPlaylistSong, setAddToPlaylistSong] = useState(null);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterArtist) params.artist = filterArtist;
      if (filterAlbum) params.album = filterAlbum;
      if (filterDirector) params.director = filterDirector;
      const { data } = await songsAPI.getAll(params);
      setSongs(data);
    } catch { toast.error('Failed to load songs'); }
    finally { setLoading(false); }
  }, [search, filterArtist, filterAlbum, filterDirector]);

  useEffect(() => {
    const t = setTimeout(fetchSongs, 350);
    return () => clearTimeout(t);
  }, [fetchSongs]);

  const clearFilters = () => { setSearch(''); setFilterArtist(''); setFilterAlbum(''); setFilterDirector(''); };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Music Library</h1>
        <p className="page-subtitle">{songs.length} songs available</p>
      </div>

      
      <div className="search-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input placeholder="Search songs…" value={search} onChange={e => setSearch(e.target.value)} />
        {(search || filterArtist || filterAlbum || filterDirector) &&
          <button onClick={clearFilters} style={{ background: 'none', color: 'var(--text3)', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>}
      </div>

      
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <input style={{ flex: 1, minWidth: 140, maxWidth: 200 }} placeholder="Filter by artist…" value={filterArtist} onChange={e => setFilterArtist(e.target.value)} />
        <input style={{ flex: 1, minWidth: 140, maxWidth: 200 }} placeholder="Filter by album…" value={filterAlbum} onChange={e => setFilterAlbum(e.target.value)} />
        <input style={{ flex: 1, minWidth: 160, maxWidth: 220 }} placeholder="Filter by music director…" value={filterDirector} onChange={e => setFilterDirector(e.target.value)} />
      </div>

      {loading ? <div className="spinner" /> : songs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎵</div>
          <div className="empty-title">No songs found</div>
          <div className="empty-msg">Try adjusting your search or filters.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          
          <div className="song-row" style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', cursor: 'default' }}>
            <div style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>#</div>
            <div style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Title</div>
            <div style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'right' }}>Duration</div>
            <div />
          </div>
          {songs.map((song, i) => {
            const isActive = currentSong?._id === song._id;
            const artists = song.artistId?.map(a => a.artistName).join(', ') || '—';
            return (
              <div key={song._id}
                className={`song-row${isActive ? ' active' : ''}`}
                onClick={() => playQueue(songs, i)}>
                <div className="song-num">
                  {isActive && isPlaying
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)"><rect x="3" y="5" width="4" height="14" rx="1"/><rect x="10" y="5" width="4" height="14" rx="1"/><rect x="17" y="5" width="4" height="14" rx="1"/></svg>
                    : <span>{i + 1}</span>
                  }
                </div>
                <div className="song-info">
                  <div className={`song-name${isActive ? ' active' : ''}`}>{song.songName}</div>
                  <div className="song-meta">{artists} · {song.albumId?.albumName || '—'} · {song.directorId?.directorName || '—'}</div>
                </div>
                <div className="song-duration">{fmt(song.duration)}</div>
                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                  <button className="btn-icon btn-sm" title="Add to playlist" onClick={() => setAddToPlaylistSong(song)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {addToPlaylistSong && (
        <AddToPlaylistModal song={addToPlaylistSong} onClose={() => setAddToPlaylistSong(null)} />
      )}
    </div>
  );
}
