export interface WordSearchGrid {
  grid: string[][];
  words: string[];
  placedPositions: { [key: string]: { r: number; c: number }[] };
}

export function generateWordSearch(words: string[], size: number = 12): WordSearchGrid {
  const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
  const placedPositions: { [key: string]: { r: number; c: number }[] } = {};

  const directions = [
    [0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]
  ];

  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    let placed = false;
    let attempts = 0;
    const cleanWord = word.toUpperCase().replace(/[^A-Z]/g, '');

    while (!placed && attempts < 100) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const startR = Math.floor(Math.random() * size);
      const startC = Math.floor(Math.random() * size);

      if (canPlace(cleanWord, startR, startC, dir)) {
        const positions = place(cleanWord, startR, startC, dir);
        placedPositions[word] = positions;
        placed = true;
      }
      attempts++;
    }
  }

  // Fill empty spaces
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }

  function canPlace(word: string, r: number, c: number, [dr, dc]: number[]) {
    if (r + dr * (word.length - 1) < 0 || r + dr * (word.length - 1) >= size) return false;
    if (c + dc * (word.length - 1) < 0 || c + dc * (word.length - 1) >= size) return false;

    for (let i = 0; i < word.length; i++) {
      const currR = r + dr * i;
      const currC = c + dc * i;
      if (grid[currR][currC] !== '' && grid[currR][currC] !== word[i]) return false;
    }
    return true;
  }

  function place(word: string, r: number, c: number, [dr, dc]: number[]) {
    const positions = [];
    for (let i = 0; i < word.length; i++) {
      const currR = r + dr * i;
      const currC = c + dc * i;
      grid[currR][currC] = word[i];
      positions.push({ r: currR, c: currC });
    }
    return positions;
  }

  return { grid, words, placedPositions };
}
