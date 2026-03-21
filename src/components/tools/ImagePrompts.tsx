import React, { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, Wand2, Layers, Zap } from 'lucide-react';
import { generateContent } from '../../services/ai';
import { motion } from 'motion/react';

const ImagePrompts: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [batch, setBatch] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleEnhance = async () => {
    setLoading(true);
    try {
      const result = await generateContent(
        `Enhance this image generation prompt for high-quality AI art (Midjourney/DALL-E style). 
        Original: "${prompt}"
        Add technical details, lighting, style keywords, and composition. Keep it descriptive but concise.`,
        "You are a master AI prompt engineer."
      );
      setEnhancedPrompt(result || '');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatch = async () => {
    setLoading(true);
    try {
      const result = await generateContent(
        `Generate 5 variations of an image prompt based on this concept: "${prompt}". 
        Each variation should explore a different artistic style (e.g. Cyberpunk, Watercolor, Cinematic, 3D Render, Pencil Sketch).
        Separate each prompt with a newline and a number.`,
        "You are a master AI prompt engineer."
      );
      const variations = (result || '').split('\n').filter(line => line.trim() && /^\d/.test(line));
      setBatch(variations);
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
        <h2 className="text-4xl font-serif italic font-bold">Image Prompts</h2>
        <p className="text-[#1A1A1A]/50 dark:text-slate-400">Style guide builder, prompt enhancer, and batch generator.</p>
      </header>

      <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl border border-[#1A1A1A]/5 dark:border-white/5 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500">Base Concept</label>
          <textarea 
            rows={3}
            placeholder="A cat wearing a space suit on Mars..."
            className="w-full p-4 rounded-2xl border border-[#1A1A1A]/10 dark:border-white/10 bg-transparent outline-none focus:ring-2 focus:ring-[#F27D26] resize-none"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleEnhance}
            disabled={loading || !prompt}
            className="flex-1 min-w-[200px] py-4 bg-[#F27D26] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
            Enhance Prompt
          </button>
          <button 
            onClick={handleBatch}
            disabled={loading || !prompt}
            className="flex-1 min-w-[200px] py-4 bg-[#1A1A1A] dark:bg-slate-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-slate-600 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Layers size={20} />}
            Generate Batch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Result */}
        {enhancedPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl border border-[#1A1A1A]/5 dark:border-white/5 shadow-sm space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#F27D26]">Enhanced Prompt</h3>
              <button 
                onClick={() => copyToClipboard(enhancedPrompt, -1)}
                className="p-2 hover:bg-[#1A1A1A]/5 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                {copiedIndex === -1 ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
              </button>
            </div>
            <p className="text-lg leading-relaxed italic text-[#1A1A1A]/80 dark:text-slate-300">
              {enhancedPrompt}
            </p>
          </motion.div>
        )}

        {/* Batch Results */}
        {batch.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl border border-[#1A1A1A]/5 dark:border-white/5 shadow-sm space-y-6"
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/40 dark:text-slate-500">Style Variations</h3>
            <div className="space-y-4">
              {batch.map((item, i) => (
                <div key={i} className="group relative p-4 bg-[#FDFCFB] dark:bg-[#0F172A] rounded-2xl border border-[#1A1A1A]/5 dark:border-white/5 hover:border-[#F27D26]/30 transition-all">
                  <p className="text-xs text-[#1A1A1A]/70 dark:text-slate-400 pr-10">{item}</p>
                  <button 
                    onClick={() => copyToClipboard(item, i)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white dark:bg-[#1E293B] shadow-sm rounded-lg"
                  >
                    {copiedIndex === i ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ImagePrompts;
