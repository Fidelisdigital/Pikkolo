import React, { useState } from 'react';
import { Sparkles, Loader2, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { generateJSON } from '../../services/ai';
import { Type } from '@google/genai';
import { motion } from 'motion/react';

interface Question {
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

const Trivia: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);

  const [settings, setSettings] = useState({
    topic: '',
    format: 'Multiple Choice',
    count: 5,
    difficulty: 'Medium',
  });

  const handleGenerate = async () => {
    setLoading(true);
    const prompt = `Generate ${settings.count} trivia questions about "${settings.topic}". 
    Format: ${settings.format}. 
    Difficulty: ${settings.difficulty}. 
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
      const result = await generateJSON<Question[]>(prompt, schema, "You are a trivia master.");
      setQuestions(result);
      setShowAnswers(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-serif italic font-bold">Trivia Generator</h2>
        <p className="text-[#1A1A1A]/50 dark:text-slate-400">Create engaging quizzes in multiple formats.</p>
      </header>

      <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl border border-[#1A1A1A]/5 dark:border-white/5 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500">Topic</label>
            <input 
              type="text" 
              placeholder="World History, Pop Culture..."
              className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 dark:border-white/10 bg-transparent outline-none"
              value={settings.topic}
              onChange={e => setSettings({...settings, topic: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500">Format</label>
            <select 
              className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 dark:border-white/10 bg-transparent outline-none"
              value={settings.format}
              onChange={e => setSettings({...settings, format: e.target.value})}
            >
              <option className="bg-white dark:bg-[#1E293B]">Multiple Choice</option>
              <option className="bg-white dark:bg-[#1E293B]">True/False</option>
              <option className="bg-white dark:bg-[#1E293B]">Open Answer</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500">Difficulty</label>
            <select 
              className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 dark:border-white/10 bg-transparent outline-none"
              value={settings.difficulty}
              onChange={e => setSettings({...settings, difficulty: e.target.value})}
            >
              <option className="bg-white dark:bg-[#1E293B]">Easy</option>
              <option className="bg-white dark:bg-[#1E293B]">Medium</option>
              <option className="bg-white dark:bg-[#1E293B]">Hard</option>
              <option className="bg-white dark:bg-[#1E293B]">Expert</option>
            </select>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading || !settings.topic}
            className="w-full px-8 py-3.5 bg-[#F27D26] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            Generate
          </button>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={() => setShowAnswers(!showAnswers)}
              className="px-4 py-2 bg-[#1A1A1A]/5 dark:bg-white/5 rounded-lg text-sm font-bold hover:bg-[#1A1A1A]/10 dark:hover:bg-white/10 transition-colors"
            >
              {showAnswers ? 'Hide Answers' : 'Show Answers'}
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((q, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl border border-[#1A1A1A]/5 dark:border-white/5 shadow-sm space-y-4"
              >
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#F27D26]/10 text-[#F27D26] flex items-center justify-center font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="space-y-4 flex-1">
                    <h3 className="text-lg font-medium leading-relaxed">{q.question}</h3>
                    
                    {q.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="p-3 bg-[#FDFCFB] dark:bg-[#0F172A] border border-[#1A1A1A]/5 dark:border-white/5 rounded-xl text-sm">
                            <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {showAnswers && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-4 border-t border-[#1A1A1A]/5 dark:border-white/5 space-y-2"
                      >
                        <div className="flex items-center gap-2 text-emerald-600 font-bold">
                          <CheckCircle2 size={18} />
                          <span>Correct Answer: {q.answer}</span>
                        </div>
                        <p className="text-sm text-[#1A1A1A]/60 dark:text-slate-400 italic">
                          {q.explanation}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Trivia;
