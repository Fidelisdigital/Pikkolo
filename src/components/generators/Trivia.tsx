import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, HelpCircle, CheckCircle2, XCircle, Trash2, FileText, FileDown, Eye, Save, Check, Trophy } from 'lucide-react';
import { generateJSON } from '../../services/ai';
import { Type } from '@google/genai';
import { motion } from 'motion/react';
import { useDraft } from '../../hooks/useDraft';
import { useAuth } from '../../hooks/useAuth';
import { useDrafts } from '../../hooks/useDrafts';
import { supabase } from '../../services/supabase';
import { exportToPDF, exportToDOCX } from '../../services/exportService';
import FullPreviewModal from '../FullPreviewModal';

import { ConfirmationModal, Toast } from '../ui/Feedback';

interface Question {
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

const Trivia: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions, clearQuestions] = useDraft<Question[]>('trivia_result', []);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSavingScore, setIsSavingScore] = useState(false);

  const [settings, setSettings, clearSettings] = useDraft('trivia_settings', {
    topic: '',
    format: 'Multiple Choice',
    count: 10,
    difficulty: 'Medium',
    paperSize: '8.5 x 11',
    customInstructions: '',
  });

  const { saveDraft, isSaving, lastSaved } = useDrafts('trivia', settings.topic || 'Untitled Trivia', questions, settings);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const submitScore = async () => {
    if (!user || questions.length === 0) return;
    setIsSavingScore(true);
    try {
      // Simulate a score based on number of questions generated
      const score = questions.length * 10; 
      const { error } = await supabase.from('quiz_scores').insert({
        user_id: user.id,
        score,
        category: settings.topic || 'General',
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setToast({ message: `Score of ${score} submitted to leaderboard!`, type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Error submitting score: ' + err.message, type: 'error' });
    } finally {
      setIsSavingScore(false);
    }
  };

  const handleClear = () => {
    setIsClearModalOpen(true);
  };

  const confirmClear = () => {
    clearQuestions();
    clearSettings();
    setShowAnswers(false);
    setIsClearModalOpen(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    const prompt = `Generate a full trivia book content about "${settings.topic}". 
    Format: ${settings.format}. 
    Difficulty: ${settings.difficulty}. 
    Number of questions: ${settings.count}.
    Paper Size: ${settings.paperSize}.
    ${settings.customInstructions ? `Additional Instructions: ${settings.customInstructions}` : ''}
    
    The book should be structured for printing. Generate ${settings.count} questions.
    Each question should include the question text, ${settings.format === 'Multiple Choice' ? 'a list of 4 options,' : ''} the correct answer, and a brief explanation.
    
    Return a JSON array of objects with question, ${settings.format === 'Multiple Choice' ? 'options,' : ''} answer, and explanation.`;

    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ['question', 'answer', 'explanation']
      }
    };

    try {
      if (!settings.topic) {
        setToast({ message: 'Please enter a topic first', type: 'error' });
        return;
      }
      const result = await generateJSON<Question[]>(prompt, schema, "You are a trivia master.");
      setQuestions(result);
      setShowAnswers(false);
      setToast({ message: 'Trivia questions generated successfully!', type: 'success' });
    } catch (error: any) {
      console.error(error);
      setToast({ message: `Generation failed: ${error.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    const title = `${settings.topic || 'Trivia'}_Trivia_Book`;
    const puzzleContent = questions.map((q, i) => ({
      title: `Question ${i + 1}`,
      description: `Topic: ${settings.topic}`,
      content: `${q.question}\n\n${q.options ? q.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`).join('\n') : ''}`,
      prompt: settings.customInstructions
    }));

    const solutionPages = [];
    const questionsPerPage = 10;
    for (let i = 0; i < questions.length; i += questionsPerPage) {
      const pageQuestions = questions.slice(i, i + questionsPerPage);
      solutionPages.push({
        title: `Answers: Questions ${i + 1} - ${Math.min(i + questionsPerPage, questions.length)}`,
        description: `Correct Answers and Explanations`,
        content: pageQuestions.map((q, idx) => 
          `${i + idx + 1}. Correct Answer: ${q.answer}\nExplanation: ${q.explanation}`
        ).join('\n\n'),
        isSolution: true
      });
    }

    const content = [...puzzleContent, ...solutionPages];

    try {
      if (format === 'pdf') {
        await exportToPDF(title, content, 'trivia');
      } else {
        await exportToDOCX(title, content, 'trivia');
      }
      setToast({ message: `Exported to ${format.toUpperCase()} successfully`, type: 'success' });
    } catch (err: any) {
      setToast({ message: `Export failed: ${err.message}`, type: 'error' });
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-serif italic font-bold text-foreground">Trivia Generator</h2>
        <p className="text-muted-foreground">Create engaging quizzes in multiple formats.</p>
      </header>

      <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Topic</label>
            <input 
              type="text" 
              placeholder="World History, Pop Culture..."
              className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
              value={settings.topic}
              onChange={e => setSettings({...settings, topic: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Format</label>
            <select 
              className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
              value={settings.format}
              onChange={e => setSettings({...settings, format: e.target.value})}
            >
              <option className="bg-card">Multiple Choice</option>
              <option className="bg-card">True/False</option>
              <option className="bg-card">Open Answer</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Difficulty</label>
            <select 
              className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
              value={settings.difficulty}
              onChange={e => setSettings({...settings, difficulty: e.target.value})}
            >
              <option className="bg-card">Easy</option>
              <option className="bg-card">Medium</option>
              <option className="bg-card">Hard</option>
              <option className="bg-card">Expert</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
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
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Number of Questions</label>
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
            placeholder="Add specific details, categories, or styles for more precise generation..."
            rows={2}
            className="w-full p-3 rounded-xl border border-input bg-transparent outline-none focus:ring-2 focus:ring-primary resize-none text-sm text-foreground"
            value={settings.customInstructions}
            onChange={e => setSettings({...settings, customInstructions: e.target.value})}
          />
        </div>

        <div className="flex gap-3 w-full lg:w-auto">
          <button 
            onClick={handleGenerate}
            disabled={loading || !settings.topic}
            className="flex-1 lg:w-auto px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            Generate Book
          </button>
          {user && questions.length > 0 && (
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
                onClick={submitScore}
                disabled={isSavingScore}
                className="p-3.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl font-bold hover:bg-amber-500/20 transition-all flex items-center gap-2"
                title="Submit Score to Leaderboard"
              >
                {isSavingScore ? <Loader2 className="animate-spin" size={20} /> : <Trophy size={20} />}
                <span className="hidden sm:inline text-sm font-bold">Submit Score</span>
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

      {questions.length > 0 && (
        <div className="space-y-12">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-serif italic font-bold text-foreground">Book Preview</h3>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsPreviewOpen(true)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Eye size={18} />
                Preview & Export
              </button>
              <button 
                onClick={() => setShowAnswers(!showAnswers)}
                className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-bold hover:bg-muted/80 transition-colors"
              >
                {showAnswers ? 'Hide Solutions' : 'Show Solutions'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-muted p-4 rounded-xl text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-center">
              Questions Section
            </div>
            {questions.map((q, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-4"
              >
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="space-y-4 flex-1">
                    <h3 className="text-lg font-medium leading-relaxed text-foreground">{q.question}</h3>
                    
                    {q.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="p-3 bg-background border border-border rounded-xl text-sm text-foreground">
                            <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {showAnswers && (
              <>
                <div className="bg-muted p-4 rounded-xl text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-center mt-12">
                  Solutions Section
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {questions.map((q, i) => (
                    <motion.div 
                      key={`ans-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card p-6 rounded-2xl border border-emerald-500/20 shadow-sm space-y-2"
                    >
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                        <CheckCircle2 size={16} />
                        <span>Question {i + 1}: {q.answer}</span>
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        {q.explanation}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <FullPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={settings.topic || 'Trivia Quiz'}
        items={[
          ...questions.map((q, i) => ({
            title: `Question ${i + 1}`,
            description: `Topic: ${settings.topic}`,
            content: `${q.question}\n\n${q.options ? q.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`).join('\n') : ''}`,
          })),
          ...(() => {
            const solutionPages = [];
            const questionsPerPage = 10;
            for (let i = 0; i < questions.length; i += questionsPerPage) {
              const pageQuestions = questions.slice(i, i + questionsPerPage);
              solutionPages.push({
                title: `Answers: Questions ${i + 1} - ${Math.min(i + questionsPerPage, questions.length)}`,
                description: `Correct Answers and Explanations`,
                content: pageQuestions.map((q, idx) => 
                  `${i + idx + 1}. Correct Answer: ${q.answer}\nExplanation: ${q.explanation}`
                ).join('\n\n'),
                isSolution: true
              });
            }
            return solutionPages;
          })()
        ]}
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

export default Trivia;
