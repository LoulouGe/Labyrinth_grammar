import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import Level from './components/Level';
import Player3D from './components/Player3D';
import WinSequence from './components/WinSequence';
import { useGame } from './hooks/useGame';
import { createSoundPlayer } from './utils/sound';

const BEST_LEVELS_STORAGE_KEY = 'labyrinthe_best_levels';
const SURFACE_STYLE = {
  background: 'linear-gradient(180deg, rgba(6,17,32,0.82), rgba(10,32,54,0.72))',
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

const DIFFICULTY_SETTINGS = {
  easy: {
    label: 'Facile',
    description: 'Plus accessible, mais moins tranquille qu’avant.',
    baseSize: 7,
    maxSize: 15,
    baseDoors: 4,
    maxDoors: 8,
    memorizationSeconds: 6,
    color: '#2ecc71',
  },
  normal: {
    label: 'Normal',
    description: 'Une vraie montée en tension à chaque niveau.',
    baseSize: 9,
    maxSize: 17,
    baseDoors: 6,
    maxDoors: 10,
    memorizationSeconds: 5,
    color: '#f39c12',
  },
  hard: {
    label: 'Difficile',
    description: 'Très grands labyrinthes et grosse pression mémoire.',
    baseSize: 11,
    maxSize: 21,
    baseDoors: 8,
    maxDoors: 14,
    memorizationSeconds: 4,
    color: '#e74c3c',
  },
};

function getLevelConfig(difficulty, level) {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const extraGrowth = Math.floor((level - 1) / 3) * 2;
  const size = Math.min(settings.baseSize + (level - 1) * 2 + extraGrowth, settings.maxSize);
  const doorCount = Math.min(settings.baseDoors + level, settings.maxDoors);
  const memorizationSeconds = Math.max(2, settings.memorizationSeconds - Math.floor((level - 1) / 2));

  return {
    ...settings,
    size,
    doorCount,
    memorizationSeconds,
  };
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

function App() {
  const soundsRef = useRef(null);
  if (!soundsRef.current) {
    soundsRef.current = createSoundPlayer();
  }

  const [difficulty, setDifficulty] = useState('easy');
  const [level, setLevel] = useState(1);
  const [gameSeed, setGameSeed] = useState(0);
  const [phase, setPhase] = useState('intro');
  const [showPath, setShowPath] = useState(true);
  const [bestLevels, setBestLevels] = useState(loadBestLevels);
  const [levelTime, setLevelTime] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [lastWinBonus, setLastWinBonus] = useState(0);
  const levelConfig = getLevelConfig(difficulty, level);
  const { maze, won, setWon, solutionPath, doors, setDoors } = useGame(
    levelConfig.size,
    levelConfig.size,
    gameSeed,
    levelConfig.doorCount,
  );
  const [countdown, setCountdown] = useState(levelConfig.memorizationSeconds);

  useEffect(() => {
    if (phase !== 'memorizing') return;

    setShowPath(true);
    setCountdown(levelConfig.memorizationSeconds);

    const intervalId = window.setInterval(() => {
      setCountdown((value) => (value > 1 ? value - 1 : 1));
    }, 1000);

    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId);
      setShowPath(false);
      setPhase('playing');
    }, levelConfig.memorizationSeconds * 1000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [phase, gameSeed, levelConfig.memorizationSeconds]);

  useEffect(() => {
    if (won && phase === 'playing') {
      const winBonus = 120 + level * 55 + Math.max(0, 90 - levelTime * 3);
      soundsRef.current?.win();
      setBestLevels((previous) => ({
        ...previous,
        [difficulty]: Math.max(previous[difficulty] ?? 0, level),
      }));
      setLevelScore((value) => value + winBonus);
      setLastWinBonus(winBonus);
      setShowPath(false);
      setPhase('won');
    }
  }, [won, phase, difficulty, level, levelTime]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(BEST_LEVELS_STORAGE_KEY, JSON.stringify(bestLevels));
  }, [bestLevels]);

  useEffect(() => {
    if (phase !== 'playing') return;

    const intervalId = window.setInterval(() => {
      setLevelTime((value) => value + 1);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [phase]);

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

  const startGame = () => {
    soundsRef.current?.start();
    setLevel(1);
    setGameSeed((value) => value + 1);
    setWon(false);
    setLevelTime(0);
    setLevelScore(0);
    setLastWinBonus(0);
    setPhase('memorizing');
  };

  const restartGame = () => {
    soundsRef.current?.click();
    setWon(false);
    setGameSeed((value) => value + 1);
    setLevelTime(0);
    setLevelScore(0);
    setLastWinBonus(0);
    setPhase('memorizing');
  };

  const goToNextLevel = () => {
    soundsRef.current?.nextLevel();
    setWon(false);
    setLevel((value) => value + 1);
    setGameSeed((value) => value + 1);
    setLevelTime(0);
    setLevelScore(0);
    setLastWinBonus(0);
    setPhase('memorizing');
  };

  const replayLevel = () => {
    soundsRef.current?.click();
    setWon(false);
    setGameSeed((value) => value + 1);
    setLevelTime(0);
    setLevelScore(0);
    setLastWinBonus(0);
    setPhase('memorizing');
  };

  const returnToMenu = () => {
    soundsRef.current?.click();
    setWon(false);
    setLevel(1);
    setShowPath(true);
    setLevelTime(0);
    setLevelScore(0);
    setLastWinBonus(0);
    setPhase('intro');
  };

  const togglePause = () => {
    soundsRef.current?.click();
    setPhase((value) => (value === 'playing' ? 'paused' : 'playing'));
  };

  const handleDoorAnswer = (correct) => {
    if (correct) {
      soundsRef.current?.success();
      setLevelScore((value) => value + 40);
      return;
    }

    soundsRef.current?.error();
    setLevelScore((value) => Math.max(0, value - 15));
  };

  const selectedDifficulty = DIFFICULTY_SETTINGS[difficulty];
  const bestLevelForDifficulty = bestLevels[difficulty] ?? 0;
  const globalBestLevel = Math.max(...Object.values(bestLevels), 0);
  const showWonScene = phase === 'won';

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle at top, #a9d8ff 0%, #7cb8ee 35%, #5c9fd8 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      
      {phase === 'intro' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'sans-serif', padding: '24px'
        }}>
          <div style={{
            ...SURFACE_STYLE,
            width: 'min(960px, 94vw)',
            borderRadius: '26px',
            padding: '34px',
            textAlign: 'center',
          }}>
            <h1 style={{ marginBottom: '20px', fontSize: '3rem' }}>Labyrinthe Magique</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px', textAlign: 'center', lineHeight: '1.5', opacity: 0.92 }}>
              Mémorise le bon chemin qui s'affichera vu d'en haut.<br/>
              Ensuite, déplace-toi sans la souris jusqu'au Minotaure !
            </p>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {Object.entries(DIFFICULTY_SETTINGS).map(([key, settings]) => {
                const isSelected = key === difficulty;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      soundsRef.current?.click();
                      setDifficulty(key);
                    }}
                    style={{
                      width: '220px',
                      padding: '18px',
                      borderRadius: '14px',
                      border: isSelected ? `2px solid ${settings.color}` : '2px solid rgba(255,255,255,0.14)',
                      background: isSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                      color: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: settings.color }}>{settings.label}</div>
                    <div style={{ marginTop: '8px', fontSize: '0.95rem', lineHeight: '1.45', opacity: 0.92 }}>
                      {settings.description}
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{
              marginBottom: '28px',
              padding: '16px 22px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.08)',
              textAlign: 'center',
              minWidth: '320px',
            }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: selectedDifficulty.color }}>
                {selectedDifficulty.label} - Niveau 1
              </div>
              <div style={{ marginTop: '8px', opacity: 0.9 }}>
                Labyrinthe {levelConfig.size}x{levelConfig.size} • {levelConfig.doorCount} porte{levelConfig.doorCount > 1 ? 's' : ''} • {levelConfig.memorizationSeconds}s pour mémoriser
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.92rem', opacity: 0.75 }}>
                Chaque niveau agrandit le labyrinthe et augmente la difficulté.
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.92rem', opacity: 0.82 }}>
                Meilleur niveau {selectedDifficulty.label.toLowerCase()} : {bestLevelForDifficulty || 'aucun'} • Record global : {globalBestLevel || 'aucun'}
              </div>
            </div>
            <button
              style={{ ...LIGHT_BUTTON_STYLE, padding: '15px 40px', fontSize: '20px', background: selectedDifficulty.color, color: 'white' }}
              onClick={startGame}
            >
              Lancer l'exploration
            </button>
          </div>
        </div>
      )}

      {phase !== 'intro' && (
        <>
          <Canvas shadows camera={{ fov: 75 }}>
            <Sky sunPosition={[100, 20, 100]} turbidity={0.1} />
            <ambientLight intensity={0.6} />
            <directionalLight castShadow position={[50, 50, 20]} intensity={1.2} />
            
            {maze && maze.length > 0 && (
              <Level
                maze={maze}
                solutionPath={solutionPath}
                showPath={showPath}
                doors={doors}
                setDoors={setDoors}
                won={won}
                onDoorAnswer={handleDoorAnswer}
              />
            )}
            {phase === 'memorizing' && maze && maze.length > 0 && <MemorizationCamera maze={maze} />}
            {phase === 'playing' && maze && maze.length > 0 && (
              <Player3D
                key={`player-${difficulty}-${level}-${gameSeed}`}
                maze={maze}
                setWon={setWon}
                setShowPath={setShowPath}
                doors={doors}
              />
            )}
            
            {showWonScene && <WinSequence maze={maze} />}
          </Canvas>

          <div style={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 20,
            ...SURFACE_STYLE,
            color: 'white',
            padding: '14px 18px',
            borderRadius: '12px',
            fontFamily: 'sans-serif',
            minWidth: '250px',
          }}>
            <div style={{ fontWeight: 'bold', color: selectedDifficulty.color }}>
              {selectedDifficulty.label} - Niveau {level}
            </div>
            <div style={{ marginTop: '6px', fontSize: '0.92rem', opacity: 0.88 }}>
              {levelConfig.size}x{levelConfig.size} • {levelConfig.doorCount} porte{levelConfig.doorCount > 1 ? 's' : ''} • mémoire {levelConfig.memorizationSeconds}s
            </div>
            <div style={{ marginTop: '6px', fontSize: '0.88rem', opacity: 0.72 }}>
              Record : niveau {bestLevelForDifficulty || '-'}
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '18px', fontSize: '0.94rem' }}>
              <div>
                <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Temps</div>
                <div style={{ fontWeight: 'bold' }}>{levelTime}s</div>
              </div>
              <div>
                <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Score</div>
                <div style={{ fontWeight: 'bold' }}>{levelScore}</div>
              </div>
            </div>
          </div>

          {phase === 'memorizing' && (
            <div style={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              zIndex: 20,
              ...SURFACE_STYLE,
              padding: '16px 24px',
              borderRadius: '12px',
              fontFamily: 'sans-serif',
              textAlign: 'center',
              minWidth: '280px',
            }}>
              <div style={{ fontSize: '1rem', opacity: 0.85 }}>Mémorise le chemin</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '6px' }}>{countdown}</div>
              <div style={{ marginTop: '8px', fontSize: '0.95rem', opacity: 0.9 }}>
                Le parcours va disparaître, prépare-toi.
              </div>
            </div>
          )}

          {phase === 'playing' && !won && (
            <div style={{ position: 'absolute', bottom: 20, right: 20, color: 'white', zIndex: 10, ...SURFACE_STYLE, padding: '15px', borderRadius: '12px', fontFamily: 'sans-serif' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Trouve le centre ! 🌟</div>
              <div style={{ marginTop: '10px' }}>Q/D ou Flèches ⬅️ / ➡️ : Tourner<br/>Z/S ou Flèches ⬆️ / ⬇️ : Avancer<br/>ECHAP : Pause</div>
            </div>
          )}

          {phase === 'paused' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 90,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}>
              <div style={{
                ...SURFACE_STYLE,
                width: 'min(92vw, 460px)',
                padding: '28px',
                borderRadius: '22px',
                color: 'white',
                textAlign: 'center',
                fontFamily: 'sans-serif',
              }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>Pause</div>
                <div style={{ marginTop: '10px', opacity: 0.84 }}>
                  Le chrono est figé. Reprends quand tu veux.
                </div>
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Temps</div>
                    <div style={{ fontWeight: 'bold' }}>{levelTime}s</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Score</div>
                    <div style={{ fontWeight: 'bold' }}>{levelScore}</div>
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

          {phase !== 'intro' && (
            <div style={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 20,
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              maxWidth: '40vw',
            }}>
              <button
                style={DARK_BUTTON_STYLE}
                onClick={restartGame}
              >
                Nouveau labyrinthe
              </button>
              {(phase === 'playing' || phase === 'paused') && (
                <button style={{ ...DARK_BUTTON_STYLE, background: selectedDifficulty.color }} onClick={togglePause}>
                  {phase === 'paused' ? 'Reprendre' : 'Pause'}
                </button>
              )}
              <button
                style={LIGHT_BUTTON_STYLE}
                onClick={returnToMenu}
              >
                Retour au menu
              </button>
            </div>
          )}

          {showWonScene && (
            <div style={{
              position: 'absolute',
              top: '12%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              fontFamily: 'sans-serif',
              textAlign: 'center',
              width: 'min(92vw, 520px)',
            }}>
              <h1 style={{ fontSize: '3.4rem', margin: 0, color: '#f1c40f', textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}>
                🤜🤛 VOUS ÊTES SUPER POTES !
              </h1>
              <div style={{
                marginTop: '18px',
                ...SURFACE_STYLE,
                color: 'white',
                borderRadius: '16px',
                padding: '22px',
              }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>
                  Niveau {level} terminé en {selectedDifficulty.label.toLowerCase()}
                </div>
                <div style={{ marginTop: '8px', opacity: 0.88 }}>
                  Prochain défi : labyrinthe plus grand, plus de pression, et toujours le bon chemin à retenir.
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.92rem', opacity: 0.78 }}>
                  Meilleur niveau atteint en {selectedDifficulty.label.toLowerCase()} : {Math.max(bestLevelForDifficulty, level)}
                </div>
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Temps du niveau</div>
                    <div style={{ fontWeight: 'bold' }}>{levelTime}s</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Score final</div>
                    <div style={{ fontWeight: 'bold' }}>{levelScore}</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Bonus victoire</div>
                    <div style={{ fontWeight: 'bold' }}>+{lastWinBonus}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
                  <button
                    onClick={replayLevel}
                    style={LIGHT_BUTTON_STYLE}
                  >
                    Rejouer ce niveau
                  </button>
                  <button
                    onClick={goToNextLevel}
                    style={{ ...LIGHT_BUTTON_STYLE, background: selectedDifficulty.color, color: 'white' }}
                  >
                    Niveau suivant
                  </button>
                  <button
                    onClick={returnToMenu}
                    style={{ ...DARK_BUTTON_STYLE, background: 'rgba(255,255,255,0.18)' }}
                  >
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
