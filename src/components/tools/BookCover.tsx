import React, { useState, useRef, useEffect } from 'react';
import { Download, Type as TypeIcon, Palette, Layout, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

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
  const [title, setTitle] = useState('The Great Adventure');
  const [author, setAuthor] = useState('Jane Doe');
  const [scheme, setScheme] = useState(colorSchemes[0]);
  const [layout, setLayout] = useState<'centered' | 'bottom' | 'top'>('centered');

  useEffect(() => {
    drawCover();
  }, [title, author, scheme, layout]);

  const drawCover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = scheme.primary;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative elements
    ctx.strokeStyle = scheme.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Text settings
    ctx.textAlign = 'center';
    ctx.fillStyle = scheme.secondary;

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
    ctx.fillStyle = scheme.accent;
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
        <h2 className="text-4xl font-serif italic font-bold">Book Cover Tool</h2>
        <p className="text-[#1A1A1A]/50 dark:text-slate-400">Live canvas preview with professional color schemes.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Controls */}
        <div className="space-y-8 bg-white dark:bg-[#1E293B] p-8 rounded-3xl border border-[#1A1A1A]/5 dark:border-white/5 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500 flex items-center gap-2">
                <TypeIcon size={14} /> Book Title
              </label>
              <input 
                type="text" 
                className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 dark:border-white/10 bg-transparent outline-none focus:ring-2 focus:ring-[#F27D26]"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500 flex items-center gap-2">
                <Layout size={14} /> Author Name
              </label>
              <input 
                type="text" 
                className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 dark:border-white/10 bg-transparent outline-none focus:ring-2 focus:ring-[#F27D26]"
                value={author}
                onChange={e => setAuthor(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500 flex items-center gap-2">
              <Palette size={14} /> Color Scheme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {colorSchemes.map(s => (
                <button
                  key={s.name}
                  onClick={() => setScheme(s)}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    scheme.name === s.name ? 'border-[#F27D26] bg-[#F27D26]/5' : 'border-transparent bg-[#FDFCFB] dark:bg-[#0F172A]'
                  }`}
                >
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.primary }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.accent }} />
                  </div>
                  <span className="text-[10px] font-bold uppercase">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500 flex items-center gap-2">
              <Layout size={14} /> Layout Style
            </label>
            <div className="flex gap-2">
              {(['top', 'centered', 'bottom'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLayout(l)}
                  className={`flex-1 py-2 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${
                    layout === l ? 'bg-[#1A1A1A] dark:bg-slate-700 text-white border-[#1A1A1A] dark:border-slate-600' : 'bg-white dark:bg-[#1E293B] border-[#1A1A1A]/10 dark:border-white/10 text-[#1A1A1A]/60 dark:text-slate-400'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={downloadCover}
            className="w-full py-4 bg-[#F27D26] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <Download size={20} />
            Download as PNG
          </button>
        </div>

        {/* Preview */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#F27D26]/20 to-transparent blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={600} 
              className="relative bg-white rounded-lg shadow-2xl border border-[#1A1A1A]/10 w-full max-w-[400px] aspect-[2/3]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCover;
