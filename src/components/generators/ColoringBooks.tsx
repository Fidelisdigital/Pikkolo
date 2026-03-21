import React, { useState } from 'react';
import { Sparkles, Loader2, Download, Copy, Check } from 'lucide-react';
import { generateJSON } from '../../services/ai';
import { Type } from '@google/genai';
import { motion } from 'motion/react';

interface ColoringPage {
  title: string;
  description: string;
  prompt: string;
}

const ColoringBooks: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<ColoringPage[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [settings, setSettings] = useState({
    theme: '',
    complexity: 'Medium',
    count: 5,
  });

  const handleGenerate = async () => {
    setLoading(true);
    const prompt = `Generate ${settings.count} coloring book page ideas for the theme "${settings.theme}". 
    Complexity level: ${settings.complexity}. 
    Each page should have a title, a brief description for the user, and a highly detailed AI image generation prompt optimized for black and white line art.
    
    Return a JSON array of objects with title, description, and prompt.`;

    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          prompt: { type: Type.STRING },
        },
        required: ['title', 'description', 'prompt']
      }
    };

    try {
      const result = await generateJSON<ColoringPage[]>(prompt, schema, "You are a professional coloring book designer and AI prompt engineer.");
      setPages(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-serif italic font-bold">Coloring Books</h2>
        <p className="text-[#1A1A1A]/50">Generate themed page prompts with specific complexity levels.</p>
      </header>

      <div className="bg-white p-8 rounded-3xl border border-[#1A1A1A]/5 shadow-sm flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 space-y-2 w-full">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Theme</label>
          <input 
            type="text" 
            placeholder="Enchanted Forest, Space Adventure..."
            className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 outline-none"
            value={settings.theme}
            onChange={e => setSettings({...settings, theme: e.target.value})}
          />
        </div>
        <div className="w-full md:w-48 space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Complexity</label>
          <select 
            className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 outline-none"
            value={settings.complexity}
            onChange={e => setSettings({...settings, complexity: e.target.value})}
          >
            <option>Toddler (Very Simple)</option>
            <option>Kids (Simple)</option>
            <option>Medium</option>
            <option>Detailed</option>
            <option>Adult (Intricate)</option>
          </select>
        </div>
        <div className="w-full md:w-32 space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Count</label>
          <input 
            type="number" 
            className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 outline-none"
            value={settings.count}
            onChange={e => setSettings({...settings, count: parseInt(e.target.value)})}
          />
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading || !settings.theme}
          className="w-full md:w-auto px-8 py-3.5 bg-[#F27D26] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
          Generate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pages.map((page, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-[#1A1A1A]/5 shadow-sm space-y-4"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg">{page.title}</h3>
              <span className="px-2 py-1 bg-[#1A1A1A]/5 rounded text-[10px] font-bold uppercase tracking-wider">Page {i + 1}</span>
            </div>
            <p className="text-sm text-[#1A1A1A]/60">{page.description}</p>
            <div className="relative group">
              <div className="p-4 bg-[#FDFCFB] rounded-2xl border border-[#1A1A1A]/5 text-xs font-mono text-[#1A1A1A]/70 leading-relaxed break-words">
                {page.prompt}
              </div>
              <button 
                onClick={() => copyToClipboard(page.prompt, i)}
                className="absolute top-2 right-2 p-2 bg-white shadow-md rounded-lg hover:bg-[#F27D26] hover:text-white transition-all"
              >
                {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ColoringBooks;
