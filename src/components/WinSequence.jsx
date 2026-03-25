/* eslint-disable react-hooks/immutability */
import React, { useEffect, useRef } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const CharacterPlane = ({ texturePath, position, rotation, scale = 2.2, tint = '#ffffff' }) => {
  const tex = useLoader(THREE.TextureLoader, texturePath);
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.NearestFilter;
  }, [tex]);
  const aspectRatio = tex.image ? tex.image.width / tex.image.height : 1;

  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow renderOrder={20}>
      <planeGeometry args={[scale * aspectRatio, scale]} />
      <meshBasicMaterial map={tex} color={tint} transparent={true} side={THREE.DoubleSide} alphaTest={0.08} depthTest={false} toneMapped={false} />
    </mesh>
  );
};

export default function WinSequence({ maze, playerSkin }) {
  const { camera } = useThree();
  const centerX = Math.floor(maze[0].length / 2) * 2;
  const centerZ = Math.floor(maze.length / 2) * 2;
  const groupRef = useRef();

  useEffect(() => {
    // Reset camera state
    camera.up.set(0, 1, 0);
  }, [camera]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    camera.position.x = centerX;
    camera.position.y = 1.4;
    camera.position.z = centerZ + 5.1 - Math.min(t * 0.22, 0.95);
    camera.lookAt(centerX, -0.28, centerZ + 0.45);

    if (groupRef.current) {
        groupRef.current.position.y = -2.04 + Math.sin(t * 2) * 0.03;
    }
  });

  return (
    <group position={[centerX, 0, centerZ]}>
      <ambientLight intensity={0.7} />
      <spotLight position={[0, 6, 2]} intensity={6.5} angle={0.9} penumbra={0.4} castShadow />
      
      <group ref={groupRef}>
        <CharacterPlane 
          texturePath="/minotaur_fist.png" 
          position={[-0.86, 0.62, 0.8]} 
          rotation={[0, Math.PI / 6, 0]} 
          scale={2.7}
        />
        <CharacterPlane 
          texturePath="/chicken_fist.png" 
          position={[0.86, 0.54, 0.64]} 
          rotation={[0, -Math.PI / 6, 0]} 
          scale={2.5}
          tint={playerSkin?.tint}
        />
      </group>
    </group>
  );
}
