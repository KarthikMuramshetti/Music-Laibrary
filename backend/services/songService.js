const Song = require('../models/Song');
const Notification = require('../models/Notification');
const User = require('../models/User');
const fs = require('fs');

const getAllSongs = async ({ search, artist, album, director }) => {
  let query = { isVisible: true };
  if (search) query.songName = { $regex: search, $options: 'i' };

  let result = await Song.find(query)
    .populate('albumId')
    .populate('artistId')
    .populate('directorId');

  if (artist)   result = result.filter(s => s.artistId.some(a => a.artistName?.match(new RegExp(artist, 'i'))));
  if (album)    result = result.filter(s => s.albumId?.albumName?.match(new RegExp(album, 'i')));
  if (director) result = result.filter(s => s.directorId?.directorName?.match(new RegExp(director, 'i')));

  return result;
};

const getAllSongsAdmin = async () => {
  return await Song.find({})
    .populate('albumId')
    .populate('artistId')
    .populate('directorId')
    .sort({ createdAt: -1 });
};

const addSong = async (body, filePath, adminUserId) => {
  if (!filePath) throw new Error('Song file is required');

  const song = await Song.create({
    songName:   body.songName,
    albumId:    body.albumId,
    artistId:   JSON.parse(body.artistId || '[]'),
    directorId: body.directorId,
    duration:   body.duration,
    filePath
  });

  const allUsers = await User.find({}, '_id');
  const notifications = allUsers.map(u => ({
    userId:  u._id,
    type:    'new_song',
    songId:  song._id,
    message: `New song added: ${song.songName}`
  }));

  if (notifications.length > 0) await Notification.insertMany(notifications);

  return song;
};

const getSongById = async (id) => {
  const song = await Song.findById(id)
    .populate('albumId')
    .populate('artistId')
    .populate('directorId');
  if (!song) throw new Error('Song not found');
  return song;
};


const updateSong = async (id, data) => {
  const song = await Song.findByIdAndUpdate(id, data, { returnDocument: 'after' })
    .populate('albumId')
    .populate('artistId')
    .populate('directorId');
  if (!song) throw new Error('Song not found');
  return song;
};


const deleteSong = async (id) => {
  const song = await Song.findByIdAndDelete(id);
  if (!song) throw new Error('Song not found');

  if (song.filePath && fs.existsSync(song.filePath)) {
    fs.unlinkSync(song.filePath);
  }

  return song;
};


const toggleVisibility = async (id) => {
  const song = await Song.findById(id);
  if (!song) throw new Error('Song not found');
  song.isVisible = !song.isVisible;
  await song.save();
  return song;
};

module.exports = { getAllSongs, getAllSongsAdmin, addSong, getSongById, updateSong, deleteSong, toggleVisibility };
