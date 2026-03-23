import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import Level from './components/Level';
import Player3D from './components/Player3D';
import { useGame } from './hooks/useGame';
import './App.css';

function App() {
  const { maze, won, setWon, solutionPath } = useGame(15, 15);
  const [started, setStarted] = useState(false);
  const [showPath, setShowPath] = useState(true);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#87CEEB', position: 'relative' }}>
      
      {!started && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'sans-serif'
        }}>
          <h1 style={{ marginBottom: '20px', fontSize: '3rem' }}>Labyrinthe Magique</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '30px', textAlign: 'center', lineHeight: '1.5' }}>
            Mémorise le bon chemin qui s'affichera vu d'en haut.<br/>
            Ensuite, déplace-toi sans la souris jusqu'au Minotaure !
          </p>
          <button 
            style={{ padding: '15px 40px', fontSize: '20px', cursor: 'pointer', borderRadius: '8px', border: 'none', background: '#e74c3c', color: 'white', fontWeight: 'bold' }}
            onClick={() => setStarted(true)}
          >
            Lancer l'exploration
          </button>
        </div>
      )}

      {started && (
        <>
          <Canvas shadows camera={{ fov: 75 }}>
            <Sky sunPosition={[100, 20, 100]} turbidity={0.1} />
            <ambientLight intensity={0.6} />
            <directionalLight castShadow position={[50, 50, 20]} intensity={1.2} />
            
            {maze && maze.length > 0 && <Level maze={maze} solutionPath={solutionPath} showPath={showPath} />}
            {maze && maze.length > 0 && <Player3D maze={maze} setWon={setWon} setShowPath={setShowPath} />}
          </Canvas>

          <div style={{ position: 'absolute', bottom: 20, right: 20, color: 'white', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '15px', borderRadius: '8px', fontFamily: 'sans-serif' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Trouve le centre ! 🌟</div>
            <div style={{ marginTop: '10px' }}>Q/D ou Flèches ⬅️ / ➡️ : Tourner<br/>Z/S ou Flèches ⬆️ / ⬇️ : Avancer</div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
