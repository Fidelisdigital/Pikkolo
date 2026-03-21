import React, { useState } from 'react';
import { X, Download, FileText, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PreviewItem {
  title: string;
  description: string;
  content?: string;
  imageUrl?: string;
  grid?: (string | number | null)[][];
  words?: string[];
}

interface FullPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: PreviewItem[];
  onExport: (format: 'pdf' | 'docx') => void;
}

const FullPreviewModal: React.FC<FullPreviewModalProps> = ({ isOpen, onClose, title, items, onExport }) => {
  const [currentPage, setCurrentPage] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentPage < items.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const currentItem = items[currentPage];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card w-full max-w-5xl h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-border"
        >
          <div className="p-6 border-b border-border flex justify-between items-center bg-card sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-serif italic font-bold text-foreground">{title}</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Full Book Preview • Page {currentPage + 1} of {items.length}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2 mr-4 pr-4 border-r border-border">
                <button 
                  onClick={() => onExport('pdf')}
                  className="px-4 py-2 bg-foreground text-background rounded-xl text-sm font-bold hover:opacity-90 transition-colors flex items-center gap-2"
                >
                  <FileDown size={16} />
                  PDF
                </button>
                <button 
                  onClick={() => onExport('docx')}
                  className="px-4 py-2 bg-muted text-foreground rounded-xl text-sm font-bold hover:bg-muted/80 transition-colors flex items-center gap-2"
                >
                  <FileText size={16} />
                  DOCX
                </button>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors text-foreground"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative bg-muted/30 flex items-center justify-center p-8">
            {/* Navigation Buttons */}
            <button 
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="absolute left-4 z-20 p-4 bg-card border border-border rounded-full shadow-lg text-foreground hover:bg-muted disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              onClick={handleNext}
              disabled={currentPage === items.length - 1}
              className="absolute right-4 z-20 p-4 bg-card border border-border rounded-full shadow-lg text-foreground hover:bg-muted disabled:opacity-30 transition-all"
            >
              <ChevronRight size={24} />
            </button>

            {/* Page Container (Fixed Aspect Ratio to mimic paper) */}
            <div className="bg-card w-full max-w-[500px] aspect-[8.5/11] shadow-2xl rounded-sm border border-border flex flex-col p-12 relative overflow-hidden">
              <div className="flex-1 flex flex-col space-y-8">
                <div className="flex justify-between items-center border-b border-border/10 pb-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50">Page {currentPage + 1}</span>
                  <h4 className="font-bold text-sm text-foreground uppercase tracking-widest">{currentItem.title}</h4>
                </div>

                {currentItem.imageUrl && (
                  <div className="aspect-square w-full bg-muted rounded-xl overflow-hidden border border-border/5">
                    <img 
                      src={currentItem.imageUrl} 
                      alt={currentItem.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {currentItem.grid && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                    <div 
                      className="grid gap-0.5 border-2 border-foreground/20 bg-foreground/5 p-1 rounded-sm" 
                      style={{ gridTemplateColumns: `repeat(${currentItem.grid[0].length}, minmax(0, 1fr))` }}
                    >
                      {currentItem.grid.map((row, r) => (
                        row.map((char, c) => (
                          <div 
                            key={`${r}-${c}`} 
                            className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-background border border-border/20 font-mono font-bold text-xs sm:text-sm text-foreground"
                          >
                            {char}
                          </div>
                        ))
                      ))}
                    </div>

                    {currentItem.words && (
                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 max-w-sm">
                        {currentItem.words.map((word, i) => (
                          <span key={i} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {word}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  <p className="text-xs italic text-muted-foreground text-center px-4 leading-relaxed">
                    {currentItem.description}
                  </p>
                  {currentItem.content && (
                    <p className="text-lg font-serif leading-relaxed text-center text-foreground">
                      {currentItem.content}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Page Number Footer */}
              <div className="mt-8 text-center border-t border-border/10 pt-4">
                <span className="text-xs font-serif italic text-muted-foreground">-{currentPage + 1}-</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FullPreviewModal;
