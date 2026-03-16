const MusicDirector = require('../models/MusicDirector');
const fs = require('fs');

const getAllDirectors = async () => await MusicDirector.find();

const addDirector = async (data, photoPath) => {
  return await MusicDirector.create({
    directorName:  data.directorName,
    directorPhoto: photoPath || null
  });
};

const updateDirector = async (id, data) => {
  const director = await MusicDirector.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  if (!director) throw new Error('Director not found');
  return director;
};

const updateDirectorPhoto = async (id, newPhotoPath) => {
  const director = await MusicDirector.findById(id);
  if (!director) throw new Error('Director not found');

  
  if (director.directorPhoto && fs.existsSync(director.directorPhoto)) {
    fs.unlinkSync(director.directorPhoto);
  }

  director.directorPhoto = newPhotoPath;
  await director.save();
  return director;
};

const deleteDirector = async (id) => {
  const director = await MusicDirector.findByIdAndDelete(id);
  if (!director) throw new Error('Director not found');


  if (director.directorPhoto && fs.existsSync(director.directorPhoto)) {
    fs.unlinkSync(director.directorPhoto);
  }

  return director;
};

module.exports = { getAllDirectors, addDirector, updateDirector, updateDirectorPhoto, deleteDirector };