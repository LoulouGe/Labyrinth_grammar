import React from 'react';
import './Maze.css';
import Player from './Player';

function Maze({ maze, playerPos }) {
  if (!maze || maze.length === 0) return null;

  const width = maze[0].length;

  return (
    <div className="maze-wrapper">
      <div 
        className="maze-container" 
        style={{ gridTemplateColumns: `repeat(${width}, var(--cell-size))` }}
      >
        {maze.map((row) => 
          row.map((cell) => {
            const isCenter = cell.isCenter;
            const visited = cell.visited;
            
            return (
              <div 
                key={`${cell.x}-${cell.y}`}
                className={`cell ${isCenter ? 'center-cell' : ''} ${visited ? 'visited' : ''}`}
                style={{
                  borderTop: cell.walls.top ? '2px solid var(--wall-highlight)' : '2px solid transparent',
                  borderRight: cell.walls.right ? '2px solid var(--wall-highlight)' : '2px solid transparent',
                  borderBottom: cell.walls.bottom ? '2px solid var(--wall-highlight)' : '2px solid transparent',
                  borderLeft: cell.walls.left ? '2px solid var(--wall-highlight)' : '2px solid transparent',
                  backgroundColor: cell.walls.top && cell.walls.bottom && cell.walls.left && cell.walls.right ? 'var(--wall)' : undefined
                }}
              >
                {/* Visual decorators for the cell could go here */}
              </div>
            );
          })
        )}
        <Player pos={playerPos} />
      </div>
    </div>
  );
}

export default Maze;
