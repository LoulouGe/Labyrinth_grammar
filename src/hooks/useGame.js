import { useState, useEffect } from 'react';
import { generateMaze } from '../utils/mazeGenerator';
import { questions } from '../data/grammar';
import { createSeededRandom, hashStringToSeed } from '../utils/random';

const DIFFICULTY_RANK = {
  easy: 0,
  normal: 1,
  hard: 2,
};

const CHEST_REWARD_TYPES = ['score', 'key', 'compass', 'lantern', 'scroll', 'shield'];

function getQuestionPool(gameDifficulty, level, focusCategory) {
  const levelGate = gameDifficulty === 'easy'
    ? (level >= 4 ? 1 : 0)
    : gameDifficulty === 'normal'
      ? (level >= 5 ? 2 : 1)
      : 2;

  const minimumRank = gameDifficulty === 'hard' && level >= 4 ? 1 : 0;

  const gatedQuestions = questions.filter((question) => {
    const rank = DIFFICULTY_RANK[question.difficultyTier] ?? 0;
    return rank >= minimumRank && rank <= levelGate;
  });

  if (!focusCategory) {
    return gatedQuestions;
  }

  const focusedQuestions = gatedQuestions.filter((question) => question.category === focusCategory);
  return focusedQuestions.length > 0 ? focusedQuestions : gatedQuestions;
}

function pickQuestion(pool, usedQuestionIds, categoryUsage, random) {
  const availableQuestions = pool.filter((question) => !usedQuestionIds.has(question.id));
  const fallbackPool = availableQuestions.length > 0 ? availableQuestions : pool;
  const categories = [...new Set(fallbackPool.map((question) => question.category))];

  categories.sort((left, right) => (categoryUsage.get(left) ?? 0) - (categoryUsage.get(right) ?? 0));

  const preferredCategory = categories[0];
  const categoryPool = fallbackPool.filter((question) => question.category === preferredCategory);
  const sourcePool = categoryPool.length > 0 ? categoryPool : fallbackPool;
  const pickedQuestion = sourcePool[Math.floor(random() * sourcePool.length)];

  usedQuestionIds.add(pickedQuestion.id);
  categoryUsage.set(
    pickedQuestion.category,
    (categoryUsage.get(pickedQuestion.category) ?? 0) + 1,
  );

  return pickedQuestion;
}

function pickIndexes(candidates, count, random, usedIndexes, predicate = () => true) {
  const filteredCandidates = candidates.filter((index) => !usedIndexes.has(index) && predicate(index));
  const pickedIndexes = [];

  while (filteredCandidates.length > 0 && pickedIndexes.length < count) {
    const pickedPos = Math.floor(random() * filteredCandidates.length);
    const [pickedIndex] = filteredCandidates.splice(pickedPos, 1);
    usedIndexes.add(pickedIndex);
    pickedIndexes.push(pickedIndex);
  }

  return pickedIndexes;
}

function markDoorTypes(doors, random, difficulty, level, options = {}) {
  if (doors.length === 0) return doors;

  const {
    eventId = 'mist',
    chapterStep = 1,
    runLength = 3,
  } = options;

  const eliteCount = difficulty === 'hard'
    ? Math.min(2, Math.max(1, Math.floor(level / 3)))
    : level >= 4
      ? 1
      : 0;

  const timedCount = Math.min(
    eventId === 'closing' ? 2 : 1,
    Math.max(0, doors.length - 1),
  );
  const trapCount = difficulty === 'easy' ? 0 : Math.min(1 + (eventId === 'false-shortcuts' ? 1 : 0), Math.max(0, doors.length - 2));
  const bonusCount = Math.min(level >= 2 ? 1 : 0, Math.max(0, doors.length - 2));

  const eligibleIndexes = doors.map((_, index) => index);
  const usedIndexes = new Set();
  const typedDoors = doors.map((door) => ({
    ...door,
    tier: 'normal',
    timeLimit: null,
  }));

  pickIndexes(
    eligibleIndexes,
    bonusCount,
    random,
    usedIndexes,
    (index) => index > 0 && index < doors.length - 1,
  ).forEach((index) => {
    typedDoors[index] = { ...typedDoors[index], tier: 'bonus' };
  });

  pickIndexes(
    eligibleIndexes,
    trapCount,
    random,
    usedIndexes,
    (index) => index >= Math.floor(doors.length / 3) && index < doors.length - 1,
  ).forEach((index) => {
    typedDoors[index] = { ...typedDoors[index], tier: 'trap' };
  });

  pickIndexes(
    eligibleIndexes,
    timedCount,
    random,
    usedIndexes,
    (index) => index > 0 && index < doors.length - 1,
  ).forEach((index) => {
    typedDoors[index] = {
      ...typedDoors[index],
      tier: 'timed',
      timeLimit: Math.max(6, 11 - Math.min(level, 5) - (difficulty === 'hard' ? 2 : 0)),
    };
  });

  pickIndexes(
    eligibleIndexes,
    eliteCount,
    random,
    usedIndexes,
    (index) => index >= Math.floor(doors.length / 3),
  ).forEach((index) => {
    typedDoors[index] = { ...typedDoors[index], tier: 'elite' };
  });

  if (chapterStep >= runLength && typedDoors.length > 0) {
    const bossIndex = typedDoors.length - 1;
    typedDoors[bossIndex] = {
      ...typedDoors[bossIndex],
      tier: 'boss',
      timeLimit: Math.max(7, 13 - Math.min(level, 6)),
    };
  }

  return typedDoors;
}

function buildBonusChests(maze, path, random, difficulty, level, options = {}) {
  const { chestBonus = 0, eventId = 'mist' } = options;
  const pathSet = new Set(path.map((cell) => `${cell.x},${cell.y}`));
  const deadEnds = [];

  maze.forEach((row, y) => {
    row.forEach((cell, x) => {
      if ((x === 0 && y === 0) || cell.isCenter) return;

      const wallCount = Object.values(cell.walls).filter(Boolean).length;
      if (wallCount !== 3) return;
      if (pathSet.has(`${x},${y}`)) return;

      deadEnds.push(cell);
    });
  });

  const chestCount = difficulty === 'hard'
    ? Math.min(2, Math.max(1, Math.floor(level / 4) + 1), deadEnds.length)
    : Math.min(level >= 4 ? 2 : 1, deadEnds.length);
  const adjustedChestCount = Math.min(
    deadEnds.length,
    chestCount + chestBonus + (eventId === 'false-shortcuts' ? 1 : 0),
  );

  const rewards = [];
  const candidates = [...deadEnds];

  for (let index = 0; index < adjustedChestCount; index += 1) {
    if (candidates.length === 0) break;

    const pickedPos = Math.floor(random() * candidates.length);
    const [cell] = candidates.splice(pickedPos, 1);
    const rewardIndex = Math.min(
      CHEST_REWARD_TYPES.length - 1,
      Math.floor(random() * CHEST_REWARD_TYPES.length),
    );
    const rewardType = CHEST_REWARD_TYPES[rewardIndex];
    const rewardValue = rewardType === 'score' ? 90 + level * 16 : 1;

    rewards.push({
      id: `chest-${cell.x}-${cell.y}`,
      x: cell.x,
      y: cell.y,
      status: 'closed',
      rewardType,
      rewardValue,
      rarity: rewardType === 'score'
        ? 'common'
        : rewardType === 'key' || rewardType === 'compass'
          ? 'rare'
          : 'epic',
    });
  }

  return rewards;
}

function normalizeSeed(seed) {
  return typeof seed === 'number' ? seed : hashStringToSeed(String(seed));
}

export function useGame(
  width = 15,
  height = 15,
  seed = 0,
  doorCount = 1,
  gameDifficulty = 'easy',
  level = 1,
  options = {},
) {
  const [maze, setMaze] = useState([]);
  const [won, setWon] = useState(false);
  const [solutionPath, setSolutionPath] = useState([]);
  const [doors, setDoors] = useState([]);
  const [bonusChests, setBonusChests] = useState([]);
  const focusCategory = options.focusCategory ?? null;
  const eventId = options.eventId ?? 'mist';
  const chapterStep = options.chapterStep ?? 1;
  const runLength = options.runLength ?? 3;
  const chestBonus = options.chestBonus ?? 0;

  useEffect(() => {
    const numericSeed = normalizeSeed(seed);
    const random = createSeededRandom(numericSeed);
    const newMaze = generateMaze(width, height, random);
    newMaze[0][0].visited = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMaze(newMaze);
    setWon(false);

    const queue = [[newMaze[0][0]]];
    const visited = new Set(['0,0']);

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

      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (visited.has(key)) continue;
        visited.add(key);
        queue.push([...currentPath, neighbor]);
      }
    }

    setSolutionPath(path);

    const newDoors = [];
    if (path.length > 2) {
      const pathWithoutEnds = path.slice(1, -1);
      const numberOfDoors = Math.min(doorCount, pathWithoutEnds.length);
      const candidateIndices = pathWithoutEnds.map((_, index) => index);
      const pool = getQuestionPool(gameDifficulty, level, focusCategory);
      const usedQuestionIds = new Set();
      const categoryUsage = new Map();

      while (candidateIndices.length > 0 && newDoors.length < numberOfDoors) {
        const ratio = (newDoors.length + 1) / (numberOfDoors + 1);
        const targetIndex = Math.floor(ratio * pathWithoutEnds.length);

        let closestCandidatePos = 0;
        let closestDistance = Infinity;
        candidateIndices.forEach((candidateIndex, candidatePos) => {
          const distance = Math.abs(candidateIndex - targetIndex);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestCandidatePos = candidatePos;
          }
        });

        const cellIndex = candidateIndices.splice(closestCandidatePos, 1)[0];
        const cell = pathWithoutEnds[cellIndex];
        const prev = cellIndex === 0 ? path[0] : pathWithoutEnds[cellIndex - 1];
        const orientation = prev.x !== cell.x ? 'vertical' : 'horizontal';
        const question = pickQuestion(pool.length > 0 ? pool : questions, usedQuestionIds, categoryUsage, random);

        newDoors.push({
          id: `door-${cell.x}-${cell.y}`,
          x: (prev.x + cell.x) / 2,
          y: (prev.y + cell.y) / 2,
          orientation,
          question,
          status: 'closed',
          tier: 'normal',
        });
      }
    }

    setDoors(markDoorTypes(newDoors, random, gameDifficulty, level, { eventId, chapterStep, runLength }));
    setBonusChests(buildBonusChests(newMaze, path, random, gameDifficulty, level, { chestBonus, eventId }));
  }, [width, height, seed, doorCount, gameDifficulty, level, focusCategory, eventId, chapterStep, runLength, chestBonus]);

  return {
    maze,
    won,
    setWon,
    solutionPath,
    doors,
    setDoors,
    bonusChests,
    setBonusChests,
  };
}
