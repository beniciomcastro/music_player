/* =========================
    QUEUE 
========================= */

function getActiveQueue() {
  return Array.isArray(activeQueue) && activeQueue.length > 0
    ? activeQueue
    : musics.map((_, index) => index);
}

function resetQueueToAll() {
  activeQueue = null;
  activeQueueName = "all";
  activeQueuePlaylistId = null;
  nextShuffleIndex = null;
  updateFooterQueueLabel();
}

function setQueueFromIndices(indices, name = "playlist", playlistId = null) {
  const validIndices = indices.filter((index) => {
    return Number.isInteger(index) && index >= 0 && index < musics.length;
  });

  if (validIndices.length === 0) return false;

  activeQueue = validIndices;
  activeQueueName = name;
  activeQueuePlaylistId = playlistId;
  nextShuffleIndex = null;
  updateFooterQueueLabel();
  return true;
}

function getCurrentQueuePosition() {
  return getActiveQueue().indexOf(currentIndex);
}

function getQueueLabelText() {
  return activeQueueName && activeQueueName !== "all"
    ? activeQueueName
    : "All songs";
}

function updateFooterQueueLabel() {
  if (!globalArtist) return;

  const music = getCurrentMusic();
  if (!music) return;

  globalArtist.textContent = `${music.artist} • ${getQueueLabelText()}`;
}

function updateActiveQueueFromPlaylist(playlist) {
  if (!playlist || activeQueuePlaylistId !== playlist.id) return;

  const indices = playlist.tracks
    .map((key) => musics.findIndex((music) => getMusicKey(music) === key))
    .filter((index) => index >= 0);

  if (indices.length === 0) {
    resetQueueToAll();
    return;
  }

  activeQueue = indices;
  activeQueueName = playlist.name;
  activeQueuePlaylistId = playlist.id;

  if (!activeQueue.includes(currentIndex)) {
    currentIndex = activeQueue[0];
  }

  nextShuffleIndex = null;
  updateFooterQueueLabel();
  updateNextMusicPreview();
}

function playPlaylist(playlist, startIndex = 0) {
  if (!playlist || !Array.isArray(playlist.tracks)) return;

  const indices = playlist.tracks
    .map((key) => musics.findIndex((music) => getMusicKey(music) === key))
    .filter((index) => index >= 0);

  if (!setQueueFromIndices(indices, playlist.name, playlist.id)) return;

  const safeStartIndex = Math.max(0, Math.min(startIndex, indices.length - 1));
  playGlobalMusic(indices[safeStartIndex], { keepQueue: true });
}

function playPlaylistFromTrack(playlist, musicIndex) {
  if (!playlist) {
    resetQueueToAll();
    playGlobalMusic(musicIndex);
    return;
  }

  const indices = playlist.tracks
    .map((key) => musics.findIndex((music) => getMusicKey(music) === key))
    .filter((index) => index >= 0);

  const queuePosition = indices.indexOf(musicIndex);

  if (!setQueueFromIndices(indices, playlist.name, playlist.id)) return;

  playGlobalMusic(queuePosition >= 0 ? indices[queuePosition] : musicIndex, {
    keepQueue: true,
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
  updateFooterQueueLabel();

  resetProgress();

  localStorage.setItem("playerIndex", currentIndex);

  if (!keepTime) {
    globalAudio.currentTime = 0;
    localStorage.setItem("playerTime", "0");
  }

  loadLyrics(currentIndex);
  updateVisuals();
}

function playGlobalMusic(index = currentIndex, options = {}) {
  if (!hasGlobalPlayer() || musics.length === 0) return;

  const sameMusic = index === currentIndex && globalAudio.src;

  if (!options.keepQueue && !sameMusic) {
    resetQueueToAll();
  }

  if (!sameMusic) {
    changeMusicSmooth(index, options);
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

function changeMusicSmooth(index, options = {}) {
  if (!hasGlobalPlayer() || musics.length === 0 || isChangingMusic) return;

  if (!options.keepQueue) {
    resetQueueToAll();
  }

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

  const queue = getActiveQueue();
  if (queue.length === 0) return;

  if (queue.length === 1) {
    globalAudio.currentTime = 0;
    localStorage.setItem("playerTime", "0");
    updateLyrics(true);
    playGlobalMusic(queue[0], { keepQueue: activeQueueName !== "all" });
    return;
  }

  if (shuffle) {
    const indexToPlay = getNextMusicIndex();
    nextShuffleIndex = null;
    playGlobalMusic(indexToPlay, { keepQueue: activeQueueName !== "all" });
    return;
  }

  const currentPosition = getCurrentQueuePosition();
  const nextPosition =
    currentPosition === -1 ? 0 : (currentPosition + 1) % queue.length;

  playGlobalMusic(queue[nextPosition], {
    keepQueue: activeQueueName !== "all",
  });
}

function prevGlobalMusic() {
  if (musics.length === 0) return;

  const queue = getActiveQueue();
  if (queue.length === 0) return;

  if (queue.length === 1) {
    globalAudio.currentTime = 0;
    localStorage.setItem("playerTime", "0");
    updateLyrics(true);
    playGlobalMusic(queue[0], { keepQueue: activeQueueName !== "all" });
    return;
  }

  const currentPosition = getCurrentQueuePosition();
  const prevPosition =
    currentPosition === -1
      ? 0
      : (currentPosition - 1 + queue.length) % queue.length;

  playGlobalMusic(queue[prevPosition], {
    keepQueue: activeQueueName !== "all",
  });
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
   STATE
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
   SHUFFLE / REPEAT / NEXT
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
  const queue = getActiveQueue();
  if (queue.length === 0) return null;

  if (!shuffle) {
    const currentPosition = getCurrentQueuePosition();
    const nextPosition =
      currentPosition === -1 ? 0 : (currentPosition + 1) % queue.length;

    return queue[nextPosition];
  }

  if (
    nextShuffleIndex === null ||
    nextShuffleIndex === currentIndex ||
    !queue.includes(nextShuffleIndex)
  ) {
    do {
      nextShuffleIndex = queue[Math.floor(Math.random() * queue.length)];
    } while (nextShuffleIndex === currentIndex && queue.length > 1);
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
   LOCAL LYRICS
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
   USABLE
========================= */

function formatTime(time) {
  if (!time || Number.isNaN(time)) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}
