import fs from 'fs';
import {createCanvas} from 'canvas';

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
  const MAX_ATTEMPTS = 10000;  // Maximum attempts to place a word
  for (const word of words) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < MAX_ATTEMPTS) {
      const dir = getRandomInt(DIRECTIONS.length);
      const row = getRandomInt(size);
      const col = getRandomInt(size);
      if (canPlaceWord(grid, word, row, col, dir)) {
        placeWord(grid, word, row, col, dir);
        placed = true;
      }
      attempts++;
    }
    if (!placed) {
      console.error(`Unable to place the word: ${word} after ${MAX_ATTEMPTS} attempts. Retrying...`);
      return createWordSearch(words, size);
    }
  }
  fillGrid(grid);
  return grid;
}

function createImage(grid, words, rawWords, filename, solutions = [], category, page) {
  const size = grid.length;
  const startingOfTitle = 120;
  const startingOfRectangles = 200;
  const cellSize = 100;
  const padding = 66.66;
  const width = size * cellSize + padding * 2;
  const height = (size + 2) * cellSize + padding + startingOfTitle * 2 + 20 * 35;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;

  ctx.font = `${cellSize}px Impact`;
  ctx.fillStyle = 'black';
  const title = `${category} #${page}`;
  ctx.fillText(title, (width - ctx.measureText(title).width) / 2 , startingOfTitle);

  ctx.font = `${cellSize / 1.5}px Courier`;
  ctx.fillStyle = 'black';
  // Draw the grid and letters
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const x = padding + j * cellSize;
      const y = padding + i * cellSize + startingOfRectangles;
      ctx.strokeRect(x, y, cellSize, cellSize);
      if (grid[i][j] === 'I') {
        ctx.fillText(grid[i][j], x + cellSize / 2.9, y + cellSize / 1.4);
      } else {
        ctx.fillText(grid[i][j], x + cellSize / 4.7, y + cellSize / 1.4);
      }
    }
  }

  // Draw the words list
  ctx.font = `${cellSize / 1.7}px Courier`;
  const listSize = 10;
  const columns = 3;
  let newColumnPadding = padding;
  for (let i = 0; i < words.length; i += listSize) {
    if (i >= listSize) {
      newColumnPadding += padding + (width / columns) - 100;
    }
    const chunk = rawWords.slice(i, i + listSize);
    chunk.forEach((word, index) => {
      const x = newColumnPadding;
      const y = padding + startingOfRectangles + (size + 1) * cellSize + index * 90;
      ctx.fillText(word, x, y);
    });
  }


  // Draw the solution
  ctx.font = `${cellSize / 1.5}px Courier`;
  if (solutions.length > 0) {
    ctx.strokeStyle = 'grey';
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 2;
    solutions.forEach(solution => {
      const [word, startRow, startCol, dir] = solution;
      const [dx, dy] = DIRECTIONS[dir];
      for (let i = 0; i < word.length; i++) {
        const x = padding + (startCol + i * dy) * cellSize + cellSize / 2;
        const y = padding + startingOfRectangles + (startRow + i * dx) * cellSize + cellSize / 2;
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

function createWordSearchWithSolution(words, category, size, counter = 0) {
  const rawWords = words;
  words = cleanWords(words);
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
  createImage(grid, words, rawWords, `output/wordsearch-${counter}.png`,[], category, counter);
  console.log(`Created output/wordsearch-${counter}.png`)
  createImage(grid, words, rawWords, `output/solution-${counter}.png`, solutions, category, counter);
  console.log(`Created output/solution-${counter}.png`)
}

function cleanWords(words){
  return words.map(word => {
    // Remove non-alphanumeric characters using regex
    let cleanedWord = word.replace(/[^a-zA-Z0-9]/g, '');
    // Convert to uppercase
    return cleanedWord.toUpperCase();
  });
}

const categories = JSON.parse(fs.readFileSync('words.json', 'utf8'));
const size = 20;


// Create crosswords from categories
let page = 1;
for (const [category, words] of Object.entries(categories)) {
  createWordSearchWithSolution(words, category, size, page);
  page++;
}




