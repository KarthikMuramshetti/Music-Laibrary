import React, { useState, useEffect } from 'react';
import { directorsAPI, getFileUrl } from '../services/api';
import toast from 'react-hot-toast';

function DirectorModal({ director, onClose, onSave }) {
  const [name, setName] = useState(director?.directorName || '');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Enter director name'); return; }
    setLoading(true);
    try {
      if (director) {
        const { data } = await directorsAPI.update(director._id, { directorName: name });
        if (photo) {
          const fd = new FormData(); fd.append('directorPhoto', photo);
          await directorsAPI.updatePhoto(director._id, fd);
        }
        onSave({ ...data, directorName: name }, 'update');
        toast.success('Director updated');
      } else {
        const fd = new FormData();
        fd.append('directorName', name);
        if (photo) fd.append('directorPhoto', photo);
        const { data } = await directorsAPI.add(fd);
        onSave(data, 'create');
        toast.success('Director added');
      }
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{director ? 'Edit Director' : 'Add Director'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Director Name *</label>
            <input placeholder="e.g. A.R. Rahman" value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Photo (optional)</label>
            <input type="file" accept="image/*" style={{ padding: 8, cursor: 'pointer' }} onChange={e => setPhoto(e.target.files[0])} />
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

export default function AdminDirectors() {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDirector, setEditDirector] = useState(null);

  useEffect(() => {
    directorsAPI.getAll().then(r => { setDirectors(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = (d, type) => {
    if (type === 'create') setDirectors(arr => [...arr, d]);
    else setDirectors(arr => arr.map(x => x._id === d._id ? d : x));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this director?')) return;
    try {
      await directorsAPI.delete(id);
      setDirectors(arr => arr.filter(x => x._id !== id));
      toast.success('Director deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Music Directors</h1>
          <p className="page-subtitle">{directors.length} directors</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditDirector(null); setShowModal(true); }}>+ Add Director</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="grid-3">
          {directors.map(d => (
            <div key={d._id} className="card card-sm">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {d.directorPhoto
                  ? <img src={getFileUrl(d.directorPhoto)} alt={d.directorName} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border2)' }} />
                  : <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{d.directorName[0]}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.directorName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>Music Director</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
                <button className="btn-icon" onClick={() => { setEditDirector(d); setShowModal(true); }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button className="btn-icon" style={{ color: 'var(--red)' }} onClick={() => handleDelete(d._id)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <DirectorModal
          director={editDirector}
          onClose={() => { setShowModal(false); setEditDirector(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
