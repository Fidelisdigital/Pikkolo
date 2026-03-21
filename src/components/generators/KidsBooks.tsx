import React, { useState } from 'react';
import { Sparkles, Loader2, ChevronRight, ChevronLeft, Download, User, BookOpen } from 'lucide-react';
import { generateJSON } from '../../services/ai';
import { Type } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';

interface Page {
  pageNumber: number;
  storyText: string;
  illustrationPrompt: string;
}

interface Book {
  title: string;
  pages: Page[];
}

const KidsBooks: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const [settings, setSettings] = useState({
    topic: '',
    ageGroup: '4-6',
    pageCount: 10,
    moral: '',
    style: 'Watercolor',
  });

  const handleGenerate = async () => {
    setLoading(true);
    const characterPrompt = localStorage.getItem('bookbloom_character_prompt') || '';
    
    const prompt = `Generate a children's book titled about "${settings.topic}". 
    Target age: ${settings.ageGroup}. 
    Page count: ${settings.pageCount}. 
    Moral of the story: ${settings.moral}. 
    Illustration style: ${settings.style}.
    ${characterPrompt ? `Include this character description in all illustration prompts: ${characterPrompt}` : ''}
    
    Return a JSON object with a title and an array of pages. Each page should have pageNumber, storyText, and illustrationPrompt.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        pages: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              pageNumber: { type: Type.INTEGER },
              storyText: { type: Type.STRING },
              illustrationPrompt: { type: Type.STRING },
            },
            required: ['pageNumber', 'storyText', 'illustrationPrompt']
          }
        }
      },
      required: ['title', 'pages']
    };

    try {
      const result = await generateJSON<Book>(prompt, schema, "You are a professional children's book author and illustrator prompt engineer.");
      setBook(result);
      setCurrentPage(0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-serif italic font-bold">Kids Books Generator</h2>
        <p className="text-[#1A1A1A]/50 dark:text-slate-400">Create full stories with detailed illustration prompts.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings */}
        <div className="lg:col-span-1 space-y-6 bg-white dark:bg-[#1E293B] p-8 rounded-3xl border border-[#1A1A1A]/5 dark:border-white/5 shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500">Story Topic</label>
            <input 
              type="text" 
              placeholder="A brave little squirrel..."
              className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-[#F27D26] outline-none"
              value={settings.topic}
              onChange={e => setSettings({...settings, topic: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Age Group</label>
              <select 
                className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 outline-none"
                value={settings.ageGroup}
                onChange={e => setSettings({...settings, ageGroup: e.target.value})}
              >
                <option>0-3</option>
                <option>4-6</option>
                <option>7-9</option>
                <option>10-12</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Pages</label>
              <input 
                type="number" 
                className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 outline-none"
                value={settings.pageCount}
                onChange={e => setSettings({...settings, pageCount: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Moral (Optional)</label>
            <input 
              type="text" 
              placeholder="Sharing is caring..."
              className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 outline-none"
              value={settings.moral}
              onChange={e => setSettings({...settings, moral: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Illustration Style</label>
            <select 
              className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 outline-none"
              value={settings.style}
              onChange={e => setSettings({...settings, style: e.target.value})}
            >
              <option>Watercolor</option>
              <option>Digital Art</option>
              <option>Oil Painting</option>
              <option>Pencil Sketch</option>
              <option>3D Render</option>
              <option>Paper Cutout</option>
            </select>
          </div>

          {localStorage.getItem('bookbloom_character_prompt') && (
            <div className="p-3 bg-amber-50 rounded-xl flex items-center gap-2 text-amber-700 text-xs">
              <User size={14} />
              <span>Character profile active</span>
            </div>
          )}

          <button 
            onClick={handleGenerate}
            disabled={loading || !settings.topic}
            className="w-full py-4 bg-[#F27D26] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#F27D26]/30 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            Generate Story
          </button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {book ? (
              <motion.div 
                key="book-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#1E293B] p-10 rounded-[40px] border border-[#1A1A1A]/5 dark:border-white/5 shadow-xl min-h-[500px] flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-30 dark:text-slate-500">Page {book.pages[currentPage].pageNumber} of {book.pages.length}</span>
                    <h3 className="font-serif italic text-xl">{book.title}</h3>
                  </div>

                  <div className="flex-1 space-y-8">
                    <p className="text-2xl font-serif leading-relaxed text-center px-10">
                      "{book.pages[currentPage].storyText}"
                    </p>

                    <div className="p-6 bg-[#FDFCFB] dark:bg-[#0F172A] rounded-3xl border border-dashed border-[#1A1A1A]/10 dark:border-white/10">
                      <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500 mb-2 block">Illustration Prompt</label>
                      <p className="text-sm italic text-[#1A1A1A]/70 dark:text-slate-400">
                        {book.pages[currentPage].illustrationPrompt}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between mt-10">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="p-4 rounded-full hover:bg-[#1A1A1A]/5 disabled:opacity-20"
                    >
                      <ChevronLeft />
                    </button>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(book.pages.length - 1, prev + 1))}
                      disabled={currentPage === book.pages.length - 1}
                      className="p-4 rounded-full hover:bg-[#1A1A1A]/5 disabled:opacity-20"
                    >
                      <ChevronRight />
                    </button>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-white border border-[#1A1A1A]/10 rounded-xl text-sm font-bold hover:bg-[#1A1A1A]/5 transition-colors">
                    <Download size={18} />
                    Export as PDF
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-[#1A1A1A]/20 border-4 border-dashed border-[#1A1A1A]/5 rounded-[40px]">
                <BookOpen size={64} strokeWidth={1} />
                <p className="mt-4 font-serif italic text-xl">Your story will appear here</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default KidsBooks;
