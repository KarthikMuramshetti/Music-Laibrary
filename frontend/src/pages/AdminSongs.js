import React, { useState, useEffect } from 'react';
import { songsAPI, albumsAPI, artistsAPI, directorsAPI } from '../services/api';
import toast from 'react-hot-toast';

function SongModal({ song, albums, artists, directors, onClose, onSave }) {
  const [form, setForm] = useState({
    songName: song?.songName || '',
    albumId: song?.albumId?._id || song?.albumId || '',
    directorId: song?.directorId?._id || song?.directorId || '',
    artistId: song?.artistId?.map(a => a._id || a) || [],
    duration: song?.duration || '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const toggleArtist = (id) => {
    setForm(f => ({
      ...f,
      artistId: f.artistId.includes(id) ? f.artistId.filter(x => x !== id) : [...f.artistId, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.songName || !form.albumId || !form.directorId) { toast.error('Fill required fields'); return; }
    if (!song && !file) { toast.error('Upload a song file'); return; }
    setLoading(true);
    try {
      if (song) {
        const { data } = await songsAPI.update(song._id, form);
        onSave(data, 'update');
        toast.success('Song updated');
      } else {
        const fd = new FormData();
        fd.append('songName', form.songName);
        fd.append('albumId', form.albumId);
        fd.append('directorId', form.directorId);
        fd.append('artistId', JSON.stringify(form.artistId));
        if (form.duration) fd.append('duration', form.duration);
        fd.append('songFile', file);
        const { data } = await songsAPI.add(fd);
        onSave(data, 'create');
        toast.success('Song added!');
      }
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{song ? 'Edit Song' : 'Add Song'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Song Name *</label>
            <input placeholder="e.g. Jai Ho" value={form.songName} onChange={set('songName')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Album *</label>
              <select value={form.albumId} onChange={set('albumId')}>
                <option value="">Select album…</option>
                {albums.map(a => <option key={a._id} value={a._id}>{a.albumName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Music Director *</label>
              <select value={form.directorId} onChange={set('directorId')}>
                <option value="">Select director…</option>
                {directors.map(d => <option key={d._id} value={d._id}>{d.directorName}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Duration (seconds)</label>
            <input type="number" placeholder="e.g. 240" value={form.duration} onChange={set('duration')} />
          </div>
          <div className="form-group">
            <label className="form-label">Artists</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '10px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border2)' }}>
              {artists.map(a => (
                <label key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, padding: '4px 10px', borderRadius: 20, background: form.artistId.includes(a._id) ? 'var(--accent-dim)' : 'var(--bg4)', color: form.artistId.includes(a._id) ? 'var(--accent)' : 'var(--text2)', border: `1px solid ${form.artistId.includes(a._id) ? 'var(--accent)' : 'var(--border)'}`, transition: 'all 0.15s' }}>
                  <input type="checkbox" style={{ width: 'auto', display: 'none' }} checked={form.artistId.includes(a._id)} onChange={() => toggleArtist(a._id)} />
                  {a.artistName}
                </label>
              ))}
            </div>
          </div>
          {!song && (
            <div className="form-group">
              <label className="form-label">Song File (mp3) *</label>
              <input type="file" accept="audio/*" style={{ padding: '8px', cursor: 'pointer' }} onChange={e => setFile(e.target.files[0])} />
            </div>
          )}
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Song'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminSongs() {
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSong, setEditSong] = useState(null);

  useEffect(() => {
    Promise.all([songsAPI.getAllAdmin(), albumsAPI.getAll(), artistsAPI.getAll(), directorsAPI.getAll()])
      .then(([s, al, ar, d]) => {
        setSongs(s.data); setAlbums(al.data); setArtists(ar.data); setDirectors(d.data);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  const handleSave = (song, type) => {
    if (type === 'create') setSongs(s => [song, ...s]);
    else setSongs(s => s.map(x => x._id === song._id ? song : x));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this song?')) return;
    try {
      await songsAPI.delete(id);
      setSongs(s => s.filter(x => x._id !== id));
      toast.success('Song deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await songsAPI.toggleVisibility(id);
      setSongs(s => s.map(x => x._id === id ? { ...x, isVisible: data.song.isVisible } : x));
      toast.success(data.message);
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Manage Songs</h1>
          <p className="page-subtitle">{songs.length} songs in library</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditSong(null); setShowModal(true); }}>+ Add Song</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Song Name</th><th>Album</th><th>Director</th><th>Artists</th><th>Visible</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((s, i) => (
                  <tr key={s._id}>
                    <td style={{ color: 'var(--text3)' }}>{i + 1}</td>
                    <td style={{ color: 'var(--text)', fontWeight: 600 }}>{s.songName}</td>
                    <td>{s.albumId?.albumName || '—'}</td>
                    <td>{s.directorId?.directorName || '—'}</td>
                    <td>{s.artistId?.map(a => a.artistName).join(', ') || '—'}</td>
                    <td>
                      <span className={`badge ${s.isVisible ? 'badge-green' : 'badge-red'}`}>
                        {s.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" title="Toggle visibility" onClick={() => handleToggle(s._id)}>
                          {s.isVisible
                            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          }
                        </button>
                        <button className="btn-icon" title="Edit" onClick={() => { setEditSong(s); setShowModal(true); }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="btn-icon" title="Delete" onClick={() => handleDelete(s._id)} style={{ color: 'var(--red)' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <SongModal
          song={editSong} albums={albums} artists={artists} directors={directors}
          onClose={() => { setShowModal(false); setEditSong(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
