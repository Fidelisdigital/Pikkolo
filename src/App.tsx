import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Palette, 
  Search, 
  HelpCircle, 
  Grid3X3, 
  Image as ImageIcon, 
  Sparkles, 
  User, 
  Book, 
  Menu, 
  X,
  ChevronRight,
  Download,
  RefreshCw,
  Layout as LayoutIcon,
  Info,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowLeft,
  Star,
  Pencil,
  Sparkles as SparklesIcon,
  LogOut,
  History,
  Trophy,
  LogIn as LogInIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Auth
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthView from './components/AuthView';
import DraftsView from './components/DraftsView';
import LeaderboardView from './components/LeaderboardView';
import { set } from 'idb-keyval';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Components
import KidsBooks from './components/generators/KidsBooks';
import ColoringBooks from './components/generators/ColoringBooks';
import WordSearch from './components/generators/WordSearch';
import Trivia from './components/generators/Trivia';
import Sudoku from './components/generators/Sudoku';
import BookCover from './components/tools/BookCover';
import ImagePrompts from './components/tools/ImagePrompts';
import CharacterBuilder from './components/tools/CharacterBuilder';
import KDPGuide from './components/tools/KDPGuide';

type View = 
  | 'kids-books' 
  | 'coloring-books' 
  | 'word-search' 
  | 'trivia' 
  | 'sudoku' 
  | 'book-cover' 
  | 'image-prompts' 
  | 'character-builder' 
  | 'kdp-guide'
  | 'home'
  | 'drafts'
  | 'leaderboard'
  | 'auth';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');
  const [history, setHistory] = useState<View[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pikkolo_theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const navigateTo = (view: View) => {
    if (view === 'home') {
      setHistory([]);
      setCurrentView('home');
    } else if (view !== currentView) {
      setHistory(prev => [...prev, currentView]);
      setCurrentView(view);
    }
  };

  const goBack = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previous = newHistory.pop();
      setHistory(newHistory);
      if (previous) setCurrentView(previous);
    } else {
      setCurrentView('home');
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pikkolo_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pikkolo_theme', 'light');
    }
  }, [isDarkMode]);

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutIcon, category: 'Main' },
    { id: 'drafts', label: 'My Drafts', icon: History, category: 'Main', protected: true },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, category: 'Main' },
    { id: 'kids-books', label: 'Kids Books', icon: BookOpen, category: 'Generators' },
    { id: 'coloring-books', label: 'Coloring Books', icon: Palette, category: 'Generators' },
    { id: 'word-search', label: 'Word Search', icon: Search, category: 'Generators' },
    { id: 'trivia', label: 'Trivia', icon: HelpCircle, category: 'Generators' },
    { id: 'sudoku', label: 'Sudoku', icon: Grid3X3, category: 'Generators' },
    { id: 'book-cover', label: 'Book Cover', icon: ImageIcon, category: 'Tools' },
    { id: 'image-prompts', label: 'Image Prompts', icon: Sparkles, category: 'Tools' },
    { id: 'character-builder', label: 'Character Builder', icon: User, category: 'Tools' },
    { id: 'kdp-guide', label: 'KDP Guide', icon: Book, category: 'Tools' },
  ];

  const renderView = () => {
    if (currentView === 'auth') return <AuthView onSuccess={() => navigateTo('home')} />;
    
    const activeItem = navItems.find(item => item.id === currentView);
    if (activeItem?.protected && !user) {
      return <AuthView onSuccess={() => navigateTo(currentView)} />;
    }

    switch (currentView) {
      case 'home': return <HomeView onNavigate={navigateTo} />;
      case 'drafts': return <DraftsView onOpenDraft={async (type, content) => {
        const keys: Record<string, { result: string, settings: string }> = {
          'kids-books': { result: 'kids_books_result', settings: 'kids_books_settings' },
          'coloring-books': { result: 'coloring_books_result', settings: 'coloring_books_settings' },
          'word-search': { result: 'word_search_results', settings: 'word_search_settings' },
          'trivia': { result: 'trivia_result', settings: 'trivia_settings' },
          'sudoku': { result: 'sudoku_results', settings: 'sudoku_settings' },
        };

        const keyPair = keys[type];
        if (keyPair && content) {
          if (content.data) await set(`pikkolo_draft_${keyPair.result}`, content.data);
          if (content.settings) await set(`pikkolo_draft_${keyPair.settings}`, content.settings);
        }
        navigateTo(type as View);
      }} />;
      case 'leaderboard': return <LeaderboardView />;
      case 'kids-books': return <KidsBooks />;
      case 'coloring-books': return <ColoringBooks />;
      case 'word-search': return <WordSearch />;
      case 'trivia': return <Trivia />;
      case 'sudoku': return <Sudoku />;
      case 'book-cover': return <BookCover />;
      case 'image-prompts': return <ImagePrompts />;
      case 'character-builder': return <CharacterBuilder />;
      case 'kdp-guide': return <KDPGuide />;
      default: return <HomeView onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300 flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <button 
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            <span className="font-serif italic font-bold text-lg">P</span>
          </div>
          <span className="font-serif italic font-bold text-lg text-foreground">Pikkolo</span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-muted-foreground">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-foreground">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card/95 backdrop-blur-md border-r border-border transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full lg:w-0 lg:opacity-0 lg:overflow-hidden"
        )}>
          <div className="p-6 hidden lg:flex items-center justify-between border-b border-border/5">
            <button 
              onClick={() => navigateTo('home')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
            >
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <span className="font-serif italic font-bold text-2xl">P</span>
              </div>
              <div>
                <h1 className="font-serif italic font-bold text-xl leading-none text-foreground">Pikkolo</h1>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Studio</span>
              </div>
            </button>
          </div>

          <nav className="p-4 space-y-8 overflow-y-auto h-[calc(100vh-88px)] flex flex-col">
            <div className="flex-1 space-y-8">
              {['Main', 'Generators', 'Tools'].map(category => (
                <div key={category}>
                  <h3 className="px-4 text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-3">{category}</h3>
                  <div className="space-y-1">
                    {navItems.filter(item => item.category === category).map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigateTo(item.id as View);
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group",
                          currentView === item.id 
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                            : "hover:bg-primary/5 text-muted-foreground hover:text-primary"
                        )}
                      >
                        <item.icon size={18} className={cn(currentView === item.id ? "text-primary-foreground" : "group-hover:scale-110 transition-transform")} />
                        <span className="font-medium text-sm">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-border/10">
              {user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{user.email}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Logged In</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <LogOut size={18} />
                    <span className="font-medium text-sm">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => navigateTo('auth')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-foreground text-background hover:opacity-90 transition-all"
                >
                  <LogInIcon size={18} />
                  <span className="font-medium text-sm">Sign In</span>
                </button>
              )}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen relative overflow-x-hidden flex flex-col">
          {/* Desktop Toolbar */}
          <div className="hidden lg:flex items-center justify-between p-6 sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/5">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-muted/50 rounded-lg text-muted-foreground transition-colors"
              >
                {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
              </button>
              {currentView !== 'home' && (
                <button 
                  onClick={goBack}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted/50 rounded-lg text-muted-foreground transition-colors text-sm font-medium"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              )}
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-muted/50 rounded-lg text-muted-foreground transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Mobile Back Button (Floating or inline) */}
          {currentView !== 'home' && (
            <div className="lg:hidden px-4 pt-4">
              <button 
                onClick={goBack}
                className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-muted-foreground text-sm font-medium shadow-sm"
              >
                <ArrowLeft size={18} />
                Back
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex-1",
                currentView === 'home' ? "p-0" : "p-4 lg:p-10 max-w-7xl mx-auto w-full"
              )}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <footer className="border-t border-border bg-card/50 backdrop-blur-sm p-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-primary-foreground">
                  <span className="font-serif italic font-bold text-xs">P</span>
                </div>
                <span className="font-serif italic font-bold text-foreground">Pikkolo</span>
              </div>
              <div className="font-medium">Created by FidelisDigitalS</div>
              <div>&copy; {new Date().getFullYear()} Pikkolo. All rights reserved.</div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

const HomeView: React.FC<{ onNavigate: (view: View) => void }> = ({ onNavigate }) => {
  const tools = [
    { id: 'kids-books', title: 'Kids Books', desc: 'Create enchanting stories with AI-powered illustrations.', icon: BookOpen, color: 'bg-blue-500' },
    { id: 'coloring-books', title: 'Coloring Books', desc: 'Generate unique themed prompts for coloring pages.', icon: Palette, color: 'bg-pink-500' },
    { id: 'word-search', title: 'Word Search', desc: 'Build custom word search puzzles with instant grids.', icon: Search, color: 'bg-emerald-500' },
    { id: 'trivia', title: 'Trivia', desc: 'Generate engaging quizzes and educational trivia.', icon: HelpCircle, color: 'bg-purple-500' },
    { id: 'sudoku', title: 'Sudoku', desc: 'Create valid Sudoku puzzles with multiple difficulty levels.', icon: Grid3X3, color: 'bg-amber-500' },
  ];

  return (
    <div className="flex flex-col">
      {/* SECTION 1: Hero Section */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
        {/* Child-friendly background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: [0.2, 0.5, 0.2],
                y: [0, -20, 0],
                x: [0, Math.random() * 10 - 5, 0]
              }}
              transition={{ 
                duration: 3 + Math.random() * 2, 
                repeat: Infinity,
                delay: Math.random() * 2 
              }}
              className="absolute text-primary/20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            >
              {i % 4 === 0 ? <Star size={24 + Math.random() * 20} /> : 
               i % 4 === 1 ? <Pencil size={20 + Math.random() * 15} /> :
               i % 4 === 2 ? <BookOpen size={22 + Math.random() * 18} /> :
               <SparklesIcon size={18 + Math.random() * 12} />}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 space-y-8 max-w-4xl"
        >
          {/* Prominent Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-primary rounded-[24px] flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30 rotate-3">
              <span className="font-serif italic font-bold text-5xl">P</span>
            </div>
            <h1 className="font-serif italic font-bold text-4xl text-foreground tracking-tight">Pikkolo</h1>
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl lg:text-7xl font-bold leading-tight text-foreground">
              Ignite Your Child's <br />
              <span className="text-primary italic font-serif">Imagination.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The ultimate creative suite for parents, teachers, and authors. 
              Generate enchanting books, puzzles, and activities with the magic of AI.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const el = document.getElementById('generators-grid');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-10 py-5 bg-primary text-primary-foreground rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-3 mx-auto"
          >
            Start Creating <ChevronRight size={20} />
          </motion.button>
        </motion.div>
      </section>

      {/* SECTION 2: Tools and Generators */}
      <section id="generators-grid" className="py-24 px-6 max-w-7xl mx-auto w-full space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-foreground">What Would You Like to Create Today?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Choose a tool below to start your creative journey. Each generator is optimized for high-quality results.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, i) => (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onNavigate(tool.id as View)}
              className="group relative p-10 bg-card border border-border rounded-[40px] text-left hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden flex flex-col h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-primary-foreground mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg",
                tool.color
              )}>
                <tool.icon size={32} />
              </div>

              <h3 className="text-2xl font-bold mb-4 text-card-foreground group-hover:text-primary transition-colors">
                {tool.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed flex-1">
                {tool.desc}
              </p>

              <div className="mt-8 flex items-center text-primary font-bold text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                Open Generator <ChevronRight size={16} className="ml-1" />
              </div>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default App;
