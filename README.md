# My Player

A modern music player built with HTML, CSS, and JavaScript.

This project runs entirely on the frontend, with no backend required. All user data is stored locally in the browser using LocalStorage and IndexedDB.

## Features

### Music Playback

- Play, pause, next, and previous controls
- Shuffle mode
- Repeat mode
- Volume control
- Progress bar with seek support
- Crossfade transitions between songs
- Keyboard shortcuts

### Library

- Music library management
- Search by title, artist, or album
- Favorites system
- Recently played tracks
- Most played tracks
- Listening history
- Custom playlists

### Statistics

- Total songs played
- Total listening time
- Most played song
- Most listened artist
- Top 5 most played songs

### Interface

- Dark mode
- Light mode
- Dynamic background based on album artwork
- Responsive design for desktop, tablet, and mobile
- Modern glassmorphism-inspired UI

### Storage

All information is saved locally:

- Favorites
- Playlists
- Listening history
- Statistics
- Theme preference
- Uploaded songs

## Keyboard Shortcuts

| Key   | Action         |
| ----- | -------------- |
| Space | Play / Pause   |
| ←     | Previous Track |
| →     | Next Track     |
| ↑     | Volume Up      |
| ↓     | Volume Down    |

## Running Locally

Simply open `index.html` in your browser.

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
├── style.css
├── script.js
├── musicas.json
├── assets/
│   ├── capas/
│   ├── musicas/
│   └── lyrics/
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Adding New Songs

Edit `musicas.json` and add a new item following the existing format:

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

## Browser Storage

The application stores data locally using:

- LocalStorage
- IndexedDB

No user data is sent to external servers.

## Technologies

- HTML5
- CSS3
- JavaScript (Vanilla)
- LocalStorage
- IndexedDB
- Bootstrap Icons
- Docker

## License

MIT License
