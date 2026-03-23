import { useState, useEffect } from 'react';
import { generateMaze } from '../utils/mazeGenerator';

export function useGame(width = 15, height = 15) {
  const [maze, setMaze] = useState([]);
  const [won, setWon] = useState(false);
  const [solutionPath, setSolutionPath] = useState([]);

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

  }, [width, height]);

  useEffect(() => {
    if (won) {
      setTimeout(() => alert("🤜🤛 Check ! Tu as checké le minotaure au centre du labyrinthe ! Vous êtes devenus de super potes."), 500);
    }
  }, [won]);

  return { maze, won, setWon, solutionPath };
}
