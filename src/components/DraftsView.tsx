import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { History, FileText, Trash2, ExternalLink, Loader2, AlertCircle, Download } from 'lucide-react';
import { exportToPDF, exportToDOCX } from '../services/exportService';

import { ConfirmationModal, Toast } from './ui/Feedback';

interface Draft {
  id: string;
  title: string;
  type: string;
  content: any;
  updated_at: string;
}

interface DraftsViewProps {
  onOpenDraft: (type: string, content: any) => void;
}

const DraftsView: React.FC<DraftsViewProps> = ({ onOpenDraft }) => {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [user]);

  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const deleteDraft = async (id: string) => {
    setDraftToDelete(id);
  };

  const confirmDelete = async () => {
    if (!draftToDelete) return;
    try {
      const { error } = await supabase.from('drafts').delete().eq('id', draftToDelete);
      if (error) throw error;
      setDrafts(prev => prev.filter(d => d.id !== draftToDelete));
      setToast({ message: 'Draft deleted successfully', type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Error deleting draft: ' + err.message, type: 'error' });
    } finally {
      setDraftToDelete(null);
    }
  };

  const handleExport = async (draft: Draft, format: 'pdf' | 'docx') => {
    const data = draft.content.data;
    if (!data) return;

    let items = [];
    let exportType: 'book' | 'puzzle' | 'trivia' | 'coloring' = 'book';

    switch (draft.type) {
      case 'kids-books':
        items = data.pages || [];
        exportType = 'book';
        break;
      case 'coloring-books':
        items = data;
        exportType = 'coloring';
        break;
      case 'trivia':
        items = data;
        exportType = 'trivia';
        break;
      case 'word-search':
        items = data.map((p: any, i: number) => ({
          title: `Puzzle ${i + 1}: ${draft.title}`,
          description: `Find the hidden words in the grid.`,
          grid: p.grid,
          words: p.words,
        }));
        exportType = 'puzzle';
        break;
      case 'sudoku':
        items = data.map((g: any, i: number) => ({
          title: `Puzzle ${i + 1}`,
          description: `Difficulty: ${draft.content.settings?.difficulty || 'Medium'}`,
          grid: g.puzzle,
        }));
        exportType = 'puzzle';
        break;
      default:
        items = Array.isArray(data) ? data : [];
    }
    
    try {
      if (format === 'pdf') {
        await exportToPDF(draft.title, items, exportType);
      } else {
        await exportToDOCX(draft.title, items, exportType);
      }
      setToast({ message: `Exported to ${format.toUpperCase()} successfully`, type: 'success' });
    } catch (err: any) {
      setToast({ message: `Export failed: ${err.message}`, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif italic font-bold text-foreground">My Drafts</h2>
          <p className="text-muted-foreground">Continue working on your saved creations</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
          <History size={16} />
          {drafts.length} Drafts
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-2xl flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {drafts.length === 0 ? (
        <div className="bg-card border border-border rounded-[40px] p-20 text-center space-y-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <FileText size={40} />
          </div>
          <h3 className="text-xl font-bold">No drafts yet</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">Start creating something and save it as a draft to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drafts.map((draft) => (
            <motion.div 
              key={draft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-[32px] p-6 hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                    {draft.type.replace('-', ' ')}
                  </span>
                  <h3 className="text-xl font-bold text-foreground">{draft.title}</h3>
                  <p className="text-xs text-muted-foreground">Last updated: {new Date(draft.updated_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => deleteDraft(draft.id)}
                    className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                    title="Delete Draft"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button 
                  onClick={() => onOpenDraft(draft.type, draft.content)}
                  className="flex-1 bg-foreground text-background py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                >
                  <ExternalLink size={18} />
                  Open & Edit
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleExport(draft, 'pdf')}
                    className="p-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-all"
                    title="Export PDF"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <ConfirmationModal
        isOpen={!!draftToDelete}
        title="Delete Draft"
        message="Are you sure you want to delete this draft? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDraftToDelete(null)}
        variant="danger"
        confirmText="Delete Draft"
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

export default DraftsView;
