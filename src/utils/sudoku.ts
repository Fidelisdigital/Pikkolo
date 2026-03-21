export type SudokuDifficulty = 'easy' | 'medium' | 'hard';

export function generateSudoku(difficulty: SudokuDifficulty = 'easy') {
  const board: (number | null)[][] = Array(9).fill(null).map(() => Array(9).fill(null));
  
  // Fill diagonal 3x3 blocks
  for (let i = 0; i < 9; i += 3) {
    fillBox(board, i, i);
  }

  // Solve the rest
  solveSudoku(board);

  const solution = board.map(row => [...row]);

  // Remove numbers based on difficulty
  const attempts = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : 60;
  let count = attempts;
  while (count > 0) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (board[r][c] !== null) {
      board[r][c] = null;
      count--;
    }
  }

  return { puzzle: board, solution };
}

function fillBox(board: (number | null)[][], row: number, col: number) {
  let num;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      do {
        num = Math.floor(Math.random() * 9) + 1;
      } while (!isSafeInBox(board, row, col, num));
      board[row + i][col + j] = num;
    }
  }
}

function isSafeInBox(board: (number | null)[][], rowStart: number, colStart: number, num: number) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[rowStart + i][colStart + j] === num) return false;
    }
  }
  return true;
}

function solveSudoku(board: (number | null)[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        for (let num = 1; num <= 9; num++) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function isSafe(board: (number | null)[][], row: number, col: number, num: number) {
  for (let x = 0; x < 9; x++) if (board[row][x] === num) return false;
  for (let x = 0; x < 9; x++) if (board[x][col] === num) return false;
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }
  return true;
}
