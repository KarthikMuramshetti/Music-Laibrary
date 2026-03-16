# 🎵 TuneStack – Music Library Frontend

A full-featured React frontend for the Music Library MERN capstone project.

---

## ⚡ Prerequisites

Make sure you have these installed before starting:

| Tool | Version | Check with |
|------|---------|------------|
| Node.js | v16 or higher | `node -v` |
| npm | v7 or higher | `npm -v` |

> Download Node.js from: https://nodejs.org (LTS version recommended)

---

## 🚀 Setup & Run

### Step 1 — Go into the project folder
```bash
cd music-library-frontend
```

### Step 2 — Install all dependencies
```bash
npm install
```
> This installs React, React Router, Axios, and all other packages. Takes ~1-2 minutes.

### Step 3 — Configure the backend URL
```bash
# On Windows:
copy .env.example .env

# On Mac/Linux:
cp .env.example .env
```
Then open `.env` and confirm the URL matches your backend port:
```
REACT_APP_API_URL=http://localhost:5000
```

### Step 4 — Start the frontend
```bash
npm start
```
> Opens automatically at **http://localhost:3000**

---

## 🖥️ Run Both Backend & Frontend Together

Open **two terminals** side by side:

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm start          # or: node server.js
```

**Terminal 2 — Frontend:**
```bash
cd music-library-frontend
npm install
npm start
```

---

## 🔑 Default Roles

Roles must be seeded in the backend before registering:
```bash
# In your backend folder:
node seedRoles.js
```

- Register normally → gets **user** role
- To make someone admin → update their `roleId` in MongoDB manually, or seed an admin account

---

## 📄 Pages & Features

| Page | Path | Role |
|------|------|------|
| Login | `/login` | All |
| Register | `/register` | All |
| Music Library | `/library` | User + Admin |
| My Playlists | `/playlists` | User + Admin |
| Notifications | `/notifications` | User + Admin |
| Profile | `/profile` | User + Admin |
| Manage Songs | `/admin/songs` | Admin only |
| Artists | `/admin/artists` | Admin only |
| Directors | `/admin/directors` | Admin only |
| Albums | `/admin/albums` | Admin only |
| Broadcast | `/admin/notifications` | Admin only |

---

## 🛠️ Build for Production

```bash
npm run build
```
Creates an optimized production build in the `build/` folder.

---

## 🔧 Troubleshooting

**"Cannot connect to backend"**
- Make sure your backend is running on port 5000
- Check `.env` has the correct `REACT_APP_API_URL`

**"Default role not found" on register**
- Run `node seedRoles.js` in your backend folder first

**Blank page after login**
- Open browser DevTools (F12) → Console tab for errors
- Check the backend is returning a valid JWT token

**Port 3000 already in use**
- React will ask you to use a different port — press `Y` to accept
