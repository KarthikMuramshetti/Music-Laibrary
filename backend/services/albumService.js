const Album = require('../models/Album');

const getAllAlbums = async () => await Album.find().populate('directorId');
const addAlbum = async (data) => {
  const payload = { albumName: data.albumName };
  if (data.releaseDate) payload.releaseDate = data.releaseDate;
  if (data.directorId)  payload.directorId  = data.directorId;
  return await Album.create(payload);
};

const updateAlbum = async (id, data) => {
  const album = await Album.findByIdAndUpdate(id, data, { new: true }).populate('directorId');
  if (!album) throw new Error('Album not found');
  return album;
};

const deleteAlbum = async (id) => {
  const album = await Album.findByIdAndDelete(id);
  if (!album) throw new Error('Album not found');
  return album;
};

module.exports = { getAllAlbums, addAlbum, updateAlbum, deleteAlbum };