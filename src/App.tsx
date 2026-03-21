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
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
  | 'home';

const App: React.FC = () => {
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
    switch (currentView) {
      case 'home': return <HomeView onNavigate={navigateTo} />;
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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300">
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

      <div className="flex">
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

          <nav className="p-4 space-y-8 overflow-y-auto h-[calc(100vh-88px)]">
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
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen relative overflow-x-hidden">
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
              className="p-4 lg:p-10 max-w-7xl mx-auto"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const HomeView: React.FC<{ onNavigate: (view: View) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest"
        >
          Welcome to the Studio
        </motion.div>
        <h2 className="text-5xl lg:text-7xl font-serif italic font-light leading-tight text-foreground">
          Craft your next <br />
          <span className="font-bold text-primary">Masterpiece.</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl">
          The all-in-one creative suite for self-publishers. Generate content, build characters, and design covers with the power of AI.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: 'kids-books', title: 'Kids Books', desc: 'Full stories with illustration prompts.', icon: BookOpen, color: 'bg-blue-500' },
          { id: 'coloring-books', title: 'Coloring Books', desc: 'Themed prompts for all ages.', icon: Palette, color: 'bg-pink-500' },
          { id: 'word-search', title: 'Word Search', desc: 'AI word lists and grid generation.', icon: Search, color: 'bg-emerald-500' },
          { id: 'trivia', title: 'Trivia', desc: 'Engaging quizzes in multiple formats.', icon: HelpCircle, color: 'bg-purple-500' },
          { id: 'sudoku', title: 'Sudoku', desc: 'Instant valid puzzles with solutions.', icon: Grid3X3, color: 'bg-amber-500' },
          { id: 'book-cover', title: 'Book Cover', desc: 'Live canvas preview and design.', icon: ImageIcon, color: 'bg-primary' },
        ].map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onNavigate(card.id as View)}
            className="group relative p-8 bg-card border border-border rounded-[32px] text-left hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg", card.color)}>
              <card.icon size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-2 relative z-10 text-card-foreground">
              {card.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed relative z-10">{card.desc}</p>
            <div className="mt-8 flex items-center text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 relative z-10">
              Launch Tool <ChevronRight size={14} className="ml-1" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default App;
