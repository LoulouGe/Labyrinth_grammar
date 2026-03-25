import { useState, useEffect } from 'react';
import { generateMaze } from '../utils/mazeGenerator';
import { questions } from '../data/grammar';

export function useGame(width = 15, height = 15, seed = 0, doorCount = 1) {
  const [maze, setMaze] = useState([]);
  const [won, setWon] = useState(false);
  const [solutionPath, setSolutionPath] = useState([]);
  const [doors, setDoors] = useState([]);

  useEffect(() => {
    const newMaze = generateMaze(width, height);
    newMaze[0][0].visited = true;
    setMaze(newMaze);
    setWon(false);

    // BFS to find shortest path from (0,0) to center
    const queue = [[newMaze[0][0]]];
    const visited = new Set();
    visited.add('0,0');
    
    let path = [];
    while (queue.length > 0) {
      const currentPath = queue.shift();
      const cell = currentPath[currentPath.length - 1];
      
      if (cell.isCenter) {
        path = currentPath;
        break;
      }
      
      const { x, y, walls } = cell;
      const neighbors = [];
      if (!walls.top && y > 0) neighbors.push(newMaze[y - 1][x]);
      if (!walls.bottom && y < height - 1) neighbors.push(newMaze[y + 1][x]);
      if (!walls.left && x > 0) neighbors.push(newMaze[y][x - 1]);
      if (!walls.right && x < width - 1) neighbors.push(newMaze[y][x + 1]);
      
      for (const n of neighbors) {
        const key = `${n.x},${n.y}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push([...currentPath, n]);
        }
      }
    }
    setSolutionPath(path);

    // Generate Grammar Doors
    const newDoors = [];
    if (path.length > 2) {
      const pathWithoutEnds = path.slice(1, -1);
      const nbDoors = Math.min(doorCount, pathWithoutEnds.length);
      const candidateIndices = pathWithoutEnds.map((_, index) => index);

      while (candidateIndices.length > 0 && newDoors.length < nbDoors) {
        const ratio = (newDoors.length + 1) / (nbDoors + 1);
        const targetIndex = Math.floor(ratio * pathWithoutEnds.length);

        let closestCandidatePos = 0;
        let closestDistance = Infinity;
        candidateIndices.forEach((candidateIndex, pos) => {
          const distance = Math.abs(candidateIndex - targetIndex);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestCandidatePos = pos;
          }
        });

        const cellIndex = candidateIndices.splice(closestCandidatePos, 1)[0];
        const cell = pathWithoutEnds[cellIndex];
        const prev = cellIndex === 0 ? path[0] : pathWithoutEnds[cellIndex - 1];
        let orientation = 'horizontal'; // Blocks Z-axis movement
        if (prev.x !== cell.x) orientation = 'vertical'; // Blocks X-axis movement

        const qObj = questions[Math.floor(Math.random() * questions.length)];
        newDoors.push({
          id: `door-${cell.x}-${cell.y}`,
          x: (prev.x + cell.x) / 2,
          y: (prev.y + cell.y) / 2,
          orientation,
          question: qObj,
          status: 'closed' // 'closed', 'wrong', 'open'
        });
      }
    }
    setDoors(newDoors);

  }, [width, height, seed, doorCount]);

  return { maze, won, setWon, solutionPath, doors, setDoors };
}
