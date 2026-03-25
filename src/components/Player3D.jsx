import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const boxCircleCollide = (minX, maxX, minZ, maxZ, cx, cz, radius) => {
  const rx = Math.max(minX, Math.min(cx, maxX));
  const rz = Math.max(minZ, Math.min(cz, maxZ));
  const dx = cx - rx;
  const dz = cz - rz;
  return (dx * dx + dz * dz) <= (radius * radius);
};

const checkCollision = (maze, px, pz, radius, doors = []) => {
  const cellSize = 2;
  const t = 0.2; // wall thickness
  const mazeWidth = maze[0].length * cellSize;
  const mazeHeight = maze.length * cellSize;
  
  if (px < -cellSize/2 + radius || px > mazeWidth - cellSize/2 - radius) return true;
  if (pz < -cellSize/2 + radius || pz > mazeHeight - cellSize/2 - radius) return true;

  const cx = Math.max(0, Math.min(maze[0].length - 1, Math.round(px / cellSize)));
  const cz = Math.max(0, Math.min(maze.length - 1, Math.round(pz / cellSize)));

  for (let z = cz - 1; z <= cz + 1; z++) {
    for (let x = cx - 1; x <= cx + 1; x++) {
      if (z >= 0 && z < maze.length && x >= 0 && x < maze[0].length) {
        const cell = maze[z][x];
        const cxPos = x * cellSize;
        const czPos = z * cellSize;
        
        if (cell.walls.top) {
          if (boxCircleCollide(cxPos - cellSize/2, cxPos + cellSize/2, czPos - cellSize/2 - t/2, czPos - cellSize/2 + t/2, px, pz, radius)) return true;
        }
        if (cell.walls.bottom) {
          if (boxCircleCollide(cxPos - cellSize/2, cxPos + cellSize/2, czPos + cellSize/2 - t/2, czPos + cellSize/2 + t/2, px, pz, radius)) return true;
        }
        if (cell.walls.left) {
          if (boxCircleCollide(cxPos - cellSize/2 - t/2, cxPos - cellSize/2 + t/2, czPos - cellSize/2, czPos + cellSize/2, px, pz, radius)) return true;
        }
        if (cell.walls.right) {
          if (boxCircleCollide(cxPos + cellSize/2 - t/2, cxPos + cellSize/2 + t/2, czPos - cellSize/2, czPos + cellSize/2, px, pz, radius)) return true;
        }
      }
    }
  }

  for (const door of doors) {
    if (door.status !== 'open') {
       const t = 0.4;
       const cxPos = door.x * cellSize;
       const czPos = door.y * cellSize;
       const doorRadius = 0.8;
       if (door.orientation === 'horizontal') {
         if (boxCircleCollide(cxPos - cellSize/2, cxPos + cellSize/2, czPos - t/2, czPos + t/2, px, pz, doorRadius)) return true;
       } else {
         if (boxCircleCollide(cxPos - t/2, cxPos + t/2, czPos - cellSize/2, czPos + cellSize/2, px, pz, doorRadius)) return true;
       }
    }
  }

  return false;
};

export default function Player3D({ maze, setWon, setShowPath, doors }) {
  const { camera } = useThree();
  const pouleTexture = useLoader(THREE.TextureLoader, '/poule.png');
  pouleTexture.colorSpace = THREE.SRGBColorSpace;
  pouleTexture.magFilter = THREE.NearestFilter;

  const doorsRef = useRef(doors);
  useEffect(() => {
    doorsRef.current = doors;
  }, [doors]);

  const moveState = useRef({ forward: false, backward: false, left: false, right: false });
  const hudRef = useRef();
  const hasWon = useRef(false);
  const hasLeftStart = useRef(false);
  const spawnPosition = useRef(new THREE.Vector3(0, 1.2, 0));
  const isReady = useRef(false);
  
  const [phase, setPhase] = useState('playing'); 
  
  // Initialisation instantanée
  useLayoutEffect(() => {
    moveState.current = { forward: false, backward: false, left: false, right: false };
    hasWon.current = false;
    hasLeftStart.current = false;
    isReady.current = false;
    camera.up.set(0, 1, 0);
    camera.position.set(0, 1.2, 0);
    camera.lookAt(new THREE.Vector3(0, 1.2, 2));
    spawnPosition.current.set(0, 1.2, 0);
    setShowPath(false);
    isReady.current = true;
  }, [camera, setShowPath]);

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
    if (phase !== 'playing' || !isReady.current) return;

    // Phase Jeu: Clavier Tank Controls
    const rotateSpeed = 2.5;
    if (moveState.current.left) camera.rotation.y -= rotateSpeed * delta;
    if (moveState.current.right) camera.rotation.y += rotateSpeed * delta;

    const speed = 7;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    
    const move = new THREE.Vector3(0, 0, 0);
    if (moveState.current.forward) move.add(forward.clone().multiplyScalar(speed * delta));
    if (moveState.current.backward) move.sub(forward.clone().multiplyScalar(speed * delta));

    // AABB strict collision
    const radius = 0.4;
    
    let intendedX = camera.position.x + move.x;
    if (!checkCollision(maze, intendedX, camera.position.z, radius, doorsRef.current)) {
      camera.position.x = intendedX;
    }
    
    let intendedZ = camera.position.z + move.z;
    if (!checkCollision(maze, camera.position.x, intendedZ, radius, doorsRef.current)) {
      camera.position.z = intendedZ;
    }

    if (!hasLeftStart.current) {
      const horizontalDistanceFromSpawn = Math.hypot(
        camera.position.x - spawnPosition.current.x,
        camera.position.z - spawnPosition.current.z,
      );

      if (horizontalDistanceFromSpawn > 1.25) {
        hasLeftStart.current = true;
      }
    }

    const currCellX = Math.max(0, Math.min(maze[0].length - 1, Math.round(camera.position.x / 2)));
    const currCellZ = Math.max(0, Math.min(maze.length - 1, Math.round(camera.position.z / 2)));
    
    if (maze[currCellZ] && maze[currCellZ][currCellX].isCenter && !hasWon.current && hasLeftStart.current) {
        const dX = camera.position.x - currCellX * 2;
        const dZ = camera.position.z - currCellZ * 2;
        if (Math.sqrt(dX*dX + dZ*dZ) < 1.0) { 
          hasWon.current = true;
          setWon(true);
          setPhase('won');
        }
    }

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
          <sprite scale={[0.9, 0.9, 1]}>
            <spriteMaterial map={pouleTexture} transparent={true} depthTest={false} renderOrder={999} />
          </sprite>
        </group>
      )}
    </>
  );
}
