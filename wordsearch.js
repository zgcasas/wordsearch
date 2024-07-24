import fs from 'fs';
import {CanvasGradient, createCanvas} from 'canvas';

const DIRECTIONS = [
  [0, 1], [1, 0], [1, 1], [-1, -1], [0, -1], [-1, 0], [1, -1], [-1, 1]
];

function createGrid(size) {
  return Array(size).fill(null).map(() => Array(size).fill(''));
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function canPlaceWord(grid, word, row, col, dir) {
  const [dx, dy] = DIRECTIONS[dir];
  for (let i = 0; i < word.length; i++) {
    const newRow = row + i * dx;
    const newCol = col + i * dy;
    if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid[0].length || (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i])) {
      return false;
    }
  }
  return true;
}

function placeWord(grid, word, row, col, dir) {
  const [dx, dy] = DIRECTIONS[dir];
  for (let i = 0; i < word.length; i++) {
    const newRow = row + i * dx;
    const newCol = col + i * dy;
    grid[newRow][newCol] = word[i];
  }
}

function fillGrid(grid) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = letters[getRandomInt(letters.length)];
      }
    }
  }
}

function createWordSearch(words, size) {
  const grid = createGrid(size);
  for (const word of words) {
    let placed = false;
    while (!placed) {
      const dir = getRandomInt(DIRECTIONS.length);
      const row = getRandomInt(size);
      const col = getRandomInt(size);
      if (canPlaceWord(grid, word, row, col, dir)) {
        placeWord(grid, word, row, col, dir);
        placed = true;
      }
    }
  }
  fillGrid(grid);
  return grid;
}

function createImage(grid, words, filename, solutions = []) {
  const size = grid.length;
  const cellSize = 30;
  const padding = 20;
  const width = size * cellSize + padding * 2;
  const height = (size + 2) * cellSize + padding * 2 + words.length * 20;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.font = `${cellSize / 1.5}px Courier`;

  // Draw the grid and letters
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const x = padding + j * cellSize;
      const y = padding + i * cellSize;
      ctx.strokeRect(x, y, cellSize, cellSize);
      ctx.fillStyle = 'black';
      ctx.fillText(grid[i][j], x + cellSize / 4.7, y + cellSize / 1.4);
    }
  }

  // Draw the words list
  const listSize = 10;
  let newColumnPadding = padding;
  for (let i = 0; i < words.length; i += listSize) {
    console.log(i, padding);
    if (i >= listSize) {
      newColumnPadding = padding + 200;
    }
    const chunk = words.slice(i, i + listSize);
    chunk.forEach((word, index) => {
      const x = newColumnPadding;
      const y = padding + (size + 1) * cellSize + index * 20;
      ctx.fillText(word, x, y);
    });
  }


  // Draw the solution
  if (solutions.length > 0) {
    ctx.strokeStyle = 'grey';
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 2;
    solutions.forEach(solution => {
      const [word, startRow, startCol, dir] = solution;
      const [dx, dy] = DIRECTIONS[dir];
      for (let i = 0; i < word.length; i++) {
        const x = padding + (startCol + i * dy) * cellSize + cellSize / 2;
        const y = padding + (startRow + i * dx) * cellSize + cellSize / 2;
        ctx.beginPath();
        ctx.arc(x, y, cellSize / 2, 0, 2 * Math.PI);
        ctx.fill()
        // ctx.stroke();
      }
    });
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
}

function createWordSearchWithSolution(words, size, counter = 0) {
  const grid = createWordSearch(words, size);
  const solutions = words.map(word => {
    for (let dir = 0; dir < DIRECTIONS.length; dir++) {
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (canPlaceWord(grid, word, row, col, dir)) {
            return [word, row, col, dir];
          }
        }
      }
    }
  });
  createImage(grid, words, `output/wordsearch-${counter}.png`);
  createImage(grid, words, `output/solution-${counter}.png`, solutions);
}

const words = JSON.parse(fs.readFileSync('words.json', 'utf8'));
const size = 20;


const chunkSize = 20;
let page = 1;
for (let i = 0; i < words.length; i += chunkSize) {
  const chunk = words.slice(i, i + chunkSize);
  createWordSearchWithSolution(chunk, size, page);
  page++;
  program.stop()
}

