/* =========================
   INDEXEDDB
========================= */

function openMusicDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("myPlayerDB", 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains("musics")) {
        db.createObjectStore("musics", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveLocalMusic(music) {
  const db = await openMusicDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("musics", "readwrite");
    const store = transaction.objectStore("musics");

    store.add(music);

    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

async function loadLocalMusics() {
  const db = await openMusicDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("musics", "readonly");
    const store = transaction.objectStore("musics");
    const request = store.getAll();

    request.onsuccess = () => {
      const savedMusics = request.result.map((music) => ({
        title: music.title,
        artist: music.artist,
        album: music.album || "Local",
        src: URL.createObjectURL(music.audioBlob),
        cover: URL.createObjectURL(music.coverBlob),
        lyricsText: music.lyricsText || "",
        local: true,
      }));

      resolve(savedMusics);
    };

    request.onerror = () => reject(request.error);
  });
}


/* =========================
   LOCALSTORAGE
========================= */

function loadPlayerStats() {
  return JSON.parse(
    localStorage.getItem("playerStats") ||
      `{"totalPlays":0,"totalSeconds":0,"tracks":{},"recent":[],"history":[]}`,
  );
}

function savePlayerStats() {
  localStorage.setItem("playerStats", JSON.stringify(playerStats));
}

function loadCustomPlaylists() {
  return JSON.parse(localStorage.getItem("customPlaylists") || "[]");
}

function saveCustomPlaylists() {
  localStorage.setItem("customPlaylists", JSON.stringify(customPlaylists));
}

