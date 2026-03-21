import React, { useState, useEffect } from 'react';
import { User, Sparkles, Save, Trash2, Info, CheckCircle2 } from 'lucide-react';
import { generateContent } from '../../services/ai';
import { motion } from 'motion/react';

const CharacterBuilder: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [character, setCharacter] = useState({
    name: '',
    species: '',
    traits: '',
    clothing: '',
    description: '',
  });
  const [savedPrompt, setSavedPrompt] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bookbloom_character_prompt');
    if (saved) setSavedPrompt(saved);
  }, []);

  const handleGenerateDescription = async () => {
    setLoading(true);
    const prompt = `Create a detailed visual description for an AI image generator based on these character details:
    Name: ${character.name}
    Species: ${character.species}
    Traits: ${character.traits}
    Clothing: ${character.clothing}
    
    The description should be a single paragraph optimized for consistency in children's book illustrations.`;

    try {
      const result = await generateContent(prompt, "You are a character designer for children's books.");
      setCharacter({ ...character, description: result || '' });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('bookbloom_character_prompt', character.description);
    setSavedPrompt(character.description);
  };

  const handleClear = () => {
    localStorage.removeItem('bookbloom_character_prompt');
    setSavedPrompt(null);
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-serif italic font-bold">Character Builder</h2>
        <p className="text-[#1A1A1A]/50">Create a locked reference prompt for consistent book illustrations.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6 bg-white dark:bg-[#1E293B] p-8 rounded-3xl border border-[#1A1A1A]/5 dark:border-white/5 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500">Name</label>
              <input 
                type="text" 
                className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 dark:border-white/10 bg-transparent outline-none"
                value={character.name}
                onChange={e => setCharacter({...character, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500">Species</label>
              <input 
                type="text" 
                className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 dark:border-white/10 bg-transparent outline-none"
                value={character.species}
                onChange={e => setCharacter({...character, species: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500">Traits (e.g. fluffy, brave, small)</label>
            <input 
              type="text" 
              className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 dark:border-white/10 bg-transparent outline-none"
              value={character.traits}
              onChange={e => setCharacter({...character, traits: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500">Clothing / Accessories</label>
            <input 
              type="text" 
              className="w-full p-3 rounded-xl border border-[#1A1A1A]/10 dark:border-white/10 bg-transparent outline-none"
              value={character.clothing}
              onChange={e => setCharacter({...character, clothing: e.target.value})}
            />
          </div>

          <button 
            onClick={handleGenerateDescription}
            disabled={loading || !character.name}
            className="w-full py-4 bg-[#1A1A1A] dark:bg-slate-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-slate-600 transition-all disabled:opacity-50"
          >
            {loading ? <Sparkles className="animate-pulse" /> : <Sparkles size={20} />}
            Generate Visual Profile
          </button>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 dark:text-slate-500">Visual Description (The Prompt)</label>
            <textarea 
              rows={4}
              className="w-full p-4 rounded-2xl border border-[#1A1A1A]/10 dark:border-white/10 bg-transparent outline-none focus:ring-2 focus:ring-[#F27D26] resize-none text-sm italic"
              value={character.description}
              onChange={e => setCharacter({...character, description: e.target.value})}
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={!character.description}
            className="w-full py-4 bg-[#F27D26] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Save size={20} />
            Lock & Save Character
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-[#F27D26]/5 p-8 rounded-[40px] border border-[#F27D26]/10">
            <h3 className="text-xl font-serif italic font-bold mb-4 flex items-center gap-2">
              <Info size={20} className="text-[#F27D26]" />
              Why use this?
            </h3>
            <p className="text-sm text-[#1A1A1A]/70 leading-relaxed space-y-4">
              Consistency is key in children's books. By "locking" a character description, BookBloom will automatically append this profile to every illustration prompt generated in the Kids Books tool.
            </p>
          </div>

          {savedPrompt && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl border border-emerald-500/20 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <CheckCircle2 className="text-emerald-500" size={24} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-4">Active Character Profile</h3>
              <p className="text-sm italic text-[#1A1A1A]/70 mb-6">"{savedPrompt}"</p>
              <button 
                onClick={handleClear}
                className="text-xs font-bold text-red-500 flex items-center gap-1 hover:underline"
              >
                <Trash2 size={14} /> Remove Profile
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterBuilder;
