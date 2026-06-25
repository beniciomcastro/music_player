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

    playerStats = loadPlayerStats();
    customPlaylists = loadCustomPlaylists();

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

initApp();
