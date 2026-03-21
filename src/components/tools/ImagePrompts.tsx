import React, { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, Wand2, Layers, Zap } from 'lucide-react';
import { generateContent } from '../../services/ai';
import { motion } from 'motion/react';

const ImagePrompts: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [batch, setBatch] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleEnhance = async () => {
    setLoading(true);
    try {
      const result = await generateContent(
        `Enhance this image generation prompt for high-quality AI art (Midjourney/DALL-E style). 
        Original: "${prompt}"
        ${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}
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
        ${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}
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
        <h2 className="text-4xl font-serif italic font-bold text-foreground">Image Prompts</h2>
        <p className="text-muted-foreground">Style guide builder, prompt enhancer, and batch generator.</p>
      </header>

      <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Base Concept</label>
          <textarea 
            rows={3}
            placeholder="A cat wearing a space suit on Mars..."
            className="w-full p-4 rounded-2xl border border-input bg-transparent outline-none focus:ring-2 focus:ring-primary resize-none text-foreground"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Precise Generation Prompt</label>
          <textarea 
            placeholder="Add specific details, styles, or modifiers for more precise generation..."
            rows={2}
            className="w-full p-3 rounded-xl border border-input bg-transparent outline-none focus:ring-2 focus:ring-primary resize-none text-sm text-foreground"
            value={customInstructions}
            onChange={e => setCustomInstructions(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleEnhance}
            disabled={loading || !prompt}
            className="flex-1 min-w-[200px] py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
            Enhance Prompt
          </button>
          <button 
            onClick={handleBatch}
            disabled={loading || !prompt}
            className="flex-1 min-w-[200px] py-4 bg-foreground text-background rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
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
            className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Enhanced Prompt</h3>
              <button 
                onClick={() => copyToClipboard(enhancedPrompt, -1)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {copiedIndex === -1 ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-muted-foreground" />}
              </button>
            </div>
            <p className="text-lg leading-relaxed italic text-foreground/80">
              {enhancedPrompt}
            </p>
          </motion.div>
        )}

        {/* Batch Results */}
        {batch.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6"
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Style Variations</h3>
            <div className="space-y-4">
              {batch.map((item, i) => (
                <div key={i} className="group relative p-4 bg-background rounded-2xl border border-border hover:border-primary/30 transition-all">
                  <p className="text-xs text-muted-foreground pr-10">{item}</p>
                  <button 
                    onClick={() => copyToClipboard(item, i)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-card shadow-sm rounded-lg"
                  >
                    {copiedIndex === i ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-muted-foreground" />}
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
