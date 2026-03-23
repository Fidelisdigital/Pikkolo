import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Download, Copy, Check, Trash2, FileText, FileDown, Image as ImageIcon, RefreshCw, Eye, Save } from 'lucide-react';
import { generateJSON, generateImage } from '../../services/ai';
import { Type } from '@google/genai';
import { motion } from 'motion/react';
import { useDraft } from '../../hooks/useDraft';
import { useAuth } from '../../hooks/useAuth';
import { useDrafts } from '../../hooks/useDrafts';
import { supabase } from '../../services/supabase';
import { exportToPDF, exportToDOCX } from '../../services/exportService';
import FullPreviewModal from '../FullPreviewModal';

import { ConfirmationModal, Toast } from '../ui/Feedback';

interface ColoringPage {
  title: string;
  description: string;
  prompt: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
}

const ColoringBooks: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pages, setPages, clearPages] = useDraft<ColoringPage[]>('coloring_books_result', []);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  const [settings, setSettings, clearSettings] = useDraft('coloring_books_settings', {
    theme: '',
    complexity: 'Medium',
    count: 5,
    paperSize: '8.5 x 11',
    customInstructions: '',
  });

  const { saveDraft, isSaving, lastSaved } = useDrafts('coloring-books', settings.theme || 'Untitled Coloring Book', pages, settings);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const saveProgress = async () => {
    if (!user || pages.length === 0) return;
    setIsSavingProgress(true);
    try {
      const { error } = await supabase.from('coloring_progress').insert({
        user_id: user.id,
        page_data: pages,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setToast({ message: 'Progress saved successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Error saving progress: ' + err.message, type: 'error' });
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handleClear = () => {
    setIsClearModalOpen(true);
  };

  const confirmClear = () => {
    clearPages();
    clearSettings();
    setIsClearModalOpen(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    const prompt = `Generate ${settings.count} coloring book page ideas for the theme "${settings.theme}". 
    Complexity level: ${settings.complexity}. 
    Paper Size: ${settings.paperSize}.
    ${settings.customInstructions ? `Additional Instructions: ${settings.customInstructions}` : ''}
    Each page should have a title, a brief description for the user, and a highly detailed AI image generation prompt.
    The image generation prompt MUST strictly request clean black and white line art, no shading, no colors, high contrast, bold outlines, suitable for coloring.
    
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
      if (!settings.theme) {
        setToast({ message: 'Please enter a theme first', type: 'error' });
        return;
      }
      const result = await generateJSON<ColoringPage[]>(prompt, schema, "You are a professional coloring book designer and AI prompt engineer.");
      setPages(result);
      setToast({ message: 'Coloring book pages generated successfully!', type: 'success' });
    } catch (error: any) {
      console.error(error);
      setToast({ message: `Generation failed: ${error.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    const title = `${settings.theme || 'Coloring_Book'}_Coloring_Book`;
    const content = pages.map(p => ({
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl,
    }));
    try {
      if (format === 'pdf') {
        await exportToPDF(title, content, 'coloring');
      } else {
        await exportToDOCX(title, content, 'coloring');
      }
      setToast({ message: `Exported to ${format.toUpperCase()} successfully`, type: 'success' });
    } catch (err: any) {
      setToast({ message: `Export failed: ${err.message}`, type: 'error' });
    }
  };

  const generatePageImage = async (index: number) => {
    const page = pages[index];
    if (!page || page.isGeneratingImage) return;

    const newPages = [...pages];
    newPages[index] = { ...page, isGeneratingImage: true };
    setPages(newPages);

    try {
      const imageUrl = await generateImage(page.prompt, true);
      const updatedPages = [...pages];
      updatedPages[index] = { ...page, imageUrl, isGeneratingImage: false };
      setPages(updatedPages);
      setToast({ message: 'Image generated successfully!', type: 'success' });
    } catch (error: any) {
      console.error("Failed to generate image:", error);
      const resetPages = [...pages];
      resetPages[index] = { ...page, isGeneratingImage: false };
      setPages(resetPages);
      setToast({ message: `Image generation failed: ${error.message || 'Unknown error'}`, type: 'error' });
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-serif italic font-bold text-foreground">Coloring Books</h2>
        <p className="text-muted-foreground">Generate themed page prompts with specific complexity levels.</p>
      </header>

      <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Theme</label>
            <input 
              type="text" 
              placeholder="Enchanted Forest, Space Adventure..."
              className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
              value={settings.theme}
              onChange={e => setSettings({...settings, theme: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Complexity</label>
            <select 
              className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
              value={settings.complexity}
              onChange={e => setSettings({...settings, complexity: e.target.value})}
            >
              <option className="bg-card">Toddler (Very Simple)</option>
              <option className="bg-card">Kids (Simple)</option>
              <option className="bg-card">Medium</option>
              <option className="bg-card">Detailed</option>
              <option className="bg-card">Adult (Intricate)</option>
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
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Pages</label>
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
            placeholder="Add specific details, styles, or elements for more precise generation..."
            rows={2}
            className="w-full p-3 rounded-xl border border-input bg-transparent outline-none focus:ring-2 focus:ring-primary resize-none text-sm text-foreground"
            value={settings.customInstructions}
            onChange={e => setSettings({...settings, customInstructions: e.target.value})}
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleGenerate}
            disabled={loading || !settings.theme}
            className="flex-1 md:w-auto px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            Generate Book
          </button>
          {user && pages.length > 0 && (
            <>
              <button 
                onClick={saveDraft}
                disabled={isSaving}
                className="p-3.5 bg-card border border-border rounded-xl text-foreground hover:bg-muted transition-all flex items-center gap-2"
                title="Save Draft"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : lastSaved ? <Check className="text-emerald-500" size={20} /> : <Save size={20} />}
                <span className="hidden sm:inline text-sm font-bold">Save</span>
              </button>
              <button 
                onClick={saveProgress}
                disabled={isSavingProgress}
                className="p-3.5 bg-primary/10 text-primary border border-primary/20 rounded-xl font-bold hover:bg-primary/20 transition-all flex items-center gap-2"
                title="Save Coloring Progress"
              >
                {isSavingProgress ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                <span className="hidden sm:inline text-sm font-bold">Save Progress</span>
              </button>
            </>
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

      {pages.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-serif italic font-bold text-foreground">Book Preview</h3>
            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Eye size={18} />
              Preview & Export
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pages.map((page, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-foreground">{page.title}</h3>
                  <span className="px-2 py-1 bg-muted rounded text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Page {i + 1}</span>
                </div>
                
                {page.imageUrl ? (
                  <div className="aspect-[3/4] w-full bg-muted rounded-2xl overflow-hidden border border-border relative group/img">
                    <img 
                      src={page.imageUrl} 
                      alt={page.title} 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => generatePageImage(i)}
                        className="p-3 bg-primary text-primary-foreground rounded-full hover:scale-110 transition-transform shadow-lg"
                        title="Regenerate Image"
                      >
                        <RefreshCw size={20} className={page.isGeneratingImage ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => generatePageImage(i)}
                    disabled={page.isGeneratingImage}
                    className="aspect-[3/4] w-full bg-muted/50 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 hover:bg-muted transition-colors group"
                  >
                    {page.isGeneratingImage ? (
                      <Loader2 className="animate-spin text-primary" size={32} />
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ImageIcon size={24} />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">Generate Preview</span>
                      </>
                    )}
                  </button>
                )}

                <p className="text-sm text-muted-foreground">{page.description}</p>
                <div className="relative group">
                  <button 
                    onClick={() => copyToClipboard(page.prompt, i)}
                    className="absolute top-2 right-2 p-2 bg-card shadow-md rounded-lg hover:bg-primary hover:text-primary-foreground transition-all z-10"
                  >
                    {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <textarea 
                    className="w-full p-4 bg-background rounded-2xl border border-border text-xs font-mono text-foreground leading-relaxed resize-none outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                    value={page.prompt}
                    onChange={(e) => {
                      const newPages = [...pages];
                      newPages[i] = { ...page, prompt: e.target.value };
                      setPages(newPages);
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <FullPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={settings.theme || 'Coloring Book'}
        items={pages.map(p => ({
          title: p.title,
          description: p.description,
          imageUrl: p.imageUrl,
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

export default ColoringBooks;
