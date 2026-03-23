import React, { useState, useRef, useEffect } from 'react';
import { Download, Type as TypeIcon, Palette, Layout, RefreshCw, Trash2, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useDraft } from '../../hooks/useDraft';
import { generateImage } from '../../services/ai';

import { ConfirmationModal } from '../ui/Feedback';

const colorSchemes = [
  { name: 'Classic', primary: '#1A1A1A', secondary: '#FDFCFB', accent: '#F27D26' },
  { name: 'Midnight', primary: '#0F172A', secondary: '#F8FAFC', accent: '#38BDF8' },
  { name: 'Forest', primary: '#064E3B', secondary: '#F0FDF4', accent: '#10B981' },
  { name: 'Royal', primary: '#312E81', secondary: '#EEF2FF', accent: '#818CF8' },
  { name: 'Sunset', primary: '#7C2D12', secondary: '#FFF7ED', accent: '#FB923C' },
  { name: 'Berry', primary: '#701A75', secondary: '#FDF4FF', accent: '#D946EF' },
];

const BookCover: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [title, setTitle, clearTitle] = useDraft('book_cover_title', 'The Great Adventure');
  const [author, setAuthor, clearAuthor] = useDraft('book_cover_author', 'Jane Doe');
  const [scheme, setScheme, clearScheme] = useDraft('book_cover_scheme', colorSchemes[0]);
  const [layout, setLayout, clearLayout] = useDraft<'centered' | 'bottom' | 'top'>('book_cover_layout', 'centered');
  const [bgPrompt, setBgPrompt, clearBgPrompt] = useDraft('book_cover_bg_prompt', '');
  const [customInstructions, setCustomInstructions, clearCustomInstructions] = useDraft('book_cover_custom_instructions', '');
  const [bgImage, setBgImage, clearBgImage] = useDraft<string | null>('book_cover_bg_image', null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleClear = () => {
    setIsResetModalOpen(true);
  };

  const confirmReset = () => {
    clearTitle();
    clearAuthor();
    clearScheme();
    clearLayout();
    clearBgPrompt();
    clearCustomInstructions();
    clearBgImage();
    setIsResetModalOpen(false);
  };

  useEffect(() => {
    drawCover();
  }, [title, author, scheme, layout, bgImage]);

  const handleGenerateBackground = async () => {
    if (!bgPrompt) return;
    setIsGenerating(true);
    try {
      const prompt = `Professional book cover background illustration, ${bgPrompt}, high resolution, artistic style, no text, ${customInstructions}`;
      const imageUrl = await generateImage(prompt, false);
      setBgImage(imageUrl);
    } catch (error) {
      console.error("Failed to generate background:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const drawCover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    if (bgImage) {
      const img = new Image();
      img.src = bgImage;
      img.onload = () => {
        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Add overlay for readability if needed
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawText(ctx, canvas);
      };
    } else {
      ctx.fillStyle = scheme.primary;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Decorative elements
      ctx.strokeStyle = scheme.accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      
      drawText(ctx, canvas);
    }
  };

  const drawText = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Text settings
    ctx.textAlign = 'center';
    ctx.fillStyle = bgImage ? '#FFFFFF' : scheme.secondary;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = bgImage ? 10 : 0;

    // Title
    ctx.font = 'bold 48px serif';
    const titleY = layout === 'centered' ? canvas.height / 2 - 20 : layout === 'top' ? 120 : canvas.height - 200;
    
    // Wrap title text
    const words = title.split(' ');
    let line = '';
    let y = titleY;
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > canvas.width - 100 && n > 0) {
        ctx.fillText(line, canvas.width / 2, y);
        line = words[n] + ' ';
        y += 60;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width / 2, y);

    // Author
    ctx.font = 'italic 24px serif';
    ctx.fillStyle = bgImage ? '#F27D26' : scheme.accent;
    ctx.shadowBlur = 0;
    const authorY = layout === 'centered' ? y + 80 : layout === 'top' ? y + 60 : canvas.height - 100;
    ctx.fillText(`by ${author}`, canvas.width / 2, authorY);
  };

  const downloadCover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `book-cover-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-serif italic font-bold text-foreground">Book Cover Tool</h2>
        <p className="text-muted-foreground">Live canvas preview with AI background generation.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Controls */}
        <div className="space-y-8 bg-card p-8 rounded-3xl border border-border shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                <TypeIcon size={14} /> Book Title
              </label>
              <input 
                type="text" 
                className="w-full p-3 rounded-xl border border-input bg-transparent outline-none focus:ring-2 focus:ring-primary text-foreground"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                <Layout size={14} /> Author Name
              </label>
              <input 
                type="text" 
                className="w-full p-3 rounded-xl border border-input bg-transparent outline-none focus:ring-2 focus:ring-primary text-foreground"
                value={author}
                onChange={e => setAuthor(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
              <Sparkles size={14} /> AI Background Prompt
            </label>
            <div className="flex gap-2">
              <textarea 
                rows={2}
                placeholder="Describe the background (e.g. 'a misty forest at dawn', 'cyberpunk city streets')..."
                className="flex-1 p-3 rounded-xl border border-input bg-transparent outline-none focus:ring-2 focus:ring-primary text-sm text-foreground resize-none"
                value={bgPrompt}
                onChange={e => setBgPrompt(e.target.value)}
              />
              <button 
                onClick={handleGenerateBackground}
                disabled={isGenerating || !bgPrompt}
                className="px-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50"
                title="Generate Background"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Precise Generation Prompt</label>
              <textarea 
                placeholder="Add specific artistic styles, moods, or additional details for the background..."
                rows={2}
                className="w-full p-3 rounded-xl border border-input bg-transparent outline-none focus:ring-2 focus:ring-primary resize-none text-sm text-foreground"
                value={customInstructions}
                onChange={e => setCustomInstructions(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
              <Palette size={14} /> Color Scheme (Fallback)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {colorSchemes.map(s => (
                <button
                  key={s.name}
                  onClick={() => setScheme(s)}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    scheme.name === s.name ? 'border-primary bg-primary/5' : 'border-transparent bg-background'
                  }`}
                >
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.primary }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.accent }} />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
              <Layout size={14} /> Layout Style
            </label>
            <div className="flex gap-2">
              {(['top', 'centered', 'bottom'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLayout(l)}
                  className={`flex-1 py-2 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${
                    layout === l ? 'bg-foreground text-background border-foreground' : 'bg-card border-border text-muted-foreground'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button 
              onClick={downloadCover}
              className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              <Download size={20} />
              Download as PNG
            </button>
            <button 
              onClick={handleClear}
              className="p-4 bg-card border border-border rounded-2xl text-muted-foreground hover:text-destructive transition-colors"
              title="Reset Cover"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-transparent blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={600} 
              className="relative bg-background rounded-lg shadow-2xl border border-border w-full max-w-[400px] aspect-[2/3]"
            />
            {isGenerating && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center text-white gap-4">
                <Loader2 className="animate-spin" size={48} />
                <span className="font-serif italic text-xl">Generating Masterpiece...</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isResetModalOpen}
        title="Reset Cover"
        message="Are you sure you want to reset the cover? This will clear all fields and the background image."
        onConfirm={confirmReset}
        onCancel={() => setIsResetModalOpen(false)}
        variant="danger"
        confirmText="Reset Now"
      />
    </div>
  );
};

export default BookCover;
