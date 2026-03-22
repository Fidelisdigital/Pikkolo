import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './useAuth';

export function useDrafts(type: string, title: string, content: any, settings?: any) {
  const { user } = useAuth();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveDraft = useCallback(async () => {
    if (!user || !content || (Array.isArray(content) && content.length === 0)) return;
    
    setIsSaving(true);
    setError(null);
    try {
      const draftContent = { data: content, settings };
      
      // Check if a draft with the same title and type already exists for this user
      const { data: existingDrafts, error: fetchError } = await supabase
        .from('drafts')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', title)
        .eq('type', type)
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingDrafts && existingDrafts.length > 0) {
        // Update existing draft
        const { error: updateError } = await supabase
          .from('drafts')
          .update({ content: draftContent, updated_at: new Date().toISOString() })
          .eq('id', existingDrafts[0].id);
        if (updateError) throw updateError;
      } else {
        // Create new draft
        const { error: insertError } = await supabase
          .from('drafts')
          .insert({
            user_id: user.id,
            title,
            type,
            content: draftContent,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        if (insertError) throw insertError;
      }
      setLastSaved(new Date());
    } catch (err: any) {
      setError(err.message);
      console.error('Error saving draft:', err);
    } finally {
      setIsSaving(false);
    }
  }, [user, type, title, content, settings]);

  // Auto-save every 2 minutes
  useEffect(() => {
    if (!user || !content) return;
    
    const intervalId = setInterval(() => {
      saveDraft();
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(intervalId);
  }, [user, content, saveDraft]);

  return { saveDraft, lastSaved, isSaving, error };
}
