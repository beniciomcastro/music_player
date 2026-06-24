# My Player

Music player built with HTML, CSS, and JavaScript.

## Running with Docker

```bash
docker compose up -d --build
```

Access:

```txt
http://localhost:8080
```

## Adding Songs

Edit the `musicas.json` file and add new entries following the same structure:

```json
{
  "title": "Song Title",
  "artist": "Artist",
  "album": "Album",
  "src": "assets/musicas/file.mp3",
  "cover": "assets/capas/cover.png",
  "lyrics": "assets/lyrics/lyrics.png"
}
```

Then place the `.mp3` file in `assets/musicas/` and the cover image in `assets/capas/`.

Or add new musics with the "+" button

## Songs added with "+" are saved locally in your browser cache (IndexedDB) and remain available after closing the app. They are not uploaded to a server and may be lost if browser data is cleared.

## The favorite music will not be saved, when you restart the container, it will be empty
