Music Library — MERN Stack Capstone Project
This is my capstone project for the Full Stack Programming course at Great Learning. I built a music library web application using the MERN stack where users can browse songs, create and manage personal playlists, and play music through a built-in audio player, while admins have full control over the content library.

What the App Does
There are two types of users in this application.
Regular users can register and log in with their email and phone number, browse the complete song library, search for songs by name, artist, album, or music director, view song details including the singer, music director, release date, and album name, create and manage multiple playlists, add or remove songs from playlists, search within playlists by song name, and play songs through a built-in audio player with play, pause, next, previous, shuffle, and repeat controls.
Admins can log in to a dedicated dashboard, perform full CRUD operations on songs including uploading MP3 files, add and manage artists and music directors with profile photos, manage albums with cover images, toggle song visibility to hide songs from users without deleting them, and send broadcast notifications to all users whenever new songs are added.

Tech Stack

Frontend — React 18, React Router v6, Custom CSS with CSS variables
Backend — Node.js, Express.js, MongoDB, Mongoose
Authentication — JWT (JSON Web Token) stored in localStorage
File Uploads — Multer (MP3 songs, artist photos, director photos, profile pictures)
Testing — Jest + React Testing Library (unit and component tests), Cypress (end-to-end tests)
Notifications — react-hot-toast for UI feedback