import React, { useState, useEffect } from 'react';
import { playlistsAPI, songsAPI } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import toast from 'react-hot-toast';

const fmt = (s) => { if (!s) return ''; const m = Math.floor(s / 60), sec = s % 60; return `${m}:${sec.toString().padStart(2, '0')}`; };

function PlaylistModal({ playlist, onClose, onSave }) {
  const [name, setName] = useState(playlist?.playlistName || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Enter a playlist name'); return; }
    setLoading(true);
    try {
      if (playlist) {
        const { data } = await playlistsAPI.update(playlist._id, { playlistName: name });
        onSave(data, 'update');
        toast.success('Playlist updated');
      } else {
        const { data } = await playlistsAPI.create({ playlistName: name });
        onSave(data, 'create');
        toast.success('Playlist created');
      }
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{playlist ? 'Edit Playlist' : 'New Playlist'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Playlist Name</label>
            <input placeholder="My Awesome Playlist" value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddSongModal({ playlist, onClose, onAdd }) {
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const existingIds = new Set((playlist.songs || []).map(s => s._id || s));

  useEffect(() => {
    songsAPI.getAll({ search }).then(r => { setSongs(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [search]);

  const add = async (song) => {
    try {
      const { data } = await playlistsAPI.addSong(playlist._id, song._id);
      onAdd(data);
      toast.success(`Added "${song.songName}"`);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Songs to "{playlist.playlistName}"</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="search-bar" style={{ marginBottom: 16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input placeholder="Search songs…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? <div className="spinner" /> :
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {songs.filter(s => !existingIds.has(s._id)).map(song => (
              <div key={song._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, marginBottom: 4, border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{song.songName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{song.artistId?.map(a => a.artistName).join(', ') || '—'}</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => add(song)}>+ Add</button>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}

export default function Playlists() {
  const { playQueue, currentSong, isPlaying } = usePlayer();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editPlaylist, setEditPlaylist] = useState(null);
  const [showAddSong, setShowAddSong] = useState(false);
  const [songSearch, setSongSearch] = useState('');

  useEffect(() => {
    playlistsAPI.getAll()
      .then(r => { setPlaylists(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = (pl, type) => {
    if (type === 'create') setPlaylists(p => [...p, pl]);
    else setPlaylists(p => p.map(x => x._id === pl._id ? pl : x));
    if (type === 'update' && selected?._id === pl._id) setSelected(pl);
  };

  const handleDelete = async (pl) => {
    if (!window.confirm(`Delete "${pl.playlistName}"?`)) return;
    try {
      await playlistsAPI.delete(pl._id);
      setPlaylists(p => p.filter(x => x._id !== pl._id));
      if (selected?._id === pl._id) setSelected(null);
      toast.success('Playlist deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleRemoveSong = async (songId) => {
    try {
      const { data } = await playlistsAPI.removeSong(selected._id, songId);
      const updated = { ...selected, songs: data.songs };
      setSelected(updated);
      setPlaylists(p => p.map(x => x._id === selected._id ? { ...x, songs: data.songs } : x));
      toast.success('Song removed');
    } catch { toast.error('Failed'); }
  };

  const handleSongAdded = (updatedPlaylist) => {
    setSelected(updatedPlaylist);
    setPlaylists(p => p.map(x => x._id === updatedPlaylist._id ? updatedPlaylist : x));
  };

  const filteredSongs = (selected?.songs || []).filter(s =>
    s.songName?.toLowerCase().includes(songSearch.toLowerCase())
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">My Playlists</h1>
          <p className="page-subtitle">{playlists.length} playlists</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditPlaylist(null); setShowModal(true); }}>
          + New Playlist
        </button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '280px 1fr' : '1fr', gap: 20, alignItems: 'start' }}>
          
          <div>
            {playlists.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎧</div>
                <div className="empty-title">No playlists yet</div>
                <div className="empty-msg">Create your first playlist!</div>
              </div>
            ) : (
              playlists.map(pl => (
                <div key={pl._id}
                  className="playlist-card"
                  style={{ marginBottom: 10, borderColor: selected?._id === pl._id ? 'var(--accent)' : '' }}
                  onClick={() => { setSelected(pl); setSongSearch(''); }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div className="playlist-name">{pl.playlistName}</div>
                      <div className="playlist-count">{pl.songs?.length || 0} songs</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button className="btn-icon" title="Edit" onClick={() => { setEditPlaylist(pl); setShowModal(true); }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="btn-icon btn-danger" style={{ background: 'none' }} title="Delete" onClick={() => handleDelete(pl)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

  
          {selected && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700 }}>{selected.playlistName}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text2)' }}>{selected.songs?.length || 0} songs</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {selected.songs?.length > 0 &&
                    <button className="btn btn-primary btn-sm" onClick={() => playQueue(selected.songs, 0)}>
                      ▶ Play All
                    </button>}
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowAddSong(true)}>+ Add Songs</button>
                </div>
              </div>

              <div className="search-bar" style={{ marginBottom: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input placeholder="Search in playlist…" value={songSearch} onChange={e => setSongSearch(e.target.value)} />
              </div>

              {filteredSongs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎵</div>
                  <div className="empty-title">No songs here</div>
                  <div className="empty-msg">Add songs from the library.</div>
                </div>
              ) : (
                <div className="card" style={{ padding: 0 }}>
                  {filteredSongs.map((song, i) => {
                    const isActive = currentSong?._id === song._id;
                    const artists = song.artistId?.map(a => a.artistName).join(', ') || '—';
                    return (
                      <div key={song._id} className={`song-row${isActive ? ' active' : ''}`} onClick={() => playQueue(filteredSongs, i)}>
                        <div className="song-num">{i + 1}</div>
                        <div className="song-info">
                          <div className={`song-name${isActive ? ' active' : ''}`}>{song.songName}</div>
                          <div className="song-meta">{artists} · {song.albumId?.albumName || '—'}</div>
                        </div>
                        <div className="song-duration">{fmt(song.duration)}</div>
                        <div onClick={e => e.stopPropagation()}>
                          <button className="btn-icon btn-sm btn-danger" style={{ background: 'none' }} onClick={() => handleRemoveSong(song._id)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <PlaylistModal
          playlist={editPlaylist}
          onClose={() => { setShowModal(false); setEditPlaylist(null); }}
          onSave={handleSave}
        />
      )}
      {showAddSong && selected && (
        <AddSongModal
          playlist={selected}
          onClose={() => setShowAddSong(false)}
          onAdd={handleSongAdded}
        />
      )}
    </div>
  );
}
