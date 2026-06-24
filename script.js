const DEFAULT_MUSICS = [
  {
    title: "10K",
    artist: "KB",
    album: "Minhas Músicas",
    src: "assets/musicas/10k.mp3",
    cover: "assets/capas/10k.png",
    lyrics: "assets/lyrics/10k.lrc",
  },
  {
    title: "Chuvas de Deus",
    artist: "2metro",
    album: "Minhas Músicas",
    src: "assets/musicas/chuvas_de_deus.mp3",
    cover: "assets/capas/chuvas_de_deus.png",
    lyrics: "assets/lyrics/chuvas_de_deus.lrc",
  },
  {
    title: "Love Theory",
    artist: "Kirk Franklin",
    album: "Minhas Músicas",
    src: "assets/musicas/love_theory.mp3",
    cover: "assets/capas/love_theory.png",
    lyrics: "assets/lyrics/love_theory.lrc",
  },
  {
    title: "Brighter Day",
    artist: "Kirk Franklin",
    album: "Minhas Músicas",
    src: "assets/musicas/brighter_day.mp3",
    cover: "assets/capas/brighter_day.png",
    lyrics: "assets/lyrics/brighter_day.lrc",
  },
  {
    title: "Êxodo",
    artist: "Projeto Sola",
    album: "Minhas Músicas",
    src: "assets/musicas/exodo.mp3",
    cover: "assets/capas/exodo.png",
    lyrics: "assets/lyrics/exodo.lrc",
  },
  {
    title: "Efésios 6",
    artist: "2metro",
    album: "Minhas Músicas",
    src: "assets/musicas/efesios6.mp3",
    cover: "assets/capas/efesios6.png",
    lyrics: "assets/lyrics/efesios6.lrc",
  },
  {
    title: "Ooh Ahh",
    artist: "Grits",
    album: "Minhas Músicas",
    src: "assets/musicas/ooh ahh.mp3",
    cover: "assets/capas/ooh ahh.png",
    lyrics: "assets/lyrics/ooh ahh.lrc",
  },
  {
    title: "Paracetamol",
    artist: "Lookas",
    album: "Minhas Músicas",
    src: "assets/musicas/paracetamol.mp3",
    cover: "assets/capas/paracetamol.png",
    lyrics: "assets/lyrics/paracetamol.lrc",
  },
  {
    title: "Inheritance",
    artist: "KOTR",
    album: "Minhas Músicas",
    src: "assets/musicas/battle_anthem.mp3",
    cover: "assets/capas/battle_anthem.png",
    lyrics: "assets/lyrics/inheritance.lrc",
  },
  {
    title: "Arde Outra Vez",
    artist: "Thalles Roberto",
    album: "Minhas Músicas",
    src: "assets/musicas/arde_outra_vez.mp3",
    cover: "assets/capas/arde_outra_vez.png",
    lyrics: "assets/lyrics/arde_outra_vez.lrc",
  },
  {
    title: "Up!",
    artist: "Forrest Frank & Connor Price",
    album: "Minhas Músicas",
    src: "assets/musicas/up!.mp3",
    cover: "assets/capas/up!.png",
    lyrics: "assets/lyrics/up!.lrc",
  },
];

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

const themeToggleBtn = document.getElementById("themeToggleBtn");
const playlistForm = document.getElementById("playlistForm");
const playlistName = document.getElementById("playlistName");
const playlistModal = document.getElementById("playlistModal");
const playlistModalTitle = document.getElementById("playlistModalTitle");
const playlistModalOptions = document.getElementById("playlistModalOptions");
const playlistModalClose = document.getElementById("playlistModalClose");
const playlistModalCreateForm = document.getElementById(
  "playlistModalCreateForm",
);
const playlistModalNewName = document.getElementById("playlistModalNewName");
const mostPlayedList = document.getElementById("mostPlayedList");
const recentPlayedList = document.getElementById("recentPlayedList");
const historyList = document.getElementById("historyList");
const customPlaylistsGrid = document.getElementById("customPlaylistsGrid");
const statsCards = document.getElementById("statsCards");
const topRankingList = document.getElementById("topRankingList");

let appTheme = localStorage.getItem("playerTheme") || "dark";
let playerStats = loadPlayerStats();
let customPlaylists = loadCustomPlaylists();
let pendingPlaylistMusicIndex = null;
let lastTrackedSecond = -1;
let lastCountedPlayKey = null;
let isChangingMusic = false;
const NORMAL_VOLUME = Number(localStorage.getItem("playerVolume") || 50) / 100;

/* =========================
   CARREGAMENTO
========================= */

async function loadMusicsFromJson() {
  const localMusics = await loadLocalMusics();

  // Sem backend e sem arquivo JSON externo: a biblioteca base fica neste JS.
  musics = [...DEFAULT_MUSICS, ...localMusics];

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

    initTheme();
    initPageNavigation();
    initGlobalPlayer();
    initControls();
    renderLibrarySongs();
    renderFavorites();
    renderPlaylists();
    renderStats();
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
          Erro ao carregar suas músicas.
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
  if (hash === "#playlists") return "playlistsPage";
  if (hash === "#estatisticas") return "statsPage";
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

  if (pageId === "playlistsPage") {
    renderPlaylists();
  }

  if (pageId === "statsPage") {
    renderStats();
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
    changeMusicSmooth(index);
    return;
  }

  globalAudio
    .play()
    .then(() => {
      isPlaying = true;
      registerTrackPlay(getCurrentMusic());
      updatePlayIcons();
      saveState();
    })
    .catch(() => {
      isPlaying = false;
      updatePlayIcons();
    });
}

function changeMusicSmooth(index) {
  if (!hasGlobalPlayer() || musics.length === 0 || isChangingMusic) return;

  index = Number(index);
  if (Number.isNaN(index) || index < 0 || index >= musics.length) return;

  const shouldAutoPlay = isPlaying || !globalAudio.paused;
  isChangingMusic = true;

  const targetVolume = Number(localStorage.getItem("playerVolume") || 50) / 100;
  const fadeSteps = 12;
  const fadeMs = 28;

  fadeAudioVolume(globalAudio, 0, fadeSteps, fadeMs).then(() => {
    loadGlobalMusic(index, false);
    globalAudio.volume = 0;
    lastTrackedSecond = -1;

    const finish = () => {
      fadeAudioVolume(globalAudio, targetVolume, fadeSteps, fadeMs).then(() => {
        isChangingMusic = false;
      });
    };

    if (shouldAutoPlay) {
      globalAudio
        .play()
        .then(() => {
          isPlaying = true;
          registerTrackPlay(getCurrentMusic());
          updatePlayIcons();
          saveState();
          finish();
        })
        .catch(() => {
          isPlaying = false;
          updatePlayIcons();
          globalAudio.volume = targetVolume;
          isChangingMusic = false;
        });
    } else {
      globalAudio.volume = targetVolume;
      isChangingMusic = false;
    }
  });
}

function fadeAudioVolume(audio, target, steps = 10, interval = 30) {
  return new Promise((resolve) => {
    if (!audio) return resolve();

    const start = audio.volume;
    let step = 0;

    const timer = setInterval(() => {
      step += 1;
      const progress = step / steps;
      audio.volume = Math.max(
        0,
        Math.min(1, start + (target - start) * progress),
      );

      if (step >= steps) {
        clearInterval(timer);
        audio.volume = Math.max(0, Math.min(1, target));
        resolve();
      }
    }, interval);
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
  trackListeningTime(current);
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
      renderPlaylists();
      renderStats();
      updateVisuals();
    });
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }

  if (playlistForm) {
    playlistForm.addEventListener("submit", (event) => {
      event.preventDefault();
      createCustomPlaylist(playlistName.value.trim());
      playlistForm.reset();
    });
  }

  if (playlistModalClose) {
    playlistModalClose.addEventListener("click", closePlaylistModal);
  }

  if (playlistModal) {
    playlistModal.addEventListener("click", (event) => {
      if (event.target === playlistModal) closePlaylistModal();
    });
  }

  if (playlistModalCreateForm) {
    playlistModalCreateForm.addEventListener("submit", (event) => {
      event.preventDefault();
      createPlaylistFromModal();
    });
  }

  initKeyboardShortcuts();
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

  document.body.style.setProperty("--dynamic-cover", `url("${music.cover}")`);

  document.querySelectorAll(".library-song").forEach((song) => {
    const isCurrent = Number(song.dataset.index) === currentIndex;

    song.classList.toggle("active", isCurrent);
    song.classList.toggle("playing", isCurrent && isPlaying);
  });

  document
    .querySelectorAll(".favorite-card, .compact-song, .playlist-track")
    .forEach((card) => {
      const isCurrent = Number(card.dataset.index) === currentIndex;

      card.classList.toggle("active", isCurrent);
      card.classList.toggle("playing", isCurrent && isPlaying);
    });

  updateFavoriteButtons();
  updateActiveButtons();
  updatePlayIcons();
  updateNextMusicPreview();
  renderStats();
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

function getMusicKey(music) {
  if (!music) return "";
  return `${music.title}::${music.artist}::${music.album || ""}`.toLowerCase();
}

function isFavorite(music = getCurrentMusic()) {
  if (!music) return false;

  return (
    favoriteSrcs.includes(getMusicKey(music)) ||
    favoriteSrcs.includes(music.src)
  );
}

function saveFavorites() {
  localStorage.setItem("favoriteMusics", JSON.stringify(favoriteSrcs));
}

function toggleFavorite() {
  const music = getCurrentMusic();
  if (!music) return;

  const key = getMusicKey(music);

  if (isFavorite(music)) {
    favoriteSrcs = favoriteSrcs.filter(
      (item) => item !== key && item !== music.src,
    );
  } else {
    favoriteSrcs.push(key);
  }

  saveFavorites();
  updateFavoriteButtons();
  renderFavorites();
  renderPlaylists();
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

function getCurrentLibraryList() {
  const term = (librarySearch?.value || "").toLowerCase().trim();

  if (!term) return musics;

  return musics.filter((music) =>
    `${music.title} ${music.artist} ${music.album || ""}`
      .toLowerCase()
      .includes(term),
  );
}

function renderLibrarySongs(list = getCurrentLibraryList()) {
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

      <div class="song-actions">
        <button class="small-action favorite-mini" type="button" aria-label="Favoritar">
          <i class="bi ${isFavorite(music) ? "bi-heart-fill" : "bi-heart"}"></i>
        </button>
        <button class="small-action playlist-mini" type="button" aria-label="Adicionar à playlist">
          <i class="bi bi-plus-lg"></i>
        </button>
        <button class="library-status" type="button" aria-label="Música tocando">
          <i class="bi bi-play-fill"></i>
          <span class="sound-bars" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
        </button>
      </div>
    `;

    song.addEventListener("click", () => {
      playGlobalMusic(originalIndex);
    });

    song.querySelector(".favorite-mini").addEventListener("click", (event) => {
      event.stopPropagation();
      currentIndex = originalIndex;
      toggleFavorite();
      renderLibrarySongs(list);
    });

    song.querySelector(".playlist-mini").addEventListener("click", (event) => {
      event.stopPropagation();
      addMusicToPlaylistPrompt(originalIndex);
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
          <span></span><span></span><span></span>
        </span>
      </button>

      <button class="remove-favorite" type="button" aria-label="Remover dos favoritos">
        <i class="bi bi-x-lg"></i>
      </button>

      <h3>${music.title}</h3>
      <p>${music.artist}</p>
      <small>${music.album || "Sem álbum"}</small>
    `;

    card.addEventListener("click", () => {
      playGlobalMusic(originalIndex);
    });

    card
      .querySelector(".remove-favorite")
      .addEventListener("click", (event) => {
        event.stopPropagation();
        favoriteSrcs = favoriteSrcs.filter(
          (item) => item !== getMusicKey(music) && item !== music.src,
        );
        saveFavorites();
        renderFavorites();
        renderLibrarySongs();
        updateFavoriteButtons();
      });

    favoritesGrid.appendChild(card);
  });

  updateVisuals();
}

/* =========================
   ESTATÍSTICAS / PLAYLISTS / TEMA
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

function registerTrackPlay(music) {
  if (!music) return;

  const key = getMusicKey(music);
  const now = new Date().toISOString();

  if (lastCountedPlayKey !== key || globalAudio.currentTime < 2) {
    playerStats.totalPlays += 1;
    playerStats.tracks[key] ||= {
      key,
      title: music.title,
      artist: music.artist,
      album: music.album || "",
      cover: music.cover,
      plays: 0,
      seconds: 0,
      lastPlayed: now,
    };

    playerStats.tracks[key].plays += 1;
    playerStats.tracks[key].lastPlayed = now;
    playerStats.tracks[key].cover = music.cover;

    playerStats.recent = [
      key,
      ...playerStats.recent.filter((item) => item !== key),
    ].slice(0, 20);
    playerStats.history = [{ key, at: now }, ...playerStats.history].slice(
      0,
      80,
    );

    lastCountedPlayKey = key;
    savePlayerStats();
    renderPlaylists();
    renderStats();
  }
}

function trackListeningTime(currentTime) {
  const second = Math.floor(currentTime);
  const music = getCurrentMusic();
  if (!music || second === lastTrackedSecond) return;

  lastTrackedSecond = second;
  const key = getMusicKey(music);

  playerStats.totalSeconds += 1;
  playerStats.tracks[key] ||= {
    key,
    title: music.title,
    artist: music.artist,
    album: music.album || "",
    cover: music.cover,
    plays: 0,
    seconds: 0,
    lastPlayed: new Date().toISOString(),
  };

  playerStats.tracks[key].seconds += 1;

  if (second % 5 === 0) {
    savePlayerStats();
  }
}

function getTrackStatsList() {
  return Object.values(playerStats.tracks || {}).sort(
    (a, b) => b.plays - a.plays || b.seconds - a.seconds,
  );
}

function getMostPlayedArtist() {
  const totals = {};

  Object.values(playerStats.tracks || {}).forEach((track) => {
    totals[track.artist] ||= 0;
    totals[track.artist] += track.plays;
  });

  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
}

function renderStats() {
  if (!statsCards || !topRankingList) return;

  const ranking = getTrackStatsList();
  const topMusic = ranking[0];

  statsCards.innerHTML = `
    <article><strong>${playerStats.totalPlays}</strong><span>Total de músicas ouvidas</span></article>
    <article><strong>${formatLongTime(playerStats.totalSeconds)}</strong><span>Tempo total ouvindo</span></article>
    <article><strong>${topMusic ? topMusic.title : "-"}</strong><span>Música mais tocada</span></article>
    <article><strong>${getMostPlayedArtist()}</strong><span>Artista mais ouvido</span></article>
  `;

  renderCompactSongs(topRankingList, ranking.slice(0, 10), true);
}

function loadCustomPlaylists() {
  return JSON.parse(localStorage.getItem("customPlaylists") || "[]");
}

function saveCustomPlaylists() {
  localStorage.setItem("customPlaylists", JSON.stringify(customPlaylists));
}

function createCustomPlaylist(name, shouldRender = true) {
  if (!name) return null;

  const playlist = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name,
    tracks: [],
  };

  customPlaylists.push(playlist);
  saveCustomPlaylists();

  if (shouldRender) renderPlaylists();
  return playlist;
}

function addMusicToPlaylistPrompt(index) {
  pendingPlaylistMusicIndex = index;
  openPlaylistModal(index);
}

function openPlaylistModal(index) {
  if (!playlistModal || !playlistModalOptions) return;

  const music = musics[index];
  if (!music) return;

  playlistModalTitle.textContent = `Adicionar “${music.title}”`;
  playlistModalOptions.innerHTML = "";

  if (customPlaylists.length === 0) {
    playlistModalOptions.innerHTML = `<div class="playlist-choice-empty">Você ainda não tem playlists. Crie uma nova abaixo.</div>`;
  } else {
    customPlaylists.forEach((playlist) => {
      const hasTrack = playlist.tracks.includes(getMusicKey(music));
      const option = document.createElement("button");
      option.type = "button";
      option.className = "playlist-choice-card";
      option.innerHTML = `
        <span>
          <strong>${playlist.name}</strong>
          <small>${playlist.tracks.length} música${playlist.tracks.length === 1 ? "" : "s"}</small>
        </span>
        <em>${hasTrack ? "Já adicionada" : "Adicionar"}</em>
      `;
      option.disabled = hasTrack;
      option.addEventListener("click", () =>
        addMusicToPlaylist(index, playlist.id),
      );
      playlistModalOptions.appendChild(option);
    });
  }

  playlistModal.hidden = false;
  playlistModalNewName?.focus();
}

function closePlaylistModal() {
  if (!playlistModal) return;
  playlistModal.hidden = true;
  pendingPlaylistMusicIndex = null;
  if (playlistModalNewName) playlistModalNewName.value = "";
}

function createPlaylistFromModal() {
  const name = playlistModalNewName?.value.trim();
  if (!name) return;

  const playlist = createCustomPlaylist(name, false);
  if (playlist && pendingPlaylistMusicIndex !== null) {
    addMusicToPlaylist(pendingPlaylistMusicIndex, playlist.id, false);
  }

  if (playlistModalNewName) playlistModalNewName.value = "";
}

function addMusicToPlaylist(index, playlistId, keepModalOpen = false) {
  const playlist = customPlaylists.find((item) => item.id === playlistId);
  const music = musics[index];

  if (!playlist || !music) return;

  const key = getMusicKey(music);
  if (!playlist.tracks.includes(key)) {
    playlist.tracks.push(key);
    saveCustomPlaylists();
  }

  renderPlaylists();
  renderLibrarySongs(getCurrentLibraryList());

  if (keepModalOpen) {
    openPlaylistModal(index);
  } else {
    closePlaylistModal();
  }
}

function renderPlaylists() {
  if (
    !mostPlayedList ||
    !recentPlayedList ||
    !historyList ||
    !customPlaylistsGrid
  )
    return;

  const ranking = getTrackStatsList();
  const recentTracks = playerStats.recent.map(findTrackStats).filter(Boolean);
  const historyTracks = playerStats.history
    .map((item) => findTrackStats(item.key))
    .filter(Boolean);

  renderCompactSongs(mostPlayedList, ranking.slice(0, 5), true);
  renderCompactSongs(recentPlayedList, recentTracks.slice(0, 10));
  renderCompactSongs(historyList, historyTracks.slice(0, 20));

  customPlaylistsGrid.innerHTML = "";

  if (customPlaylists.length === 0) {
    customPlaylistsGrid.innerHTML = `<div class="library-empty">Crie sua primeira playlist acima.</div>`;
    return;
  }

  customPlaylists.forEach((playlist) => {
    const block = document.createElement("article");
    block.className = "playlist-block custom-playlist";

    const tracks = playlist.tracks
      .map((key) => findMusicByKey(key))
      .filter(Boolean);

    block.innerHTML = `
      <div class="playlist-title-row">
        <h3>${playlist.name}</h3>
        <button type="button" class="delete-playlist">Excluir</button>
      </div>
      <div class="compact-song-list"></div>
    `;

    block.querySelector(".delete-playlist").addEventListener("click", () => {
      customPlaylists = customPlaylists.filter(
        (item) => item.id !== playlist.id,
      );
      saveCustomPlaylists();
      renderPlaylists();
    });

    renderMusicListInto(
      block.querySelector(".compact-song-list"),
      tracks,
      playlist,
    );
    customPlaylistsGrid.appendChild(block);
  });
}

function findTrackStats(key) {
  return playerStats.tracks[key];
}

function findMusicByKey(key) {
  return musics.find((music) => getMusicKey(music) === key);
}

function renderCompactSongs(container, tracks, showPlays = false) {
  if (!container) return;

  container.innerHTML = "";

  if (!tracks || tracks.length === 0) {
    container.innerHTML = `<div class="library-empty small-empty">Nada por aqui ainda.</div>`;
    return;
  }

  tracks.forEach((track) => {
    const musicIndex = musics.findIndex(
      (music) => getMusicKey(music) === track.key,
    );
    const item = document.createElement("button");
    item.className = "compact-song";
    item.type = "button";
    item.dataset.index = musicIndex;

    item.innerHTML = `
      <img src="${track.cover}" alt="${track.title}" />
      <span><strong>${track.title}</strong><small>${track.artist}</small></span>
      <em>${showPlays ? `${track.plays}x` : formatShortDate(track.lastPlayed)}</em>
    `;

    item.addEventListener("click", () => {
      if (musicIndex >= 0) playGlobalMusic(musicIndex);
    });

    container.appendChild(item);
  });
}

function renderMusicListInto(container, tracks, playlist) {
  if (!container) return;

  container.innerHTML = "";

  if (tracks.length === 0) {
    container.innerHTML = `<div class="library-empty small-empty">Use o botão + nas músicas para adicionar aqui.</div>`;
    return;
  }

  tracks.forEach((music) => {
    const index = musics.indexOf(music);
    const item = document.createElement("article");
    item.className = "playlist-track";
    item.dataset.index = index;

    item.innerHTML = `
      <img src="${music.cover}" alt="${music.title}" />
      <span><strong>${music.title}</strong><small>${music.artist}</small></span>
      <button type="button">Remover</button>
    `;

    item.addEventListener("click", () => playGlobalMusic(index));
    item.querySelector("button").addEventListener("click", (event) => {
      event.stopPropagation();
      playlist.tracks = playlist.tracks.filter(
        (key) => key !== getMusicKey(music),
      );
      saveCustomPlaylists();
      renderPlaylists();
    });

    container.appendChild(item);
  });
}

function initTheme() {
  document.body.classList.toggle("light-theme", appTheme === "light");
  updateThemeButton();
}

function toggleTheme() {
  appTheme = appTheme === "dark" ? "light" : "dark";
  localStorage.setItem("playerTheme", appTheme);
  initTheme();
}

function updateThemeButton() {
  if (!themeToggleBtn) return;

  themeToggleBtn.innerHTML =
    appTheme === "light"
      ? '<i class="bi bi-sun-fill"></i>'
      : '<i class="bi bi-moon-stars-fill"></i>';
}

function initKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (["input", "textarea", "select"].includes(tag)) return;

    if (event.code === "Space") {
      event.preventDefault();
      toggleGlobalPlay();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextGlobalMusic();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prevGlobalMusic();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      changeVolumeBy(5);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      changeVolumeBy(-5);
    }
  });
}

function changeVolumeBy(delta) {
  if (!volumeControl || !globalAudio) return;

  const nextVolume = Math.max(
    0,
    Math.min(100, Number(volumeControl.value) + delta),
  );
  volumeControl.value = nextVolume;
  globalAudio.volume = nextVolume / 100;
  localStorage.setItem("playerVolume", nextVolume);
  updateRangeProgress(volumeControl);
}

function formatLongTime(seconds) {
  const total = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

function formatShortDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

/* =========================
   LETRA LOCAL/* =========================
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
