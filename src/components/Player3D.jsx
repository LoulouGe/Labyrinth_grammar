import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function Player3D({ maze, setWon, setShowPath }) {
  const { camera } = useThree();
  const pouleTexture = useLoader(THREE.TextureLoader, '/poule.png');
  pouleTexture.colorSpace = THREE.SRGBColorSpace;
  pouleTexture.magFilter = THREE.NearestFilter;

  const moveState = useRef({ forward: false, backward: false, left: false, right: false });
  const hudRef = useRef();
  const hasWon = useRef(false);
  
  const [phase, setPhase] = useState('wait'); 
  
  const centerX = Math.floor(maze[0].length / 2) * 2;
  const centerZ = Math.floor(maze.length / 2) * 2;
  const lookTarget = useRef(new THREE.Vector3(centerX, 0, centerZ));

  // Sequence animée
  useEffect(() => {
    camera.position.set(centerX, 30, centerZ + 15);
    camera.lookAt(lookTarget.current);
    setShowPath(true);
    
    // Attente (Visualisation du chemin)
    const t1 = setTimeout(() => {
      setPhase('zoom');
    }, 4500); 

    return () => clearTimeout(t1);
  }, []);

  // Events clavier purs
  useEffect(() => {
    const onKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': moveState.current.forward = true; break;
        case 'KeyS': case 'ArrowDown': moveState.current.backward = true; break;
        case 'KeyA': case 'ArrowLeft': moveState.current.left = true; break;
        case 'KeyD': case 'ArrowRight': moveState.current.right = true; break;
        default: break;
      }
    };
    const onKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': moveState.current.forward = false; break;
        case 'KeyS': case 'ArrowDown': moveState.current.backward = false; break;
        case 'KeyA': case 'ArrowLeft': moveState.current.left = false; break;
        case 'KeyD': case 'ArrowRight': moveState.current.right = false; break;
        default: break;
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (phase === 'wait') return;

    // Phase Cinématique: Descente
    if (phase === 'zoom') {
      const targetPos = new THREE.Vector3(0, 1.2, 0);
      const targetLook = new THREE.Vector3(0, 1.2, 2); 
      
      camera.position.lerp(targetPos, 2.5 * delta);
      lookTarget.current.lerp(targetLook, 2.5 * delta);
      camera.lookAt(lookTarget.current);

      if (camera.position.distanceTo(targetPos) < 0.2) {
         setPhase('playing');
         camera.position.copy(targetPos);
         const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
         camera.rotation.set(0, euler.y, 0);
         setShowPath(false); 
      }
      return;
    }

    // Phase Jeu: Clavier Tank Controls
    const rotateSpeed = 2.5;
    if (moveState.current.left) camera.rotation.y += rotateSpeed * delta;
    if (moveState.current.right) camera.rotation.y -= rotateSpeed * delta;

    const speed = 7;
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, camera.rotation.y, 0));
    
    const move = new THREE.Vector3(0, 0, 0);
    if (moveState.current.forward) move.add(forward.clone().multiplyScalar(speed * delta));
    if (moveState.current.backward) move.sub(forward.clone().multiplyScalar(speed * delta));

    // AABB strict collision
    const cellSize = 2;
    const padding = 0.4; 
    
    let finalX = camera.position.x + move.x;
    let finalZ = camera.position.z + move.z;

    const currCellX = Math.round(camera.position.x / cellSize);
    const currCellZ = Math.round(camera.position.z / cellSize);
    
    if (currCellZ >= 0 && currCellZ < maze.length && currCellX >= 0 && currCellX < maze[0].length) {
      const cell = maze[currCellZ][currCellX];
      const localX = finalX - currCellX * cellSize;
      
      if (cell.walls.left && localX < -cellSize/2 + padding) finalX = currCellX * cellSize - cellSize/2 + padding;
      if (cell.walls.right && localX > cellSize/2 - padding) finalX = currCellX * cellSize + cellSize/2 - padding;
    }
    camera.position.x = finalX;

    const newCellX = Math.round(camera.position.x / cellSize);
    if (currCellZ >= 0 && currCellZ < maze.length && newCellX >= 0 && newCellX < maze[0].length) {
      const cell = maze[currCellZ][newCellX];
      const localZ = finalZ - currCellZ * cellSize;
      
      if (cell.walls.top && localZ < -cellSize/2 + padding) finalZ = currCellZ * cellSize - cellSize/2 + padding;
      if (cell.walls.bottom && localZ > cellSize/2 + padding) finalZ = currCellZ * cellSize + cellSize/2 - padding;
      
      if (cell.isCenter && !hasWon.current) {
        const dX = camera.position.x - newCellX * cellSize;
        const dZ = finalZ - currCellZ * cellSize;
        if (Math.sqrt(dX*dX + dZ*dZ) < 1.0) { 
          hasWon.current = true;
          setWon(true);
        }
      }
    }
    camera.position.z = finalZ;

    // HUD Poulet dynamique
    if (hudRef.current) {
      hudRef.current.position.copy(camera.position);
      hudRef.current.rotation.copy(camera.rotation);
      hudRef.current.translateZ(-1.5); 
      
      const isMoving = move.lengthSq() > 0;
      const bob = isMoving ? Math.abs(Math.sin(state.clock.elapsedTime * 12)) * 0.1 : 0;
      hudRef.current.translateY(-0.6 + bob); 
    }
  });

  return (
    <>
      {phase === 'playing' && (
        <group ref={hudRef}>
          <sprite scale={[1.2, 1.2, 1]}>
            <spriteMaterial map={pouleTexture} transparent={true} depthTest={false} renderOrder={999} />
          </sprite>
        </group>
      )}
    </>
  );
}
