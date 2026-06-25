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
let activeQueue = null;
let activeQueueName = "all";
let activeQueuePlaylistId = null;


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
let playerStats;
let customPlaylists;
let pendingPlaylistMusicIndex = null;
let lastTrackedSecond = -1;
let lastCountedPlayKey = null;
let isChangingMusic = false;
const NORMAL_VOLUME = Number(localStorage.getItem("playerVolume") || 50) / 100;
