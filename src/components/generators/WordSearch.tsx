import React, { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, Download } from 'lucide-react';
import { generateJSON } from '../../services/ai';
import { Type } from '@google/genai';
import { generateWordSearch, WordSearchGrid } from '../../utils/wordsearch';
import { motion } from 'motion/react';

const WordSearch: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [grid, setGrid] = useState<WordSearchGrid | null>(null);
  const [topic, setTopic] = useState('');
  const [size, setSize] = useState(12);

  const handleGenerate = async () => {
    setLoading(true);
    const prompt = `Generate a list of 15 words related to the topic "${topic}". 
    The words should be between 3 and 10 characters long.
    Return a JSON object with a "words" array.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        words: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ['words']
    };

    try {
      const result = await generateJSON<{ words: string[] }>(prompt, schema, "You are a word puzzle expert.");
      const newGrid = generateWordSearch(result.words, size);
      setGrid(newGrid);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-serif italic font-bold">Word Search</h2>
        <p className="text-[#1A1A1A]/50 dark:text-slate-400">AI generates the word list, we build the grid.</p>
      </header>

      <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl border border-[#1A1A1A]/5 dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 space-y-2 w-full">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500">Topic</label>
          <input 
            type="text" 
            placeholder="Ocean Creatures, Space, Cooking..."
            className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 dark:border-white/10 bg-transparent outline-none"
            value={topic}
            onChange={e => setTopic(e.target.value)}
          />
        </div>
        <div className="w-full md:w-32 space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500">Grid Size</label>
          <select 
            className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 dark:border-white/10 bg-transparent outline-none"
            value={size}
            onChange={e => setSize(parseInt(e.target.value))}
          >
            <option className="bg-white dark:bg-[#1E293B]" value={10}>10x10</option>
            <option className="bg-white dark:bg-[#1E293B]" value={12}>12x12</option>
            <option className="bg-white dark:bg-[#1E293B]" value={15}>15x15</option>
          </select>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading || !topic}
          className="w-full md:w-auto px-8 py-3.5 bg-[#F27D26] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
          Generate Puzzle
        </button>
      </div>

      {grid && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-[#1A1A1A]/5 dark:border-white/5 shadow-xl flex items-center justify-center">
            <div 
              className="grid gap-1" 
              style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
            >
              {grid.grid.map((row, r) => (
                row.map((char, c) => (
                  <div 
                    key={`${r}-${c}`} 
                    className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center bg-[#FDFCFB] dark:bg-[#0F172A] border border-[#1A1A1A]/5 dark:border-white/5 rounded-lg font-mono font-bold text-lg"
                  >
                    {char}
                  </div>
                ))
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl border border-[#1A1A1A]/5 dark:border-white/5 shadow-sm">
              <h3 className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500 mb-4">Word List</h3>
              <div className="flex flex-wrap gap-2">
                {grid.words.map((word, i) => (
                  <span key={i} className="px-3 py-1 bg-[#F27D26]/5 text-[#F27D26] rounded-full text-sm font-bold">
                    {word.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all">
              <Download size={20} />
              Export as Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSearch;
