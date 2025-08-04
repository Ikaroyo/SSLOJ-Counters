import React, { useState, useEffect } from "react";
import { Sun, Moon, Edit, Users } from "lucide-react";
import saintsData from './data/saints.json';
import TeamBuilder from './components/TeamBuilder';
import CharacterGrid from './components/CharacterGrid';
import SearchAndFilters from './components/SearchAndFilters';
import JsonEditor from './components/JsonEditor';
import ModalsContainer from './components/ModalsContainer';
import Navbar from './components/Navbar';
import Statistics from './components/Statistics';

const App = () => {
  // Estado con valores iniciales desde localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ssloj-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  // Add current view state
  const [currentView, setCurrentView] = useState('home'); // 'home', 'teamBuilder', 'jsonEditor'

  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [elementFilter, setElementFilter] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [showCounterInfo, setShowCounterInfo] = useState(false);
  const [showPositionSearch, setShowPositionSearch] = useState(false);
  const [searchingPosition, setSearchingPosition] = useState(null);

  // Estados de equipos con valores iniciales desde localStorage
  const [team, setTeam] = useState(() => {
    const saved = localStorage.getItem('ssloj-my-team');
    return saved ? JSON.parse(saved) : { front: [null, null], back: [null, null, null] };
  });

  const [enemyTeam, setEnemyTeam] = useState(() => {
    const saved = localStorage.getItem('ssloj-enemy-team');
    return saved ? JSON.parse(saved) : { front: [null, null], back: [null, null, null] };
  });

  const [draggedCharacter, setDraggedCharacter] = useState(null);
  const [favoritesFilter, setFavoritesFilter] = useState(false);

  // Constants
  const roleNames = {
    1: "Protector",
    2: "Guerrero",
    3: "Habilidad",
    4: "Asesino",
    5: "Asistente"
  };

  const elementNames = {
    1: "Agua",
    2: "Fuego",
    3: "Aire",
    4: "Tierra",
    5: "Luz",
    6: "Oscuridad"
  };

  const roleColors = {
    1: "bg-red-500",
    2: "bg-orange-500",
    3: "bg-blue-500",
    4: "bg-purple-500",
    5: "bg-green-500",
  };

  const elementColors = {
    1: "bg-gray-400",
    2: "bg-yellow-500",
    3: "bg-cyan-500",
    4: "bg-pink-500",
    5: "bg-indigo-500",
    6: "bg-gray-800",
  };

  // Effects
  useEffect(() => {
    localStorage.setItem('ssloj-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('ssloj-my-team', JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem('ssloj-enemy-team', JSON.stringify(enemyTeam));
  }, [enemyTeam]);

  useEffect(() => {
    const loadCharacters = () => {
      const savedCharacters = localStorage.getItem('ssloj-characters');
      let charactersToLoad = saintsData;

      if (savedCharacters) {
        try {
          const parsed = JSON.parse(savedCharacters);
          const savedIds = new Set(parsed.map(char => char.id));
          const newCharacters = saintsData.filter(char => !savedIds.has(char.id));

          if (newCharacters.length > 0) {
            charactersToLoad = [...parsed, ...newCharacters];
          } else {
            charactersToLoad = parsed;
          }
        } catch (error) {
          console.error('Error parsing saved characters:', error);
          charactersToLoad = saintsData;
        }
      }

      setCharacters(charactersToLoad);
      setFilteredCharacters(charactersToLoad);
    };

    loadCharacters();
  }, []);

  useEffect(() => {
    if (characters.length > 0) {
      localStorage.setItem('ssloj-characters', JSON.stringify(characters));
    }
  }, [characters]);

  // Reconstruir equipos cuando los personajes se cargan
  useEffect(() => {
    if (characters.length > 0) {
      const reconstructTeamFromStorage = (savedTeam) => {
        if (!savedTeam) return { front: [null, null], back: [null, null, null] };

        return {
          front: savedTeam.front.map(char =>
            char ? characters.find(c => c.id === char.id) || null : null
          ),
          back: savedTeam.back.map(char =>
            char ? characters.find(c => c.id === char.id) || null : null
          )
        };
      };

      const savedMyTeam = localStorage.getItem('ssloj-my-team');
      const savedEnemyTeam = localStorage.getItem('ssloj-enemy-team');

      if (savedMyTeam) {
        try {
          const parsedTeam = JSON.parse(savedMyTeam);
          const reconstructedTeam = reconstructTeamFromStorage(parsedTeam);
          setTeam(reconstructedTeam);
        } catch (error) {
          console.error('Error reconstructing my team:', error);
        }
      }

      if (savedEnemyTeam) {
        try {
          const parsedEnemyTeam = JSON.parse(savedEnemyTeam);
          const reconstructedEnemyTeam = reconstructTeamFromStorage(parsedEnemyTeam);
          setEnemyTeam(reconstructedEnemyTeam);
        } catch (error) {
          console.error('Error reconstructing enemy team:', error);
        }
      }
    }
  }, [characters]);

  // Filter characters based on search term
  useEffect(() => {
    let filtered = characters;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(character =>
        character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        character.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "") {
      filtered = filtered.filter(character => character.role === parseInt(roleFilter));
    }

    if (elementFilter !== "") {
      filtered = filtered.filter(character => character.element === parseInt(elementFilter));
    }

    if (favoritesFilter) {
      filtered = filtered.filter(character => character.isFavorite === true);
    }

    setFilteredCharacters(filtered);
  }, [searchTerm, roleFilter, elementFilter, favoritesFilter, characters]);

  // Icon Components
  const RoleIcon = ({ role, className = "w-4 h-4" }) => (
    <img
      src={`/images/role/${role}.png`}
      alt={roleNames[role]}
      className={className}
      title={roleNames[role]}
      onError={(e) => {
        e.target.style.display = 'none';
        const fallback = e.target.nextSibling;
        if (fallback) fallback.style.display = 'block';
      }}
    />
  );

  const ElementIcon = ({ element, className = "w-4 h-4" }) => (
    <img
      src={`/images/element/${element}.png`}
      alt={elementNames[element]}
      className={className}
      title={elementNames[element]}
      onError={(e) => {
        e.target.style.display = 'none';
        const fallback = e.target.nextSibling;
        if (fallback) fallback.style.display = 'block';
      }}
    />
  );

  // Functions
  const addCounter = (characterId, counterId, counterPosition = "opposite") => {
    setCharacters((chars) =>
      chars.map((char) =>
        char.id === characterId
          ? {
            ...char,
            counters: [...(char.counters || []), { id: counterId, position: counterPosition }]
          }
          : char
      )
    );
  };

  const removeCounter = (characterId, counterId) => {
    setCharacters((chars) =>
      chars.map((char) =>
        char.id === characterId
          ? {
            ...char,
            counters: (char.counters || []).filter((counter) => counter.id !== counterId),
          }
          : char
      )
    );
  };

  const addToTeam = (character, position, index = null) => {
    const isInTeam = [...team.front, ...team.back].some(char => char && char.id === character.id);
    if (isInTeam) {
      alert('Este santo ya está en tu equipo');
      return;
    }

    if (position === "front" && index !== null && index < 2) {
      const newFront = [...team.front];
      newFront[index] = character;
      setTeam((prev) => ({ ...prev, front: newFront }));
    } else if (position === "back" && index !== null && index < 3) {
      const newBack = [...team.back];
      newBack[index] = character;
      setTeam((prev) => ({ ...prev, back: newBack }));
    }
  };

  const removeFromTeam = (position, index) => {
    if (position === "front") {
      const newFront = [...team.front];
      newFront[index] = null;
      setTeam((prev) => ({ ...prev, front: newFront }));
    } else if (position === "back") {
      const newBack = [...team.back];
      newBack[index] = null;
      setTeam((prev) => ({ ...prev, back: newBack }));
    }
  };

  const addToEnemyTeam = (character, position, index = null) => {
    const isInEnemyTeam = [...enemyTeam.front, ...enemyTeam.back].some(char => char && char.id === character.id);
    if (isInEnemyTeam) {
      alert('Este santo ya está en el equipo enemigo');
      return;
    }

    if (position === "front" && index !== null && index < 2) {
      const newFront = [...enemyTeam.front];
      newFront[index] = character;
      setEnemyTeam((prev) => ({ ...prev, front: newFront }));
    } else if (position === "back" && index !== null && index < 3) {
      const newBack = [...enemyTeam.back];
      newBack[index] = character;
      setEnemyTeam((prev) => ({ ...prev, back: newBack }));
    }
  };

  const removeFromEnemyTeam = (position, index) => {
    if (position === "front") {
      const newFront = [...enemyTeam.front];
      newFront[index] = null;
      setEnemyTeam((prev) => ({ ...prev, front: newFront }));
    } else if (position === "back") {
      const newBack = [...enemyTeam.back];
      newBack[index] = null;
      setEnemyTeam((prev) => ({ ...prev, back: newBack }));
    }
  };

  const handleRemoveFromTeam = (position, index, isEnemy) => {
    if (isEnemy) {
      removeFromEnemyTeam(position, index);
    } else {
      removeFromTeam(position, index);
    }
  };

  const openPositionSearch = (position, index, isEnemy = false) => {
    setSearchingPosition({ position, index, isEnemy });
    setShowPositionSearch(true);
    setSearchTerm("");
  };

  const selectCharacterForPosition = (character) => {
    if (searchingPosition) {
      const { position, index, isEnemy } = searchingPosition;
      if (isEnemy) {
        addToEnemyTeam(character, position, index);
      } else {
        addToTeam(character, position, index);
      }
      setShowPositionSearch(false);
      setSearchingPosition(null);
    }
  };

  const handleDragStart = (e, character) => {
    setDraggedCharacter(character);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, position, index, isEnemy = false) => {
    e.preventDefault();
    if (draggedCharacter) {
      if (isEnemy) {
        addToEnemyTeam(draggedCharacter, position, index);
      } else {
        addToTeam(draggedCharacter, position, index);
      }
      setDraggedCharacter(null);
    }
  };

  const downloadJsonFile = () => {
    const dataStr = JSON.stringify(characters, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'saints.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const toggleFavorite = (characterId) => {
    setCharacters(chars =>
      chars.map(char =>
        char.id === characterId
          ? { ...char, isFavorite: !char.isFavorite }
          : char
      )
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setElementFilter("");
    setFavoritesFilter(false);
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${darkMode ? "dark bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
        }`}
    >
      {/* Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Home View - Character Management */}
        {currentView === 'home' && (
          <>
            {/* Enhanced Search Bar */}
            <SearchAndFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              elementFilter={elementFilter}
              setElementFilter={setElementFilter}
              favoritesFilter={favoritesFilter}
              setFavoritesFilter={setFavoritesFilter}
              roleNames={roleNames}
              elementNames={elementNames}
              RoleIcon={RoleIcon}
              ElementIcon={ElementIcon}
              filteredCharacters={filteredCharacters}
              totalCharacters={characters.length}
              clearFilters={clearFilters}
            />

            {/* Characters Grid */}
            <CharacterGrid
              characters={filteredCharacters}
              allCharacters={characters}
              roleNames={roleNames}
              elementNames={elementNames}
              roleColors={roleColors}
              elementColors={elementColors}
              showTeamBuilder={false}
              showPositionSearch={showPositionSearch}
              onDragStart={handleDragStart}
              onSelectForPosition={selectCharacterForPosition}
              onAddToTeam={addToTeam}
              onAddToEnemyTeam={addToEnemyTeam}
              onToggleFavorite={toggleFavorite}
              onShowCounterInfo={(char) => {
                setSelectedCharacter(char);
                setShowCounterInfo(true);
              }}
              RoleIcon={RoleIcon}
              ElementIcon={ElementIcon}
            />
          </>
        )}

        {/* Team Builder View */}
        {currentView === 'teamBuilder' && (
          <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700">
            <TeamBuilder
              team={team}
              enemyTeam={enemyTeam}
              characters={characters}
              filteredCharacters={filteredCharacters}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              elementFilter={elementFilter}
              setElementFilter={setElementFilter}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleRemoveFromTeam={handleRemoveFromTeam}
              openPositionSearch={openPositionSearch}
              setTeam={setTeam}
              setEnemyTeam={setEnemyTeam}
              roleNames={roleNames}
              elementNames={elementNames}
              RoleIcon={RoleIcon}
              ElementIcon={ElementIcon}
            />
          </div>
        )}

        {/* Statistics View */}
        {currentView === 'statistics' && (
          <div className="mb-8 p-4 sm:p-6 bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700">
            <Statistics
              characters={characters}
              roleNames={roleNames}
              elementNames={elementNames}
            />
          </div>
        )}

        {/* JSON Editor View */}
        {currentView === 'jsonEditor' && localStorage.getItem('ssloj-editor-unlocked') === 'true' && (
          <div className="mb-8 p-4 sm:p-6 bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700">
            <JsonEditor
              characters={characters}
              setCharacters={setCharacters}
              roleNames={roleNames}
              elementNames={elementNames}
              downloadJsonFile={downloadJsonFile}
            />
          </div>
        )}

        {/* Modals Container */}
        <ModalsContainer
          showPositionSearch={showPositionSearch}
          showCounterInfo={showCounterInfo}
          showCounterModal={showCounterModal}
          selectedCharacter={selectedCharacter}
          searchingPosition={searchingPosition}
          characters={characters}
          filteredCharacters={filteredCharacters}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleNames={roleNames}
          elementNames={elementNames}
          RoleIcon={RoleIcon}
          ElementIcon={ElementIcon}
          onClosePositionSearch={() => {
            setShowPositionSearch(false);
            setSearchingPosition(null);
          }}
          onCloseCounterInfo={() => setShowCounterInfo(false)}
          onCloseCounterModal={() => setShowCounterModal(false)}
          onSelectCharacterForPosition={selectCharacterForPosition}
          onRemoveCounter={removeCounter}
          onAddCounter={addCounter}
        />
      </div>
    </div>
  );
};

export default App;