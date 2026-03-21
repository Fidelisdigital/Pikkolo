import React, { useState } from 'react';
import { Grid3X3, Eye, EyeOff, RefreshCw, Download } from 'lucide-react';
import { generateSudoku, SudokuDifficulty } from '../../utils/sudoku';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

const Sudoku: React.FC = () => {
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy');
  const [game, setGame] = useState<{ puzzle: (number | null)[][], solution: (number | null)[][] } | null>(null);
  const [userBoard, setUserBoard] = useState<(number | null)[][]>([]);
  const [showSolution, setShowSolution] = useState(false);

  const handleNewGame = () => {
    const newGame = generateSudoku(difficulty);
    setGame(newGame);
    setUserBoard(newGame.puzzle.map(row => [...row]));
    setShowSolution(false);
  };

  const handleInputChange = (r: number, c: number, val: string) => {
    if (game?.puzzle[r][c] !== null) return;
    const num = parseInt(val);
    const newBoard = userBoard.map(row => [...row]);
    if (isNaN(num) || num < 1 || num > 9) {
      newBoard[r][c] = null;
    } else {
      newBoard[r][c] = num;
    }
    setUserBoard(newBoard);

    // Check if solved
    if (checkSolved(newBoard)) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const checkSolved = (board: (number | null)[][]) => {
    if (!game) return false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== game.solution[r][c]) return false;
      }
    }
    return true;
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-serif italic font-bold">Sudoku Generator</h2>
        <p className="text-[#1A1A1A]/50 dark:text-slate-400">Instant valid puzzles with difficulty levels.</p>
      </header>

      <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl border border-[#1A1A1A]/5 dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 space-y-2 w-full">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500">Difficulty</label>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as SudokuDifficulty[]).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-xl border font-bold text-sm transition-all ${
                  difficulty === d 
                    ? 'bg-[#F27D26] border-[#F27D26] text-white' 
                    : 'bg-white dark:bg-[#1E293B] border-[#1A1A1A]/10 dark:border-white/10 text-[#1A1A1A]/60 dark:text-slate-400 hover:border-[#F27D26]'
                }`}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={handleNewGame}
          className="w-full md:w-auto px-8 py-3.5 bg-[#1A1A1A] dark:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-slate-600 transition-all"
        >
          <RefreshCw size={20} />
          New Puzzle
        </button>
      </div>

      {game && (
        <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
          <div className="bg-white dark:bg-[#1E293B] p-4 lg:p-8 rounded-[40px] border border-[#1A1A1A]/10 dark:border-white/10 shadow-2xl">
            <div className="grid grid-cols-9 border-2 border-[#1A1A1A] dark:border-white/20">
              {userBoard.map((row, r) => (
                row.map((cell, c) => (
                  <input
                    key={`${r}-${c}`}
                    type="text"
                    maxLength={1}
                    value={showSolution ? (game.solution[r][c] || '') : (cell || '')}
                    onChange={(e) => handleInputChange(r, c, e.target.value)}
                    readOnly={game.puzzle[r][c] !== null || showSolution}
                    className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-center text-xl font-bold outline-none border border-[#1A1A1A]/10 dark:border-white/10 bg-transparent
                      ${(r + 1) % 3 === 0 && r < 8 ? 'border-b-2 border-b-[#1A1A1A] dark:border-b-white/20' : ''}
                      ${(c + 1) % 3 === 0 && c < 8 ? 'border-r-2 border-r-[#1A1A1A] dark:border-r-white/20' : ''}
                      ${game.puzzle[r][c] !== null ? 'bg-[#1A1A1A]/5 dark:bg-white/5 text-[#1A1A1A] dark:text-slate-200' : 'text-[#F27D26]'}
                      ${showSolution && game.puzzle[r][c] === null ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}
                    `}
                  />
                ))
              ))}
            </div>
          </div>

          <div className="w-full lg:w-64 space-y-4">
            <button 
              onClick={() => setShowSolution(!showSolution)}
              className="w-full py-4 bg-white dark:bg-[#1E293B] border border-[#1A1A1A]/10 dark:border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#1A1A1A]/5 dark:hover:bg-white/5 transition-all"
            >
              {showSolution ? <EyeOff size={20} /> : <Eye size={20} />}
              {showSolution ? 'Hide Solution' : 'Show Solution'}
            </button>
            <button className="w-full py-4 bg-white dark:bg-[#1E293B] border border-[#1A1A1A]/10 dark:border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#1A1A1A]/5 dark:hover:bg-white/5 transition-all">
              <Download size={20} />
              Export PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sudoku;
