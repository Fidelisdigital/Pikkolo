import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, RefreshCw, Download, Trash2, FileText, FileDown, Eye, EyeOff, Save, Check } from 'lucide-react';
import { generateJSON } from '../../services/ai';
import { Type } from '@google/genai';
import { generateWordSearch, WordSearchGrid } from '../../utils/wordsearch';
import { motion } from 'motion/react';
import { useDraft } from '../../hooks/useDraft';
import { useAuth } from '../../hooks/useAuth';
import { useDrafts } from '../../hooks/useDrafts';
import { exportToPDF, exportToDOCX } from '../../services/exportService';

import FullPreviewModal from '../FullPreviewModal';

import { ConfirmationModal, Toast } from '../ui/Feedback';

const WordSearch: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [puzzles, setPuzzles, clearPuzzles] = useDraft<WordSearchGrid[]>('word_search_results', []);
  const [showSolutions, setShowSolutions] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [settings, setSettings, clearSettings] = useDraft('word_search_settings', {
    topic: '',
    size: 12,
    count: 5,
    paperSize: '8.5 x 11',
    customInstructions: '',
  });

  const { saveDraft, isSaving, lastSaved } = useDrafts('word-search', settings.topic || 'Untitled Word Search', puzzles, settings);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleClear = () => {
    setIsClearModalOpen(true);
  };

  const confirmClear = () => {
    clearPuzzles();
    clearSettings();
    setShowSolutions(false);
    setIsClearModalOpen(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    
    const prompt = `Generate ${settings.count} lists of 12 words each related to the topic "${settings.topic}". 
    Each list should be for a separate word search puzzle.
    The words should be between 3 and 10 characters long.
    Paper Size: ${settings.paperSize}.
    ${settings.customInstructions ? `Additional Instructions: ${settings.customInstructions}` : ''}
    
    Return a JSON object with a "puzzles" array, where each item is an object with a "topic" and a "words" array.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        puzzles: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              words: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['topic', 'words']
          }
        }
      },
      required: ['puzzles']
    };

    try {
      if (!settings.topic) {
        setToast({ message: 'Please enter a topic first', type: 'error' });
        return;
      }
      const result = await generateJSON<{ puzzles: { topic: string, words: string[] }[] }>(prompt, schema, "You are a word puzzle expert.");
      const newPuzzles = result.puzzles.map(p => generateWordSearch(p.words, settings.size));
      setPuzzles(newPuzzles);
      setToast({ message: 'Puzzles generated successfully!', type: 'success' });
    } catch (error: any) {
      console.error(error);
      setToast({ message: `Generation failed: ${error.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    const title = `${settings.topic || 'WordSearch'}_Puzzle_Book`;
    const content = puzzles.map((p, i) => ({
      title: `Puzzle ${i + 1}: ${settings.topic}`,
      description: `Find the hidden words in the grid.`,
      grid: p.grid,
      words: p.words,
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
        <h2 className="text-4xl font-serif italic font-bold text-foreground">Word Search</h2>
        <p className="text-muted-foreground">AI generates the word list, we build the grid.</p>
      </header>

      <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Topic</label>
            <input 
              type="text" 
              placeholder="Ocean Creatures, Space, Cooking..."
              className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
              value={settings.topic}
              onChange={e => setSettings({...settings, topic: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Grid Size</label>
            <select 
              className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
              value={settings.size}
              onChange={e => setSettings({...settings, size: parseInt(e.target.value)})}
            >
              <option className="bg-card" value={10}>10x10</option>
              <option className="bg-card" value={12}>12x12</option>
              <option className="bg-card" value={15}>15x15</option>
            </select>
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
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Precise Generation Prompt</label>
          <textarea 
            placeholder="Add specific details, categories, or styles for more precise generation..."
            rows={2}
            className="w-full p-3 rounded-xl border border-input bg-transparent outline-none focus:ring-2 focus:ring-primary resize-none text-sm text-foreground"
            value={settings.customInstructions}
            onChange={e => setSettings({...settings, customInstructions: e.target.value})}
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleGenerate}
            disabled={loading || !settings.topic}
            className="flex-1 md:w-auto px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            Generate Book
          </button>
          {user && puzzles.length > 0 && (
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
        {lastSaved && (
          <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest font-bold">
            Last saved at {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>

      {puzzles.length > 0 && (
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
                {showSolutions ? <EyeOff size={16} /> : <Eye size={16} />}
                {showSolutions ? 'Hide Solutions' : 'Show Solutions'}
              </button>
            </div>
          </div>

          <div className="space-y-12">
            <div className="bg-muted p-4 rounded-xl text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-center">
              Puzzles Section
            </div>
            {puzzles.map((puzzle, pi) => (
              <motion.div 
                key={pi}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pi * 0.1 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                <div className="lg:col-span-2 bg-card p-8 rounded-[40px] border border-border shadow-xl flex items-center justify-center">
                  <div 
                    className="grid gap-1" 
                    style={{ gridTemplateColumns: `repeat(${settings.size}, minmax(0, 1fr))` }}
                  >
                    {puzzle.grid.map((row, r) => (
                      row.map((char, c) => (
                        <div 
                          key={`${r}-${c}`} 
                          className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center bg-background border border-border rounded-lg font-mono font-bold text-lg text-foreground"
                        >
                          {char}
                        </div>
                      ))
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4">Puzzle {pi + 1}: Word List</h3>
                    <div className="flex flex-wrap gap-2">
                      {puzzle.words.map((word, i) => (
                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
                          {word.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {showSolutions && (
              <>
                <div className="bg-muted p-4 rounded-xl text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-center mt-12">
                  Solutions Section
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {puzzles.map((puzzle, pi) => (
                    <motion.div 
                      key={`sol-${pi}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-card p-6 rounded-2xl border border-emerald-500/20 shadow-sm space-y-4"
                    >
                      <h4 className="text-sm font-bold text-emerald-600">Puzzle {pi + 1} Solution</h4>
                      <div className="flex flex-wrap gap-1">
                        {puzzle.words.map((word, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded border border-emerald-500/20">
                            {word.toUpperCase()}
                          </span>
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
        title={settings.topic || 'Word Search'}
        items={puzzles.map((p, i) => ({
          title: `Puzzle ${i + 1}: ${settings.topic}`,
          description: `Find the hidden words in the grid.`,
          grid: p.grid,
          words: p.words,
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

export default WordSearch;
