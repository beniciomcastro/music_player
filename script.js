let musics = [];
let currentIndex = Number(localStorage.getItem("playerIndex")) || 0;
let isPlaying = false;
let shuffle = localStorage.getItem("playerShuffle") === "true";
let repeat = localStorage.getItem("playerRepeat") === "true";
let favoriteSrcs = JSON.parse(localStorage.getItem("favoriteMusics") || "[]");

let shouldRestoreTime = true;
let nextShuffleIndex = null;

let lyricsVisible = false;
let syncedLyrics = [];
let currentLyricIndex = -1;
const lyricsCache = {};

const mainTitle = document.getElementById("mainTitle");
const mainArtist = document.getElementById("mainArtist");
const heroCover = document.getElementById("heroCover");
const mainPlayIcon = document.getElementById("mainPlayIcon");
const mainProgress = document.getElementById("mainProgress");
const mainCurrentTime = document.getElementById("mainCurrentTime");
const mainDuration = document.getElementById("mainDuration");
const lyricsBox = document.getElementById("lyricsBox");
const lyricsLine = document.getElementById("lyricsLine");
const mainLyricsBtn = document.getElementById("mainLyricsBtn");

const mainPlayBtn = document.getElementById("mainPlayBtn");
const mainPrevBtn = document.getElementById("mainPrevBtn");
const mainNextBtn = document.getElementById("mainNextBtn");
const mainShuffleBtn = document.getElementById("mainShuffleBtn");
const mainRepeatBtn = document.getElementById("mainRepeatBtn");
const mainFavoriteBtn = document.getElementById("mainFavoriteBtn");

const libraryMusicList = document.getElementById("libraryMusicList");
const librarySearch = document.getElementById("librarySearch");
const libraryPlayerCover = document.getElementById("libraryPlayerCover");
const libraryPlayerTitle = document.getElementById("libraryPlayerTitle");
const libraryPlayerArtist = document.getElementById("libraryPlayerArtist");
const libraryPlayIcon = document.getElementById("libraryPlayIcon");
const libraryProgress = document.getElementById("libraryProgress");
const libraryCurrentTime = document.getElementById("libraryCurrentTime");
const libraryDuration = document.getElementById("libraryDuration");
const libraryPlayBtn = document.getElementById("libraryPlayBtn");
const libraryPrevBtn = document.getElementById("libraryPrevBtn");
const libraryNextBtn = document.getElementById("libraryNextBtn");

const favoritesGrid = document.getElementById("favoritesGrid");

const globalAudio = document.getElementById("globalAudio");
const volumeControl = document.getElementById("volumeControl");
const globalCover = document.getElementById("globalCover");
const globalTitle = document.getElementById("globalTitle");
const globalArtist = document.getElementById("globalArtist");
const globalPlayIcon = document.getElementById("globalPlayIcon");
const globalProgress = document.getElementById("globalProgress");
const globalCurrentTime = document.getElementById("globalCurrentTime");
const globalDuration = document.getElementById("globalDuration");
const globalPlayBtn = document.getElementById("globalPlayBtn");
const globalPrevBtn = document.getElementById("globalPrevBtn");
const globalNextBtn = document.getElementById("globalNextBtn");
const globalShuffleBtn = document.getElementById("globalShuffleBtn");
const globalRepeatBtn = document.getElementById("globalRepeatBtn");
const globalFavoriteBtn = document.getElementById("globalFavoriteBtn");

const nextMusicTitle = document.getElementById("nextMusicTitle");
const nextMusicArtist = document.getElementById("nextMusicArtist");
const nextMusicCover = document.getElementById("nextMusicCover");

const addMusicForm = document.getElementById("addMusicForm");
const newMusicTitle = document.getElementById("newMusicTitle");
const newMusicArtist = document.getElementById("newMusicArtist");
const newMusicAlbum = document.getElementById("newMusicAlbum");
const newMusicAudio = document.getElementById("newMusicAudio");
const newMusicCover = document.getElementById("newMusicCover");
const newMusicLyrics = document.getElementById("newMusicLyrics");
const addMusicMessage = document.getElementById("addMusicMessage");

/* =========================
   CARREGAMENTO
========================= */

async function loadMusicsFromJson() {
  const response = await fetch("musicas.json");

  if (!response.ok) {
    throw new Error("Não foi possível carregar musicas.json");
  }

  const jsonMusics = await response.json();
  const localMusics = await loadLocalMusics();

  musics = [...jsonMusics, ...localMusics];

  if (!Array.isArray(musics) || musics.length === 0) {
    throw new Error("Nenhuma música encontrada");
  }

  if (currentIndex < 0 || currentIndex >= musics.length) {
    currentIndex = 0;
  }
}

async function initApp() {
  try {
    await loadMusicsFromJson();

    initPageNavigation();
    initGlobalPlayer();
    initControls();
    renderLibrarySongs();
    renderFavorites();
    updateVisuals();
    updatePlayIcons();

    preloadAllLyrics();
    loadLyrics(currentIndex);

    document.querySelectorAll('input[type="range"]').forEach((range) => {
      updateRangeProgress(range);
    });
  } catch (error) {
    console.error(error);

    if (libraryMusicList) {
      libraryMusicList.innerHTML = `
        <div class="library-empty">
          Erro ao carregar suas músicas. Verifique o arquivo musicas.json.
        </div>
      `;
    }
  }
}

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
   NAVEGAÇÃO INTERNA
========================= */

function initPageNavigation() {
  const pageLinks = document.querySelectorAll("[data-page]");
  const pages = document.querySelectorAll(".page");

  if (pageLinks.length === 0 || pages.length === 0) return;

  pageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const pageId = link.dataset.page;

      showPage(pageId);
      history.pushState(null, "", link.getAttribute("href"));
    });
  });

  window.addEventListener("popstate", () => {
    const pageId = getPageFromHash();
    showPage(pageId);
  });

  showPage(getPageFromHash());
}

function getPageFromHash() {
  const hash = window.location.hash;

  if (hash === "#biblioteca") return "libraryPage";
  if (hash === "#favoritas") return "favoritesPage";
  if (hash === "#adicionar") return "addMusicPage";

  return "homePage";
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.hidden = page.id !== pageId;
    page.classList.toggle("active-page", page.id === pageId);
  });

  document.querySelectorAll("[data-page]").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === pageId);
  });

  if (pageId === "libraryPage") {
    renderLibrarySongs();
  }

  if (pageId === "favoritesPage") {
    renderFavorites();
  }

  document.querySelectorAll('input[type="range"]').forEach((range) => {
    updateRangeProgress(range);
  });
}

/* =========================
   PLAYER GLOBAL
========================= */

function hasGlobalPlayer() {
  return (
    globalAudio &&
    globalCover &&
    globalTitle &&
    globalArtist &&
    globalPlayIcon &&
    globalProgress &&
    globalCurrentTime &&
    globalDuration
  );
}

function getCurrentMusic() {
  return musics[currentIndex];
}

function loadGlobalMusic(index = currentIndex, keepTime = false) {
  if (!hasGlobalPlayer() || musics.length === 0) return;

  currentIndex = index;
  const music = getCurrentMusic();

  shouldRestoreTime = keepTime;

  globalAudio.src = music.src;
  globalAudio.loop = repeat;

  globalCover.src = music.cover;
  globalTitle.textContent = music.title;
  globalArtist.textContent = music.artist;

  resetProgress();

  localStorage.setItem("playerIndex", currentIndex);

  if (!keepTime) {
    globalAudio.currentTime = 0;
    localStorage.setItem("playerTime", "0");
  }

  loadLyrics(currentIndex);
  updateVisuals();
}

function playGlobalMusic(index = currentIndex) {
  if (!hasGlobalPlayer() || musics.length === 0) return;

  const sameMusic = index === currentIndex && globalAudio.src;

  if (!sameMusic) {
    loadGlobalMusic(index, false);
    globalAudio.currentTime = 0;
    localStorage.setItem("playerTime", "0");
  }

  globalAudio
    .play()
    .then(() => {
      isPlaying = true;
      updatePlayIcons();
      saveState();
    })
    .catch(() => {
      isPlaying = false;
      updatePlayIcons();
    });
}

function pauseGlobalMusic() {
  if (!hasGlobalPlayer()) return;

  globalAudio.pause();
  isPlaying = false;
  updatePlayIcons();
  saveState();
}

function toggleGlobalPlay() {
  isPlaying ? pauseGlobalMusic() : playGlobalMusic(currentIndex);
}

function nextGlobalMusic() {
  if (musics.length === 0) return;

  if (shuffle) {
    const indexToPlay = getNextMusicIndex();
    nextShuffleIndex = null;
    playGlobalMusic(indexToPlay);
    return;
  }

  playGlobalMusic((currentIndex + 1) % musics.length);
}

function prevGlobalMusic() {
  if (musics.length === 0) return;

  playGlobalMusic((currentIndex - 1 + musics.length) % musics.length);
}

function initGlobalPlayer() {
  if (!hasGlobalPlayer()) return;

  const wasPlaying = localStorage.getItem("playerPlaying") === "true";
  const savedVolume = localStorage.getItem("playerVolume");

  if (savedVolume !== null) {
    globalAudio.volume = savedVolume / 100;

    if (volumeControl) {
      volumeControl.value = savedVolume;
    }
  } else {
    globalAudio.volume = 0.5;

    if (volumeControl) {
      volumeControl.value = 50;
    }
  }

  if (volumeControl) {
    updateRangeProgress(volumeControl);
  }

  loadGlobalMusic(currentIndex, true);

  globalAudio.addEventListener("loadedmetadata", () => {
    if (shouldRestoreTime) {
      const savedIndex = Number(localStorage.getItem("playerIndex"));
      const savedTime = Number(localStorage.getItem("playerTime")) || 0;

      if (
        savedIndex === currentIndex &&
        savedTime > 0 &&
        savedTime < globalAudio.duration
      ) {
        globalAudio.currentTime = savedTime;
      }

      shouldRestoreTime = false;
    } else {
      globalAudio.currentTime = 0;
      localStorage.setItem("playerTime", "0");
    }

    syncProgress();

    if (wasPlaying) {
      playGlobalMusic(currentIndex);
    }
  });

  globalAudio.addEventListener("timeupdate", syncProgress);

  globalAudio.addEventListener("ended", () => {
    if (repeat) return;
    nextGlobalMusic();
  });
}

/* =========================
   ESTADO
========================= */

function saveState() {
  if (!hasGlobalPlayer()) return;

  localStorage.setItem("playerIndex", currentIndex);
  localStorage.setItem("playerTime", globalAudio.currentTime || 0);
  localStorage.setItem("playerPlaying", isPlaying ? "true" : "false");
  localStorage.setItem("playerShuffle", shuffle ? "true" : "false");
  localStorage.setItem("playerRepeat", repeat ? "true" : "false");
}

function resetProgress() {
  [globalProgress, mainProgress, libraryProgress].forEach((progress) => {
    if (!progress) return;

    progress.value = 0;
    updateRangeProgress(progress);
  });

  [globalCurrentTime, mainCurrentTime, libraryCurrentTime].forEach((item) => {
    if (item) item.textContent = "0:00";
  });

  [globalDuration, mainDuration, libraryDuration].forEach((item) => {
    if (item) item.textContent = "0:00";
  });
}

function syncProgress() {
  if (!hasGlobalPlayer() || !globalAudio.duration) return;

  const current = globalAudio.currentTime;
  const duration = globalAudio.duration;

  [globalProgress, mainProgress, libraryProgress].forEach((progress) => {
    if (!progress) return;

    progress.max = duration;
    progress.value = current;
    updateRangeProgress(progress);
  });

  [globalCurrentTime, mainCurrentTime, libraryCurrentTime].forEach((item) => {
    if (item) item.textContent = formatTime(current);
  });

  [globalDuration, mainDuration, libraryDuration].forEach((item) => {
    if (item) item.textContent = formatTime(duration);
  });

  updateLyrics();
  saveState();
}

/* =========================
   CONTROLES
========================= */

function initControls() {
  if (mainPlayBtn) mainPlayBtn.addEventListener("click", toggleGlobalPlay);
  if (mainPrevBtn) mainPrevBtn.addEventListener("click", prevGlobalMusic);
  if (mainNextBtn) mainNextBtn.addEventListener("click", nextGlobalMusic);
  if (mainShuffleBtn) mainShuffleBtn.addEventListener("click", toggleShuffle);
  if (mainRepeatBtn) mainRepeatBtn.addEventListener("click", toggleRepeat);
  if (mainFavoriteBtn)
    mainFavoriteBtn.addEventListener("click", toggleFavorite);

  if (libraryPlayBtn)
    libraryPlayBtn.addEventListener("click", toggleGlobalPlay);
  if (libraryPrevBtn) libraryPrevBtn.addEventListener("click", prevGlobalMusic);
  if (libraryNextBtn) libraryNextBtn.addEventListener("click", nextGlobalMusic);

  if (globalPlayBtn) globalPlayBtn.addEventListener("click", toggleGlobalPlay);
  if (globalPrevBtn) globalPrevBtn.addEventListener("click", prevGlobalMusic);
  if (globalNextBtn) globalNextBtn.addEventListener("click", nextGlobalMusic);
  if (globalShuffleBtn)
    globalShuffleBtn.addEventListener("click", toggleShuffle);
  if (globalRepeatBtn) globalRepeatBtn.addEventListener("click", toggleRepeat);
  if (globalFavoriteBtn)
    globalFavoriteBtn.addEventListener("click", toggleFavorite);

  if (mainLyricsBtn) {
    mainLyricsBtn.addEventListener("click", toggleLyrics);
  }

  if (volumeControl) {
    volumeControl.addEventListener("input", () => {
      const volume = volumeControl.value;

      globalAudio.volume = volume / 100;
      localStorage.setItem("playerVolume", volume);

      updateRangeProgress(volumeControl);
    });
  }

  [mainProgress, libraryProgress, globalProgress].forEach((progress) => {
    if (!progress) return;

    progress.addEventListener("input", () => {
      if (globalAudio) {
        globalAudio.currentTime = progress.value;
        updateRangeProgress(progress);
        updateLyrics(true);
      }
    });
  });

  if (librarySearch) {
    librarySearch.addEventListener("input", () => {
      const term = librarySearch.value.toLowerCase().trim();

      const filtered = musics.filter((music) =>
        `${music.title} ${music.artist} ${music.album}`
          .toLowerCase()
          .includes(term),
      );

      renderLibrarySongs(filtered);
    });
  }

  if (addMusicForm) {
    addMusicForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const audioFile = newMusicAudio.files[0];
      const coverFile = newMusicCover.files[0];
      const lyricsText = newMusicLyrics.value.trim();

      if (!audioFile || !coverFile) return;

      await saveLocalMusic({
        title: newMusicTitle.value.trim(),
        artist: newMusicArtist.value.trim(),
        album: newMusicAlbum.value.trim() || "Local",
        audioBlob: audioFile,
        coverBlob: coverFile,
        lyricsText,
      });

      if (addMusicMessage) {
        addMusicMessage.textContent = "Música adicionada com sucesso.";
      }

      addMusicForm.reset();

      await loadMusicsFromJson();
      renderLibrarySongs();
      renderFavorites();
      updateVisuals();
    });
  }
}

/* =========================
   VISUAL
========================= */

function updateRangeProgress(range) {
  const min = Number(range.min || 0);
  const max = Number(range.max || 100);
  const value = Number(range.value);

  if (max <= min) {
    range.style.setProperty("--progress", "0%");
    return;
  }

  const percent = ((value - min) * 100) / (max - min);

  range.style.setProperty("--progress", `${percent}%`);
}

function updateVisuals() {
  const music = getCurrentMusic();
  if (!music) return;

  if (mainTitle) mainTitle.textContent = music.title;
  if (mainArtist) mainArtist.textContent = music.artist;
  if (heroCover) heroCover.src = music.cover;

  if (libraryPlayerCover) libraryPlayerCover.src = music.cover;
  if (libraryPlayerTitle) libraryPlayerTitle.textContent = music.title;
  if (libraryPlayerArtist) libraryPlayerArtist.textContent = music.artist;

  document.querySelectorAll(".library-song").forEach((song) => {
    const isCurrent = Number(song.dataset.index) === currentIndex;

    song.classList.toggle("active", isCurrent);
    song.classList.toggle("playing", isCurrent && isPlaying);
  });

  document.querySelectorAll(".favorite-card").forEach((card) => {
    const isCurrent = Number(card.dataset.index) === currentIndex;

    card.classList.toggle("active", isCurrent);
    card.classList.toggle("playing", isCurrent && isPlaying);
  });

  updateFavoriteButtons();
  updateActiveButtons();
  updatePlayIcons();
  updateNextMusicPreview();
}

function updatePlayIcons() {
  const icon = isPlaying ? "bi bi-pause-fill" : "bi bi-play-fill";

  if (globalPlayIcon) globalPlayIcon.className = icon;
  if (mainPlayIcon) mainPlayIcon.className = icon;
  if (libraryPlayIcon) libraryPlayIcon.className = icon;

  document.querySelectorAll(".library-song").forEach((song) => {
    const isCurrent = Number(song.dataset.index) === currentIndex;

    song.classList.toggle("playing", isCurrent && isPlaying);
  });

  document.querySelectorAll(".favorite-card").forEach((card) => {
    const isCurrent = Number(card.dataset.index) === currentIndex;

    card.classList.toggle("playing", isCurrent && isPlaying);
  });
}

function updateActiveButtons() {
  if (mainShuffleBtn) mainShuffleBtn.classList.toggle("active", shuffle);
  if (globalShuffleBtn) globalShuffleBtn.classList.toggle("active", shuffle);

  if (mainRepeatBtn) mainRepeatBtn.classList.toggle("active", repeat);
  if (globalRepeatBtn) globalRepeatBtn.classList.toggle("active", repeat);
}

/* =========================
   FAVORITOS
========================= */

function isFavorite(music = getCurrentMusic()) {
  if (!music) return false;

  return favoriteSrcs.includes(music.src);
}

function saveFavorites() {
  localStorage.setItem("favoriteMusics", JSON.stringify(favoriteSrcs));
}

function toggleFavorite() {
  const music = getCurrentMusic();
  if (!music) return;

  if (isFavorite(music)) {
    favoriteSrcs = favoriteSrcs.filter((src) => src !== music.src);
  } else {
    favoriteSrcs.push(music.src);
  }

  saveFavorites();
  updateFavoriteButtons();
  renderFavorites();
}

function updateFavoriteButtons() {
  const active = isFavorite();
  const icon = active
    ? '<i class="bi bi-heart-fill"></i>'
    : '<i class="bi bi-heart"></i>';

  if (mainFavoriteBtn) {
    mainFavoriteBtn.innerHTML = icon;
    mainFavoriteBtn.classList.toggle("active", active);
  }

  if (globalFavoriteBtn) {
    globalFavoriteBtn.innerHTML = icon;
    globalFavoriteBtn.classList.toggle("active", active);
  }
}

/* =========================
   SHUFFLE / REPEAT / PRÓXIMA
========================= */

function toggleShuffle() {
  shuffle = !shuffle;
  nextShuffleIndex = null;
  updateNextMusicPreview();
  updateActiveButtons();
  saveState();
}

function toggleRepeat() {
  repeat = !repeat;

  if (globalAudio) {
    globalAudio.loop = repeat;
  }

  updateNextMusicPreview();
  updateActiveButtons();
  saveState();
}

function getNextMusicIndex() {
  if (musics.length === 0) return null;

  if (!shuffle) {
    return (currentIndex + 1) % musics.length;
  }

  if (
    nextShuffleIndex === null ||
    nextShuffleIndex === currentIndex ||
    nextShuffleIndex >= musics.length
  ) {
    do {
      nextShuffleIndex = Math.floor(Math.random() * musics.length);
    } while (nextShuffleIndex === currentIndex && musics.length > 1);
  }

  return nextShuffleIndex;
}

function updateNextMusicPreview() {
  if (
    !nextMusicTitle ||
    !nextMusicArtist ||
    !nextMusicCover ||
    musics.length === 0
  ) {
    return;
  }

  let nextMusic;

  if (repeat) {
    nextMusic = getCurrentMusic();
  } else {
    const nextIndex = getNextMusicIndex();
    if (nextIndex === null) return;

    nextMusic = musics[nextIndex];
  }

  nextMusicCover.src = nextMusic.cover;
  nextMusicTitle.textContent = nextMusic.title;
  nextMusicArtist.textContent = nextMusic.artist;
}

/* =========================
   BIBLIOTECA
========================= */

function renderLibrarySongs(list = musics) {
  if (!libraryMusicList) return;

  libraryMusicList.innerHTML = "";

  if (list.length === 0) {
    libraryMusicList.innerHTML = `
      <div class="library-empty">
        Nenhuma música encontrada.
      </div>
    `;
    return;
  }

  list.forEach((music) => {
    const originalIndex = musics.indexOf(music);
    const song = document.createElement("article");

    song.className = "library-song";
    song.dataset.index = originalIndex;

    song.innerHTML = `
      <img src="${music.cover}" alt="${music.title}" />

      <div>
        <h3>${music.title}</h3>
        <p>${music.artist}</p>
      </div>

      <button class="library-status" type="button" aria-label="Música tocando">
        <i class="bi bi-play-fill"></i>

        <span class="sound-bars" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
    `;

    song.addEventListener("click", () => {
      playGlobalMusic(originalIndex);
    });

    libraryMusicList.appendChild(song);
  });

  updateVisuals();
}

function renderFavorites() {
  if (!favoritesGrid) return;

  favoritesGrid.innerHTML = "";

  const favorites = musics.filter((music) => isFavorite(music));

  if (favorites.length === 0) {
    favoritesGrid.innerHTML = `
      <div class="library-empty">
        Nenhuma música favorita ainda.
      </div>
    `;
    return;
  }

  favorites.forEach((music) => {
    const originalIndex = musics.indexOf(music);
    const card = document.createElement("article");

    card.className = "favorite-card";
    card.dataset.index = originalIndex;

    card.innerHTML = `
      <img src="${music.cover}" alt="${music.title}" />

      <button class="card-play" type="button">
        <i class="bi bi-play-fill"></i>

        <span class="sound-bars" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      <h3>${music.title}</h3>
      <p>${music.artist}</p>
    `;

    card.addEventListener("click", () => {
      playGlobalMusic(originalIndex);
    });

    favoritesGrid.appendChild(card);
  });

  updateVisuals();
}

/* =========================
   LETRA LOCAL
========================= */

function preloadAllLyrics() {
  musics.forEach((music, index) => {
    loadLyrics(index);
  });
}

function getLyricsPath(music) {
  return music.lyrics || music.lrc || music.lyric || "";
}

async function loadLyrics(index = currentIndex) {
  if (!lyricsLine) return;

  const music = musics[index];
  if (!music) return;

  if (music.lyricsText) {
    const parsedLyrics = parseSyncedLyrics(music.lyricsText);
    lyricsCache[music.src] = parsedLyrics;

    if (index === currentIndex) {
      syncedLyrics = parsedLyrics;
      currentLyricIndex = -1;
      updateLyrics(true);
    }

    return;
  }

  const lyricsPath = getLyricsPath(music);

  if (index === currentIndex) {
    syncedLyrics = [];
    currentLyricIndex = -1;
    lyricsLine.textContent = "...";
  }

  if (!lyricsPath) {
    lyricsCache[music.src] = [];
    return;
  }

  if (lyricsCache[music.src]) {
    if (index === currentIndex) {
      syncedLyrics = lyricsCache[music.src];
      currentLyricIndex = -1;
      updateLyrics(true);
    }

    return;
  }

  try {
    const response = await fetch(lyricsPath);

    if (!response.ok) {
      lyricsCache[music.src] = [];
      return;
    }

    const lyricsText = await response.text();
    const parsedLyrics = parseSyncedLyrics(lyricsText);

    lyricsCache[music.src] = parsedLyrics;

    if (index === currentIndex) {
      syncedLyrics = parsedLyrics;
      currentLyricIndex = -1;
      updateLyrics(true);
    }
  } catch (error) {
    lyricsCache[music.src] = [];
  }
}

function parseSyncedLyrics(lyrics) {
  return lyrics
    .split("\n")
    .map((line) => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);

      if (!match) return null;

      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const milliseconds = Number(match[3].padEnd(3, "0"));
      const text = match[4].trim();

      return {
        time: minutes * 60 + seconds + milliseconds / 1000,
        text,
      };
    })
    .filter((line) => line && line.text);
}

function updateLyrics(force = false) {
  if (!lyricsVisible && !force) return;
  if (syncedLyrics.length === 0 || !globalAudio) return;

  const currentTime = globalAudio.currentTime;

  const index = syncedLyrics.findIndex((line, i) => {
    const nextLine = syncedLyrics[i + 1];

    return (
      currentTime >= line.time && (!nextLine || currentTime < nextLine.time)
    );
  });

  if (index === -1 || index === currentLyricIndex) return;

  currentLyricIndex = index;

  if (lyricsVisible) {
    renderKaraokeLine(syncedLyrics[index].text);
  }
}

function renderKaraokeLine(text) {
  if (!lyricsLine) return;

  lyricsLine.classList.remove("enter");
  lyricsLine.classList.add("exit");

  setTimeout(() => {
    lyricsLine.textContent = text;
    lyricsLine.classList.remove("exit");
    lyricsLine.classList.add("enter");
  }, 220);
}

function toggleLyrics() {
  lyricsVisible = !lyricsVisible;

  if (!lyricsBox || !mainLyricsBtn) return;

  lyricsBox.classList.toggle("hidden", !lyricsVisible);
  mainLyricsBtn.classList.toggle("active", lyricsVisible);

  if (lyricsVisible) {
    currentLyricIndex = -1;
    lyricsLine.textContent = "...";

    if (syncedLyrics.length > 0) {
      updateLyrics(true);
      return;
    }

    loadLyrics(currentIndex).then(() => {
      currentLyricIndex = -1;
      updateLyrics(true);
    });
  }
}

/* =========================
   UTIL
========================= */

function formatTime(time) {
  if (!time || Number.isNaN(time)) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

initApp();
