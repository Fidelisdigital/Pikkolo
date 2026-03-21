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
  PanelLeftOpen
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
      case 'home': return <HomeView onNavigate={setCurrentView} />;
      case 'kids-books': return <KidsBooks />;
      case 'coloring-books': return <ColoringBooks />;
      case 'word-search': return <WordSearch />;
      case 'trivia': return <Trivia />;
      case 'sudoku': return <Sudoku />;
      case 'book-cover': return <BookCover />;
      case 'image-prompts': return <ImagePrompts />;
      case 'character-builder': return <CharacterBuilder />;
      case 'kdp-guide': return <KDPGuide />;
      default: return <HomeView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0F172A] text-[#1A1A1A] dark:text-slate-100 font-sans selection:bg-[#F27D26]/30 transition-colors duration-300">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#1A1A1A]/10 dark:border-white/10 bg-white dark:bg-[#1E293B] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F27D26] rounded-lg flex items-center justify-center text-white">
            <BookOpen size={20} />
          </div>
          <span className="font-serif italic font-bold text-lg">Pikkolo</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-[#1A1A1A]/60 dark:text-slate-400">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#1E293B] border-r border-[#1A1A1A]/10 dark:border-white/10 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full lg:w-0 lg:opacity-0 lg:overflow-hidden"
        )}>
          <div className="p-6 hidden lg:flex items-center justify-between border-b border-[#1A1A1A]/5 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F27D26] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#F27D26]/20">
                <BookOpen size={24} />
              </div>
              <div>
                <h1 className="font-serif italic font-bold text-xl leading-none">Pikkolo</h1>
                <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Studio</span>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-8 overflow-y-auto h-[calc(100vh-88px)]">
            {['Main', 'Generators', 'Tools'].map(category => (
              <div key={category}>
                <h3 className="px-4 text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A]/40 dark:text-slate-500 mb-3">{category}</h3>
                <div className="space-y-1">
                  {navItems.filter(item => item.category === category).map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id as View);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group",
                        currentView === item.id 
                          ? "bg-[#F27D26] text-white shadow-md shadow-[#F27D26]/20" 
                          : "hover:bg-[#F27D26]/5 dark:hover:bg-white/5 text-[#1A1A1A]/70 dark:text-slate-400 hover:text-[#F27D26] dark:hover:text-[#F27D26]"
                      )}
                    >
                      <item.icon size={18} className={cn(currentView === item.id ? "text-white" : "group-hover:scale-110 transition-transform")} />
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
          <div className="hidden lg:flex items-center justify-between p-6 sticky top-0 z-30 bg-[#FDFCFB]/80 dark:bg-[#0F172A]/80 backdrop-blur-md border-b border-[#1A1A1A]/5 dark:border-white/5">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#1A1A1A]/5 dark:hover:bg-white/5 rounded-lg text-[#1A1A1A]/60 dark:text-slate-400 transition-colors"
            >
              {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-[#1A1A1A]/5 dark:hover:bg-white/5 rounded-lg text-[#1A1A1A]/60 dark:text-slate-400 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

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
          className="inline-block px-3 py-1 bg-[#F27D26]/10 text-[#F27D26] rounded-full text-[10px] font-bold uppercase tracking-widest"
        >
          Welcome to the Studio
        </motion.div>
        <h2 className="text-5xl lg:text-7xl font-serif italic font-light leading-tight">
          Craft your next <br />
          <span className="font-bold text-[#F27D26]">Masterpiece.</span>
        </h2>
        <p className="text-lg text-[#1A1A1A]/60 dark:text-slate-400 max-w-2xl">
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
          { id: 'book-cover', title: 'Book Cover', desc: 'Live canvas preview and design.', icon: ImageIcon, color: 'bg-[#F27D26]' },
        ].map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onNavigate(card.id as View)}
            className="group relative p-8 bg-white dark:bg-[#1E293B] border border-[#1A1A1A]/5 dark:border-white/5 rounded-3xl text-left hover:shadow-2xl hover:shadow-[#1A1A1A]/5 dark:hover:shadow-black/20 transition-all duration-300 overflow-hidden"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 transition-transform group-hover:scale-110", card.color)}>
              <card.icon size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {card.title}
            </h3>
            <p className="text-[#1A1A1A]/50 dark:text-slate-400 text-sm leading-relaxed">{card.desc}</p>
            <div className="mt-6 flex items-center text-[#F27D26] font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Launch Tool <ChevronRight size={14} />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default App;
