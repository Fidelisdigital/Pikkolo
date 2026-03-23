import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, ChevronRight, ChevronLeft, Download, User, BookOpen, Trash2, FileText, FileDown, Image as ImageIcon, RefreshCw, Eye, Save, Check } from 'lucide-react';
import { generateJSON, generateImage } from '../../services/ai';
import { Type } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { useDraft } from '../../hooks/useDraft';
import { useAuth } from '../../hooks/useAuth';
import { useDrafts } from '../../hooks/useDrafts';
import { exportToPDF, exportToDOCX } from '../../services/exportService';
import FullPreviewModal from '../FullPreviewModal';

import { ConfirmationModal, Toast } from '../ui/Feedback';

interface Page {
  pageNumber: number;
  storyText: string;
  illustrationPrompt: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
}

interface Book {
  title: string;
  pages: Page[];
}

const KidsBooks: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [book, setBook, clearBook] = useDraft<Book | null>('kids_books_result', null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [settings, setSettings, clearSettings] = useDraft('kids_books_settings', {
    topic: '',
    ageGroup: '4-6',
    pageCount: 10,
    moral: '',
    style: 'Watercolor',
    paperSize: '8.5 x 11',
    customInstructions: '',
  });

  const { saveDraft, isSaving, lastSaved } = useDrafts('kids-books', book?.title || settings.topic || 'Untitled Book', book, settings);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleClear = () => {
    setIsClearModalOpen(true);
  };

  const confirmClear = () => {
    clearBook();
    clearSettings();
    setCurrentPage(0);
    setIsClearModalOpen(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    const characterPrompt = localStorage.getItem('bookbloom_character_prompt') || '';
    
    const prompt = `Generate a children's book titled about "${settings.topic}". 
    Target age: ${settings.ageGroup}. 
    Page count: ${settings.pageCount}. 
    Moral of the story: ${settings.moral}. 
    Illustration style: ${settings.style}.
    Paper Size: ${settings.paperSize}.
    ${settings.customInstructions ? `Additional Instructions: ${settings.customInstructions}` : ''}
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
      if (!settings.topic) {
        setToast({ message: 'Please enter a topic first', type: 'error' });
        return;
      }
      const result = await generateJSON<Book>(prompt, schema, "You are a professional children's book author and illustrator prompt engineer.");
      setBook(result);
      setCurrentPage(0);
      setToast({ message: 'Story generated successfully!', type: 'success' });
    } catch (error: any) {
      console.error(error);
      setToast({ message: `Generation failed: ${error.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!book) return;
    const title = book.title || 'Kids_Book';
    const content = book.pages.map(p => ({
      title: `Page ${p.pageNumber}`,
      description: p.illustrationPrompt,
      content: p.storyText,
      imageUrl: p.imageUrl,
    }));

    try {
      if (format === 'pdf') {
        await exportToPDF(title, content, 'book');
      } else {
        await exportToDOCX(title, content, 'book');
      }
      setToast({ message: `Exported to ${format.toUpperCase()} successfully`, type: 'success' });
    } catch (err: any) {
      setToast({ message: `Export failed: ${err.message}`, type: 'error' });
    }
  };

  const generatePageImage = async (index: number) => {
    if (!book) return;
    const page = book.pages[index];
    if (!page || page.isGeneratingImage) return;

    const newPages = [...book.pages];
    newPages[index] = { ...page, isGeneratingImage: true };
    setBook({ ...book, pages: newPages });

    try {
      const imageUrl = await generateImage(page.illustrationPrompt, false);
      const updatedPages = [...book.pages];
      updatedPages[index] = { ...page, imageUrl, isGeneratingImage: false };
      setBook({ ...book, pages: updatedPages });
      setToast({ message: 'Illustration generated successfully!', type: 'success' });
    } catch (error: any) {
      console.error("Failed to generate image:", error);
      const resetPages = [...book.pages];
      resetPages[index] = { ...page, isGeneratingImage: false };
      setBook({ ...book, pages: resetPages });
      setToast({ message: `Illustration generation failed: ${error.message || 'Unknown error'}`, type: 'error' });
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-serif italic font-bold text-foreground">Kids Books Generator</h2>
        <p className="text-muted-foreground">Create full stories with detailed illustration prompts.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings */}
        <div className="lg:col-span-1 space-y-6 bg-card p-8 rounded-3xl border border-border shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Story Topic</label>
            <input 
              type="text" 
              placeholder="A brave little squirrel..."
              className="w-full p-3 rounded-xl border border-input bg-transparent focus:ring-2 focus:ring-primary outline-none text-foreground"
              value={settings.topic}
              onChange={e => setSettings({...settings, topic: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Age Group</label>
              <select 
                className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
                value={settings.ageGroup}
                onChange={e => setSettings({...settings, ageGroup: e.target.value})}
              >
                <option className="bg-card">0-3</option>
                <option className="bg-card">4-6</option>
                <option className="bg-card">7-9</option>
                <option className="bg-card">10-12</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Pages</label>
              <input 
                type="number" 
                className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
                value={settings.pageCount}
                onChange={e => setSettings({...settings, pageCount: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                <option className="bg-card">8.25 x 6</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Illustration Style</label>
              <select 
                className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
                value={settings.style}
                onChange={e => setSettings({...settings, style: e.target.value})}
              >
                <option className="bg-card">Watercolor</option>
                <option className="bg-card">Digital Art</option>
                <option className="bg-card">Oil Painting</option>
                <option className="bg-card">Pencil Sketch</option>
                <option className="bg-card">3D Render</option>
                <option className="bg-card">Paper Cutout</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Moral (Optional)</label>
            <input 
              type="text" 
              placeholder="Sharing is caring..."
              className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
              value={settings.moral}
              onChange={e => setSettings({...settings, moral: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Precise Generation Prompt</label>
            <textarea 
              placeholder="Add specific details, character names, or plot points for more precise generation..."
              rows={3}
              className="w-full p-3 rounded-xl border border-input bg-transparent outline-none focus:ring-2 focus:ring-primary resize-none text-sm text-foreground"
              value={settings.customInstructions}
              onChange={e => setSettings({...settings, customInstructions: e.target.value})}
            />
          </div>

          {localStorage.getItem('bookbloom_character_prompt') && (
            <div className="p-3 bg-primary/10 rounded-xl flex items-center gap-2 text-primary text-xs">
              <User size={14} />
              <span>Character profile active</span>
            </div>
          )}

          <div className="flex gap-3">
            <button 
              onClick={handleGenerate}
              disabled={loading || !settings.topic}
              className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              Generate Story
            </button>
            {user && book && (
              <button 
                onClick={saveDraft}
                disabled={isSaving}
                className="p-4 bg-card border border-border rounded-2xl text-foreground hover:bg-muted transition-all flex items-center gap-2"
                title="Save Draft"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : lastSaved ? <Check className="text-emerald-500" size={20} /> : <Save size={20} />}
                <span className="hidden sm:inline text-sm font-bold">Save</span>
              </button>
            )}
            <button 
              onClick={handleClear}
              className="p-4 bg-card border border-border rounded-2xl text-muted-foreground hover:text-destructive transition-colors"
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
                <div className="bg-card p-10 rounded-[40px] border border-border shadow-xl min-h-[500px] flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Page {book.pages[currentPage].pageNumber} of {book.pages.length}</span>
                    <h3 className="font-serif italic text-xl text-foreground">{book.title}</h3>
                  </div>

                  <div className="flex-1 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-6">
                        <textarea 
                          className="w-full p-4 bg-transparent border-none text-2xl font-serif leading-relaxed text-center focus:ring-2 focus:ring-primary rounded-2xl resize-none outline-none text-foreground"
                          rows={6}
                          value={book.pages[currentPage].storyText}
                          onChange={(e) => {
                            const newPages = [...book.pages];
                            newPages[currentPage] = { ...book.pages[currentPage], storyText: e.target.value };
                            setBook({ ...book, pages: newPages });
                          }}
                        />
                        
                        <div className="p-6 bg-background rounded-3xl border border-dashed border-border space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground block">Illustration Prompt</label>
                          <textarea 
                            className="w-full bg-transparent text-sm italic text-muted-foreground resize-none outline-none focus:ring-1 focus:ring-primary rounded-lg p-2"
                            rows={3}
                            value={book.pages[currentPage].illustrationPrompt}
                            onChange={(e) => {
                              const newPages = [...book.pages];
                              newPages[currentPage] = { ...book.pages[currentPage], illustrationPrompt: e.target.value };
                              setBook({ ...book, pages: newPages });
                            }}
                          />
                        </div>
                      </div>

                      <div className="aspect-square w-full bg-muted rounded-[32px] overflow-hidden border border-border relative group/img">
                        {book.pages[currentPage].imageUrl ? (
                          <>
                            <img 
                              src={book.pages[currentPage].imageUrl} 
                              alt={`Illustration for page ${currentPage + 1}`} 
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                onClick={() => generatePageImage(currentPage)}
                                className="p-4 bg-primary text-primary-foreground rounded-full hover:scale-110 transition-transform shadow-lg"
                                title="Regenerate Illustration"
                              >
                                <RefreshCw size={24} className={book.pages[currentPage].isGeneratingImage ? 'animate-spin' : ''} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <button 
                            onClick={() => generatePageImage(currentPage)}
                            disabled={book.pages[currentPage].isGeneratingImage}
                            className="w-full h-full flex flex-col items-center justify-center gap-4 hover:bg-muted/80 transition-colors group/btn"
                          >
                            {book.pages[currentPage].isGeneratingImage ? (
                              <Loader2 className="animate-spin text-primary" size={48} />
                            ) : (
                              <>
                                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                  <ImageIcon size={32} />
                                </div>
                                <span className="text-sm font-bold text-muted-foreground">Generate Illustration</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-10">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="p-4 rounded-full hover:bg-muted transition-colors disabled:opacity-20 text-foreground"
                    >
                      <ChevronLeft />
                    </button>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(book.pages.length - 1, prev + 1))}
                      disabled={currentPage === book.pages.length - 1}
                      className="p-4 rounded-full hover:bg-muted transition-colors disabled:opacity-20 text-foreground"
                    >
                      <ChevronRight />
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/30 transition-all group"
                  >
                    <Eye size={24} className="group-hover:scale-110 transition-transform" />
                    Preview & Export Book
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-muted-foreground/20 border-4 border-dashed border-border rounded-[40px]">
                <BookOpen size={64} strokeWidth={1} />
                <p className="mt-4 font-serif italic text-xl">Your story will appear here</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <FullPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={book?.title || 'Kids Book'}
        items={book?.pages.map(p => ({
          title: `Page ${p.pageNumber}`,
          description: p.illustrationPrompt,
          content: p.storyText,
          imageUrl: p.imageUrl,
        })) || []}
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

export default KidsBooks;
