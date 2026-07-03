# My Player

A modern frontend-only music player built with HTML, CSS, and JavaScript.

The project does not require a backend. User data is stored locally in the browser using LocalStorage and IndexedDB.

## Features

### Playback

- Play, pause, next, and previous controls
- Shuffle mode
- Repeat mode
- Volume control
- Seekable progress bar
- Crossfade transitions between songs
- Keyboard shortcuts

### Library

- Music library view
- Search by title, artist, or album
- Favorites
- Recently played songs
- Most played songs
- Listening history
- Custom playlists
- Local song upload through the app

### Statistics

- Total songs played
- Total listening time
- Most played song
- Most listened artist
- Top 10 ranking

### Interface

- Dark mode
- Light mode
- Dynamic background based on album artwork
- Responsive layout for desktop, tablet, and mobile
- Modern glassmorphism-inspired UI

## Keyboard Shortcuts

| Key   | Action         |
| ----- | -------------- |
| Space | Play / Pause   |
| ←     | Previous Track |
| →     | Next Track     |
| ↑     | Volume Up      |
| ↓     | Volume Down    |

##Web Link

```txt
https://music-player-p0wr.onrender.com/#home
```

## Running Locally

Open `index.html` in your browser.

For best compatibility, use a local web server.

### VS Code Live Server

Install the Live Server extension and click:

```txt
Open with Live Server
```

## Running with Docker

### Docker Compose

```bash
docker compose up -d --build
```

Access:

```txt
http://localhost:8080
```

### Docker

Build the image:

```bash
docker build -t my-player .
```

Run the container:

```bash
docker run -d -p 8080:80 my-player
```

Access:

```txt
http://localhost:8080
```

## Project Structure

```txt
.
├── index.html
├── css/
│   ├── style.css
│   └── component CSS files
├── js/
│   ├── state.js
│   ├── storage.js
│   ├── player.js
│   ├── ui.js
│   └── script.js
├── assets/
│   ├── capas/
│   ├── musicas/
│   └── lyrics/
├── Dockerfile
├── compose.yaml
├── LICENSE
└── README.md
```

## Adding New Songs in Code

Edit `js/state.js` and add a new item following the existing format:

```json
{
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "src": "assets/musicas/song.mp3",
  "cover": "assets/capas/cover.jpg",
  "lyrics": "assets/lyrics/song.lrc"
}
```

Then place:

- The audio file inside `assets/musicas/`
- The cover image inside `assets/capas/`
- The lyrics file inside `assets/lyrics/`

## Adding Songs in the App

Use the `+` button in the website.

Songs added through the app are saved in the browser. If browser data is cleared, uploaded songs and listening history may be lost.

## Browser Storage

The application stores data locally using:

- LocalStorage
- IndexedDB

No user data is sent to external servers.

## Technologies

- HTML5
- CSS3
- JavaScript
- LocalStorage
- IndexedDB
- Bootstrap Icons
- Docker

## License

MIT License
