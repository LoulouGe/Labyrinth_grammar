export function generateMaze(width, height, random = Math.random) {
  const grid = [];
  // Initialize the grid with walls everywhere
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push({
        x,
        y,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false,
        isCenter: false,
      });
    }
    grid.push(row);
  }

  // Set the center of the maze
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  grid[centerY][centerX].isCenter = true;

  // Depth-first search (Recursive Backtracker) maze generation
  const stack = [];
  let current = grid[0][0]; // Start top-left
  current.visited = true;

  function getUnvisitedNeighbors(cell) {
    const neighbors = [];
    const { x, y } = cell;

    if (y > 0 && !grid[y - 1][x].visited) neighbors.push({ cell: grid[y - 1][x], dir: 'top' });
    if (x < width - 1 && !grid[y][x + 1].visited) neighbors.push({ cell: grid[y][x + 1], dir: 'right' });
    if (y < height - 1 && !grid[y + 1][x].visited) neighbors.push({ cell: grid[y + 1][x], dir: 'bottom' });
    if (x > 0 && !grid[y][x - 1].visited) neighbors.push({ cell: grid[y][x - 1], dir: 'left' });

    return neighbors;
  }

  function removeWalls(a, b, dir) {
    if (dir === 'top') {
      a.walls.top = false;
      b.walls.bottom = false;
    } else if (dir === 'right') {
      a.walls.right = false;
      b.walls.left = false;
    } else if (dir === 'bottom') {
      a.walls.bottom = false;
      b.walls.top = false;
    } else if (dir === 'left') {
      a.walls.left = false;
      b.walls.right = false;
    }
  }

  while (true) {
    const neighbors = getUnvisitedNeighbors(current);

    if (neighbors.length > 0) {
      // Choose randomly one of the unvisited neighbors
      const randomIndex = Math.floor(random() * neighbors.length);
      const randomNeighbor = neighbors[randomIndex];

      // Push current cell to stack
      stack.push(current);

      // Remove the wall between current and chosen cell
      removeWalls(current, randomNeighbor.cell, randomNeighbor.dir);

      // Make the chosen cell the current cell and mark as visited
      current = randomNeighbor.cell;
      current.visited = true;
    } else if (stack.length > 0) {
      // Backtrack
      current = stack.pop();
    } else {
      break; // Maze generation complete
    }
  }

  return grid;
}
