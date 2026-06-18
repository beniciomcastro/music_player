let musics = [];
let currentIndex = Number(localStorage.getItem("playerIndex")) || 0;
let isPlaying = false;
let shuffle = localStorage.getItem("playerShuffle") === "true";
let repeat = localStorage.getItem("playerRepeat") === "true";
let favoriteSrcs = JSON.parse(localStorage.getItem("favoriteMusics") || "[]");

let shouldRestoreTime = true;

const mainTitle = document.getElementById("mainTitle");
const mainArtist = document.getElementById("mainArtist");
const heroCover = document.getElementById("heroCover");
const mainPlayIcon = document.getElementById("mainPlayIcon");
const mainProgress = document.getElementById("mainProgress");
const mainCurrentTime = document.getElementById("mainCurrentTime");
const mainDuration = document.getElementById("mainDuration");

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

async function loadMusicsFromJson() {
  const response = await fetch("musicas.json");
  if (!response.ok) throw new Error("Não foi possível carregar musicas.json");

  musics = await response.json();

  if (!Array.isArray(musics) || musics.length === 0) {
    throw new Error("O arquivo musicas.json está vazio ou inválido");
  }

  if (currentIndex < 0 || currentIndex >= musics.length) {
    currentIndex = 0;
  }
}

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

function isFavorite(music = getCurrentMusic()) {
  if (!music) return false;
  return favoriteSrcs.includes(music.src);
}

function saveFavorites() {
  localStorage.setItem("favoriteMusics", JSON.stringify(favoriteSrcs));
}

function saveState() {
  if (!hasGlobalPlayer()) return;

  localStorage.setItem("playerIndex", currentIndex);
  localStorage.setItem("playerTime", globalAudio.currentTime || 0);
  localStorage.setItem("playerPlaying", isPlaying ? "true" : "false");
  localStorage.setItem("playerShuffle", shuffle ? "true" : "false");
  localStorage.setItem("playerRepeat", repeat ? "true" : "false");
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
    let randomIndex;

    do {
      randomIndex = Math.floor(Math.random() * musics.length);
    } while (randomIndex === currentIndex && musics.length > 1);

    playGlobalMusic(randomIndex);
    return;
  }

  playGlobalMusic((currentIndex + 1) % musics.length);
}

function prevGlobalMusic() {
  if (musics.length === 0) return;
  playGlobalMusic((currentIndex - 1 + musics.length) % musics.length);
}

function toggleShuffle() {
  shuffle = !shuffle;
  updateActiveButtons();
  saveState();
}

function toggleRepeat() {
  repeat = !repeat;

  if (globalAudio) {
    globalAudio.loop = repeat;
  }

  updateActiveButtons();
  saveState();
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
    song.classList.toggle(
      "active",
      Number(song.dataset.index) === currentIndex,
    );
  });

  updateFavoriteButtons();
  updateActiveButtons();
  updatePlayIcons();
}

function updatePlayIcons() {
  const icon = isPlaying ? "bi bi-pause-fill" : "bi bi-play-fill";

  if (globalPlayIcon) globalPlayIcon.className = icon;
  if (mainPlayIcon) mainPlayIcon.className = icon;
  if (libraryPlayIcon) libraryPlayIcon.className = icon;
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

function updateActiveButtons() {
  if (mainShuffleBtn) mainShuffleBtn.classList.toggle("active", shuffle);
  if (globalShuffleBtn) globalShuffleBtn.classList.toggle("active", shuffle);

  if (mainRepeatBtn) mainRepeatBtn.classList.toggle("active", repeat);
  if (globalRepeatBtn) globalRepeatBtn.classList.toggle("active", repeat);
}

function resetProgress() {
  [globalProgress, mainProgress, libraryProgress].forEach((progress) => {
    if (progress) progress.value = 0;
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
  });

  [globalCurrentTime, mainCurrentTime, libraryCurrentTime].forEach((item) => {
    if (item) item.textContent = formatTime(current);
  });

  [globalDuration, mainDuration, libraryDuration].forEach((item) => {
    if (item) item.textContent = formatTime(duration);
  });

  saveState();
}

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

      <button type="button">
        <i class="bi bi-play-fill"></i>
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

    card.innerHTML = `
      <img src="${music.cover}" alt="${music.title}" />

      <button class="card-play" type="button">
        <i class="bi bi-play-fill"></i>
      </button>

      <h3>${music.title}</h3>
      <p>${music.artist}</p>
    `;

    card.addEventListener("click", () => {
      playGlobalMusic(originalIndex);
    });

    favoritesGrid.appendChild(card);
  });
}

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

  [mainProgress, libraryProgress, globalProgress].forEach((progress) => {
    if (!progress) return;

    progress.addEventListener("input", () => {
      if (globalAudio) {
        globalAudio.currentTime = progress.value;
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
}

function initGlobalPlayer() {
  if (!hasGlobalPlayer()) return;

  const wasPlaying = localStorage.getItem("playerPlaying") === "true";

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

function formatTime(time) {
  if (!time || Number.isNaN(time)) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

async function initApp() {
  try {
    await loadMusicsFromJson();
    initGlobalPlayer();
    initControls();
    renderLibrarySongs();
    renderFavorites();
    updateVisuals();
    updatePlayIcons();
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

initApp();
