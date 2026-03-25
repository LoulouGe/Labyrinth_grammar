/* eslint-disable react-hooks/immutability */
import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CONTROL_KEYS = {
  forward: ['KeyW', 'KeyZ', 'ArrowUp'],
  backward: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'KeyQ', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
};

function updateMoveState(code, pressed, moveState) {
  if (CONTROL_KEYS.forward.includes(code)) {
    moveState.current.forward = pressed;
    return;
  }

  if (CONTROL_KEYS.backward.includes(code)) {
    moveState.current.backward = pressed;
    return;
  }

  if (CONTROL_KEYS.left.includes(code)) {
    moveState.current.left = pressed;
    return;
  }

  if (CONTROL_KEYS.right.includes(code)) {
    moveState.current.right = pressed;
  }
}

const boxCircleCollide = (minX, maxX, minZ, maxZ, cx, cz, radius) => {
  const rx = Math.max(minX, Math.min(cx, maxX));
  const rz = Math.max(minZ, Math.min(cz, maxZ));
  const dx = cx - rx;
  const dz = cz - rz;
  return (dx * dx + dz * dz) <= (radius * radius);
};

const checkCollision = (maze, px, pz, radius, doors = []) => {
  const cellSize = 2;
  const wallThickness = 0.2;
  const mazeWidth = maze[0].length * cellSize;
  const mazeHeight = maze.length * cellSize;

  if (px < -cellSize / 2 + radius || px > mazeWidth - cellSize / 2 - radius) return true;
  if (pz < -cellSize / 2 + radius || pz > mazeHeight - cellSize / 2 - radius) return true;

  const cx = Math.max(0, Math.min(maze[0].length - 1, Math.round(px / cellSize)));
  const cz = Math.max(0, Math.min(maze.length - 1, Math.round(pz / cellSize)));

  for (let z = cz - 1; z <= cz + 1; z += 1) {
    for (let x = cx - 1; x <= cx + 1; x += 1) {
      if (z < 0 || z >= maze.length || x < 0 || x >= maze[0].length) continue;

      const cell = maze[z][x];
      const cxPos = x * cellSize;
      const czPos = z * cellSize;

      if (cell.walls.top && boxCircleCollide(cxPos - cellSize / 2, cxPos + cellSize / 2, czPos - cellSize / 2 - wallThickness / 2, czPos - cellSize / 2 + wallThickness / 2, px, pz, radius)) {
        return true;
      }

      if (cell.walls.bottom && boxCircleCollide(cxPos - cellSize / 2, cxPos + cellSize / 2, czPos + cellSize / 2 - wallThickness / 2, czPos + cellSize / 2 + wallThickness / 2, px, pz, radius)) {
        return true;
      }

      if (cell.walls.left && boxCircleCollide(cxPos - cellSize / 2 - wallThickness / 2, cxPos - cellSize / 2 + wallThickness / 2, czPos - cellSize / 2, czPos + cellSize / 2, px, pz, radius)) {
        return true;
      }

      if (cell.walls.right && boxCircleCollide(cxPos + cellSize / 2 - wallThickness / 2, cxPos + cellSize / 2 + wallThickness / 2, czPos - cellSize / 2, czPos + cellSize / 2, px, pz, radius)) {
        return true;
      }
    }
  }

  for (const door of doors) {
    if (door.status === 'open') continue;

    const doorThickness = 0.4;
    const cxPos = door.x * cellSize;
    const czPos = door.y * cellSize;
    const doorRadius = 0.8;

    if (door.orientation === 'horizontal') {
      if (boxCircleCollide(cxPos - cellSize / 2, cxPos + cellSize / 2, czPos - doorThickness / 2, czPos + doorThickness / 2, px, pz, doorRadius)) {
        return true;
      }
    } else if (boxCircleCollide(cxPos - doorThickness / 2, cxPos + doorThickness / 2, czPos - cellSize / 2, czPos + cellSize / 2, px, pz, doorRadius)) {
      return true;
    }
  }

  return false;
};

export default function Player3D({
  maze,
  setWon,
  doors,
  paused = false,
  onPlayerMove,
  skin,
  turnSpeedMultiplier = 1,
  moveSpeedMultiplier = 1,
  slippery = false,
  onBump,
}) {
  const { camera } = useThree();
  const pouleTexture = useLoader(THREE.TextureLoader, '/poule.png');

  const doorsRef = useRef(doors);
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });
  const hudRef = useRef();
  const hasWon = useRef(false);
  const hasLeftStart = useRef(false);
  const spawnPosition = useRef(new THREE.Vector3(0, 1.2, 0));
  const isReady = useRef(false);
  const lastReportedCell = useRef(null);
  const velocityRef = useRef(new THREE.Vector3());
  const bumpCooldownRef = useRef(0);

  useEffect(() => {
    doorsRef.current = doors;
  }, [doors]);

  useEffect(() => {
    pouleTexture.colorSpace = THREE.SRGBColorSpace;
    pouleTexture.magFilter = THREE.NearestFilter;
  }, [pouleTexture]);

  useLayoutEffect(() => {
    moveState.current = { forward: false, backward: false, left: false, right: false };
    hasWon.current = false;
    hasLeftStart.current = false;
    isReady.current = false;
    lastReportedCell.current = null;
    velocityRef.current.set(0, 0, 0);
    bumpCooldownRef.current = 0;

    camera.up.set(0, 1, 0);
    camera.position.set(0, 1.2, 0);
    camera.lookAt(new THREE.Vector3(0, 1.2, 2));
    spawnPosition.current.set(0, 1.2, 0);
    onPlayerMove?.({
      x: 0,
      z: 0,
      cellX: 0,
      cellZ: 0,
    });
    isReady.current = true;
  }, [camera, onPlayerMove]);

  useEffect(() => {
    const onKeyDown = (event) => {
      updateMoveState(event.code, true, moveState);
    };

    const onKeyUp = (event) => {
      updateMoveState(event.code, false, moveState);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!isReady.current) return;
    bumpCooldownRef.current = Math.max(0, bumpCooldownRef.current - delta);

    if (!paused && !hasWon.current) {
      const rotateSpeed = 2.5 * turnSpeedMultiplier;
      if (moveState.current.left) camera.rotation.y -= rotateSpeed * delta;
      if (moveState.current.right) camera.rotation.y += rotateSpeed * delta;

      const speed = 7 * moveSpeedMultiplier;
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const desiredVelocity = new THREE.Vector3();
      if (moveState.current.forward) desiredVelocity.add(forward.clone().multiplyScalar(speed));
      if (moveState.current.backward) desiredVelocity.sub(forward.clone().multiplyScalar(speed));

      velocityRef.current.lerp(
        desiredVelocity,
        THREE.MathUtils.clamp((slippery ? 2.3 : 7.2) * delta, 0, 1),
      );

      const move = velocityRef.current.clone().multiplyScalar(delta);

      const radius = 0.4;
      const intendedX = camera.position.x + move.x;
      const collidedX = checkCollision(maze, intendedX, camera.position.z, radius, doorsRef.current);
      if (!collidedX) {
        camera.position.x = intendedX;
      } else if (bumpCooldownRef.current === 0) {
        bumpCooldownRef.current = 0.12;
        onBump?.();
      }

      const intendedZ = camera.position.z + move.z;
      const collidedZ = checkCollision(maze, camera.position.x, intendedZ, radius, doorsRef.current);
      if (!collidedZ) {
        camera.position.z = intendedZ;
      } else if (bumpCooldownRef.current === 0) {
        bumpCooldownRef.current = 0.12;
        onBump?.();
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

      if (maze[currCellZ]?.[currCellX]?.isCenter && hasLeftStart.current) {
        const dX = camera.position.x - currCellX * 2;
        const dZ = camera.position.z - currCellZ * 2;

        if (Math.sqrt(dX * dX + dZ * dZ) < 1.0) {
          hasWon.current = true;
          setWon(true);
        }
      }
    }

    const cellX = Math.max(0, Math.min(maze[0].length - 1, Math.round(camera.position.x / 2)));
    const cellZ = Math.max(0, Math.min(maze.length - 1, Math.round(camera.position.z / 2)));
    const reportedCellKey = `${cellX},${cellZ}`;
    if (lastReportedCell.current !== reportedCellKey) {
      lastReportedCell.current = reportedCellKey;
      onPlayerMove?.({
        x: camera.position.x,
        z: camera.position.z,
        cellX,
        cellZ,
      });
    }

    if (hudRef.current) {
      hudRef.current.position.copy(camera.position);
      hudRef.current.rotation.copy(camera.rotation);
      hudRef.current.translateZ(-1.5);

      const isMoving = !paused && (
        moveState.current.forward ||
        moveState.current.backward ||
        moveState.current.left ||
        moveState.current.right
      );
      const bob = isMoving ? Math.abs(Math.sin(state.clock.elapsedTime * 12)) * 0.1 : 0;
      hudRef.current.translateY(-0.6 + bob);
    }
  });

  return (
    <group ref={hudRef}>
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.35, 32]} />
        <meshBasicMaterial color={skin?.aura ?? '#ffffff'} transparent opacity={0.4} depthTest={false} side={THREE.DoubleSide} />
      </mesh>
      <sprite scale={[skin?.scale ?? 0.9, skin?.scale ?? 0.9, 1]}>
        <spriteMaterial map={pouleTexture} color={skin?.tint ?? '#ffffff'} transparent={true} depthTest={false} renderOrder={999} />
      </sprite>
    </group>
  );
}
