import React, { useState, useEffect } from 'react';
import { User, Sparkles, Save, Trash2, Info, CheckCircle2, RotateCcw } from 'lucide-react';
import { generateContent } from '../../services/ai';
import { motion } from 'motion/react';
import { useDraft } from '../../hooks/useDraft';

import { ConfirmationModal } from '../ui/Feedback';

const CharacterBuilder: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [character, setCharacter, clearCharacter] = useDraft('character_builder_draft', {
    name: '',
    species: '',
    traits: '',
    clothing: '',
    description: '',
    customInstructions: '',
  });
  const [savedPrompt, setSavedPrompt] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bookbloom_character_prompt');
    if (saved) setSavedPrompt(saved);
  }, []);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleResetForm = () => {
    setIsResetModalOpen(true);
  };

  const confirmReset = () => {
    clearCharacter();
    setIsResetModalOpen(false);
  };

  const handleGenerateDescription = async () => {
    setLoading(true);
    const prompt = `Create a detailed visual description for an AI image generator based on these character details:
    Name: ${character.name}
    Species: ${character.species}
    Traits: ${character.traits}
    Clothing: ${character.clothing}
    ${character.customInstructions ? `Additional Instructions: ${character.customInstructions}` : ''}
    
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
        <h2 className="text-4xl font-serif italic font-bold text-foreground">Character Builder</h2>
        <p className="text-muted-foreground">Create a locked reference prompt for consistent book illustrations.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6 bg-card p-8 rounded-3xl border border-border shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Name</label>
              <input 
                type="text" 
                className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
                value={character.name}
                onChange={e => setCharacter({...character, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Species</label>
              <input 
                type="text" 
                className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
                value={character.species}
                onChange={e => setCharacter({...character, species: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Traits (e.g. fluffy, brave, small)</label>
            <input 
              type="text" 
              className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
              value={character.traits}
              onChange={e => setCharacter({...character, traits: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Clothing / Accessories</label>
            <input 
              type="text" 
              className="w-full p-3 rounded-xl border border-input bg-transparent outline-none text-foreground"
              value={character.clothing}
              onChange={e => setCharacter({...character, clothing: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Precise Generation Prompt</label>
            <textarea 
              placeholder="Add specific artistic styles, moods, or additional details..."
              rows={2}
              className="w-full p-3 rounded-xl border border-input bg-transparent outline-none focus:ring-2 focus:ring-primary resize-none text-sm text-foreground"
              value={character.customInstructions}
              onChange={e => setCharacter({...character, customInstructions: e.target.value})}
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleGenerateDescription}
              disabled={loading || !character.name}
              className="flex-1 py-4 bg-foreground text-background rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? <Sparkles className="animate-pulse" /> : <Sparkles size={20} />}
              Generate Visual Profile
            </button>
            <button 
              onClick={handleResetForm}
              className="p-4 bg-card border border-border rounded-2xl text-muted-foreground hover:text-destructive transition-colors"
              title="Reset Form"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Visual Description (The Prompt)</label>
            <textarea 
              rows={4}
              className="w-full p-4 rounded-2xl border border-input bg-transparent outline-none focus:ring-2 focus:ring-primary resize-none text-sm italic text-foreground"
              value={character.description}
              onChange={e => setCharacter({...character, description: e.target.value})}
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={!character.description}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Save size={20} />
            Lock & Save Character
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-primary/5 p-8 rounded-[40px] border border-primary/10">
            <h3 className="text-xl font-serif italic font-bold mb-4 flex items-center gap-2 text-primary">
              <Info size={20} />
              Why use this?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed space-y-4">
              Consistency is key in children's books. By "locking" a character description, BookBloom will automatically append this profile to every illustration prompt generated in the Kids Books tool.
            </p>
          </div>

          {savedPrompt && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card p-8 rounded-3xl border border-emerald-500/20 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <CheckCircle2 className="text-emerald-500" size={24} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-4">Active Character Profile</h3>
              <p className="text-sm italic text-muted-foreground mb-6">"{savedPrompt}"</p>
              <button 
                onClick={handleClear}
                className="text-xs font-bold text-destructive flex items-center gap-1 hover:underline"
              >
                <Trash2 size={14} /> Remove Profile
              </button>
            </motion.div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={isResetModalOpen}
        title="Reset Form"
        message="Are you sure you want to reset the character form? This will clear all fields."
        onConfirm={confirmReset}
        onCancel={() => setIsResetModalOpen(false)}
        variant="danger"
        confirmText="Reset Now"
      />
    </div>
  );
};

export default CharacterBuilder;
