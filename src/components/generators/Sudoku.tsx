import React, { useState, useEffect } from 'react';
import { Grid3X3, Eye, EyeOff, RefreshCw, Download, Trash2, FileText, FileDown, Save, Check, Loader2 } from 'lucide-react';
import { generateSudoku, SudokuDifficulty } from '../../utils/sudoku';
import { motion } from 'motion/react';
import { useDraft } from '../../hooks/useDraft';
import { useAuth } from '../../hooks/useAuth';
import { useDrafts } from '../../hooks/useDrafts';
import { exportToPDF, exportToDOCX } from '../../services/exportService';

import FullPreviewModal from '../FullPreviewModal';

import { ConfirmationModal, Toast } from '../ui/Feedback';

const Sudoku: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [games, setGames, clearGames] = useDraft<{ puzzle: (number | null)[][], solution: (number | null)[][] }[]>('sudoku_results', []);
  const [showSolutions, setShowSolutions] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [settings, setSettings, clearSettings] = useDraft('sudoku_settings', {
    difficulty: 'easy' as SudokuDifficulty,
    count: 5,
    paperSize: '8.5 x 11',
    customInstructions: '',
  });

  const { saveDraft, isSaving, lastSaved } = useDrafts('sudoku', `Sudoku ${settings.difficulty}`, games, settings);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleClear = () => {
    setIsClearModalOpen(true);
  };

  const confirmClear = () => {
    clearGames();
    clearSettings();
    setShowSolutions(false);
    setIsClearModalOpen(false);
  };

  const handleGenerate = () => {
    setLoading(true);
    try {
      // Simulate generation delay since it's local
      setTimeout(() => {
        try {
          const newGames = Array.from({ length: settings.count }, () => generateSudoku(settings.difficulty));
          setGames(newGames);
          setToast({ message: 'Sudoku puzzles generated successfully!', type: 'success' });
        } catch (err: any) {
          setToast({ message: `Generation failed: ${err.message}`, type: 'error' });
        } finally {
          setLoading(false);
        }
      }, 1000);
    } catch (error: any) {
      setLoading(false);
      setToast({ message: `Generation failed: ${error.message}`, type: 'error' });
    }
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    const title = `Sudoku_Puzzle_Book_${settings.difficulty}`;
    const content = games.map((g, i) => ({
      title: `Puzzle ${i + 1}`,
      description: `Difficulty: ${settings.difficulty}`,
      grid: g.puzzle,
      prompt: settings.customInstructions
    }));

    try {
      if (format === 'pdf') {
        await exportToPDF(title, content, 'puzzle');
      } else {
        await exportToDOCX(title, content, 'puzzle');
      }
      setToast({ message: `Exported to ${format.toUpperCase()} successfully`, type: 'success' });
    } catch (err: any) {
      setToast({ message: `Export failed: ${err.message}`, type: 'error' });
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-serif italic font-bold text-foreground">Sudoku Generator</h2>
        <p className="text-muted-foreground">Instant valid puzzles with difficulty levels.</p>
      </header>

      <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Difficulty</label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as SudokuDifficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setSettings({...settings, difficulty: d})}
                  className={`flex-1 py-2 rounded-xl border font-bold text-sm transition-all ${
                    settings.difficulty === d 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'bg-card border-border text-muted-foreground hover:border-primary'
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Paper Size</label>
            <select 
              className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
              value={settings.paperSize}
              onChange={e => setSettings({...settings, paperSize: e.target.value})}
            >
              <option className="bg-card">6 x 9</option>
              <option className="bg-card">8.5 x 11</option>
              <option className="bg-card">8.25 x 8.25</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Number of Puzzles</label>
            <input 
              type="number" 
              className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
              value={settings.count}
              onChange={e => setSettings({...settings, count: parseInt(e.target.value)})}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 md:w-auto px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin" /> : <Grid3X3 size={20} />}
              Generate Book
            </button>
            {user && games.length > 0 && (
              <button 
                onClick={saveDraft}
                disabled={isSaving}
                className="p-3.5 bg-card border border-border rounded-xl text-foreground hover:bg-muted transition-all flex items-center gap-2"
                title="Save Draft"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : lastSaved ? <Check className="text-emerald-500" size={20} /> : <Save size={20} />}
                <span className="hidden sm:inline text-sm font-bold">Save</span>
              </button>
            )}
            <button 
              onClick={handleClear}
              className="p-3.5 bg-card border border-border rounded-xl text-muted-foreground hover:text-destructive transition-colors"
              title="Clear Draft"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
        {lastSaved && (
          <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest font-bold">
            Last saved at {lastSaved.toLocaleTimeString()}
          </p>
        )}

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Precise Generation Prompt</label>
          <textarea 
            placeholder="Add specific details or constraints for more precise generation..."
            rows={2}
            className="w-full p-3 rounded-xl border border-input bg-transparent outline-none focus:ring-2 focus:ring-primary resize-none text-sm text-foreground"
            value={settings.customInstructions}
            onChange={e => setSettings({...settings, customInstructions: e.target.value})}
          />
        </div>
      </div>

      {games.length > 0 && (
        <div className="space-y-12">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-serif italic font-bold text-foreground">Book Preview</h3>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsPreviewOpen(true)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Eye size={18} />
                Preview & Export
              </button>
              <button 
                onClick={() => setShowSolutions(!showSolutions)}
                className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-bold hover:bg-muted/80 transition-colors flex items-center gap-2"
              >
                {showSolutions ? <EyeOff size={20} /> : <Eye size={20} />}
                {showSolutions ? 'Hide Solutions' : 'Show Solutions'}
              </button>
            </div>
          </div>

          <div className="space-y-12">
            <div className="bg-muted p-4 rounded-xl text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-center">
              Puzzles Section
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {games.map((game, gi) => (
                <motion.div 
                  key={gi}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: gi * 0.05 }}
                  className="bg-card p-4 rounded-3xl border border-border shadow-xl"
                >
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 text-center">Puzzle {gi + 1}</h4>
                  <div className="grid grid-cols-9 border-2 border-foreground/20 mx-auto w-fit">
                    {game.puzzle.map((row, r) => (
                      row.map((cell, c) => (
                        <div
                          key={`${r}-${c}`}
                          className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-sm font-bold border border-border
                            ${(r + 1) % 3 === 0 && r < 8 ? 'border-b-2 border-b-foreground/20' : ''}
                            ${(c + 1) % 3 === 0 && c < 8 ? 'border-r-2 border-r-foreground/20' : ''}
                            ${cell !== null ? 'bg-muted text-foreground' : 'text-transparent'}
                          `}
                        >
                          {cell}
                        </div>
                      ))
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {showSolutions && (
              <>
                <div className="bg-muted p-4 rounded-xl text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-center mt-12">
                  Solutions Section
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {games.map((game, gi) => (
                    <motion.div 
                      key={`sol-${gi}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card p-4 rounded-2xl border border-emerald-500/20 shadow-sm"
                    >
                      <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 text-center">Solution {gi + 1}</h4>
                      <div className="grid grid-cols-9 border border-emerald-200 dark:border-emerald-900/50 mx-auto w-fit">
                        {game.solution.map((row, r) => (
                          row.map((cell, c) => (
                            <div
                              key={`${r}-${c}`}
                              className={`w-4 h-4 flex items-center justify-center text-[8px] font-bold border border-emerald-100 dark:border-emerald-900/20
                                ${(r + 1) % 3 === 0 && r < 8 ? 'border-b-2 border-b-emerald-200 dark:border-b-emerald-900/50' : ''}
                                ${(c + 1) % 3 === 0 && c < 8 ? 'border-r-2 border-r-emerald-200 dark:border-r-emerald-900/50' : ''}
                                ${game.puzzle[r][c] !== null ? 'text-emerald-900/40 dark:text-emerald-100/40' : 'text-emerald-600'}
                              `}
                            >
                              {cell}
                            </div>
                          ))
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <FullPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Sudoku ${settings.difficulty}`}
        items={games.map((g, i) => ({
          title: `Puzzle ${i + 1}`,
          description: `Difficulty: ${settings.difficulty}`,
          grid: g.puzzle,
        }))}
        onExport={handleExport}
      />
      <ConfirmationModal
        isOpen={isClearModalOpen}
        title="Clear Draft"
        message="Are you sure you want to clear your current work? This action cannot be undone."
        onConfirm={confirmClear}
        onCancel={() => setIsClearModalOpen(false)}
        variant="danger"
        confirmText="Clear Everything"
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Sudoku;
