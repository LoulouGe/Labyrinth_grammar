import React from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export default function Level({ maze, solutionPath, showPath }) {
  const brickTexture = useLoader(THREE.TextureLoader, '/brick.png');
  brickTexture.wrapS = THREE.RepeatWrapping;
  brickTexture.wrapT = THREE.RepeatWrapping;
  brickTexture.repeat.set(1, 1);
  brickTexture.magFilter = THREE.NearestFilter;
  brickTexture.minFilter = THREE.NearestFilter;

  const minoTexture = useLoader(THREE.TextureLoader, '/minotaure.png');

  const cellSize = 2; 
  const wallHeight = 2.5;
  const wallThickness = 0.2; 

  const walls = [];
  const floors = [];
  const objects = [];

  maze.forEach((row, y) => {
    row.forEach((cell, x) => {
      const px = x * cellSize;
      const pz = y * cellSize;

      floors.push(
        <mesh key={`floor-${x}-${y}`} position={[px, -0.1, pz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[cellSize, cellSize]} />
          <meshStandardMaterial color={"#e0c08b"} roughness={0.9} />
        </mesh>
      );

      if (cell.isCenter) {
        objects.push(
          <sprite key={`mino-${x}-${y}`} position={[px, 1.2, pz]} scale={[2, 2, 1]}>
            <spriteMaterial map={minoTexture} transparent={true} depthTest={true} />
          </sprite>
        )
      }

      if (cell.walls.top) {
        walls.push(
          <mesh key={`w-t-${x}-${y}`} position={[px, wallHeight/2, pz - cellSize/2]} castShadow receiveShadow>
            <boxGeometry args={[cellSize, wallHeight, wallThickness]} />
            <meshStandardMaterial map={brickTexture} />
          </mesh>
        );
      }
      if (cell.walls.bottom) {
        walls.push(
          <mesh key={`w-b-${x}-${y}`} position={[px, wallHeight/2, pz + cellSize/2]} castShadow receiveShadow>
            <boxGeometry args={[cellSize, wallHeight, wallThickness]} />
            <meshStandardMaterial map={brickTexture} />
          </mesh>
        );
      }
      if (cell.walls.left) {
        walls.push(
          <mesh key={`w-l-${x}-${y}`} position={[px - cellSize/2, wallHeight/2, pz]} castShadow receiveShadow>
            <boxGeometry args={[wallThickness, wallHeight, cellSize]} />
            <meshStandardMaterial map={brickTexture} />
          </mesh>
        );
      }
      if (cell.walls.right) {
        walls.push(
          <mesh key={`w-r-${x}-${y}`} position={[px + cellSize/2, wallHeight/2, pz]} castShadow receiveShadow>
            <boxGeometry args={[wallThickness, wallHeight, cellSize]} />
            <meshStandardMaterial map={brickTexture} />
          </mesh>
        );
      }
    });
  });

  const pathObjects = [];
  if (showPath && solutionPath) {
    solutionPath.forEach((cell, i) => {
      pathObjects.push(
        <mesh key={`path-${i}`} position={[cell.x * cellSize, -0.05, cell.y * cellSize]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial color="#32cd32" transparent opacity={0.7} />
        </mesh>
      );
    });
  }

  return (
    <group>
      {floors}
      {walls}
      {objects}
      {pathObjects}
    </group>
  );
}
