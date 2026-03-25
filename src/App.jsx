import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import Level from './components/Level';
import Player3D from './components/Player3D';
import WinSequence from './components/WinSequence';
import { useGame } from './hooks/useGame';
import { createSoundPlayer } from './utils/sound';
import { createSeededRandom, hashStringToSeed } from './utils/random';

const BEST_LEVELS_STORAGE_KEY = 'labyrinthe_best_levels';
const DAILY_STATS_STORAGE_KEY = 'labyrinthe_daily_stats';
const SKIN_STATE_STORAGE_KEY = 'labyrinthe_skin_state';
const TOTAL_SCORE_STORAGE_KEY = 'labyrinthe_total_score';
const PLAYER_PROFILE_STORAGE_KEY = 'labyrinthe_player_profile';
const OPTIONS_STORAGE_KEY = 'labyrinthe_options';

const WORLD_MAP = [
  {
    id: 'forest',
    label: 'Foret Murmurante',
    chapterLength: 3,
    difficulty: 'easy',
    unlockStars: 0,
    color: '#78d98a',
    flavor: 'La poule messagere suit des esprits-lucioles pour retrouver la premiere cle du sanctuaire.',
  },
  {
    id: 'ruins',
    label: 'Ruines Solaires',
    chapterLength: 3,
    difficulty: 'normal',
    unlockStars: 8,
    color: '#f2bb67',
    flavor: 'Des gardiens de pierre testent ta memoire et ton sens de l observation.',
  },
  {
    id: 'library',
    label: 'Bibliotheque Maudite',
    chapterLength: 4,
    difficulty: 'normal',
    unlockStars: 18,
    color: '#9f8bff',
    flavor: 'Des parchemins vivants deforment les mots et ouvrent de faux passages.',
  },
  {
    id: 'fortress',
    label: 'Forteresse d Ombre',
    chapterLength: 4,
    difficulty: 'hard',
    unlockStars: 32,
    color: '#ff7b73',
    flavor: 'Le minotaure n est plus juste un ennemi: il observe si tu merites le coeur du dedale.',
  },
  {
    id: 'catacombs',
    label: 'Catacombes du Pacte',
    chapterLength: 5,
    difficulty: 'hard',
    unlockStars: 48,
    color: '#80f0ff',
    flavor: 'Le final. Les esprits revelent pourquoi la poule porte la carte du labyrinthe sacre.',
  },
];

const GAME_MODES = [
  { id: 'adventure', label: 'Aventure', description: 'Runs de 3 a 5 labyrinthes, chapitres et mini-boss.' },
  { id: 'daily', label: 'Defi du jour', description: 'Seed fixe du jour, ideal pour comparer les runs.' },
  { id: 'weekly', label: 'Defi hebdo', description: 'Une semaine, un theme grammatical, un grand parcours.' },
  { id: 'speedrun', label: 'Speedrun', description: 'Plus rapide, plus nerveux, temps de memorisation reduit.' },
  { id: 'hardcore', label: 'Hardcore', description: 'Peu de vies, pas de filet, decisions a haut risque.' },
  { id: 'zen', label: 'Zen', description: 'Plus de repit, plus de vision, presque pas de pression.' },
  { id: 'training', label: 'Entrainement', description: 'Travaille surtout tes categories les plus fragiles.' },
];

const ACHIEVEMENT_CATALOG = [
  { id: 'first_win', label: 'Premier Pas', description: 'Gagner une partie.', predicate: (profile) => profile.totalWins >= 1 },
  { id: 'combo_5', label: 'Combo x5', description: 'Atteindre un combo x5.', predicate: (profile) => profile.maxCombo >= 5 },
  { id: 'treasure_hunter', label: 'Chasseur de secrets', description: 'Ouvrir 10 coffres.', predicate: (profile) => profile.totalChestsOpened >= 10 },
  { id: 'elite_master', label: 'Briseur d elite', description: 'Franchir 8 portes elite.', predicate: (profile) => profile.totalEliteDoorsCleared >= 8 },
  { id: 'boss_breaker', label: 'Coeur du dedale', description: 'Franchir 3 portes gardiennes.', predicate: (profile) => profile.totalBossDoorsCleared >= 3 },
  { id: 'daily_hero', label: 'Heros du jour', description: 'Faire 3 etoiles au defi du jour.', predicate: (profile) => profile.dailyPerfectRuns >= 1 },
  { id: 'world_walker', label: 'Marcheur des mondes', description: 'Debloquer la forteresse.', predicate: (profile) => profile.unlockedWorlds.includes('fortress') },
];

const ARTIFACT_CATALOG = [
  {
    id: 'elite_double',
    label: 'Cire royale',
    description: 'Les portes elite rapportent beaucoup plus.',
  },
  {
    id: 'mist_guard',
    label: 'Voile protecteur',
    description: 'Le premier degat de chaque niveau est annule.',
  },
  {
    id: 'treasure_joker',
    label: 'Carte des reserves',
    description: 'Les coffres donnent un petit bonus de joker.',
  },
];

const SURFACE_STYLE = {
  background: 'linear-gradient(180deg, rgba(6,17,32,0.86), rgba(10,32,54,0.74))',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
  backdropFilter: 'blur(10px)',
};

const DARK_BUTTON_STYLE = {
  padding: '12px 18px',
  borderRadius: '10px',
  border: 'none',
  background: 'rgba(0,0,0,0.72)',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const LIGHT_BUTTON_STYLE = {
  padding: '12px 18px',
  borderRadius: '10px',
  border: 'none',
  background: 'rgba(255,255,255,0.82)',
  color: '#1f2d3d',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const DIFFICULTY_SETTINGS = {
  easy: {
    label: 'Facile',
    world: 'Clairiere enchantee',
    description: 'Des labyrinthes accueillants, des jokers genereux et une progression douce.',
    baseSize: 7,
    maxSize: 15,
    baseDoors: 4,
    maxDoors: 8,
    memorizationSeconds: 6,
    color: '#2ecc71',
    theme: {
      rootBackground: 'radial-gradient(circle at top, #dff8ff 0%, #a4debd 36%, #5fa66c 100%)',
      sceneColor: '#bfe5ff',
      fogColor: '#94cda9',
      groundColor: '#5f8f3b',
      wallTint: '#d8c3a5',
      accent: '#65f0a0',
      leafColor: '#3f7d3b',
      leafGlow: '#173b14',
      trunkColor: '#5d4335',
      buttonColor: '#2f88c9',
      sunPosition: [80, 30, 60],
      turbidity: 4,
    },
  },
  normal: {
    label: 'Normal',
    world: 'Ruines dorees',
    description: 'La tension monte: plus de portes, moins de temps, et des themes plus varies.',
    baseSize: 9,
    maxSize: 17,
    baseDoors: 6,
    maxDoors: 10,
    memorizationSeconds: 5,
    color: '#f39c12',
    theme: {
      rootBackground: 'radial-gradient(circle at top, #f2dbc0 0%, #c89052 34%, #5f4735 100%)',
      sceneColor: '#d7a060',
      fogColor: '#84614a',
      groundColor: '#78663b',
      wallTint: '#cda47a',
      accent: '#ffb547',
      leafColor: '#7f5c28',
      leafGlow: '#3c240d',
      trunkColor: '#513a2d',
      buttonColor: '#996c28',
      sunPosition: [65, 20, -40],
      turbidity: 6,
    },
  },
  hard: {
    label: 'Difficile',
    world: 'Forteresse nocturne',
    description: 'De grands labyrinthes, un ciel inquietant et tres peu de repit.',
    baseSize: 11,
    maxSize: 21,
    baseDoors: 8,
    maxDoors: 14,
    memorizationSeconds: 4,
    color: '#e74c3c',
    theme: {
      rootBackground: 'radial-gradient(circle at top, #0f1c35 0%, #1f2748 34%, #090b14 100%)',
      sceneColor: '#1d2846',
      fogColor: '#12182c',
      groundColor: '#27302f',
      wallTint: '#7d8098',
      accent: '#8bd9ff',
      leafColor: '#1f3938',
      leafGlow: '#081516',
      trunkColor: '#27242d',
      buttonColor: '#2a5378',
      sunPosition: [-60, 14, -55],
      turbidity: 12,
    },
  },
};

const SKIN_CATALOG = [
  {
    id: 'classic',
    label: 'Classique',
    tint: '#ffffff',
    aura: '#ffffff',
    scale: 0.9,
    unlockText: 'Disponible de base',
    gameplay: 'Equilibre',
  },
  {
    id: 'sunrise',
    label: 'Aurore',
    tint: '#ffd8a0',
    aura: '#ff9c6d',
    scale: 0.92,
    unlockLevel: 2,
    unlockText: 'Atteindre le niveau 2',
    gameplay: '+1 vie au debut des runs',
  },
  {
    id: 'grove',
    label: 'Sylvestre',
    tint: '#d8ffd8',
    aura: '#62d487',
    scale: 0.94,
    unlockLevel: 4,
    unlockText: 'Atteindre le niveau 4',
    gameplay: '+1 lanterne de depart',
  },
  {
    id: 'moon',
    label: 'Lunaire',
    tint: '#d6e8ff',
    aura: '#7fb3ff',
    scale: 0.95,
    unlockLevel: 6,
    unlockText: 'Atteindre le niveau 6',
    gameplay: 'Boussole plus longue',
  },
  {
    id: 'royal',
    label: 'Royale',
    tint: '#ffe483',
    aura: '#ffd04a',
    scale: 1,
    unlockLevel: 8,
    unlockText: 'Atteindre le niveau 8',
    gameplay: 'Bonus de score sur les portes elite',
  },
  {
    id: 'astral',
    label: 'Astrale',
    tint: '#ffd3fb',
    aura: '#db8cff',
    scale: 1,
    unlockDaily: true,
    unlockText: 'Faire 3 etoiles au defi du jour',
    gameplay: '+1 joker aleatoire au debut',
  },
];

function loadBestLevels() {
  if (typeof window === 'undefined') {
    return { easy: 0, normal: 0, hard: 0 };
  }

  try {
    const rawValue = window.localStorage.getItem(BEST_LEVELS_STORAGE_KEY);
    if (!rawValue) return { easy: 0, normal: 0, hard: 0 };

    const parsedValue = JSON.parse(rawValue);
    return {
      easy: Number(parsedValue.easy) || 0,
      normal: Number(parsedValue.normal) || 0,
      hard: Number(parsedValue.hard) || 0,
    };
  } catch {
    return { easy: 0, normal: 0, hard: 0 };
  }
}

function loadDailyStats() {
  if (typeof window === 'undefined') return {};

  try {
    const rawValue = window.localStorage.getItem(DAILY_STATS_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : {};
  } catch {
    return {};
  }
}

function loadTotalScore() {
  if (typeof window === 'undefined') return 0;

  try {
    const rawValue = window.localStorage.getItem(TOTAL_SCORE_STORAGE_KEY);
    return Number(rawValue) || 0;
  } catch {
    return 0;
  }
}

function loadPlayerProfile() {
  const defaultProfile = {
    totalRuns: 0,
    totalWins: 0,
    totalStars: 0,
    totalChestsOpened: 0,
    totalEliteDoorsCleared: 0,
    totalTimedDoorsCleared: 0,
    totalTrapDoorsCleared: 0,
    totalBonusDoorsCleared: 0,
    totalBossDoorsCleared: 0,
    totalHeartsLost: 0,
    totalArtifactsFound: 0,
    chapterWins: 0,
    bestScore: 0,
    maxCombo: 0,
    totalTimePlayed: 0,
    dailyPerfectRuns: 0,
    unlockedAchievements: [],
    unlockedWorlds: ['forest'],
    completedChapters: {},
    perkPoints: 0,
    perks: {
      vision: 0,
      combo: 0,
      joker: 0,
      chest: 0,
    },
    categoryMistakes: {},
  };

  if (typeof window === 'undefined') return defaultProfile;

  try {
    const rawValue = window.localStorage.getItem(PLAYER_PROFILE_STORAGE_KEY);
    if (!rawValue) return defaultProfile;

    const parsedValue = JSON.parse(rawValue);
    return {
      ...defaultProfile,
      ...parsedValue,
    };
  } catch {
    return defaultProfile;
  }
}

function loadOptions() {
  const defaultOptions = {
    volume: 0.7,
    turnSpeed: 1,
    minimap: true,
    reducedMotion: false,
    highContrast: false,
  };

  if (typeof window === 'undefined') return defaultOptions;

  try {
    const rawValue = window.localStorage.getItem(OPTIONS_STORAGE_KEY);
    if (!rawValue) return defaultOptions;
    return { ...defaultOptions, ...JSON.parse(rawValue) };
  } catch {
    return defaultOptions;
  }
}

function loadSkinState() {
  if (typeof window === 'undefined') {
    return { unlocked: ['classic'], selected: 'classic' };
  }

  try {
    const rawValue = window.localStorage.getItem(SKIN_STATE_STORAGE_KEY);
    if (!rawValue) return { unlocked: ['classic'], selected: 'classic' };

    const parsedValue = JSON.parse(rawValue);
    const unlocked = Array.isArray(parsedValue.unlocked) && parsedValue.unlocked.length > 0
      ? parsedValue.unlocked
      : ['classic'];
    const selected = unlocked.includes(parsedValue.selected) ? parsedValue.selected : unlocked[0];

    return { unlocked, selected };
  } catch {
    return { unlocked: ['classic'], selected: 'classic' };
  }
}

function getCurrentDateStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDailyChallengeKey(gameMode, difficulty) {
  if (gameMode === 'weekly') {
    const now = new Date();
    const janFirst = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil((((now - janFirst) / 86400000) + janFirst.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${week}-${difficulty}`;
  }

  return `${getCurrentDateStamp()}-${difficulty}`;
}

function createRunSeed(gameMode, difficulty, level) {
  if (gameMode === 'daily') {
    return hashStringToSeed(`${getCurrentDateStamp()}:${difficulty}:${level}`);
  }

  if (gameMode === 'weekly') {
    const now = new Date();
    const janFirst = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil((((now - janFirst) / 86400000) + janFirst.getDay() + 1) / 7);
    return hashStringToSeed(`${now.getFullYear()}-W${week}:${difficulty}:${level}`);
  }

  return Math.floor(Math.random() * 2147483647);
}

function getLevelConfig(difficulty, level, modeModifiers = {}) {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const extraGrowth = Math.floor((level - 1) / 3) * 2;
  const size = Math.min(settings.baseSize + (level - 1) * 2 + extraGrowth, settings.maxSize);
  const doorCount = Math.min(settings.baseDoors + level, settings.maxDoors);
  const memorizationSeconds = Math.max(
    2,
    settings.memorizationSeconds - Math.floor((level - 1) / 2) + (modeModifiers.memorizationBonus ?? 0),
  );

  return {
    ...settings,
    size,
    doorCount: Math.max(3, doorCount + (modeModifiers.extraDoors ?? 0)),
    memorizationSeconds,
  };
}

function getMissionTargets(levelConfig) {
  return {
    timeLimit: Math.max(18, Math.round(levelConfig.size * 1.7 + levelConfig.doorCount * 3.2 + 2)),
    comboTarget: Math.max(2, Math.min(levelConfig.doorCount, Math.ceil(levelConfig.doorCount * 0.65))),
  };
}

function getJokerLoadout(difficulty, perks = { joker: 0 }, skin = SKIN_CATALOG[0], gameMode = 'adventure') {
  if (difficulty === 'easy') {
    return {
      vision: 2 + perks.joker,
      insight: 2,
      freeze: 1 + Math.floor(perks.joker / 2),
    };
  }

  if (difficulty === 'normal') {
    return {
      vision: 1 + Math.min(1, perks.joker),
      insight: 1 + Math.floor(perks.joker / 2),
      freeze: 1,
    };
  }

  const loadout = {
    vision: 1 + Math.min(1, perks.joker),
    insight: 1,
    freeze: gameMode === 'hardcore' ? 0 : Math.min(1, perks.joker),
  };

  if (skin.id === 'astral') {
    loadout.vision += 1;
  }

  return loadout;
}

function getJokerLabel(jokerType) {
  if (jokerType === 'vision') return 'Boussole';
  if (jokerType === 'insight') return 'Indice';
  return 'Chrono gele';
}

function getJokerDescription(jokerType) {
  if (jokerType === 'vision') return 'Revele temporairement coffres caches et portes elite.';
  if (jokerType === 'insight') return 'La prochaine porte la plus proche montre sa bonne reponse.';
  return 'Le temps du niveau cesse d avancer pendant quelques secondes.';
}

function getRankTitle(stars, noJokerBonus) {
  if (stars === 3 && noJokerBonus) return 'Legende du labyrinthe';
  if (stars === 3) return 'Explorateur royal';
  if (stars === 2) return 'Aventurier solide';
  if (stars === 1) return 'Prometteur';
  return 'Survivant du dedale';
}

function shouldUnlockSkin(skin, level, gameMode, stars) {
  if (skin.id === 'classic') return true;
  if (skin.unlockLevel && level >= skin.unlockLevel) return true;
  if (skin.unlockDaily && gameMode === 'daily' && stars === 3) return true;
  return false;
}

function getSkinById(id) {
  return SKIN_CATALOG.find((skin) => skin.id === id) ?? SKIN_CATALOG[0];
}

function getChestRewardText(chest) {
  if (chest.rewardType === 'score') return `+${chest.rewardValue} points`;
  if (chest.rewardType === 'key') return '+1 Cle de detour';
  if (chest.rewardType === 'compass') return '+1 Boussole';
  if (chest.rewardType === 'lantern') return '+1 Lanterne';
  if (chest.rewardType === 'scroll') return '+1 Parchemin';
  return '+1 Bouclier';
}

function getWorldById(worldId) {
  return WORLD_MAP.find((world) => world.id === worldId) ?? WORLD_MAP[0];
}

function getModeConfig(gameMode, world, perks, skin) {
  const baseConfig = {
    runLength: world.chapterLength,
    baseLives: world.difficulty === 'hard' ? 3 : world.difficulty === 'normal' ? 4 : 5,
    memorizationBonus: 0,
    extraDoors: 0,
    fogMultiplier: 1,
    slippery: false,
    focusWeakness: false,
    disableJokers: false,
    noClockPressure: false,
  };

  if (gameMode === 'daily') {
    return { ...baseConfig, runLength: Math.max(3, world.chapterLength), fogMultiplier: 0.95 };
  }

  if (gameMode === 'weekly') {
    return { ...baseConfig, runLength: Math.max(4, world.chapterLength), extraDoors: 1 };
  }

  if (gameMode === 'speedrun') {
    return { ...baseConfig, runLength: Math.max(4, world.chapterLength), memorizationBonus: -1, baseLives: 3, extraDoors: 1 };
  }

  if (gameMode === 'hardcore') {
    return { ...baseConfig, runLength: Math.max(4, world.chapterLength), baseLives: 2, extraDoors: 1, fogMultiplier: 0.84, disableJokers: true };
  }

  if (gameMode === 'zen') {
    return { ...baseConfig, baseLives: 6, memorizationBonus: 2, fogMultiplier: 1.2, noClockPressure: true };
  }

  if (gameMode === 'training') {
    return { ...baseConfig, runLength: 3, memorizationBonus: 1, focusWeakness: true };
  }

  const extraLife = skin.id === 'sunrise' ? 1 : 0;
  return {
    ...baseConfig,
    baseLives: baseConfig.baseLives + extraLife + Math.floor((perks.joker ?? 0) / 2),
  };
}

function getRunEvent(gameMode, world, level) {
  const random = createSeededRandom(hashStringToSeed(`${gameMode}:${world.id}:${level}`));
  const weightedEvents = [
    { id: 'mist', label: 'Brouillard', description: 'La lecture de l espace se resserre.', slippery: false, fogMultiplier: 0.72 },
    { id: 'slippery', label: 'Sol glissant', description: 'Les mouvements ont plus d inertie.', slippery: true, fogMultiplier: 1 },
    { id: 'closing', label: 'Portes instables', description: 'Les portes chrono sont plus nombreuses.', slippery: false, fogMultiplier: 0.95 },
    { id: 'false-shortcuts', label: 'Faux raccourcis', description: 'Plus de detours tentants et de secrets.', slippery: false, fogMultiplier: 0.92 },
  ];

  if (gameMode === 'speedrun') return weightedEvents[2];
  if (gameMode === 'hardcore') return weightedEvents[0];
  if (gameMode === 'zen') return { id: 'clear', label: 'Brise claire', description: 'Vision confortable, souffle calme.', slippery: false, fogMultiplier: 1.25 };

  return weightedEvents[Math.floor(random() * weightedEvents.length)];
}

function evaluateAchievements(profile) {
  const unlocked = new Set(profile.unlockedAchievements);
  ACHIEVEMENT_CATALOG.forEach((achievement) => {
    if (achievement.predicate(profile)) {
      unlocked.add(achievement.id);
    }
  });
  return [...unlocked];
}

function drawArtifact(existingArtifacts, seedLabel) {
  const unlockedIds = new Set(existingArtifacts.map((artifact) => artifact.id));
  const availableArtifacts = ARTIFACT_CATALOG.filter((artifact) => !unlockedIds.has(artifact.id));
  if (availableArtifacts.length === 0) return null;

  const random = createSeededRandom(hashStringToSeed(seedLabel));
  return availableArtifacts[Math.floor(random() * availableArtifacts.length)];
}

function getStartingInventory(skin, gameMode) {
  return {
    key: gameMode === 'hardcore' ? 0 : 1,
    lantern: skin.id === 'grove' || gameMode === 'zen' ? 1 : 0,
    scroll: gameMode === 'training' ? 1 : 0,
    shield: gameMode === 'hardcore' ? 0 : 1,
  };
}

function Minimap({ maze, playerPosition, doors, bonusChests, accent, visible }) {
  if (!visible || !maze?.length) return null;

  const size = Math.min(maze.length, 16);
  return (
    <div
      style={{
        marginTop: '14px',
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, 10px)`,
        gap: '2px',
        justifyContent: 'start',
      }}
    >
      {maze.slice(0, size).flatMap((row, rowIndex) => row.slice(0, size).map((cell, cellIndex) => {
        const playerHere = playerPosition.cellX === cellIndex && playerPosition.cellZ === rowIndex;
        const hasClosedDoor = doors.some((door) => door.status === 'closed' && Math.round(door.x) === cellIndex && Math.round(door.y) === rowIndex);
        const hasClosedChest = bonusChests.some((chest) => chest.status === 'closed' && chest.x === cellIndex && chest.y === rowIndex);
        return (
          <div
            key={`map-${cellIndex}-${rowIndex}`}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '3px',
              background: playerHere
                ? accent
                : cell.isCenter
                  ? '#ffe082'
                  : hasClosedDoor
                    ? '#84b6ff'
                    : hasClosedChest
                      ? '#8bf3a5'
                      : 'rgba(255,255,255,0.12)',
              border: cell.isCenter ? '1px solid rgba(255,255,255,0.65)' : '1px solid rgba(255,255,255,0.05)',
            }}
          />
        );
      }))}
    </div>
  );
}

function normalizeDailyEntry(entry) {
  if (!entry) {
    return { best: null, leaderboard: [] };
  }

  if (entry.best || entry.leaderboard) {
    return {
      best: entry.best ?? null,
      leaderboard: Array.isArray(entry.leaderboard) ? entry.leaderboard : [],
    };
  }

  return {
    best: entry,
    leaderboard: [entry],
  };
}

function buildDailyLeaderboardEntry(level, score, stars) {
  const now = new Date();
  return {
    id: `${now.getTime()}-${Math.floor(Math.random() * 10000)}`,
    level,
    score,
    stars,
    playedAt: now.toISOString(),
    label: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  };
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  return `${seconds}s`;
}

function MemorizationCamera({ maze }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!maze || maze.length === 0) return;

    const cellSize = 2;
    const mazeWidth = maze[0].length * cellSize;
    const mazeHeight = maze.length * cellSize;
    const centerX = mazeWidth / 2 - cellSize / 2;
    const centerZ = mazeHeight / 2 - cellSize / 2;
    const distance = Math.max(mazeWidth, mazeHeight) * 1.4;

    camera.position.set(centerX, distance, centerZ);
    camera.up.set(0, 0, -1);
    camera.lookAt(new THREE.Vector3(centerX, 0, centerZ));
  }, [camera, maze]);

  return null;
}

function MissionLine({ label, completed, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.92rem' }}>
      <span style={{ opacity: completed ? 1 : 0.78 }}>{label}</span>
      <span style={{ color: completed ? accent : 'rgba(255,255,255,0.45)', fontWeight: 'bold' }}>
        {completed ? 'OK' : '...'}
      </span>
    </div>
  );
}

function App() {
  const soundsRef = useRef(null);
  if (soundsRef.current == null) {
    soundsRef.current = createSoundPlayer();
  }

  const [difficulty, setDifficulty] = useState('easy');
  const [worldId, setWorldId] = useState('forest');
  const [gameMode, setGameMode] = useState('adventure');
  const [level, setLevel] = useState(1);
  const [chapterNumber, setChapterNumber] = useState(1);
  const [runStep, setRunStep] = useState(1);
  const [gameSeed, setGameSeed] = useState(() => createRunSeed('adventure', 'easy', 1));
  const [phase, setPhase] = useState('intro');
  const [menuTab, setMenuTab] = useState('play');
  const [bestLevels, setBestLevels] = useState(loadBestLevels);
  const [dailyBestScores, setDailyBestScores] = useState(loadDailyStats);
  const [skinState, setSkinState] = useState(loadSkinState);
  const [totalScore, setTotalScore] = useState(loadTotalScore);
  const [playerProfile, setPlayerProfile] = useState(loadPlayerProfile);
  const [options, setOptions] = useState(loadOptions);
  const [levelTime, setLevelTime] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [usedJokers, setUsedJokers] = useState(0);
  const [lastWinBonus, setLastWinBonus] = useState(0);
  const [lastLevelSummary, setLastLevelSummary] = useState(null);
  const [notice, setNotice] = useState(null);
  const [jokers, setJokers] = useState(getJokerLoadout('easy'));
  const [visionSeconds, setVisionSeconds] = useState(0);
  const [freezeSeconds, setFreezeSeconds] = useState(0);
  const [countdown, setCountdown] = useState(DIFFICULTY_SETTINGS.easy.memorizationSeconds);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, z: 0, cellX: 0, cellZ: 0 });
  const [activeInsight, setActiveInsight] = useState(null);
  const [lives, setLives] = useState(5);
  const [inventory, setInventory] = useState({ key: 0, lantern: 0, scroll: 0, shield: 0 });
  const [runArtifacts, setRunArtifacts] = useState([]);
  const [mistGuardAvailable, setMistGuardAvailable] = useState(false);
  const [defeatSummary, setDefeatSummary] = useState(null);

  const comboRef = useRef(0);
  const selectedSkin = getSkinById(skinState.selected);
  const selectedWorld = getWorldById(worldId);
  const modeConfig = getModeConfig(gameMode, selectedWorld, playerProfile.perks, selectedSkin);
  const runEvent = getRunEvent(gameMode, selectedWorld, level);
  const weakestCategory = Object.entries(playerProfile.categoryMistakes ?? {})
    .sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
  const focusCategory = modeConfig.focusWeakness ? weakestCategory : null;
  const levelConfig = getLevelConfig(difficulty, level, modeConfig);
  const selectedDifficulty = DIFFICULTY_SETTINGS[difficulty];
  const missionTargets = getMissionTargets(levelConfig);
  const dailyChallengeKey = getDailyChallengeKey(gameMode, difficulty);
  const dailyEntry = normalizeDailyEntry(dailyBestScores[dailyChallengeKey]);
  const dailyBest = dailyEntry.best;
  const dailyLeaderboard = dailyEntry.leaderboard;

  const {
    maze,
    won,
    setWon,
    doors,
    setDoors,
    bonusChests,
    setBonusChests,
  } = useGame(
    levelConfig.size,
    levelConfig.size,
    gameSeed,
    levelConfig.doorCount,
    difficulty,
    level,
    {
      focusCategory,
      eventId: runEvent.id,
      chapterStep: runStep,
      runLength: modeConfig.runLength,
      chestBonus: (playerProfile.perks?.chest ?? 0) + (selectedSkin.id === 'grove' ? 1 : 0),
    },
  );

  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(BEST_LEVELS_STORAGE_KEY, JSON.stringify(bestLevels));
  }, [bestLevels]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(DAILY_STATS_STORAGE_KEY, JSON.stringify(dailyBestScores));
  }, [dailyBestScores]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SKIN_STATE_STORAGE_KEY, JSON.stringify(skinState));
  }, [skinState]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TOTAL_SCORE_STORAGE_KEY, String(totalScore));
  }, [totalScore]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(PLAYER_PROFILE_STORAGE_KEY, JSON.stringify(playerProfile));
  }, [playerProfile]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(options));
  }, [options]);

  useEffect(() => {
    soundsRef.current?.setVolume(options.volume);
  }, [options.volume]);

  useEffect(() => {
    if (phase !== 'memorizing') return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountdown(levelConfig.memorizationSeconds);
    if (runStep === modeConfig.runLength) {
      soundsRef.current?.boss();
    }

    const intervalId = window.setInterval(() => {
      setCountdown((value) => (value > 1 ? value - 1 : 1));
    }, 1000);

    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId);
      setPhase('playing');
    }, levelConfig.memorizationSeconds * 1000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [gameSeed, levelConfig.memorizationSeconds, modeConfig.runLength, phase, runStep]);

  useEffect(() => {
    if (phase !== 'playing' || freezeSeconds > 0 || modeConfig.noClockPressure) return;

    const intervalId = window.setInterval(() => {
      setLevelTime((value) => value + 1);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [freezeSeconds, modeConfig.noClockPressure, phase]);

  useEffect(() => {
    if (phase !== 'playing' || freezeSeconds <= 0) return;

    const timeoutId = window.setTimeout(() => {
      setFreezeSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [freezeSeconds, phase]);

  useEffect(() => {
    if (phase !== 'playing' || visionSeconds <= 0) return;

    const timeoutId = window.setTimeout(() => {
      setVisionSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [phase, visionSeconds]);

  useEffect(() => {
    if (phase !== 'playing' || !activeInsight) return;

    const timeoutId = window.setTimeout(() => {
      setActiveInsight((currentInsight) => {
        if (!currentInsight) return null;
        const nextSeconds = currentInsight.seconds - 1;
        return nextSeconds > 0 ? { ...currentInsight, seconds: nextSeconds } : null;
      });
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeInsight, phase]);

  useEffect(() => {
    if (!(won && phase === 'playing')) return;

    const missions = [
      {
        label: 'Zero faute',
        completed: mistakes === 0,
      },
      {
        label: `Sous ${missionTargets.timeLimit}s`,
        completed: levelTime <= missionTargets.timeLimit,
      },
      {
        label: `Combo x${missionTargets.comboTarget}`,
        completed: maxCombo >= missionTargets.comboTarget,
      },
    ];
    const starCount = missions.filter((mission) => mission.completed).length;
    const noJokerBonus = usedJokers === 0;
    const openedChestCount = bonusChests.filter((chest) => chest.status === 'open').length;
    const eliteDoorCount = doors.filter((door) => door.tier === 'elite').length;
    const timedDoorCount = doors.filter((door) => door.tier === 'timed').length;
    const trapDoorCount = doors.filter((door) => door.tier === 'trap').length;
    const bonusDoorCount = doors.filter((door) => door.tier === 'bonus').length;
    const bossDoorCount = doors.filter((door) => door.tier === 'boss').length;
    const chapterCompleted = runStep >= modeConfig.runLength;
    const perkReward = chapterCompleted ? 1 : 0;
    const winBonus = 120 + level * 55 + Math.max(0, 90 - levelTime * 3) + starCount * 45 + (noJokerBonus ? 60 : 0) + openedChestCount * 25 + bossDoorCount * 90;
    const finalScore = levelScore + winBonus;
    const newlyUnlockedSkins = SKIN_CATALOG.filter((skin) => (
      !skinState.unlocked.includes(skin.id) && shouldUnlockSkin(skin, level, gameMode, starCount)
    ));

    soundsRef.current?.win();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBestLevels((previous) => ({
      ...previous,
      [difficulty]: Math.max(previous[difficulty] ?? 0, level),
    }));

    if (gameMode === 'daily' || gameMode === 'weekly') {
      setDailyBestScores((previous) => {
        const currentEntry = normalizeDailyEntry(previous[dailyChallengeKey]);
        const candidateEntry = buildDailyLeaderboardEntry(level, finalScore, starCount);
        const leaderboard = [...currentEntry.leaderboard, candidateEntry]
          .sort((left, right) => {
            if (right.level !== left.level) return right.level - left.level;
            if (right.score !== left.score) return right.score - left.score;
            return right.stars - left.stars;
          })
          .slice(0, 5);
        const best = leaderboard[0] ?? currentEntry.best ?? candidateEntry;

        return {
          ...previous,
          [dailyChallengeKey]: {
            best,
            leaderboard,
          },
        };
      });
    }

    if (newlyUnlockedSkins.length > 0) {
      setSkinState((previous) => ({
        ...previous,
        unlocked: [...new Set([...previous.unlocked, ...newlyUnlockedSkins.map((skin) => skin.id)])],
      }));
    }

    setLevelScore(finalScore);
    setTotalScore((value) => value + finalScore);
    setPlayerProfile((previous) => {
      const unlockedWorlds = WORLD_MAP
        .filter((world) => previous.totalStars + starCount >= world.unlockStars)
        .map((world) => world.id);

      const updatedProfile = {
        ...previous,
        totalWins: previous.totalWins + 1,
        totalStars: previous.totalStars + starCount,
        totalChestsOpened: previous.totalChestsOpened + openedChestCount,
        totalEliteDoorsCleared: previous.totalEliteDoorsCleared + eliteDoorCount,
        totalTimedDoorsCleared: previous.totalTimedDoorsCleared + timedDoorCount,
        totalTrapDoorsCleared: previous.totalTrapDoorsCleared + trapDoorCount,
        totalBonusDoorsCleared: previous.totalBonusDoorsCleared + bonusDoorCount,
        totalBossDoorsCleared: previous.totalBossDoorsCleared + bossDoorCount,
        totalArtifactsFound: previous.totalArtifactsFound + runArtifacts.length,
        chapterWins: previous.chapterWins + (chapterCompleted ? 1 : 0),
        bestScore: Math.max(previous.bestScore, finalScore),
        maxCombo: Math.max(previous.maxCombo, maxCombo),
        totalTimePlayed: previous.totalTimePlayed + levelTime,
        dailyPerfectRuns: previous.dailyPerfectRuns + ((gameMode === 'daily' || gameMode === 'weekly') && starCount === 3 ? 1 : 0),
        perkPoints: previous.perkPoints + perkReward,
        completedChapters: {
          ...previous.completedChapters,
          [selectedWorld.id]: Math.max(previous.completedChapters?.[selectedWorld.id] ?? 0, chapterNumber),
        },
        unlockedWorlds: [...new Set([...previous.unlockedWorlds, ...unlockedWorlds])],
      };

      return {
        ...updatedProfile,
        unlockedAchievements: evaluateAchievements(updatedProfile),
      };
    });
    setLastWinBonus(winBonus);
    setLastLevelSummary({
      missions,
      starCount,
      noJokerBonus,
      finalScore,
      title: getRankTitle(starCount, noJokerBonus),
      openedChestCount,
      eliteDoorCount,
      timedDoorCount,
      trapDoorCount,
      bonusDoorCount,
      bossDoorCount,
      chapterCompleted,
      perkReward,
      artifactLabels: runArtifacts.map((artifact) => artifact.label),
      newlyUnlockedSkins: newlyUnlockedSkins.map((skin) => skin.label),
    });
    setPhase('won');
  }, [
    bonusChests,
    chapterNumber,
    dailyChallengeKey,
    difficulty,
    doors,
    gameMode,
    level,
    levelScore,
    levelTime,
    maxCombo,
    missionTargets.comboTarget,
    missionTargets.timeLimit,
    mistakes,
    phase,
    runArtifacts,
    runStep,
    skinState.unlocked,
    selectedWorld.id,
    usedJokers,
    won,
    modeConfig.runLength,
  ]);

  useEffect(() => {
    if (!notice) return;

    const timeoutId = window.setTimeout(() => {
      setNotice(null);
    }, 2400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notice]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code !== 'Escape') return;
      if (phase !== 'playing' && phase !== 'paused') return;

      event.preventDefault();
      soundsRef.current?.click();
      setPhase((value) => (value === 'playing' ? 'paused' : 'playing'));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase]);

  const resetRunState = (nextPhase, nextDifficulty = difficulty) => {
    setWon(false);
    setLevelTime(0);
    setLevelScore(0);
    setCombo(0);
    setMaxCombo(0);
    setMistakes(0);
    setUsedJokers(0);
    setLastWinBonus(0);
    setLastLevelSummary(null);
    setNotice(null);
    setVisionSeconds(0);
    setFreezeSeconds(0);
    setActiveInsight(null);
    setJokers(getJokerLoadout(nextDifficulty, playerProfile.perks, selectedSkin, gameMode));
    setPlayerPosition({ x: 0, z: 0, cellX: 0, cellZ: 0 });
    setMistGuardAvailable(runArtifacts.some((artifact) => artifact.id === 'mist_guard'));
    setPhase(nextPhase);
  };

  const startGame = () => {
    soundsRef.current?.start();
    setDifficulty(selectedWorld.difficulty);
    setLevel(1);
    setChapterNumber(1);
    setRunStep(1);
    setRunArtifacts([]);
    setInventory(getStartingInventory(selectedSkin, gameMode));
    setLives(modeConfig.baseLives);
    setMistGuardAvailable(false);
    setDefeatSummary(null);
    setGameSeed(createRunSeed(gameMode, selectedWorld.difficulty, 1));
    setPlayerProfile((previous) => ({ ...previous, totalRuns: previous.totalRuns + 1 }));
    resetRunState('memorizing', selectedWorld.difficulty);
  };

  const restartGame = () => {
    soundsRef.current?.click();
    setChapterNumber(1);
    setRunStep(1);
    setRunArtifacts([]);
    setInventory(getStartingInventory(selectedSkin, gameMode));
    setLives(modeConfig.baseLives);
    setMistGuardAvailable(false);
    setDefeatSummary(null);
    setGameSeed(createRunSeed(gameMode, difficulty, 1));
    setPlayerProfile((previous) => ({ ...previous, totalRuns: previous.totalRuns + 1 }));
    resetRunState('memorizing', difficulty);
  };

  const replayLevel = () => {
    soundsRef.current?.click();
    setGameSeed(createRunSeed(gameMode, difficulty, level));
    setPlayerProfile((previous) => ({ ...previous, totalRuns: previous.totalRuns + 1 }));
    resetRunState('memorizing', difficulty);
  };

  const goToNextLevel = () => {
    const nextRunStep = runStep + 1;
    const nextChapter = nextRunStep > modeConfig.runLength ? chapterNumber + 1 : chapterNumber;
    const normalizedRunStep = nextRunStep > modeConfig.runLength ? 1 : nextRunStep;
    const nextLevel = level + 1;
    soundsRef.current?.nextLevel();
    setLevel(nextLevel);
    setChapterNumber(nextChapter);
    setRunStep(normalizedRunStep);
    setLives((value) => (normalizedRunStep === 1 ? modeConfig.baseLives : value));
    setMistGuardAvailable(runArtifacts.some((artifact) => artifact.id === 'mist_guard'));
    setGameSeed(createRunSeed(gameMode, difficulty, nextLevel));
    setPlayerProfile((previous) => ({ ...previous, totalRuns: previous.totalRuns + 1 }));
    resetRunState('memorizing', difficulty);
  };

  const returnToMenu = () => {
    soundsRef.current?.click();
    setLevel(1);
    setChapterNumber(1);
    setRunStep(1);
    setLives(modeConfig.baseLives);
    setInventory(getStartingInventory(selectedSkin, gameMode));
    setRunArtifacts([]);
    setDefeatSummary(null);
    setMistGuardAvailable(false);
    resetRunState('intro', difficulty);
  };

  const togglePause = () => {
    soundsRef.current?.click();
    setPhase((value) => (value === 'playing' ? 'paused' : 'playing'));
  };

  const handleDoorAnswer = ({ correct, door }) => {
    const isElite = door.tier === 'elite';
    const isBoss = door.tier === 'boss';
    const isTrap = door.tier === 'trap';
    const isTimed = door.tier === 'timed';
    const isBonus = door.tier === 'bonus';
    const eliteArtifactActive = runArtifacts.some((artifact) => artifact.id === 'elite_double');
    const comboBooster = 1 + (playerProfile.perks.combo ?? 0) * 0.12;

    if (correct) {
      const nextCombo = comboRef.current + 1;
      const comboBonusBase = isBoss
        ? 180
        : isElite
          ? 90
          : isTimed
            ? 65
            : isBonus
              ? 70
              : 40;
      let comboBonus = comboBonusBase + (nextCombo - 1) * (isElite || isBoss ? 18 : 12);
      if (eliteArtifactActive && isElite) comboBonus *= 2;
      if (selectedSkin.id === 'royal' && isElite) comboBonus += 45;
      comboBonus = Math.round(comboBonus * comboBooster);

      soundsRef.current?.success();
      setCombo(nextCombo);
      setMaxCombo((value) => Math.max(value, nextCombo));
      setLevelScore((value) => value + comboBonus);
      if (isBonus || isBoss) {
        const artifact = drawArtifact(runArtifacts, `${door.id}:${level}:${chapterNumber}`);
        if (artifact) {
          setRunArtifacts((previous) => [...previous, artifact]);
          setNotice({
            tone: 'success',
            text: `${artifact.label} trouve: ${artifact.description}`,
          });
        }
      } else {
        setNotice({
          tone: 'success',
          text: isBoss
            ? `Gardien vaincu: +${comboBonus} points, combo x${nextCombo}`
            : isElite
              ? `Porte elite franchie: +${comboBonus} points, combo x${nextCombo}`
              : isTimed
                ? `Porte chrono reussie: +${comboBonus} points, combo x${nextCombo}`
                : isBonus
                  ? `Detour bonus reussi: +${comboBonus} points, combo x${nextCombo}`
                  : `${door.question.category} maitrise: +${comboBonus} points, combo x${nextCombo}`,
        });
      }
      return;
    }

    soundsRef.current?.error();
    setCombo(0);
    setMistakes((value) => value + 1);
    setPlayerProfile((previous) => ({
      ...previous,
      categoryMistakes: {
        ...previous.categoryMistakes,
        [door.question.category]: (previous.categoryMistakes?.[door.question.category] ?? 0) + 1,
      },
    }));
    setLevelScore((value) => Math.max(0, value - (isBoss ? 45 : isElite ? 30 : isTrap ? 26 : 15)));

    const damageAmount = isBoss ? 2 : isTrap ? 2 : isBonus ? 0 : 1;
    if (damageAmount > 0) {
      if ((isTrap || isBonus) && inventory.key > 0) {
        setInventory((previous) => ({ ...previous, key: Math.max(0, previous.key - 1) }));
        setNotice({
          tone: 'info',
          text: 'Cle utilisee: le detour piege ne te blesse pas.',
        });
      } else if (mistGuardAvailable) {
        setMistGuardAvailable(false);
        setNotice({
          tone: 'info',
          text: 'Voile protecteur: le premier degat de ce niveau a ete annule.',
        });
      } else if (inventory.shield > 0) {
        setInventory((previous) => ({ ...previous, shield: Math.max(0, previous.shield - 1) }));
        setNotice({
          tone: 'info',
          text: 'Bouclier consomme: aucune vie perdue.',
        });
      } else {
        soundsRef.current?.damage();
        const nextLives = Math.max(0, lives - damageAmount);
        setLives(nextLives);
        setPlayerProfile((previous) => ({
          ...previous,
          totalHeartsLost: previous.totalHeartsLost + damageAmount,
        }));
        if (nextLives === 0) {
          setDefeatSummary({
            chapterNumber,
            runStep,
            level,
            levelScore,
            openedChestCount: bonusChests.filter((chest) => chest.status === 'open').length,
            artifacts: runArtifacts.map((artifact) => artifact.label),
          });
          setPhase('lost');
        }
        setNotice({
          tone: 'error',
          text: isBoss
            ? 'Le gardien frappe fort: 2 vies perdues.'
            : isTrap
              ? 'Porte piege: 2 vies perdues.'
              : isTimed
                ? 'Porte chrono ratee: 1 vie perdue.'
                : 'Oups. La porte s ouvre quand meme, mais tu perds 1 vie.',
        });
      }
    } else {
      setNotice({
        tone: 'error',
        text: 'Le detour bonus se referme, mais tu ne perds pas de vie.',
      });
    }
  };

  const spendJoker = (jokerType) => {
    if (modeConfig.disableJokers) {
      setNotice({
        tone: 'info',
        text: 'Mode hardcore: les jokers sont scelles pour ce run.',
      });
      return false;
    }

    const remainingUses = jokers[jokerType] ?? 0;
    if (remainingUses <= 0) {
      setNotice({
        tone: 'info',
        text: `Plus de joker ${getJokerLabel(jokerType).toLowerCase()} pour ce niveau.`,
      });
      return false;
    }

    setJokers((previous) => ({ ...previous, [jokerType]: previous[jokerType] - 1 }));
    setUsedJokers((value) => value + 1);
    soundsRef.current?.click();
    return true;
  };

  const useVision = () => {
    if (!spendJoker('vision')) return;

    const bonusVision = (playerProfile.perks.vision ?? 0) * 2 + (selectedSkin.id === 'moon' ? 2 : 0) + inventory.lantern * 2;
    setVisionSeconds(7 + bonusVision);
    setNotice({
      tone: 'success',
      text: 'Boussole activee: secrets, detours et portes rares scintillent.',
    });
  };

  const useFreeze = () => {
    if (!spendJoker('freeze')) return;

    setFreezeSeconds((value) => Math.max(value, 5));
    setNotice({
      tone: 'success',
      text: 'Chrono gele pendant 5 secondes.',
    });
  };

  const useInsight = () => {
    if (!spendJoker('insight')) return;

    const closedDoors = doors.filter((door) => door.status === 'closed');
    if (closedDoors.length === 0) {
      setNotice({
        tone: 'info',
        text: 'Aucune porte fermee a analyser pour le moment.',
      });
      setJokers((previous) => ({ ...previous, insight: previous.insight + 1 }));
      setUsedJokers((value) => Math.max(0, value - 1));
      return;
    }

    const targetDoor = closedDoors.reduce((closestDoor, currentDoor) => {
      if (!closestDoor) return currentDoor;

      const closestDistance = Math.hypot(playerPosition.x - closestDoor.x * 2, playerPosition.z - closestDoor.y * 2);
      const currentDistance = Math.hypot(playerPosition.x - currentDoor.x * 2, playerPosition.z - currentDoor.y * 2);
      return currentDistance < closestDistance ? currentDoor : closestDoor;
    }, null);

    setActiveInsight({ doorId: targetDoor.id, seconds: 6 });
    setNotice({
      tone: 'success',
      text: `Indice actif sur une porte de ${targetDoor.question.category}.`,
    });
  };

  const handlePlayerMove = (nextPosition) => {
    setPlayerPosition(nextPosition);
    if (phase !== 'playing') return;

    const collectedChest = bonusChests.find((chest) => (
      chest.status === 'closed'
      && chest.x === nextPosition.cellX
      && chest.y === nextPosition.cellZ
    ));

    if (!collectedChest) return;

    setBonusChests((previousChests) => previousChests.map((chest) => (
      chest.id === collectedChest.id
        ? { ...chest, status: 'open' }
        : chest
    )));

    if (collectedChest.rewardType === 'score') {
      setLevelScore((value) => value + collectedChest.rewardValue);
    } else if (collectedChest.rewardType === 'key') {
      setInventory((previous) => ({ ...previous, key: previous.key + 1 }));
    } else if (collectedChest.rewardType === 'compass') {
      setJokers((previous) => ({ ...previous, vision: previous.vision + 1 }));
    } else if (collectedChest.rewardType === 'lantern') {
      setInventory((previous) => ({ ...previous, lantern: previous.lantern + 1 }));
    } else if (collectedChest.rewardType === 'scroll') {
      setInventory((previous) => ({ ...previous, scroll: previous.scroll + 1 }));
      setJokers((previous) => ({ ...previous, insight: previous.insight + 1 }));
    } else {
      setInventory((previous) => ({ ...previous, shield: previous.shield + 1 }));
    }

    if (runArtifacts.some((artifact) => artifact.id === 'treasure_joker')) {
      setJokers((previous) => ({ ...previous, vision: previous.vision + 1 }));
    }

    soundsRef.current?.pickup();
    setNotice({
      tone: 'success',
      text: `Coffre trouve: ${getChestRewardText(collectedChest)}`,
    });
  };

  const upgradePerk = (perkId) => {
    if ((playerProfile.perkPoints ?? 0) <= 0) {
      setNotice({
        tone: 'info',
        text: 'Il faut finir des chapitres pour gagner des points de progression.',
      });
      return;
    }

    soundsRef.current?.click();
    setPlayerProfile((previous) => ({
      ...previous,
      perkPoints: previous.perkPoints - 1,
      perks: {
        ...previous.perks,
        [perkId]: (previous.perks?.[perkId] ?? 0) + 1,
      },
    }));
  };

  const bestLevelForDifficulty = bestLevels[difficulty] ?? 0;
  const globalBestLevel = Math.max(...Object.values(bestLevels), 0);
  const showWonScene = phase === 'won';
  const memorizationProgress = countdown / levelConfig.memorizationSeconds;
  const sceneTheme = selectedDifficulty.theme;
  const centerCell = Math.floor(levelConfig.size / 2);
  const distanceToCenter = Math.hypot(playerPosition.cellX - centerCell, playerPosition.cellZ - centerCell);
  const maxDistanceToCenter = Math.hypot(centerCell, centerCell) || 1;
  const centerHeat = Math.max(0, 1 - distanceToCenter / maxDistanceToCenter);
  const activeMissions = [
    { label: 'Zero faute', completed: mistakes === 0 },
    { label: `Sous ${missionTargets.timeLimit}s`, completed: levelTime <= missionTargets.timeLimit },
    { label: `Combo x${missionTargets.comboTarget}`, completed: maxCombo >= missionTargets.comboTarget },
  ];
  const openedChestCount = bonusChests.filter((chest) => chest.status === 'open').length;
  const eliteDoorCount = doors.filter((door) => door.tier === 'elite').length;
  const unlockedAchievementSet = new Set(playerProfile.unlockedAchievements);
  const totalCompletedChapters = Object.values(playerProfile.completedChapters ?? {}).reduce((sum, value) => sum + value, 0);
  const minimapVisible = (options.minimap || inventory.lantern > 0) && (phase === 'playing' || phase === 'paused');

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: sceneTheme.rootBackground,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {phase === 'intro' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.78)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontFamily: 'sans-serif',
            padding: '24px',
          }}
        >
          <div
            style={{
              ...SURFACE_STYLE,
              width: 'min(1080px, 94vw)',
              borderRadius: '26px',
              padding: '34px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.72 }}>
              Labyrinthe Magique
            </div>
            <h1 style={{ margin: '14px 0 12px', fontSize: '3.2rem' }}>Aventure grammaticale roguelite</h1>
            <p style={{ fontSize: '1.08rem', marginBottom: '20px', lineHeight: '1.6', opacity: 0.92 }}>
              La poule messagere doit traverser les mondes du dedale sacre avant que le Minotaure ne ferme le coeur du sanctuaire.
              <br />
              Chaque run melange memoire, exploration, objets, portes speciales et questions de grammaire.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
              {[
                { id: 'play', label: 'Jouer' },
                { id: 'profile', label: 'Profil' },
                { id: 'collection', label: 'Collection' },
                { id: 'options', label: 'Options' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    soundsRef.current?.click();
                    setMenuTab(tab.id);
                  }}
                  style={{
                    ...LIGHT_BUTTON_STYLE,
                    background: menuTab === tab.id ? selectedWorld.color : 'rgba(255,255,255,0.16)',
                    color: 'white',
                    minWidth: '150px',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {menuTab === 'play' && (
              <>
                <div style={{ display: 'flex', gap: '14px', marginBottom: '22px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {WORLD_MAP.map((world) => {
                    const isUnlocked = playerProfile.unlockedWorlds.includes(world.id);
                    const isSelected = world.id === worldId;

                    return (
                      <button
                        key={world.id}
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => {
                          if (!isUnlocked) return;
                          soundsRef.current?.click();
                          setWorldId(world.id);
                          setDifficulty(world.difficulty);
                        }}
                        style={{
                          width: '188px',
                          padding: '16px',
                          borderRadius: '16px',
                          border: isSelected ? `2px solid ${world.color}` : '2px solid rgba(255,255,255,0.14)',
                          background: isUnlocked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                          color: 'white',
                          cursor: isUnlocked ? 'pointer' : 'not-allowed',
                          textAlign: 'left',
                          opacity: isUnlocked ? 1 : 0.45,
                        }}
                      >
                        <div style={{ fontWeight: 'bold', color: world.color }}>{world.label}</div>
                        <div style={{ marginTop: '5px', fontSize: '0.8rem', opacity: 0.78 }}>
                          {DIFFICULTY_SETTINGS[world.difficulty].label} • {world.chapterLength} etapes
                        </div>
                        <div style={{ marginTop: '10px', fontSize: '0.84rem', lineHeight: '1.45', opacity: 0.88 }}>
                          {isUnlocked ? world.flavor : `${world.unlockStars} etoiles requises`}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '22px' }}>
                  {GAME_MODES.map((mode) => {
                    const isSelected = gameMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => {
                          soundsRef.current?.click();
                          setGameMode(mode.id);
                        }}
                        style={{
                          width: '220px',
                          padding: '14px',
                          borderRadius: '14px',
                          border: isSelected ? `2px solid ${selectedWorld.color}` : '2px solid rgba(255,255,255,0.14)',
                          background: isSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                          color: 'white',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ fontWeight: 'bold' }}>{mode.label}</div>
                        <div style={{ marginTop: '6px', fontSize: '0.84rem', opacity: 0.78 }}>{mode.description}</div>
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginBottom: '22px',
                    padding: '18px 22px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.08)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '1.08rem', fontWeight: 'bold', color: selectedWorld.color }}>
                    {selectedWorld.label} • Chapitre de {modeConfig.runLength} labyrinthes • {GAME_MODES.find((mode) => mode.id === gameMode)?.label}
                  </div>
                  <div style={{ marginTop: '8px', opacity: 0.9 }}>
                    {selectedWorld.flavor}
                  </div>
                  <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px 16px', fontSize: '0.92rem' }}>
                    <div>Labyrinthe de depart: <strong>{levelConfig.size}x{levelConfig.size}</strong></div>
                    <div>Portes: <strong>{levelConfig.doorCount}</strong></div>
                    <div>Memoire: <strong>{levelConfig.memorizationSeconds}s</strong></div>
                    <div>Vies de depart: <strong>{modeConfig.baseLives}</strong></div>
                    <div>Evenement probable: <strong>{runEvent.label}</strong></div>
                    <div>Focus pedagogique: <strong>{focusCategory ?? 'varie'}</strong></div>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '0.92rem', opacity: 0.78 }}>
                    Jokers de depart: Boussole x{getJokerLoadout(difficulty, playerProfile.perks, selectedSkin, gameMode).vision}, Indice x{getJokerLoadout(difficulty, playerProfile.perks, selectedSkin, gameMode).insight}, Chrono gele x{getJokerLoadout(difficulty, playerProfile.perks, selectedSkin, gameMode).freeze}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.92rem', opacity: 0.82 }}>
                    Meilleur niveau {selectedDifficulty.label.toLowerCase()} : {bestLevelForDifficulty || 'aucun'} • Record global : {globalBestLevel || 'aucun'}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.92rem', opacity: 0.88 }}>
                    Score total cumule : {totalScore} • Chapitres termines : {totalCompletedChapters}
                  </div>
                  {(gameMode === 'daily' || gameMode === 'weekly') && (
                    <>
                      <div style={{ marginTop: '8px', fontSize: '0.92rem', opacity: 0.84 }}>
                        Aujourd hui: {dailyBest ? `niveau ${dailyBest.level}, ${dailyBest.score} pts, ${dailyBest.stars} etoiles` : 'aucun score enregistre'}
                      </div>
                      <div style={{ marginTop: '12px', textAlign: 'left', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 14px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Top local</div>
                        {dailyLeaderboard.length === 0 && (
                          <div style={{ fontSize: '0.88rem', opacity: 0.7 }}>Aucune tentative enregistree pour l instant.</div>
                        )}
                        {dailyLeaderboard.map((entry, index) => (
                          <div key={entry.id ?? `${entry.level}-${entry.score}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.88rem', padding: '4px 0' }}>
                            <span>#{index + 1} • {entry.label ?? 'Run'} • niv. {entry.level}</span>
                            <span>{entry.score} pts • {entry.stars}★</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <button
                  style={{
                    ...LIGHT_BUTTON_STYLE,
                    padding: '15px 40px',
                    fontSize: '20px',
                    background: selectedWorld.color,
                    color: 'white',
                  }}
                  onClick={startGame}
                >
                  {gameMode === 'daily' ? 'Lancer le defi du jour' : gameMode === 'weekly' ? 'Lancer le defi hebdo' : 'Commencer le chapitre'}
                </button>
              </>
            )}

            {menuTab === 'profile' && (
              <div style={{ display: 'grid', gap: '18px', textAlign: 'left' }}>
                <div style={{ padding: '18px 22px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px' }}>Carnet de progression</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px 18px', fontSize: '0.92rem' }}>
                    <div>Score total: <strong>{totalScore}</strong></div>
                    <div>Parties lancees: <strong>{playerProfile.totalRuns}</strong></div>
                    <div>Victoires: <strong>{playerProfile.totalWins}</strong></div>
                    <div>Chapitres termines: <strong>{playerProfile.chapterWins}</strong></div>
                    <div>Meilleur score: <strong>{playerProfile.bestScore}</strong></div>
                    <div>Etoiles gagnees: <strong>{playerProfile.totalStars}</strong></div>
                    <div>Combo record: <strong>x{playerProfile.maxCombo}</strong></div>
                    <div>Coffres ouverts: <strong>{playerProfile.totalChestsOpened}</strong></div>
                    <div>Portes elite: <strong>{playerProfile.totalEliteDoorsCleared}</strong></div>
                    <div>Portes gardiennes: <strong>{playerProfile.totalBossDoorsCleared}</strong></div>
                    <div>Artefacts trouves: <strong>{playerProfile.totalArtifactsFound}</strong></div>
                    <div>Temps joue: <strong>{formatDuration(playerProfile.totalTimePlayed)}</strong></div>
                  </div>
                </div>

                <div style={{ padding: '18px 22px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px' }}>Arbre de progression</div>
                  <div style={{ marginBottom: '12px', opacity: 0.84 }}>Points disponibles: <strong>{playerProfile.perkPoints}</strong></div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px 14px' }}>
                    {[
                      { id: 'vision', label: 'Vision', description: 'Boussole et lecture de l espace plus confortables.' },
                      { id: 'combo', label: 'Combo', description: 'Les bonnes series rapportent davantage.' },
                      { id: 'joker', label: 'Joker', description: 'Plus de ressources en debut de run.' },
                      { id: 'chest', label: 'Coffres', description: 'Davantage de secrets et de detours rentables.' },
                    ].map((perk) => (
                      <div key={perk.id} style={{ borderRadius: '12px', padding: '14px', background: 'rgba(255,255,255,0.05)' }}>
                        <div style={{ fontWeight: 'bold' }}>{perk.label} • niv. {playerProfile.perks?.[perk.id] ?? 0}</div>
                        <div style={{ marginTop: '6px', fontSize: '0.84rem', opacity: 0.8 }}>{perk.description}</div>
                        <button
                          type="button"
                          disabled={(playerProfile.perkPoints ?? 0) <= 0}
                          onClick={() => upgradePerk(perk.id)}
                          style={{
                            ...LIGHT_BUTTON_STYLE,
                            marginTop: '10px',
                            width: '100%',
                            background: (playerProfile.perkPoints ?? 0) > 0 ? selectedWorld.color : 'rgba(255,255,255,0.24)',
                            color: 'white',
                          }}
                        >
                          Ameliorer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {menuTab === 'collection' && (
              <div style={{ display: 'grid', gap: '18px' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px' }}>Choisis ton skin</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {SKIN_CATALOG.map((skin) => {
                      const isUnlocked = skinState.unlocked.includes(skin.id);
                      const isSelected = skinState.selected === skin.id;

                      return (
                        <button
                          key={skin.id}
                          type="button"
                          disabled={!isUnlocked}
                          onClick={() => {
                            if (!isUnlocked) return;
                            soundsRef.current?.click();
                            setSkinState((previous) => ({ ...previous, selected: skin.id }));
                          }}
                          style={{
                            width: '178px',
                            padding: '14px',
                            borderRadius: '14px',
                            border: isSelected ? `2px solid ${skin.aura}` : '2px solid rgba(255,255,255,0.12)',
                            background: isUnlocked ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.03)',
                            color: 'white',
                            cursor: isUnlocked ? 'pointer' : 'not-allowed',
                            opacity: isUnlocked ? 1 : 0.5,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '999px', background: skin.tint, boxShadow: `0 0 18px ${skin.aura}` }} />
                          </div>
                          <div style={{ fontWeight: 'bold' }}>{skin.label}</div>
                          <div style={{ marginTop: '6px', fontSize: '0.78rem', opacity: 0.74 }}>{skin.unlockText}</div>
                          <div style={{ marginTop: '6px', fontSize: '0.76rem', color: skin.aura }}>{skin.gameplay}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ padding: '18px 22px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', textAlign: 'left' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px' }}>Succes persistants</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px 14px' }}>
                    {ACHIEVEMENT_CATALOG.map((achievement) => {
                      const unlocked = unlockedAchievementSet.has(achievement.id);
                      return (
                        <div key={achievement.id} style={{ padding: '14px', borderRadius: '12px', background: unlocked ? 'rgba(120,217,138,0.18)' : 'rgba(255,255,255,0.05)', opacity: unlocked ? 1 : 0.62 }}>
                          <div style={{ fontWeight: 'bold', color: unlocked ? '#b8ffcb' : 'white' }}>{achievement.label}</div>
                          <div style={{ marginTop: '6px', fontSize: '0.84rem', opacity: 0.84 }}>{achievement.description}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {menuTab === 'options' && (
              <div style={{ display: 'grid', gap: '18px', textAlign: 'left' }}>
                <div style={{ padding: '18px 22px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px' }}>Reglages</div>
                  <div style={{ display: 'grid', gap: '14px' }}>
                    <label>
                      <div style={{ marginBottom: '6px' }}>Volume global: {Math.round(options.volume * 100)}%</div>
                      <input type="range" min="0" max="1" step="0.05" value={options.volume} onChange={(event) => setOptions((previous) => ({ ...previous, volume: Number(event.target.value) }))} style={{ width: '100%' }} />
                    </label>
                    <label>
                      <div style={{ marginBottom: '6px' }}>Sensibilite de rotation: x{options.turnSpeed.toFixed(1)}</div>
                      <input type="range" min="0.7" max="1.5" step="0.1" value={options.turnSpeed} onChange={(event) => setOptions((previous) => ({ ...previous, turnSpeed: Number(event.target.value) }))} style={{ width: '100%' }} />
                    </label>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <span>Mini-carte debloquee</span>
                      <input type="checkbox" checked={options.minimap} onChange={(event) => setOptions((previous) => ({ ...previous, minimap: event.target.checked }))} />
                    </label>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <span>Animations reduites</span>
                      <input type="checkbox" checked={options.reducedMotion} onChange={(event) => setOptions((previous) => ({ ...previous, reducedMotion: event.target.checked }))} />
                    </label>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <span>Contraste renforce</span>
                      <input type="checkbox" checked={options.highContrast} onChange={(event) => setOptions((previous) => ({ ...previous, highContrast: event.target.checked }))} />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {phase !== 'intro' && (
        <>
          <Canvas shadows camera={{ fov: 75 }}>
            <color attach="background" args={[sceneTheme.sceneColor]} />
            <fog
              attach="fog"
              args={[
                sceneTheme.fogColor,
                10,
                levelConfig.size * 4.6 * runEvent.fogMultiplier * (inventory.lantern > 0 ? 1.15 : 1) * (options.highContrast ? 1.08 : 1),
              ]}
            />
            <Sky sunPosition={sceneTheme.sunPosition} turbidity={sceneTheme.turbidity} />
            <ambientLight intensity={options.highContrast ? 0.86 : 0.72} />
            <directionalLight castShadow position={[50, 50, 20]} intensity={options.highContrast ? 1.42 : 1.25} />

            {maze?.length > 0 && (
              <Level
                maze={maze}
                doors={doors}
                setDoors={setDoors}
                won={won}
                onDoorAnswer={handleDoorAnswer}
                theme={sceneTheme}
                insightDoorId={activeInsight?.doorId ?? null}
                bonusChests={bonusChests}
                revealSecrets={visionSeconds > 0}
              />
            )}

            {phase === 'memorizing' && maze?.length > 0 && <MemorizationCamera maze={maze} />}

            {(phase === 'playing' || phase === 'paused') && maze?.length > 0 && (
              <Player3D
                key={`player-${difficulty}-${level}-${gameSeed}`}
                maze={maze}
                setWon={setWon}
                doors={doors}
                paused={phase === 'paused'}
                onPlayerMove={handlePlayerMove}
                skin={selectedSkin}
                turnSpeedMultiplier={options.turnSpeed}
                moveSpeedMultiplier={gameMode === 'speedrun' ? 1.08 : 1}
                slippery={runEvent.slippery}
                onBump={() => soundsRef.current?.click()}
              />
            )}

            {showWonScene && <WinSequence maze={maze} playerSkin={selectedSkin} />}
          </Canvas>

          <div
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              zIndex: 20,
              ...SURFACE_STYLE,
              color: 'white',
              padding: '14px 18px',
              borderRadius: '14px',
              fontFamily: 'sans-serif',
              minWidth: '320px',
            }}
          >
            <div style={{ fontWeight: 'bold', color: selectedDifficulty.color }}>
              {selectedWorld.label} - Chapitre {chapterNumber}, etape {runStep}/{modeConfig.runLength}
            </div>
            <div style={{ marginTop: '4px', fontSize: '0.84rem', opacity: 0.78 }}>
              {selectedDifficulty.world} • {GAME_MODES.find((mode) => mode.id === gameMode)?.label} • Skin {selectedSkin.label}
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.92rem', opacity: 0.88 }}>
              {levelConfig.size}x{levelConfig.size} • {levelConfig.doorCount} portes • elite {eliteDoorCount} • coffres {bonusChests.length}
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '0.94rem' }}>
              <div>
                <div style={{ opacity: 0.62, fontSize: '0.8rem' }}>Temps</div>
                <div style={{ fontWeight: 'bold' }}>
                  {levelTime}s {freezeSeconds > 0 ? `• gele ${freezeSeconds}s` : ''}
                </div>
              </div>
              <div>
                <div style={{ opacity: 0.62, fontSize: '0.8rem' }}>Score</div>
                <div style={{ fontWeight: 'bold' }}>{levelScore}</div>
              </div>
              <div>
                <div style={{ opacity: 0.62, fontSize: '0.8rem' }}>Vies</div>
                <div style={{ fontWeight: 'bold', color: lives <= 1 ? '#ff9d9d' : '#ffd88a' }}>{'♥'.repeat(Math.max(0, lives)) || '0'}</div>
              </div>
              <div>
                <div style={{ opacity: 0.62, fontSize: '0.8rem' }}>Combo</div>
                <div style={{ fontWeight: 'bold', color: combo > 0 ? selectedDifficulty.color : 'white' }}>
                  x{combo} / max x{maxCombo}
                </div>
              </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.88rem', opacity: 0.82 }}>
              Evenement: {runEvent.label} • {runEvent.description}
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.88rem', opacity: 0.78 }}>
              Record de difficulte : niveau {bestLevelForDifficulty || '-'}
            </div>
            <div style={{ marginTop: '6px', fontSize: '0.88rem', opacity: 0.82 }}>
              Score total : {totalScore}
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 20,
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              maxWidth: '42vw',
            }}
          >
            <button style={DARK_BUTTON_STYLE} onClick={restartGame}>
              Nouveau labyrinthe
            </button>
            {(phase === 'playing' || phase === 'paused') && (
              <button style={{ ...DARK_BUTTON_STYLE, background: selectedDifficulty.color }} onClick={togglePause}>
                {phase === 'paused' ? 'Reprendre' : 'Pause'}
              </button>
            )}
            <button style={LIGHT_BUTTON_STYLE} onClick={returnToMenu}>
              Retour au menu
            </button>
          </div>

          {phase === 'memorizing' && (
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                zIndex: 20,
                ...SURFACE_STYLE,
                padding: '16px 24px',
                borderRadius: '14px',
                fontFamily: 'sans-serif',
                textAlign: 'center',
                minWidth: '360px',
              }}
            >
              <div style={{ fontSize: '1rem', opacity: 0.85 }}>Observe le dedale vu d en haut</div>
              <div style={{ fontSize: '2.6rem', fontWeight: 'bold', marginTop: '6px', color: selectedDifficulty.color }}>
                {countdown}
              </div>
              <div
                style={{
                  marginTop: '12px',
                  height: '10px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.12)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.max(8, memorizationProgress * 100)}%`,
                    height: '100%',
                    background: selectedDifficulty.color,
                    transition: 'width 0.25s ease',
                  }}
                />
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.92rem', opacity: 0.9 }}>
                Le tracé n est plus montre. Retiens les couloirs, les impasses et les repères utiles.
              </div>
            </div>
          )}

          {(phase === 'playing' || phase === 'paused') && (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: 20,
                  bottom: 20,
                  zIndex: 18,
                  ...SURFACE_STYLE,
                  color: 'white',
                  padding: '16px 18px',
                  borderRadius: '14px',
                  fontFamily: 'sans-serif',
                  width: 'min(370px, 92vw)',
                }}
              >
                <div style={{ fontWeight: 'bold', color: selectedDifficulty.color }}>Missions du niveau</div>
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeMissions.map((mission) => (
                    <MissionLine key={mission.label} label={mission.label} completed={mission.completed} accent={selectedDifficulty.color} />
                  ))}
                </div>
                <div style={{ marginTop: '14px', fontSize: '0.84rem', opacity: 0.78 }}>
                  Secrets trouves: {openedChestCount}/{bonusChests.length} • Portes elite: {eliteDoorCount} • Gardien final: {runStep === modeConfig.runLength ? 'oui' : 'non'}
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.82rem', opacity: 0.66 }}>
                  Z/S ou fleches haut/bas pour avancer • Q/D ou fleches gauche/droite pour tourner • Echap pour pause
                </div>
                <Minimap
                  maze={maze}
                  playerPosition={playerPosition}
                  doors={doors}
                  bonusChests={bonusChests}
                  accent={selectedDifficulty.color}
                  visible={minimapVisible}
                />
              </div>

              <div
                style={{
                  position: 'absolute',
                  right: 20,
                  bottom: 20,
                  zIndex: 18,
                  ...SURFACE_STYLE,
                  color: 'white',
                  padding: '16px 18px',
                  borderRadius: '14px',
                  fontFamily: 'sans-serif',
                  width: 'min(360px, 92vw)',
                }}
              >
                <div style={{ fontWeight: 'bold', color: selectedDifficulty.color }}>Jokers</div>
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['vision', 'insight', 'freeze'].map((jokerType) => (
                    <button
                      key={jokerType}
                      type="button"
                      disabled={phase !== 'playing' || (jokers[jokerType] ?? 0) <= 0}
                      onClick={jokerType === 'vision' ? useVision : jokerType === 'insight' ? useInsight : useFreeze}
                      style={{
                        ...LIGHT_BUTTON_STYLE,
                        textAlign: 'left',
                        background: (jokers[jokerType] ?? 0) > 0 ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.32)',
                        opacity: phase === 'playing' ? 1 : 0.7,
                        color: '#102030',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span style={{ fontWeight: 'bold' }}>{getJokerLabel(jokerType)}</span>
                        <span>x{jokers[jokerType] ?? 0}</span>
                      </div>
                      <div style={{ marginTop: '4px', fontSize: '0.8rem', opacity: 0.72 }}>
                        {getJokerDescription(jokerType)}
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', fontSize: '0.84rem' }}>
                  <div>Cle: <strong>{inventory.key}</strong></div>
                  <div>Lanterne: <strong>{inventory.lantern}</strong></div>
                  <div>Parchemin: <strong>{inventory.scroll}</strong></div>
                  <div>Bouclier: <strong>{inventory.shield}</strong></div>
                </div>
                {runArtifacts.length > 0 && (
                  <div style={{ marginTop: '12px', fontSize: '0.82rem', opacity: 0.84 }}>
                    Artefacts: {runArtifacts.map((artifact) => artifact.label).join(', ')}
                  </div>
                )}
                <div style={{ marginTop: '14px' }}>
                  <div style={{ fontSize: '0.82rem', opacity: 0.68, marginBottom: '6px' }}>
                    Chaleur du centre {visionSeconds > 0 ? `• boussole ${visionSeconds}s` : ''}
                  </div>
                  <div style={{ height: '10px', borderRadius: '999px', background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.max(6, centerHeat * 100)}%`,
                        height: '100%',
                        background: selectedDifficulty.color,
                        transition: 'width 0.25s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {notice && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: phase === 'memorizing' ? '12%' : '10%',
                transform: 'translateX(-50%)',
                zIndex: 40,
                ...SURFACE_STYLE,
                color: 'white',
                padding: '12px 18px',
                borderRadius: '12px',
                fontFamily: 'sans-serif',
                minWidth: '300px',
                textAlign: 'center',
                borderColor: notice.tone === 'error' ? 'rgba(231,76,60,0.5)' : notice.tone === 'success' ? 'rgba(46,204,113,0.45)' : 'rgba(255,255,255,0.12)',
              }}
            >
              {notice.text}
            </div>
          )}

          {phase === 'paused' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 90,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
              }}
            >
              <div
                style={{
                  ...SURFACE_STYLE,
                  width: 'min(92vw, 470px)',
                  padding: '28px',
                  borderRadius: '22px',
                  color: 'white',
                  textAlign: 'center',
                  fontFamily: 'sans-serif',
                }}
              >
                <div style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>Pause</div>
                <div style={{ marginTop: '10px', opacity: 0.84 }}>
                  Ta position est conservee. Reprends quand tu veux.
                </div>
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Temps</div>
                    <div style={{ fontWeight: 'bold' }}>{levelTime}s</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Score</div>
                    <div style={{ fontWeight: 'bold' }}>{levelScore}</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Total</div>
                    <div style={{ fontWeight: 'bold' }}>{totalScore}</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Combo max</div>
                    <div style={{ fontWeight: 'bold' }}>x{maxCombo}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '22px' }}>
                  <button onClick={togglePause} style={{ ...LIGHT_BUTTON_STYLE, background: selectedDifficulty.color, color: 'white' }}>
                    Reprendre
                  </button>
                  <button onClick={restartGame} style={DARK_BUTTON_STYLE}>
                    Recommencer
                  </button>
                  <button onClick={returnToMenu} style={LIGHT_BUTTON_STYLE}>
                    Retour au menu
                  </button>
                </div>
              </div>
            </div>
          )}

          {showWonScene && lastLevelSummary && (
            <div
              style={{
                position: 'absolute',
                top: '9%',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                fontFamily: 'sans-serif',
                textAlign: 'center',
                width: 'min(92vw, 580px)',
              }}
            >
              <h1 style={{ fontSize: '3rem', margin: 0, color: selectedDifficulty.color, textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}>
                Duo legendaire
              </h1>
              <div
                style={{
                  marginTop: '18px',
                  ...SURFACE_STYLE,
                  color: 'white',
                  borderRadius: '18px',
                  padding: '24px',
                }}
              >
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  Niveau {level} termine en {selectedDifficulty.label.toLowerCase()}
                </div>
                <div style={{ marginTop: '6px', opacity: 0.9 }}>{lastLevelSummary.title}</div>
                <div style={{ marginTop: '16px', fontSize: '2rem', color: '#f6d365', letterSpacing: '0.18em' }}>
                  {'★'.repeat(lastLevelSummary.starCount)}
                  <span style={{ opacity: 0.28 }}>{'★'.repeat(3 - lastLevelSummary.starCount)}</span>
                </div>
                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Temps du niveau</div>
                    <div style={{ fontWeight: 'bold' }}>{levelTime}s</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Score final</div>
                    <div style={{ fontWeight: 'bold' }}>{lastLevelSummary.finalScore}</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Score total</div>
                    <div style={{ fontWeight: 'bold' }}>{totalScore}</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Bonus victoire</div>
                    <div style={{ fontWeight: 'bold' }}>+{lastWinBonus}</div>
                  </div>
                </div>
                <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                  {lastLevelSummary.missions.map((mission) => (
                    <MissionLine key={mission.label} label={mission.label} completed={mission.completed} accent={selectedDifficulty.color} />
                  ))}
                  <MissionLine label="Sans joker" completed={lastLevelSummary.noJokerBonus} accent={selectedDifficulty.color} />
                </div>
                <div style={{ marginTop: '16px', fontSize: '0.9rem', opacity: 0.84 }}>
                  Coffres ouverts: {lastLevelSummary.openedChestCount} • Elite: {lastLevelSummary.eliteDoorCount} • Chrono: {lastLevelSummary.timedDoorCount} • Pieges: {lastLevelSummary.trapDoorCount}
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.9rem', opacity: 0.84 }}>
                  Bonus: {lastLevelSummary.bonusDoorCount} • Gardiens: {lastLevelSummary.bossDoorCount} • Etape {runStep}/{modeConfig.runLength}
                </div>
                {lastLevelSummary.newlyUnlockedSkins.length > 0 && (
                  <div style={{ marginTop: '10px', fontSize: '0.92rem', color: '#ffe69b' }}>
                    Nouveaux skins debloques: {lastLevelSummary.newlyUnlockedSkins.join(', ')}
                  </div>
                )}
                {lastLevelSummary.artifactLabels.length > 0 && (
                  <div style={{ marginTop: '10px', fontSize: '0.92rem', color: '#c8f4ff' }}>
                    Artefacts en run: {lastLevelSummary.artifactLabels.join(', ')}
                  </div>
                )}
                {lastLevelSummary.chapterCompleted && (
                  <div style={{ marginTop: '10px', fontSize: '0.92rem', color: '#b8ffcb' }}>
                    Chapitre termine: +{lastLevelSummary.perkReward} point de progression
                  </div>
                )}
                <div style={{ marginTop: '18px', fontSize: '0.92rem', opacity: 0.84 }}>
                  {lastLevelSummary.chapterCompleted
                    ? 'Le Minotaure recule et un nouveau chapitre s ouvre.'
                    : 'Prochain defi: un autre labyrinthe t attend dans ce meme chapitre.'}
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.88rem', opacity: 0.72 }}>
                  Meilleur niveau atteint en {selectedDifficulty.label.toLowerCase()} : {Math.max(bestLevelForDifficulty, level)}
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
                  <button onClick={replayLevel} style={LIGHT_BUTTON_STYLE}>
                    Rejouer ce niveau
                  </button>
                  <button
                    onClick={goToNextLevel}
                    style={{ ...LIGHT_BUTTON_STYLE, background: selectedDifficulty.color, color: 'white' }}
                  >
                    {lastLevelSummary.chapterCompleted ? 'Chapitre suivant' : 'Niveau suivant'}
                  </button>
                  <button onClick={returnToMenu} style={{ ...DARK_BUTTON_STYLE, background: 'rgba(255,255,255,0.18)' }}>
                    Retour au menu
                  </button>
                </div>
              </div>
            </div>
          )}

          {phase === 'lost' && defeatSummary && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 100,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                fontFamily: 'sans-serif',
              }}
            >
              <div
                style={{
                  ...SURFACE_STYLE,
                  width: 'min(92vw, 560px)',
                  borderRadius: '22px',
                  color: 'white',
                  padding: '28px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2.4rem', fontWeight: 'bold', color: '#ff9d9d' }}>Run brisee</div>
                <div style={{ marginTop: '8px', opacity: 0.84 }}>
                  Le dedale a eu raison de la poule pour cette fois. Le Minotaure garde encore une cle du sanctuaire.
                </div>
                <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Chapitre</div>
                    <div style={{ fontWeight: 'bold' }}>{defeatSummary.chapterNumber}</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Etape</div>
                    <div style={{ fontWeight: 'bold' }}>{defeatSummary.runStep}</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Score du niveau</div>
                    <div style={{ fontWeight: 'bold' }}>{defeatSummary.levelScore}</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Secrets ouverts</div>
                    <div style={{ fontWeight: 'bold' }}>{defeatSummary.openedChestCount}</div>
                  </div>
                </div>
                {defeatSummary.artifacts.length > 0 && (
                  <div style={{ marginTop: '14px', fontSize: '0.9rem', opacity: 0.84 }}>
                    Artefacts trouves pendant la run: {defeatSummary.artifacts.join(', ')}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '22px' }}>
                  <button onClick={restartGame} style={{ ...LIGHT_BUTTON_STYLE, background: selectedWorld.color, color: 'white' }}>
                    Relancer le chapitre
                  </button>
                  <button onClick={returnToMenu} style={LIGHT_BUTTON_STYLE}>
                    Retour au menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
