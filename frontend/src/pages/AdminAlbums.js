import React, { useState, useEffect } from 'react';
import { albumsAPI, directorsAPI } from '../services/api';
import toast from 'react-hot-toast';

function AlbumModal({ album, directors, onClose, onSave }) {
  const [form, setForm] = useState({
    albumName: album?.albumName || '',
    releaseDate: album?.releaseDate ? album.releaseDate.split('T')[0] : '',
    directorId: album?.directorId?._id || album?.directorId || '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

 const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.albumName.trim()) { toast.error('Enter album name'); return; }
    setLoading(true);

    
    const payload = { albumName: form.albumName };
    if (form.releaseDate) payload.releaseDate = form.releaseDate;
    if (form.directorId)  payload.directorId  = form.directorId;

    try {
      if (album) {
        const { data } = await albumsAPI.update(album._id, payload);
        onSave(data, 'update'); toast.success('Album updated');
      } else {
        const { data } = await albumsAPI.add(form);
        onSave(data, 'create'); toast.success('Album added');
      }
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{album ? 'Edit Album' : 'Add Album'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Album Name *</label>
            <input placeholder="e.g. Rockstar" value={form.albumName} onChange={set('albumName')} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Release Date</label>
            <input type="date" value={form.releaseDate} onChange={set('releaseDate')} />
          </div>
          <div className="form-group">
            <label className="form-label">Music Director</label>
            <select value={form.directorId} onChange={set('directorId')}>
              <option value="">Select director…</option>
              {directors.map(d => <option key={d._id} value={d._id}>{d.directorName}</option>)}
            </select>
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

export default function AdminAlbums() {
  const [albums, setAlbums] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAlbum, setEditAlbum] = useState(null);

  useEffect(() => {
    Promise.all([albumsAPI.getAll(), directorsAPI.getAll()])
      .then(([a, d]) => { setAlbums(a.data); setDirectors(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = (album, type) => {
    if (type === 'create') setAlbums(a => [...a, album]);
    else setAlbums(a => a.map(x => x._id === album._id ? album : x));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this album?')) return;
    try {
      await albumsAPI.delete(id);
      setAlbums(a => a.filter(x => x._id !== id));
      toast.success('Album deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Albums</h1>
          <p className="page-subtitle">{albums.length} albums</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditAlbum(null); setShowModal(true); }}>+ Add Album</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Album Name</th><th>Director</th><th>Release Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {albums.map((a, i) => (
                  <tr key={a._id}>
                    <td style={{ color: 'var(--text3)' }}>{i + 1}</td>
                    <td style={{ color: 'var(--text)', fontWeight: 600 }}>{a.albumName}</td>
                    <td>{a.directorId?.directorName || '—'}</td>
                    <td>{a.releaseDate ? new Date(a.releaseDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" onClick={() => { setEditAlbum(a); setShowModal(true); }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="btn-icon" style={{ color: 'var(--red)' }} onClick={() => handleDelete(a._id)}>
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
        <AlbumModal album={editAlbum} directors={directors}
          onClose={() => { setShowModal(false); setEditAlbum(null); }}
          onSave={handleSave} />
      )}
    </div>
  );
}
