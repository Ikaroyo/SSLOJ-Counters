import React from 'react';
import { Sun, Moon, Edit, Users, Menu, X } from 'lucide-react';

const Navbar = ({
  darkMode,
  setDarkMode,
  currentView,
  setCurrentView
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [editorUnlocked, setEditorUnlocked] = React.useState(() => {
    return localStorage.getItem('ssloj-editor-unlocked') === 'true';
  });
  const [konamiSequence, setKonamiSequence] = React.useState([]);

  // Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
  const konamiCode = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];

  React.useEffect(() => {
    const handleKeyPress = (event) => {
      const newSequence = [...konamiSequence, event.code].slice(-konamiCode.length);
      setKonamiSequence(newSequence);

      if (JSON.stringify(newSequence) === JSON.stringify(konamiCode)) {
        setEditorUnlocked(true);
        localStorage.setItem('ssloj-editor-unlocked', 'true');
        setKonamiSequence([]);

        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
        successDiv.textContent = '🎉 ¡Editor desbloqueado!';
        document.body.appendChild(successDiv);
        setTimeout(() => {
          document.body.removeChild(successDiv);
        }, 3000);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [konamiSequence]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-lg dark:shadow-slate-900/50 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleViewChange('home')}
          >
            <div className="w-20 h-20 overflow-hidden">
              <img
                src="https://saintseiya.wdyxgames.com/img/home/en/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">
                Sistema de Counters
              </h1>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Home Button */}
            <button
              onClick={() => handleViewChange('home')}
              className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${currentView === 'home'
                ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-lg'
                : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              title="Gestión de Personajes"
            >
              <Users size={16} />
              <span className="hidden sm:inline">Personajes</span>
            </button>

            {/* Team Builder Button */}
            <button
              onClick={() => handleViewChange('teamBuilder')}
              className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${currentView === 'teamBuilder'
                ? 'bg-emerald-600 dark:bg-emerald-700 text-white shadow-lg'
                : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              title="Constructor de Equipos"
            >
              <Users size={16} />
              <span className="hidden sm:inline">Equipos</span>
            </button>

            {/* Statistics Button */}
            <button
              onClick={() => handleViewChange('statistics')}
              className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${currentView === 'statistics'
                ? 'bg-red-600 dark:bg-red-700 text-white shadow-lg'
                : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              title="Estadísticas"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span className="hidden sm:inline">Estadísticas</span>
            </button>

            {/* JSON Editor Button - Only show if unlocked */}
            {editorUnlocked && (
              <button
                onClick={() => handleViewChange('jsonEditor')}
                className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${currentView === 'jsonEditor'
                  ? 'bg-purple-600 dark:bg-purple-700 text-white shadow-lg'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                title="Editor JSON"
              >
                <Edit size={16} />
                <span className="hidden sm:inline">Editor</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
              title={darkMode ? "Modo Claro" : "Modo Oscuro"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Konami Code Progress Indicator (for debugging) */}
      {konamiSequence.length > 0 && !editorUnlocked && (
        <div className="fixed bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Código: {konamiSequence.length}/{konamiCode.length}
        </div>
      )}
    </nav>
  );
};

export default Navbar;