/* eslint-disable react-hooks/immutability */
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CELL_SIZE = 2;
const PLAYER_RADIUS = 0.4;
const CONTROL_KEYS = {
  forward: ['KeyW', 'KeyZ', 'ArrowUp'],
  backward: ['KeyS', 'ArrowDown'],
  turnLeft: ['KeyA', 'KeyQ', 'ArrowLeft'],
  turnRight: ['KeyD', 'ArrowRight'],
};

const boxCircleCollide = (minX, maxX, minZ, maxZ, cx, cz, radius) => {
  const rx = Math.max(minX, Math.min(cx, maxX));
  const rz = Math.max(minZ, Math.min(cz, maxZ));
  const dx = cx - rx;
  const dz = cz - rz;
  return (dx * dx + dz * dz) <= (radius * radius);
};

function resolveControl(code, key, keyCode) {
  const normalizedKey = typeof key === 'string' ? key.toLowerCase() : '';

  if (CONTROL_KEYS.forward.includes(code) || normalizedKey === 'w' || normalizedKey === 'z' || normalizedKey === 'arrowup' || keyCode === 38) {
    return 'forward';
  }

  if (CONTROL_KEYS.backward.includes(code) || normalizedKey === 's' || normalizedKey === 'arrowdown' || keyCode === 40) {
    return 'backward';
  }

  if (CONTROL_KEYS.turnLeft.includes(code) || normalizedKey === 'a' || normalizedKey === 'q' || normalizedKey === 'arrowleft' || keyCode === 37) {
    return 'turnLeft';
  }

  if (CONTROL_KEYS.turnRight.includes(code) || normalizedKey === 'd' || normalizedKey === 'arrowright' || keyCode === 39) {
    return 'turnRight';
  }

  return null;
}

function checkCollision(maze, px, pz, radius, doors = []) {
  if (!maze?.length || !maze[0]?.length) return true;

  const wallThickness = 0.2;
  const mazeWidth = maze[0].length * CELL_SIZE;
  const mazeHeight = maze.length * CELL_SIZE;

  if (px < -CELL_SIZE / 2 + radius || px > mazeWidth - CELL_SIZE / 2 - radius) return true;
  if (pz < -CELL_SIZE / 2 + radius || pz > mazeHeight - CELL_SIZE / 2 - radius) return true;

  const cx = Math.max(0, Math.min(maze[0].length - 1, Math.round(px / CELL_SIZE)));
  const cz = Math.max(0, Math.min(maze.length - 1, Math.round(pz / CELL_SIZE)));

  for (let z = cz - 1; z <= cz + 1; z += 1) {
    for (let x = cx - 1; x <= cx + 1; x += 1) {
      if (z < 0 || z >= maze.length || x < 0 || x >= maze[0].length) continue;

      const cell = maze[z][x];
      const cxPos = x * CELL_SIZE;
      const czPos = z * CELL_SIZE;

      if (cell.walls.top && boxCircleCollide(cxPos - CELL_SIZE / 2, cxPos + CELL_SIZE / 2, czPos - CELL_SIZE / 2 - wallThickness / 2, czPos - CELL_SIZE / 2 + wallThickness / 2, px, pz, radius)) {
        return true;
      }

      if (cell.walls.bottom && boxCircleCollide(cxPos - CELL_SIZE / 2, cxPos + CELL_SIZE / 2, czPos + CELL_SIZE / 2 - wallThickness / 2, czPos + CELL_SIZE / 2 + wallThickness / 2, px, pz, radius)) {
        return true;
      }

      if (cell.walls.left && boxCircleCollide(cxPos - CELL_SIZE / 2 - wallThickness / 2, cxPos - CELL_SIZE / 2 + wallThickness / 2, czPos - CELL_SIZE / 2, czPos + CELL_SIZE / 2, px, pz, radius)) {
        return true;
      }

      if (cell.walls.right && boxCircleCollide(cxPos + CELL_SIZE / 2 - wallThickness / 2, cxPos + CELL_SIZE / 2 + wallThickness / 2, czPos - CELL_SIZE / 2, czPos + CELL_SIZE / 2, px, pz, radius)) {
        return true;
      }
    }
  }

  for (const door of doors) {
    if (door.status === 'open') continue;

    const doorThickness = 0.4;
    const doorWorldX = door.x * CELL_SIZE;
    const doorWorldZ = door.y * CELL_SIZE;
    const doorRadius = 0.8;

    if (door.orientation === 'horizontal') {
      if (boxCircleCollide(doorWorldX - CELL_SIZE / 2, doorWorldX + CELL_SIZE / 2, doorWorldZ - doorThickness / 2, doorWorldZ + doorThickness / 2, px, pz, doorRadius)) {
        return true;
      }
    } else if (boxCircleCollide(doorWorldX - doorThickness / 2, doorWorldX + doorThickness / 2, doorWorldZ - CELL_SIZE / 2, doorWorldZ + CELL_SIZE / 2, px, pz, doorRadius)) {
      return true;
    }
  }

  return false;
}

function getSpawnForward(maze) {
  const startCell = maze?.[0]?.[0];
  if (!startCell) return new THREE.Vector3(0, 0, 1);

  if (!startCell.walls.bottom) return new THREE.Vector3(0, 0, 1);
  if (!startCell.walls.right) return new THREE.Vector3(1, 0, 0);
  if (!startCell.walls.top) return new THREE.Vector3(0, 0, -1);
  if (!startCell.walls.left) return new THREE.Vector3(-1, 0, 0);
  return new THREE.Vector3(0, 0, 1);
}

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
  const pausedRef = useRef(paused);
  const onPlayerMoveRef = useRef(onPlayerMove);
  const onBumpRef = useRef(onBump);
  const moveStateRef = useRef({
    forward: false,
    backward: false,
    turnLeft: false,
    turnRight: false,
  });
  const hudRef = useRef();
  const spawnPositionRef = useRef(new THREE.Vector3(0, 1.2, 0));
  const lastReportedCellRef = useRef(null);
  const velocityRef = useRef(new THREE.Vector3());
  const bumpCooldownRef = useRef(0);
  const hasWonRef = useRef(false);
  const hasLeftStartRef = useRef(false);
  const isReadyRef = useRef(false);

  useEffect(() => {
    doorsRef.current = doors;
  }, [doors]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    onPlayerMoveRef.current = onPlayerMove;
  }, [onPlayerMove]);

  useEffect(() => {
    onBumpRef.current = onBump;
  }, [onBump]);

  useEffect(() => {
    pouleTexture.colorSpace = THREE.SRGBColorSpace;
    pouleTexture.magFilter = THREE.NearestFilter;
  }, [pouleTexture]);

  useLayoutEffect(() => {
    const spawnForward = getSpawnForward(maze);

    moveStateRef.current = {
      forward: false,
      backward: false,
      turnLeft: false,
      turnRight: false,
    };
    velocityRef.current.set(0, 0, 0);
    bumpCooldownRef.current = 0;
    hasWonRef.current = false;
    hasLeftStartRef.current = false;
    lastReportedCellRef.current = null;
    isReadyRef.current = false;

    if (typeof document !== 'undefined') {
      document.body.tabIndex = -1;
      document.body.focus();
    }
    if (typeof window !== 'undefined') {
      window.focus();
    }

    camera.up.set(0, 1, 0);
    camera.position.set(0, 1.2, 0);
    camera.lookAt(new THREE.Vector3(spawnForward.x * 2, 1.2, spawnForward.z * 2));
    spawnPositionRef.current.set(0, 1.2, 0);

    onPlayerMoveRef.current?.({
      x: 0,
      z: 0,
      cellX: 0,
      cellZ: 0,
    });

    isReadyRef.current = true;
  }, [camera, maze]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const control = resolveControl(event.code, event.key, event.keyCode);
      if (!control) return;

      event.preventDefault();
      event.stopPropagation();
      moveStateRef.current[control] = true;
    };

    const onKeyUp = (event) => {
      const control = resolveControl(event.code, event.key, event.keyCode);
      if (!control) return;

      event.preventDefault();
      event.stopPropagation();
      moveStateRef.current[control] = false;
    };

    const resetKeys = () => {
      moveStateRef.current = {
        forward: false,
        backward: false,
        turnLeft: false,
        turnRight: false,
      };
      velocityRef.current.set(0, 0, 0);
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp, { passive: false });
    document.addEventListener('keydown', onKeyDown, { passive: false });
    document.addEventListener('keyup', onKeyUp, { passive: false });
    window.addEventListener('blur', resetKeys);
    document.addEventListener('visibilitychange', resetKeys);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', resetKeys);
      document.removeEventListener('visibilitychange', resetKeys);
    };
  }, []);

  useFrame((state, delta) => {
    if (!isReadyRef.current || !maze?.length || !maze[0]?.length) return;

    bumpCooldownRef.current = Math.max(0, bumpCooldownRef.current - delta);

    if (!pausedRef.current && !hasWonRef.current) {
      const rotateSpeed = 2.5 * turnSpeedMultiplier;
      if (moveStateRef.current.turnLeft) camera.rotation.y -= rotateSpeed * delta;
      if (moveStateRef.current.turnRight) camera.rotation.y += rotateSpeed * delta;

      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const desiredVelocity = new THREE.Vector3();
      if (moveStateRef.current.forward) desiredVelocity.add(forward.clone().multiplyScalar(7 * moveSpeedMultiplier));
      if (moveStateRef.current.backward) desiredVelocity.sub(forward.clone().multiplyScalar(5.5 * moveSpeedMultiplier));

      velocityRef.current.lerp(
        desiredVelocity,
        THREE.MathUtils.clamp((slippery ? 2.2 : 8) * delta, 0, 1),
      );

      const move = velocityRef.current.clone().multiplyScalar(delta);

      const intendedX = camera.position.x + move.x;
      const collidedX = checkCollision(maze, intendedX, camera.position.z, PLAYER_RADIUS, doorsRef.current);
      if (!collidedX) {
        camera.position.x = intendedX;
      } else if (bumpCooldownRef.current === 0 && move.lengthSq() > 0) {
        bumpCooldownRef.current = 0.12;
        onBumpRef.current?.();
      }

      const intendedZ = camera.position.z + move.z;
      const collidedZ = checkCollision(maze, camera.position.x, intendedZ, PLAYER_RADIUS, doorsRef.current);
      if (!collidedZ) {
        camera.position.z = intendedZ;
      } else if (bumpCooldownRef.current === 0 && move.lengthSq() > 0) {
        bumpCooldownRef.current = 0.12;
        onBumpRef.current?.();
      }

      if (!hasLeftStartRef.current) {
        const horizontalDistanceFromSpawn = Math.hypot(
          camera.position.x - spawnPositionRef.current.x,
          camera.position.z - spawnPositionRef.current.z,
        );

        if (horizontalDistanceFromSpawn > 1.25) {
          hasLeftStartRef.current = true;
        }
      }

      const currentCellX = Math.max(0, Math.min(maze[0].length - 1, Math.round(camera.position.x / CELL_SIZE)));
      const currentCellZ = Math.max(0, Math.min(maze.length - 1, Math.round(camera.position.z / CELL_SIZE)));

      if (maze[currentCellZ]?.[currentCellX]?.isCenter && hasLeftStartRef.current) {
        const deltaX = camera.position.x - currentCellX * CELL_SIZE;
        const deltaZ = camera.position.z - currentCellZ * CELL_SIZE;

        if (Math.sqrt(deltaX * deltaX + deltaZ * deltaZ) < 1) {
          hasWonRef.current = true;
          setWon(true);
        }
      }
    }

    const cellX = Math.max(0, Math.min(maze[0].length - 1, Math.round(camera.position.x / CELL_SIZE)));
    const cellZ = Math.max(0, Math.min(maze.length - 1, Math.round(camera.position.z / CELL_SIZE)));
    const reportedCellKey = `${cellX},${cellZ}`;

    if (lastReportedCellRef.current !== reportedCellKey) {
      lastReportedCellRef.current = reportedCellKey;
      onPlayerMoveRef.current?.({
        x: camera.position.x,
        z: camera.position.z,
        cellX,
        cellZ,
      });
    }

    if (hudRef.current) {
      hudRef.current.position.copy(camera.position);
      hudRef.current.rotation.copy(camera.rotation);
      hudRef.current.translateZ(-1.45);

      const isMoving = (
        moveStateRef.current.forward
        || moveStateRef.current.backward
        || moveStateRef.current.turnLeft
        || moveStateRef.current.turnRight
      );
      const bob = isMoving ? Math.abs(Math.sin(state.clock.elapsedTime * 12)) * 0.08 : 0;
      hudRef.current.translateY(-0.58 + bob);
    }
  });

  return (
    <group ref={hudRef}>
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.35, 32]} />
        <meshBasicMaterial color={skin?.aura ?? '#ffffff'} transparent opacity={0.4} depthTest={false} side={THREE.DoubleSide} />
      </mesh>
      <sprite scale={[skin?.scale ?? 0.9, skin?.scale ?? 0.9, 1]}>
        <spriteMaterial map={pouleTexture} color={skin?.tint ?? '#ffffff'} transparent depthTest={false} renderOrder={999} />
      </sprite>
    </group>
  );
}
