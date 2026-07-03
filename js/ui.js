/* =========================
   INTERNAL NAVIGATION
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

  if (hash === "#library") return "libraryPage";
  if (hash === "#favorites") return "favoritesPage";
  if (hash === "#playlists") return "playlistsPage";
  if (hash === "#statistics") return "statsPage";
  if (hash === "#add") return "addMusicPage";

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
   CONTROLS
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
        addMusicMessage.textContent = "Song added successfully.";
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
  updateFooterQueueLabel();

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
   FAVORITES
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
   LIBRARY
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
        No songs found.
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
        <button class="small-action favorite-mini" type="button" aria-label="Favorite">
          <i class="bi ${isFavorite(music) ? "bi-heart-fill" : "bi-heart"}"></i>
        </button>
        <button class="small-action playlist-mini" type="button" aria-label="Add to playlist">
          <i class="bi bi-plus-lg"></i>
        </button>
        <button class="library-status" type="button" aria-label="Song playing">
          <i class="bi bi-play-fill"></i>
          <span class="sound-bars" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
        </button>
      </div>
    `;

    song.addEventListener("click", () => {
      resetQueueToAll();
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
        No favorite songs yet.
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
      <small>${music.album || "No album"}</small>
    `;

    card.addEventListener("click", () => {
      playGlobalMusic(originalIndex);
    });

    card.querySelector(".card-play").addEventListener("click", (event) => {
      event.stopPropagation();

      if (originalIndex === currentIndex && isPlaying) {
        pauseGlobalMusic();
      } else {
        playGlobalMusic(originalIndex);
      }
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
   STATISTICS / PLAYLISTS / THEME
========================= */

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
    <article><strong>${playerStats.totalPlays}</strong><span>Total songs played</span></article>
    <article><strong>${formatLongTime(playerStats.totalSeconds)}</strong><span>Total listening time</span></article>
    <article><strong>${topMusic ? topMusic.title : "-"}</strong><span>Most played song</span></article>
    <article><strong>${getMostPlayedArtist()}</strong><span>Most listened artist</span></article>
  `;

  renderCompactSongs(topRankingList, ranking.slice(0, 10), true);
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

  playlistModalTitle.textContent = `Add “${music.title}”`;
  playlistModalOptions.innerHTML = "";

  if (customPlaylists.length === 0) {
    playlistModalOptions.innerHTML = `<div class="playlist-choice-empty">You do not have any playlists yet. Create a new one below.</div>`;
  } else {
    customPlaylists.forEach((playlist) => {
      const hasTrack = playlist.tracks.includes(getMusicKey(music));
      const option = document.createElement("button");
      option.type = "button";
      option.className = "playlist-choice-card";
      option.innerHTML = `
        <span>
          <strong>${playlist.name}</strong>
          <small>${playlist.tracks.length} song${playlist.tracks.length === 1 ? "" : "s"}</small>
        </span>
        <em>${hasTrack ? "Already added" : "Add"}</em>
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
    updateActiveQueueFromPlaylist(playlist);
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
    customPlaylistsGrid.innerHTML = `<div class="library-empty">Create your first playlist above.</div>`;
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
        <div class="playlist-title-actions">
          <button type="button" class="play-playlist" aria-label="Tocar playlist">
            <i class="bi bi-play-fill"></i>
          </button>
          <button type="button" class="delete-playlist">Excluir</button>
        </div>
      </div>
      <div class="compact-song-list"></div>
    `;

    block.querySelector(".play-playlist").addEventListener("click", () => {
      playPlaylist(playlist);
    });

    block.querySelector(".delete-playlist").addEventListener("click", () => {
      customPlaylists = customPlaylists.filter(
        (item) => item.id !== playlist.id,
      );
      if (activeQueuePlaylistId === playlist.id) {
        resetQueueToAll();
      }
      saveCustomPlaylists();
      updateActiveQueueFromPlaylist(playlist);
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
    container.innerHTML = `<div class="library-empty small-empty">Nothing here yet.</div>`;
    return;
  }

  tracks.forEach((track) => {
    const musicIndex = musics.findIndex(
      (music) => getMusicKey(music) === track.key,
    );

    const music = musicIndex >= 0 ? musics[musicIndex] : null;
    const cover = music?.cover || track.cover || "";

    const item = document.createElement("button");
    item.className = "compact-song";
    item.type = "button";
    item.dataset.index = musicIndex;

    item.innerHTML = `
      <img src="${cover}" alt="${track.title}" />
      <span><strong>${track.title}</strong><small>${track.artist}</small></span>
      <em>${showPlays ? `${track.plays}x` : formatShortDate(track.lastPlayed)}</em>
    `;

    item.addEventListener("click", () => {
      if (musicIndex >= 0) {
        resetQueueToAll();
        playGlobalMusic(musicIndex);
      }
    });

    container.appendChild(item);
  });
}

function renderMusicListInto(container, tracks, playlist) {
  if (!container) return;

  container.innerHTML = "";

  if (tracks.length === 0) {
    container.innerHTML = `<div class="library-empty small-empty">Use the + button on songs to add them here.</div>`;
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

    item.addEventListener("click", () =>
      playPlaylistFromTrack(playlist, index),
    );
    item.querySelector("button").addEventListener("click", (event) => {
      event.stopPropagation();
      playlist.tracks = playlist.tracks.filter(
        (key) => key !== getMusicKey(music),
      );
      saveCustomPlaylists();
      updateActiveQueueFromPlaylist(playlist);
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
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
  });
}
