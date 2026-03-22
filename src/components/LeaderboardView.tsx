import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { motion } from 'motion/react';
import { Trophy, Medal, Loader2, AlertCircle, User, Star } from 'lucide-react';

interface Score {
  id: string;
  user_id: string;
  score: number;
  category: string;
  created_at: string;
  user_email?: string;
}

const LeaderboardView: React.FC = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = async () => {
    setLoading(true);
    try {
      // In a real app, we'd join with a profiles table to get usernames/emails
      // For now, let's just fetch the top scores
      const { data, error } = await supabase
        .from('quiz_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setScores(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-[32px] flex items-center justify-center mx-auto rotate-6 shadow-xl shadow-amber-500/10">
          <Trophy size={40} />
        </div>
        <h2 className="text-4xl font-serif italic font-bold text-foreground">Global Leaderboard</h2>
        <p className="text-muted-foreground max-w-md mx-auto">Top quiz scores from our community of young geniuses!</p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-2xl flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-4">
        {scores.length === 0 ? (
          <div className="bg-card border border-border rounded-[40px] p-20 text-center space-y-4">
            <h3 className="text-xl font-bold">No scores yet</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">Be the first to take a quiz and claim the top spot!</p>
          </div>
        ) : (
          scores.map((score, index) => (
            <motion.div 
              key={score.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "bg-card border border-border rounded-3xl p-6 flex items-center gap-6 hover:shadow-lg transition-all",
                index === 0 && "border-amber-500/30 bg-amber-500/5",
                index === 1 && "border-slate-400/30 bg-slate-400/5",
                index === 2 && "border-orange-400/30 bg-orange-400/5"
              )}
            >
              <div className="w-12 h-12 flex items-center justify-center text-2xl font-serif italic font-bold text-muted-foreground">
                {index === 0 ? <Medal className="text-amber-500" size={32} /> : 
                 index === 1 ? <Medal className="text-slate-400" size={32} /> : 
                 index === 2 ? <Medal className="text-orange-400" size={32} /> : 
                 `#${index + 1}`}
              </div>

              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <User size={24} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground truncate">User {score.user_id.slice(0, 8)}...</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{score.category}</p>
              </div>

              <div className="text-right space-y-1">
                <div className="text-2xl font-bold text-primary flex items-center gap-2 justify-end">
                  <Star className="fill-primary" size={20} />
                  {score.score}
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Points</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

// Helper for classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default LeaderboardView;
