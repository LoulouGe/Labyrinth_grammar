/* eslint-disable react-hooks/immutability */
import React from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

function getChestColor(rewardType) {
  if (rewardType === 'score') return '#ffd47a';
  if (rewardType === 'key') return '#ffeaa0';
  if (rewardType === 'compass') return '#89e8ff';
  if (rewardType === 'lantern') return '#ffc27a';
  if (rewardType === 'scroll') return '#d1a7ff';
  return '#9ff4c1';
}

function getChestLabel(rewardType) {
  if (rewardType === 'score') return 'Orbe';
  if (rewardType === 'key') return 'Cle';
  if (rewardType === 'compass') return 'Boussole';
  if (rewardType === 'lantern') return 'Lanterne';
  if (rewardType === 'scroll') return 'Parchemin';
  return 'Bouclier';
}

function getDoorTone(door, theme, isInsightTarget, revealSecrets) {
  const secretHighlight = revealSecrets && (door.tier === 'elite' || door.tier === 'boss' || door.tier === 'bonus');

  if (door.status === 'correct') {
    return { color: '#6ae792', emissive: '#39d87a' };
  }

  if (door.status === 'wrong') {
    return { color: '#f07a7a', emissive: '#8b1e1e' };
  }

  if (isInsightTarget) {
    return { color: '#ffe08a', emissive: theme.accent };
  }

  if (door.tier === 'boss') {
    return { color: '#ffb2d9', emissive: '#ff5fb2' };
  }

  if (door.tier === 'elite') {
    return { color: secretHighlight ? '#ffcf7a' : '#d79d4b', emissive: '#c27114' };
  }

  if (door.tier === 'timed') {
    return { color: '#7fd4ff', emissive: '#2b8dd8' };
  }

  if (door.tier === 'trap') {
    return { color: '#ff9d9d', emissive: '#8a2525' };
  }

  if (door.tier === 'bonus') {
    return { color: '#98ffc6', emissive: '#2ca864' };
  }

  return {
    color: secretHighlight ? '#d5f4ff' : theme.wallTint,
    emissive: secretHighlight ? '#4dc6ff' : '#111111',
  };
}

function getDoorLabel(door) {
  if (door.tier === 'elite') return `Elite • ${door.question.category}`;
  if (door.tier === 'timed') return `Chrono • ${door.question.category}`;
  if (door.tier === 'trap') return `Piege • ${door.question.category}`;
  if (door.tier === 'bonus') return `Bonus • ${door.question.category}`;
  if (door.tier === 'boss') return `Gardien • ${door.question.category}`;
  return door.question.category;
}

function TreasureChest({ chest, revealSecrets }) {
  const groupRef = React.useRef();
  const glowRef = React.useRef();
  const beamRef = React.useRef();
  const lidRef = React.useRef();

  useFrame((state) => {
    if (!groupRef.current || !glowRef.current || !beamRef.current || !lidRef.current) return;

    const pulse = 0.45 + Math.sin(state.clock.elapsedTime * 6) * 0.14;
    const isOpen = chest.status === 'open';
    groupRef.current.position.y = chest.status === 'open'
      ? -1.4
      : 0.46 + Math.sin(state.clock.elapsedTime * 2 + chest.x + chest.y) * 0.08;
    glowRef.current.material.opacity = chest.status === 'open'
      ? 0
      : revealSecrets
        ? 0.48 + pulse * 0.2
        : 0.18 + pulse * 0.08;
    beamRef.current.material.opacity = isOpen
      ? 0.42 + pulse * 0.12
      : revealSecrets
        ? 0.18 + pulse * 0.08
        : 0;
    beamRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5 + chest.x) * 0.08;
    lidRef.current.rotation.z = isOpen ? -0.95 : -0.12 + Math.sin(state.clock.elapsedTime * 2.4) * 0.03;
  });

  const rarityColor = getChestColor(chest.rewardType);

  return (
    <group ref={groupRef} position={[chest.x * 2, 0.46, chest.y * 2]}>
      <mesh position={[0, -0.08, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 0.16, 0.82]} />
        <meshStandardMaterial color="#5f3d22" roughness={0.9} />
      </mesh>
      <mesh rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.38, 0.7]} />
        <meshStandardMaterial color={rarityColor} emissive={rarityColor} emissiveIntensity={revealSecrets ? 0.35 : 0.18} />
      </mesh>
      <group ref={lidRef} position={[0, 0.23, -0.16]}>
        <mesh position={[0, 0.08, 0.16]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.72, 0.14, 0.72]} />
          <meshStandardMaterial color={rarityColor} emissive={rarityColor} emissiveIntensity={0.26} />
        </mesh>
      </group>
      <mesh ref={beamRef} position={[0, 1.05, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.24, 1.9, 16, 1, true]} />
        <meshBasicMaterial color={rarityColor} transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.38, 0]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color="#fff4c8" emissive={rarityColor} emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} ref={glowRef}>
        <ringGeometry args={[0.25, 0.45, 20]} />
        <meshBasicMaterial color={rarityColor} transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>
      {revealSecrets && chest.status === 'closed' && (
        <Text
          position={[0, 0.78, 0]}
          fontSize={0.1}
          color={rarityColor}
          maxWidth={1.4}
          textAlign="center"
          raycast={() => null}
        >
          {getChestLabel(chest.rewardType)}
        </Text>
      )}
    </group>
  );
}

function GrammarDoor({
  door,
  setDoors,
  brickTexture,
  onAnswer,
  theme,
  isInsightTarget,
  revealSecrets,
}) {
  const groupRef = React.useRef();
  const doorMeshRef = React.useRef();
  const cellSize = 2;
  const px = door.x * cellSize;
  const pz = door.y * cellSize;
  const width = door.orientation === 'horizontal' ? 2 : 0.4;
  const depth = door.orientation === 'horizontal' ? 0.4 : 2;
  const timeoutsRef = React.useRef([]);
  const eliteHaloRef = React.useRef();
  const [timedRemaining, setTimedRemaining] = React.useState(door.timeLimit ?? null);

  React.useEffect(() => () => {
    timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
  }, []);

  React.useEffect(() => {
    setTimedRemaining(door.timeLimit ?? null);
  }, [door.id, door.timeLimit]);

  React.useEffect(() => {
    if (door.tier !== 'timed' && door.tier !== 'boss') return undefined;
    if (door.status !== 'closed') return undefined;
    if ((timedRemaining ?? 0) <= 0) return undefined;

    const timeoutId = window.setTimeout(() => {
      setTimedRemaining((value) => {
        if (value == null) return value;
        return value - 1;
      });
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [door.status, door.tier, timedRemaining]);

  React.useEffect(() => {
    if ((door.tier !== 'timed' && door.tier !== 'boss') || door.status !== 'closed') return;
    if ((timedRemaining ?? 1) > 0) return;

    onAnswer?.({ correct: false, door, optionIndex: -1, reason: 'timeout' });
    setDoors((previousDoors) => previousDoors.map((candidateDoor) => (
      candidateDoor.id === door.id
        ? { ...candidateDoor, status: 'wrong' }
        : candidateDoor
    )));

    const timeoutId = window.setTimeout(() => {
      setDoors((previousDoors) => previousDoors.map((candidateDoor) => (
        candidateDoor.id === door.id
          ? { ...candidateDoor, status: 'open' }
          : candidateDoor
      )));
    }, door.tier === 'boss' ? 3600 : 2200);

    timeoutsRef.current.push(timeoutId);
  }, [door, onAnswer, setDoors, timedRemaining]);

  useFrame((state, delta) => {
    if (!groupRef.current || !doorMeshRef.current) return;

    const targetY = door.status === 'open' ? -2.5 : 1.25;
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 5 * delta);

    const pulse = 0.55 + Math.sin(state.clock.elapsedTime * 7) * 0.2;
    const shake = door.status === 'wrong' ? Math.sin(state.clock.elapsedTime * 35) * 0.05 : 0;
    groupRef.current.position.x = px + shake;

    const material = doorMeshRef.current.material;
    const tone = getDoorTone(door, theme, isInsightTarget, revealSecrets);
    material.color.set(tone.color);
    material.emissive.set(tone.emissive);
    material.emissiveIntensity = door.status === 'open'
      ? 0
      : isInsightTarget || door.tier !== 'normal' || revealSecrets
        ? pulse
        : pulse * 0.22;

    if (eliteHaloRef.current) {
      eliteHaloRef.current.material.opacity = door.status === 'open'
        ? 0
        : 0.16 + pulse * 0.12;
      eliteHaloRef.current.rotation.y += delta * 0.6;
    }
  });

  const handleAnswer = (optionIndex) => {
    if (door.status !== 'closed') return;

    const correct = optionIndex === door.question.answer;
    onAnswer?.({ correct, door, optionIndex });

    setDoors((previousDoors) => previousDoors.map((candidateDoor) => (
      candidateDoor.id === door.id
        ? { ...candidateDoor, status: correct ? 'correct' : 'wrong' }
        : candidateDoor
    )));

    const timeoutId = window.setTimeout(() => {
      setDoors((previousDoors) => previousDoors.map((candidateDoor) => (
        candidateDoor.id === door.id
          ? { ...candidateDoor, status: 'open' }
          : candidateDoor
      )));
    }, correct ? (door.tier === 'elite' ? 1250 : 950) : (door.tier === 'elite' ? 3200 : 2400));

    timeoutsRef.current.push(timeoutId);
  };

  const getButtonColor = (optionIndex) => {
    if (isInsightTarget && optionIndex === door.question.answer) return '#f6c84b';
    if (door.tier === 'elite') return '#b86b18';
    if (door.tier === 'timed') return '#1f76b5';
    if (door.tier === 'trap') return '#8c3131';
    if (door.tier === 'bonus') return '#2d9a61';
    if (door.tier === 'boss') return '#9f2e74';
    return theme.buttonColor;
  };

  const renderDoorContent = (position, rotation) => (
    <group position={position} rotation={rotation}>
      <Text
        position={[0, 1.08, 0]}
        fontSize={0.1}
        color={door.tier === 'elite' ? '#ffc06a' : door.tier === 'boss' ? '#ffb0df' : isInsightTarget ? '#ffe08a' : theme.accent}
        maxWidth={1.8}
        textAlign="center"
        anchorY="middle"
        raycast={() => null}
      >
        {getDoorLabel(door)}
      </Text>

      <Text
        position={[0, 0.68, 0]}
        fontSize={0.15}
        color="white"
        maxWidth={1.8}
        textAlign="center"
        anchorY="middle"
        raycast={() => null}
      >
        {door.question.question}
      </Text>

      {(door.tier === 'timed' || door.tier === 'boss') && door.status === 'closed' && timedRemaining != null && (
        <Text
          position={[0, 0.4, 0]}
          fontSize={0.11}
          color={timedRemaining <= 3 ? '#ffb0b0' : '#bceaff'}
          maxWidth={1.8}
          textAlign="center"
          raycast={() => null}
        >
          {door.tier === 'boss' ? `Gardien en alerte • ${timedRemaining}s` : `Temps limite • ${timedRemaining}s`}
        </Text>
      )}

      {door.status === 'wrong' && (
        <>
          <Text
            position={[0, door.tier === 'timed' || door.tier === 'boss' ? -0.02 : 0.04, 0]}
            fontSize={0.12}
            color="#ffdddd"
            maxWidth={1.8}
            textAlign="center"
            raycast={() => null}
          >
            {`${timedRemaining === 0 ? 'Temps ecoule !' : 'Faux !'} Bonne reponse :\n${door.question.options[door.question.answer]}`}
          </Text>
          <Text
            position={[0, -0.63, 0]}
            fontSize={0.09}
            color="#fff5cf"
            maxWidth={1.72}
            textAlign="center"
            raycast={() => null}
          >
            {door.question.explanation}
          </Text>
        </>
      )}

      {door.status === 'closed' && door.question.options.map((option, optionIndex) => {
        const baseOffset = door.tier === 'timed' || door.tier === 'boss' ? 0.02 : 0.18;
        const yOffset = baseOffset - optionIndex * 0.34;
        return (
          <group key={`${door.id}-${option}`} position={[0, yOffset, 0]}>
            <mesh
              onClick={(event) => {
                event.stopPropagation();
                handleAnswer(optionIndex);
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                event.object.material.color.set('#1f5f96');
              }}
              onPointerOut={(event) => {
                event.stopPropagation();
                event.object.material.color.set(getButtonColor(optionIndex));
              }}
            >
              <boxGeometry args={[1.7, 0.25, 0.05]} />
              <meshStandardMaterial
                color={getButtonColor(optionIndex)}
                emissive={isInsightTarget && optionIndex === door.question.answer ? theme.accent : '#0b1622'}
                emissiveIntensity={isInsightTarget && optionIndex === door.question.answer ? 0.6 : 0.15}
              />
            </mesh>
            <Text
              position={[0, 0, 0.03]}
              fontSize={0.115}
              color="white"
              anchorY="middle"
              maxWidth={1.56}
              textAlign="center"
              raycast={() => null}
            >
              {option}
            </Text>
          </group>
        );
      })}
    </group>
  );

  const frontPosition = door.orientation === 'horizontal' ? [0, 0, 0.21] : [0.21, 0, 0];
  const frontRotation = door.orientation === 'horizontal' ? [0, 0, 0] : [0, Math.PI / 2, 0];
  const backPosition = door.orientation === 'horizontal' ? [0, 0, -0.21] : [-0.21, 0, 0];
  const backRotation = door.orientation === 'horizontal' ? [0, Math.PI, 0] : [0, -Math.PI / 2, 0];

  return (
    <group ref={groupRef} position={[px, 1.25, pz]}>
      {(door.tier === 'elite' || door.tier === 'boss' || door.tier === 'bonus') && (
        <>
          <mesh ref={eliteHaloRef} position={[0, 1.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.74, 0.05, 12, 40]} />
            <meshBasicMaterial color={door.tier === 'boss' ? '#ff6dc1' : door.tier === 'bonus' ? '#62e48f' : '#ffbf5b'} transparent opacity={0.24} />
          </mesh>
          <mesh position={[0, 2.26, 0]}>
            <octahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial color="#fff0b8" emissive={door.tier === 'boss' ? '#ff6dc1' : door.tier === 'bonus' ? '#62e48f' : '#ffbf5b'} emissiveIntensity={0.8} />
          </mesh>
        </>
      )}
      <mesh ref={doorMeshRef} castShadow receiveShadow>
        <boxGeometry args={[width, 2.5, depth]} />
        <meshStandardMaterial map={brickTexture} color={theme.wallTint} roughness={0.72} />
      </mesh>
      {(door.tier === 'elite' || door.tier === 'boss' || door.tier === 'timed' || door.tier === 'bonus') && (
        <>
          <mesh position={[0, 0.9, depth / 2 + 0.03]}>
            <boxGeometry args={[Math.max(0.18, width * 0.82), 0.1, 0.05]} />
            <meshBasicMaterial color={door.tier === 'boss' ? '#ff92d1' : door.tier === 'timed' ? '#8de0ff' : door.tier === 'bonus' ? '#9bf6bc' : '#ffc96c'} />
          </mesh>
          <mesh position={[0, 0.9, -(depth / 2 + 0.03)]}>
            <boxGeometry args={[Math.max(0.18, width * 0.82), 0.1, 0.05]} />
            <meshBasicMaterial color={door.tier === 'boss' ? '#ff92d1' : door.tier === 'timed' ? '#8de0ff' : door.tier === 'bonus' ? '#9bf6bc' : '#ffc96c'} />
          </mesh>
        </>
      )}
      {(door.status === 'closed' || door.status === 'wrong') && renderDoorContent(frontPosition, frontRotation)}
      {(door.status === 'closed' || door.status === 'wrong') && renderDoorContent(backPosition, backRotation)}
    </group>
  );
}

function Forest({ mazeWidth, mazeHeight, theme }) {
  const treeCount = 200;
  const trunkRef = React.useRef();
  const leavesRef = React.useRef();

  React.useLayoutEffect(() => {
    if (!trunkRef.current || !leavesRef.current) return;

    const tempObject = new THREE.Object3D();

    for (let index = 0; index < treeCount; index += 1) {
      let x;
      let z;

      do {
        x = (Math.random() - 0.5) * (mazeWidth + 100) + mazeWidth / 2;
        z = (Math.random() - 0.5) * (mazeHeight + 100) + mazeHeight / 2;
      } while (x > -10 && x < mazeWidth + 10 && z > -10 && z < mazeHeight + 10);

      const scale = 0.8 + Math.random();

      tempObject.position.set(x, scale, z);
      tempObject.rotation.set(0, Math.random() * Math.PI, 0);
      tempObject.scale.set(scale, scale, scale);
      tempObject.updateMatrix();
      trunkRef.current.setMatrixAt(index, tempObject.matrix);

      tempObject.position.set(x, 3.5 * scale, z);
      tempObject.updateMatrix();
      leavesRef.current.setMatrixAt(index, tempObject.matrix);
    }

    trunkRef.current.instanceMatrix.needsUpdate = true;
    leavesRef.current.instanceMatrix.needsUpdate = true;
  }, [mazeHeight, mazeWidth]);

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[null, null, treeCount]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.5, 2, 7]} />
        <meshStandardMaterial color={theme.trunkColor} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={leavesRef} args={[null, null, treeCount]} castShadow receiveShadow>
        <coneGeometry args={[2, 4.5, 7]} />
        <meshStandardMaterial color={theme.leafColor} roughness={0.8} emissive={theme.leafGlow} emissiveIntensity={0.18} />
      </instancedMesh>
    </group>
  );
}

export default function Level({
  maze,
  doors,
  setDoors,
  won,
  onDoorAnswer,
  theme,
  insightDoorId,
  bonusChests,
  revealSecrets,
}) {
  const brickTexture = useLoader(THREE.TextureLoader, '/brick.png');
  const minotaurTexture = useLoader(THREE.TextureLoader, '/minotaur_fist.png');

  React.useEffect(() => {
    brickTexture.wrapS = THREE.RepeatWrapping;
    brickTexture.wrapT = THREE.RepeatWrapping;
    brickTexture.repeat.set(1, 1);
    brickTexture.magFilter = THREE.NearestFilter;
    brickTexture.minFilter = THREE.NearestFilter;
  }, [brickTexture]);

  const cellSize = 2;
  const wallHeight = 2.5;
  const wallThickness = 0.2;
  const mazeWidth = maze.length > 0 ? maze[0].length * cellSize : 0;
  const mazeHeight = maze.length * cellSize;
  const walls = [];
  const objects = [];

  maze.forEach((row, y) => {
    row.forEach((cell, x) => {
      const px = x * cellSize;
      const pz = y * cellSize;

      if (cell.isCenter && !won) {
        objects.push(
          <sprite key={`mino-${x}-${y}`} position={[px, 1.1, pz]} scale={[1.35, 1.35, 1]}>
            <spriteMaterial map={minotaurTexture} transparent depthTest />
          </sprite>,
        );
      }

      if (cell.walls.top) {
        walls.push(
          <mesh key={`w-t-${x}-${y}`} position={[px, wallHeight / 2, pz - cellSize / 2]} castShadow receiveShadow>
            <boxGeometry args={[cellSize, wallHeight, wallThickness]} />
            <meshStandardMaterial map={brickTexture} color={theme.wallTint} />
          </mesh>,
        );
      }

      if (cell.walls.bottom) {
        walls.push(
          <mesh key={`w-b-${x}-${y}`} position={[px, wallHeight / 2, pz + cellSize / 2]} castShadow receiveShadow>
            <boxGeometry args={[cellSize, wallHeight, wallThickness]} />
            <meshStandardMaterial map={brickTexture} color={theme.wallTint} />
          </mesh>,
        );
      }

      if (cell.walls.left) {
        walls.push(
          <mesh key={`w-l-${x}-${y}`} position={[px - cellSize / 2, wallHeight / 2, pz]} castShadow receiveShadow>
            <boxGeometry args={[wallThickness, wallHeight, cellSize]} />
            <meshStandardMaterial map={brickTexture} color={theme.wallTint} />
          </mesh>,
        );
      }

      if (cell.walls.right) {
        walls.push(
          <mesh key={`w-r-${x}-${y}`} position={[px + cellSize / 2, wallHeight / 2, pz]} castShadow receiveShadow>
            <boxGeometry args={[wallThickness, wallHeight, cellSize]} />
            <meshStandardMaterial map={brickTexture} color={theme.wallTint} />
          </mesh>,
        );
      }
    });
  });

  return (
    <group>
      <mesh
        position={[mazeWidth / 2 - cellSize / 2, -0.1, mazeHeight / 2 - cellSize / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color={theme.groundColor} roughness={1} />
      </mesh>

      {walls}
      {objects}
      <Forest mazeWidth={mazeWidth} mazeHeight={mazeHeight} theme={theme} />

      {bonusChests?.map((chest) => (
        <TreasureChest key={chest.id} chest={chest} revealSecrets={revealSecrets} />
      ))}

      {doors?.map((door) => (
        <GrammarDoor
          key={door.id}
          door={door}
          setDoors={setDoors}
          brickTexture={brickTexture}
          onAnswer={onDoorAnswer}
          theme={theme}
          isInsightTarget={insightDoorId === door.id && door.status === 'closed'}
          revealSecrets={revealSecrets}
        />
      ))}
    </group>
  );
}
