import React from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

function GrammarDoor({ door, setDoors, brickTexture, onAnswer }) {
  const groupRef = React.useRef();
  const cellSize = 2;
  const px = door.x * cellSize;
  const pz = door.y * cellSize;
  
  const w = door.orientation === 'horizontal' ? 2 : 0.4;
  const d = door.orientation === 'horizontal' ? 0.4 : 2;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const targetY = door.status === 'open' ? -2.5 : 1.25;
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 5 * delta);
  });

  const handleAnswer = (idx) => {
    if (door.status !== 'closed') return;
    const correct = idx === door.question.answer;

    onAnswer?.(correct);
    
    setDoors(prev => prev.map(d => d.id === door.id ? { ...d, status: correct ? 'correct' : 'wrong' } : d));

    setTimeout(() => {
      setDoors(prev => prev.map(d => d.id === door.id ? { ...d, status: 'open' } : d));
    }, correct ? 1000 : 3500);
  };

  let color = 'white'; // White shows the brick texture perfectly
  if (door.status === 'correct') color = '#2ecc71';
  if (door.status === 'wrong') color = '#e74c3c';

  const posFront = door.orientation === 'horizontal' ? [0, 0, 0.21] : [0.21, 0, 0];
  const rotFront = door.orientation === 'horizontal' ? [0, 0, 0] : [0, Math.PI / 2, 0];
  
  const posBack = door.orientation === 'horizontal' ? [0, 0, -0.21] : [-0.21, 0, 0];
  const rotBack = door.orientation === 'horizontal' ? [0, Math.PI, 0] : [0, -Math.PI / 2, 0];

  const handlePointerOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    e.object.material.color.set('#2980b9');
  };
  const handlePointerOut = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
    e.object.material.color.set('#3498db');
  };

  const DoorContent = ({ pos, rot }) => (
    <group position={pos} rotation={rot}>
      {/* Question Text */}
      <Text position={[0, 0.7, 0]} fontSize={0.15} color="white" maxWidth={1.8} textAlign="center" anchorY="middle" raycast={() => null}>
        {door.question.question}
      </Text>
      
      {/* Wrong Answer feedback */}
      {door.status === 'wrong' && (
        <Text position={[0, 0, 0]} fontSize={0.12} color="#ffcccc" maxWidth={1.8} textAlign="center" raycast={() => null}>
          {`Faux ! C'était :\n${door.question.options[door.question.answer]}`}
        </Text>
      )}

      {/* Buttons for options */}
      {door.status === 'closed' && door.question.options.map((opt, i) => {
         const yOffset = 0.2 - (i * 0.35);
         return (
           <group key={i} position={[0, yOffset, 0]}>
             <mesh 
               onClick={(e) => { e.stopPropagation(); handleAnswer(i); }}
               onPointerOver={handlePointerOver}
               onPointerOut={handlePointerOut}
             >
               <boxGeometry args={[1.7, 0.25, 0.05]} />
               <meshStandardMaterial color="#3498db" />
             </mesh>
             <Text position={[0, 0, 0.03]} fontSize={0.12} color="white" anchorY="middle" maxWidth={1.6} textAlign="center" raycast={() => null}>
               {opt}
             </Text>
           </group>
         );
      })}
    </group>
  );

  return (
    <group ref={groupRef} position={[px, 1.25, pz]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, 2.5, d]} />
        <meshStandardMaterial map={brickTexture} color={color} roughness={0.7} />
      </mesh>
      {(door.status === 'closed' || door.status === 'wrong') && <DoorContent pos={posFront} rot={rotFront} />}
      {(door.status === 'closed' || door.status === 'wrong') && <DoorContent pos={posBack} rot={rotBack} />}
    </group>
  );
}

const Forest = ({ mazeWidth, mazeHeight }) => {
  const treeCount = 200;
  const trunkRef = React.useRef();
  const leavesRef = React.useRef();

  React.useLayoutEffect(() => {
    if (!trunkRef.current || !leavesRef.current) return;
    
    const tempObj = new THREE.Object3D();
    for (let i = 0; i < treeCount; i++) {
        let x, z;
        do {
            x = (Math.random() - 0.5) * (mazeWidth + 100) + mazeWidth / 2;
            z = (Math.random() - 0.5) * (mazeHeight + 100) + mazeHeight / 2;
        } while(x > -10 && x < mazeWidth + 10 && z > -10 && z < mazeHeight + 10);
        
        const scale = 0.8 + Math.random() * 1.0;
        
        // Trunk instance
        tempObj.position.set(x, 1 * scale, z);
        tempObj.rotation.set(0, Math.random() * Math.PI, 0);
        tempObj.scale.set(scale, scale, scale);
        tempObj.updateMatrix();
        trunkRef.current.setMatrixAt(i, tempObj.matrix);
        
        // Leaves instance
        tempObj.position.set(x, 3.5 * scale, z);
        tempObj.updateMatrix();
        leavesRef.current.setMatrixAt(i, tempObj.matrix);
    }
    trunkRef.current.instanceMatrix.needsUpdate = true;
    leavesRef.current.instanceMatrix.needsUpdate = true;
  }, [mazeWidth, mazeHeight]);

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[null, null, treeCount]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.5, 2, 7]} />
        <meshStandardMaterial color="#4A3B32" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={leavesRef} args={[null, null, treeCount]} castShadow receiveShadow>
        <coneGeometry args={[2, 4.5, 7]} />
        <meshStandardMaterial color="#2d5e2e" roughness={0.8} />
      </instancedMesh>
    </group>
  );
};

export default function Level({ maze, solutionPath, showPath, doors, setDoors, won, onDoorAnswer }) {
  const brickTexture = useLoader(THREE.TextureLoader, '/brick.png');
  brickTexture.wrapS = THREE.RepeatWrapping;
  brickTexture.wrapT = THREE.RepeatWrapping;
  brickTexture.repeat.set(1, 1);
  brickTexture.magFilter = THREE.NearestFilter;
  brickTexture.minFilter = THREE.NearestFilter;

  const minoTexture = useLoader(THREE.TextureLoader, '/minotaur_fist.png');

  const cellSize = 2; 
  const wallHeight = 2.5;
  const wallThickness = 0.2; 

  const walls = [];
  const floors = [];
  const objects = [];

  const mazeWidth = maze.length > 0 ? maze[0].length * cellSize : 0;
  const mazeHeight = maze.length * cellSize;

  floors.push(
    <mesh key="grass-floor" position={[mazeWidth / 2 - cellSize / 2, -0.1, mazeHeight / 2 - cellSize / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial color="#4A7c2c" roughness={1} />
    </mesh>
  );

  maze.forEach((row, y) => {
    row.forEach((cell, x) => {
      const px = x * cellSize;
      const pz = y * cellSize;

      if (cell.isCenter && !won) {
        objects.push(
          <sprite key={`mino-${x}-${y}`} position={[px, 1.1, pz]} scale={[1.35, 1.35, 1]}>
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
      <Forest mazeWidth={mazeWidth} mazeHeight={mazeHeight} />
      {doors && doors.map(door => (
        <GrammarDoor
          key={door.id}
          door={door}
          setDoors={setDoors}
          brickTexture={brickTexture}
          onAnswer={onDoorAnswer}
        />
      ))}
    </group>
  );
}
