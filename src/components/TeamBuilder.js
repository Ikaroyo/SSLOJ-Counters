import React from "react";
import { Shield, Sword, Target, Save, Search, Filter, Image as ImageIcon, X, Star } from "lucide-react";
import TeamPosition from './TeamPosition';
import { getCounterSuggestions } from '../utils/counterLogic';
import { exportTeamAsImage } from '../utils/imageExport';

const TeamBuilder = ({
  team,
  enemyTeam,
  characters,
  filteredCharacters,
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  elementFilter,
  setElementFilter,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleRemoveFromTeam,
  openPositionSearch,
  setTeam,
  setEnemyTeam,
  roleNames,
  elementNames,
  RoleIcon,
  ElementIcon
}) => {
  // Add mobile selection state
  const [selectedCharacter, setSelectedCharacter] = React.useState(null);
  const [selectedFromTeam, setSelectedFromTeam] = React.useState(null);

  // Handle character movement between positions
  const handleCharacterMove = (character, fromPosition, fromIndex, fromIsEnemy, toPosition, toIndex, toIsEnemy) => {
    // Don't allow moving between teams (enemy/ally)
    if (fromIsEnemy !== toIsEnemy) {
      return;
    }

    // Don't allow moving to the same position
    if (fromPosition === toPosition && fromIndex === toIndex && fromIsEnemy === toIsEnemy) {
      return;
    }

    const targetTeam = toIsEnemy ? enemyTeam : team;
    const setTargetTeam = toIsEnemy ? setEnemyTeam : setTeam;

    // Get the current character at target position
    const currentCharInTarget = toPosition === 'front' ? targetTeam.front[toIndex] : targetTeam.back[toIndex];

    // Create new team state
    const newTeam = { ...targetTeam };

    // If there's a character at the target position, swap them
    if (currentCharInTarget) {
      // Place the displaced character in the source position
      if (fromPosition === 'front') {
        newTeam.front = [...newTeam.front];
        newTeam.front[fromIndex] = currentCharInTarget;
      } else {
        newTeam.back = [...newTeam.back];
        newTeam.back[fromIndex] = currentCharInTarget;
      }
    } else {
      // Clear the source position
      if (fromPosition === 'front') {
        newTeam.front = [...newTeam.front];
        newTeam.front[fromIndex] = null;
      } else {
        newTeam.back = [...newTeam.back];
        newTeam.back[fromIndex] = null;
      }
    }

    // Place the moving character in target position
    if (toPosition === 'front') {
      newTeam.front = [...newTeam.front];
      newTeam.front[toIndex] = character;
    } else {
      newTeam.back = [...newTeam.back];
      newTeam.back[toIndex] = character;
    }

    // Update the team state
    setTargetTeam(newTeam);
  };

  const handleExportTeams = async () => {
    try {
      await exportTeamAsImage(team, enemyTeam, roleNames, elementNames);
    } catch (error) {
      alert(`Error exporting teams: ${error.message}`);
    }
  };

  // Get counter suggestions for enemy team
  const getCounterSuggestions = () => {
    const suggestions = [];
    const enemyCharacters = [...enemyTeam.front, ...enemyTeam.back].filter(Boolean);

    enemyCharacters.forEach((enemyChar, enemyIndex) => {
      if (enemyChar.counters && enemyChar.counters.length > 0) {
        enemyChar.counters.forEach(counter => {
          const counterChar = characters.find(c => c.id === counter.id);
          if (counterChar) {
            suggestions.push({
              enemy: enemyChar,
              counter: counterChar,
              position: counter.position,
              enemyPosition: enemyIndex < 2 ? 'front' : 'back',
              enemyIndex: enemyIndex < 2 ? enemyIndex : enemyIndex - 2
            });
          }
        });
      }
    });

    return suggestions;
  };

  const counterSuggestions = getCounterSuggestions();

  // Check if a counter suggestion has been fulfilled
  const isCounterFulfilled = (suggestion) => {
    const myTeamCharacters = [...team.front, ...team.back].filter(Boolean);

    // First check if the counter character is in the team
    const counterInTeam = myTeamCharacters.find(char => char.id === suggestion.counter.id);
    if (!counterInTeam) return false;

    // Now check if it's in the correct position
    const { position: requiredPos, enemyPosition, enemyIndex } = suggestion;

    // Find the actual position of the counter character in our team
    let actualPosition = null;
    let actualIndex = -1;

    // Check front line
    team.front.forEach((char, index) => {
      if (char && char.id === suggestion.counter.id) {
        actualPosition = 'front';
        actualIndex = index;
      }
    });

    // Check back line if not found in front
    if (actualPosition === null) {
      team.back.forEach((char, index) => {
        if (char && char.id === suggestion.counter.id) {
          actualPosition = 'back';
          actualIndex = index;
        }
      });
    }

    // Validate position based on requirement
    switch (requiredPos) {
      case 'front':
        return actualPosition === 'front';
      case 'back':
        return actualPosition === 'back';
      case 'opposite':
        // Must be in the same position as the enemy character
        if (enemyPosition === 'front') {
          return actualPosition === 'front' && actualIndex === enemyIndex;
        } else {
          return actualPosition === 'back' && actualIndex === enemyIndex;
        }
      case 'any':
        return true; // Any position is acceptable
      default:
        return false;
    }
  };

  // Get fulfilled and unfulfilled suggestions
  const fulfilledSuggestions = counterSuggestions.filter(isCounterFulfilled);
  const unfulfilledSuggestions = counterSuggestions.filter(s => !isCounterFulfilled(s));

  // Check if a position should be highlighted for counter placement (only for unfulfilled)
  const shouldHighlightPosition = (position, index, isEnemy) => {
    if (isEnemy) return false; // Don't highlight enemy positions

    // Check if this position already has a character
    const currentTeam = team;
    const hasCharacter = position === 'front' ? currentTeam.front[index] : currentTeam.back[index];
    if (hasCharacter) return false; // Don't highlight if position is occupied

    return unfulfilledSuggestions.some(suggestion => {
      const { position: suggestedPos, enemyPosition, enemyIndex } = suggestion;

      switch (suggestedPos) {
        case 'front':
          return position === 'front';
        case 'back':
          return position === 'back';
        case 'opposite':
          // Opposite position logic
          if (enemyPosition === 'front') {
            return position === 'front' && index === enemyIndex;
          } else {
            return position === 'back' && index === enemyIndex;
          }
        case 'any':
          return true;
        default:
          return false;
      }
    });
  };

  // Get suggested counters for a specific position (only unfulfilled)
  const getSuggestedCountersForPosition = (position, index, isEnemy) => {
    if (isEnemy) return [];

    // Check if this position already has a character
    const currentTeam = team;
    const hasCharacter = position === 'front' ? currentTeam.front[index] : currentTeam.back[index];

    // If position has a character, check if it fulfills any counter suggestion
    if (hasCharacter) {
      const characterId = hasCharacter.id;
      return counterSuggestions.filter(suggestion => {
        // Only show if this character is the recommended counter AND it's in the wrong position
        if (suggestion.counter.id !== characterId) return false;

        // Check if this suggestion is actually fulfilled (character in correct position)
        return !isCounterFulfilled(suggestion);
      });
    }

    return unfulfilledSuggestions.filter(suggestion => {
      const { position: suggestedPos, enemyPosition, enemyIndex } = suggestion;

      switch (suggestedPos) {
        case 'front':
          return position === 'front';
        case 'back':
          return position === 'back';
        case 'opposite':
          if (enemyPosition === 'front') {
            return position === 'front' && index === enemyIndex;
          } else {
            return position === 'back' && index === enemyIndex;
          }
        case 'any':
          return true;
        default:
          return false;
      }
    });
  };

  // Handle mobile character selection
  const handleCharacterSelect = (character, fromPosition = null, fromIndex = null, fromIsEnemy = null) => {
    if (selectedCharacter && selectedCharacter.id === character.id) {
      // Deselect if clicking the same character
      setSelectedCharacter(null);
      setSelectedFromTeam(null);
    } else {
      // Select new character
      setSelectedCharacter(character);
      setSelectedFromTeam(fromPosition ? { position: fromPosition, index: fromIndex, isEnemy: fromIsEnemy } : null);
    }
  };

  // Handle mobile position placement
  const handlePositionSelect = (position, index, isEnemy) => {
    if (!selectedCharacter) return;

    // Check if position is empty
    const targetTeam = isEnemy ? enemyTeam : team;
    const hasCharacter = position === 'front' ? targetTeam.front[index] : targetTeam.back[index];

    if (hasCharacter) {
      alert('Esta posición ya está ocupada. Selecciona una posición vacía.');
      return;
    }

    if (selectedFromTeam) {
      // Moving from team position
      handleCharacterMove(
        selectedCharacter,
        selectedFromTeam.position,
        selectedFromTeam.index,
        selectedFromTeam.isEnemy,
        position,
        index,
        isEnemy
      );
    } else {
      // Adding from character grid
      if (isEnemy) {
        addToEnemyTeam(selectedCharacter, position, index);
      } else {
        addToTeam(selectedCharacter, position, index);
      }
    }

    // Clear selection
    setSelectedCharacter(null);
    setSelectedFromTeam(null);
  };

  // Add these helper functions if they don't exist
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

  // Check if a character at a specific position is correctly fulfilling a counter
  const isCharacterCorrectlyPositioned = (position, index, isEnemy) => {
    if (isEnemy) return false; // Enemy team doesn't fulfill counters

    const currentTeam = team;
    const hasCharacter = position === 'front' ? currentTeam.front[index] : currentTeam.back[index];
    if (!hasCharacter) return false;

    // Check if this character fulfills any counter suggestion
    return fulfilledSuggestions.some(suggestion =>
      suggestion.counter.id === hasCharacter.id
    );
  };

  return (
    <div className="mb-8 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      {/* Add CSS for glowing animations */}
      <style jsx global>{`
        @keyframes glow-green-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(34, 197, 94, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
            border-color: rgb(34 197 94) !important;
          }
          50% {
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
            border-color: rgb(34 197 94) !important;
          }
        }
        
        @keyframes glow-orange-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(251, 146, 60, 0.6), 0 0 40px rgba(251, 146, 60, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
            border-color: rgb(251 146 60) !important;
          }
          50% {
            box-shadow: 0 0 30px rgba(251, 146, 60, 0.8), 0 0 60px rgba(251, 146, 60, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
            border-color: rgb(251 146 60) !important;
          }
        }
        
        .glow-green {
          animation: glow-green-pulse 2s ease-in-out infinite !important;
          border-width: 2px !important;
          border-style: dashed !important;
        }
        
        .glow-orange {
          animation: glow-orange-pulse 2s ease-in-out infinite !important;
          border-width: 2px !important;
          border-style: dashed !important;
        }

        /* Dark mode variants */
        .dark .glow-green {
          animation: glow-green-pulse 2s ease-in-out infinite !important;
        }
        
        .dark .glow-orange {
          animation: glow-orange-pulse 2s ease-in-out infinite !important;
        }
      `}</style>

      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white text-center">
          Formación de Equipos
        </h2>
        <button
          onClick={handleExportTeams}
          className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm flex items-center gap-1"
        >
          <ImageIcon size={16} />
          <span className="hidden sm:inline">Exportar como Imagen</span>
        </button>
      </div>

      {/* Characters Grid - Show first when team building */}
      <div className="mb-8">
        <div className="flex gap-3 max-w-6xl mx-auto mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar santos para agregar al equipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {(searchTerm || roleFilter || elementFilter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("");
                  setElementFilter("");
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Limpiar filtros"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Icons */}
        <div className="flex flex-col gap-4 max-w-6xl mx-auto mb-4">
          {/* Role Filters */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filtrar por Rol:</h5>
            <div className="flex gap-1 justify-between sm:gap-2 sm:justify-center sm:flex-wrap">
              <button
                onClick={() => setRoleFilter("")}
                className={`flex-1 sm:flex-none p-2 rounded-lg border-2 transition-all ${roleFilter === ""
                  ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg shadow-yellow-400/50"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                title="Todos los Roles"
              >
                <img src="/images/ui/All.png" alt="Todos" className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
              </button>
              {Object.entries(roleNames).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setRoleFilter(key)}
                  className={`flex-1 sm:flex-none p-2 rounded-lg border-2 transition-all ${roleFilter === key
                    ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg shadow-yellow-400/50"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                  title={value}
                >
                  <RoleIcon role={parseInt(key)} className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* Element Filters */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filtrar por Elemento:</h5>
            <div className="flex gap-1 justify-between sm:gap-2 sm:justify-center sm:flex-wrap">
              <button
                onClick={() => setElementFilter("")}
                className={`flex-1 sm:flex-none p-2 rounded-lg border-2 transition-all ${elementFilter === ""
                  ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg shadow-yellow-400/50"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                title="Todos los Elementos"
              >
                <img src="/images/ui/All.png" alt="Todos" className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
              </button>
              {Object.entries(elementNames).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setElementFilter(key)}
                  className={`flex-1 sm:flex-none p-2 rounded-lg border-2 transition-all ${elementFilter === key
                    ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg shadow-yellow-400/50"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                  title={value}
                >
                  <ElementIcon element={parseInt(key)} className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Characters Grid for Team Building */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          {filteredCharacters.slice(0, 50).map((character) => (
            <div
              key={character.id}
              className={`relative group cursor-pointer bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 ${selectedCharacter?.id === character.id
                ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-300 dark:ring-blue-600'
                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
              draggable
              onDragStart={(e) => handleDragStart(e, character)}
              onClick={() => handleCharacterSelect(character)}
              title={`${character.name} - ${character.title}`}
            >
              {/* Selection indicator */}
              {selectedCharacter?.id === character.id && (
                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center z-20">
                  <div className="bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                    SELECCIONADO
                  </div>
                </div>
              )}

              {/* Character Image */}
              <div className="relative aspect-square">
                <img
                  src={character.image}
                  alt={character.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Dark gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Role and Element badges with dark mask */}
                <div className="absolute top-1 right-1 flex flex-col gap-1">
                  <div className="relative">
                    <div className="absolute inset-0 bg-black/60 rounded-full" />
                    <div className="relative p-1 rounded-full">
                      <RoleIcon role={character.role} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-black/60 rounded-full" />
                    <div className="relative p-1 rounded-full">
                      <ElementIcon element={character.element} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>

                {/* Counter indicator */}
                {character.counters && character.counters.length > 0 && (
                  <div className="absolute top-1 left-1 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg border border-white/20">
                    {character.counters.length}
                  </div>
                )}

                {/* Favorite indicator */}
                {character.isFavorite && (
                  <div className="absolute top-1 left-1 bg-yellow-500 text-white rounded-full p-1 shadow-lg border border-yellow-300">
                    <Star size={8} fill="currentColor" />
                  </div>
                )}

                {/* Character info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h6 className="font-bold text-xs truncate">{character.name}</h6>
                  <p className="text-xs opacity-90 truncate">{character.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs bg-white/20 px-1 rounded">
                      {roleNames[character.role]}
                    </span>
                    <span className="text-xs bg-white/20 px-1 rounded">
                      {elementNames[character.element]}
                    </span>
                  </div>
                  {character.counters && character.counters.length > 0 && (
                    <p className="text-xs text-emerald-300 mt-1">
                      {character.counters.length} counter{character.counters.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Drag indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-500/20 backdrop-blur-sm">
                  <div className="bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                    Arrastrar
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile instructions */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          <span className="hidden sm:inline">
            Arrastra los personajes a las posiciones del equipo
          </span>
          <span className="sm:hidden">
            {selectedCharacter
              ? `Personaje seleccionado: ${selectedCharacter.name}. Toca una posición vacía para colocarlo.`
              : 'Toca un personaje para seleccionarlo, luego toca una posición vacía.'
            }
          </span>
        </div>

        {/* Clear selection button for mobile */}
        {selectedCharacter && (
          <div className="sm:hidden text-center mt-2">
            <button
              onClick={() => {
                setSelectedCharacter(null);
                setSelectedFromTeam(null);
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded text-xs"
            >
              Cancelar Selección
            </button>
          </div>
        )}
      </div>

      {/* Mobile Team Layout */}
      <div className="block sm:hidden space-y-6">
        {/* My Team Mobile */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-center text-blue-600 dark:text-blue-400 mb-4">
            Mi Equipo
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-center mb-2 flex items-center justify-center gap-1">
                <Shield size={14} /> Línea Trasera
              </h4>
              <div className="flex justify-center gap-2">
                {team.back.map((char, index) => (
                  <TeamPosition
                    key={`my-back-${index}`}
                    character={char}
                    position="back"
                    index={index}
                    size="small"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onRemove={handleRemoveFromTeam}
                    onOpenSearch={openPositionSearch}
                    onDragStart={handleDragStart}
                    onMove={handleCharacterMove}
                    shouldHighlight={shouldHighlightPosition('back', index, false)}
                    suggestedCounters={getSuggestedCountersForPosition('back', index, false)}
                    selectedCharacter={selectedCharacter}
                    onCharacterSelect={handleCharacterSelect}
                    onPositionSelect={handlePositionSelect}
                    isCorrectlyPositioned={isCharacterCorrectlyPositioned('back', index, false)}
                  />
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-center mb-2 flex items-center justify-center gap-1">
                <Sword size={14} /> Línea Delantera
              </h4>
              <div className="flex justify-center gap-2">
                {team.front.map((char, index) => (
                  <TeamPosition
                    key={`my-front-${index}`}
                    character={char}
                    position="front"
                    index={index}
                    size="small"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onRemove={handleRemoveFromTeam}
                    onOpenSearch={openPositionSearch}
                    onDragStart={handleDragStart}
                    onMove={handleCharacterMove}
                    shouldHighlight={shouldHighlightPosition('front', index, false)}
                    suggestedCounters={getSuggestedCountersForPosition('front', index, false)}
                    selectedCharacter={selectedCharacter}
                    onCharacterSelect={handleCharacterSelect}
                    onPositionSelect={handlePositionSelect}
                    isCorrectlyPositioned={isCharacterCorrectlyPositioned('front', index, false)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enemy Team Mobile */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-center text-red-600 dark:text-red-400 mb-4">
            Equipo Enemigo
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-center mb-2 flex items-center justify-center gap-1">
                <Sword size={14} /> Línea Delantera
              </h4>
              <div className="flex justify-center gap-2">
                {enemyTeam.front.map((char, index) => (
                  <TeamPosition
                    key={`enemy-front-${index}`}
                    character={char}
                    position="front"
                    index={index}
                    isEnemy={true}
                    size="small"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onRemove={handleRemoveFromTeam}
                    onOpenSearch={openPositionSearch}
                    onDragStart={handleDragStart}
                    onMove={handleCharacterMove}
                    selectedCharacter={selectedCharacter}
                    onCharacterSelect={handleCharacterSelect}
                    onPositionSelect={handlePositionSelect}
                  />
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-center mb-2 flex items-center justify-center gap-1">
                <Shield size={14} /> Línea Trasera
              </h4>
              <div className="flex justify-center gap-2">
                {enemyTeam.back.map((char, index) => (
                  <TeamPosition
                    key={`enemy-back-${index}`}
                    character={char}
                    position="back"
                    index={index}
                    isEnemy={true}
                    size="small"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onRemove={handleRemoveFromTeam}
                    onOpenSearch={openPositionSearch}
                    onDragStart={handleDragStart}
                    onMove={handleCharacterMove}
                    selectedCharacter={selectedCharacter}
                    onCharacterSelect={handleCharacterSelect}
                    onPositionSelect={handlePositionSelect}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Team Layout */}
      <div className="hidden sm:grid grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* My Team - Left Side */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center text-blue-600 dark:text-blue-400 mb-4">
            Mi Equipo
          </h3>

          <div className="flex gap-4 justify-center">
            {/* Back Line - Left Column */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-center text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                <Shield size={16} />
                Atrás
              </h4>
              {team.back.map((char, index) => (
                <TeamPosition
                  key={`desktop-my-back-${index}`}
                  character={char}
                  position="back"
                  index={index}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onRemove={handleRemoveFromTeam}
                  onOpenSearch={openPositionSearch}
                  onDragStart={handleDragStart}
                  onMove={handleCharacterMove}
                  shouldHighlight={shouldHighlightPosition('back', index, false)}
                  suggestedCounters={getSuggestedCountersForPosition('back', index, false)}
                  selectedCharacter={selectedCharacter}
                  onCharacterSelect={handleCharacterSelect}
                  onPositionSelect={handlePositionSelect}
                  isCorrectlyPositioned={isCharacterCorrectlyPositioned('back', index, false)}
                />
              ))}
            </div>

            {/* Front Line - Right Column */}
            <div className="space-y-3 flex flex-col justify-center">
              <h4 className="text-sm font-semibold text-center text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                <Sword size={16} />
                Frente
              </h4>
              {team.front.map((char, index) => (
                <TeamPosition
                  key={`desktop-my-front-${index}`}
                  character={char}
                  position="front"
                  index={index}
                  size="large"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onRemove={handleRemoveFromTeam}
                  onOpenSearch={openPositionSearch}
                  onDragStart={handleDragStart}
                  onMove={handleCharacterMove}
                  shouldHighlight={shouldHighlightPosition('front', index, false)}
                  suggestedCounters={getSuggestedCountersForPosition('front', index, false)}
                  selectedCharacter={selectedCharacter}
                  onCharacterSelect={handleCharacterSelect}
                  onPositionSelect={handlePositionSelect}
                  isCorrectlyPositioned={isCharacterCorrectlyPositioned('front', index, false)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Enemy Team - Right Side */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center text-red-600 dark:text-red-400 mb-4">
            Equipo Enemigo
          </h3>

          <div className="flex gap-4 justify-center">
            {/* Enemy Front Line - Left Column */}
            <div className="space-y-3 flex flex-col justify-center">
              <h4 className="text-sm font-semibold text-center text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                <Sword size={16} />
                Frente
              </h4>
              {enemyTeam.front.map((char, index) => (
                <TeamPosition
                  key={`desktop-enemy-front-${index}`}
                  character={char}
                  position="front"
                  index={index}
                  isEnemy={true}
                  size="large"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onRemove={handleRemoveFromTeam}
                  onOpenSearch={openPositionSearch}
                  onDragStart={handleDragStart}
                  onMove={handleCharacterMove}
                  selectedCharacter={selectedCharacter}
                  onCharacterSelect={handleCharacterSelect}
                  onPositionSelect={handlePositionSelect}
                />
              ))}
            </div>

            {/* Enemy Back Line - Right Column */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-center text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                <Shield size={16} />
                Atrás
              </h4>
              {enemyTeam.back.map((char, index) => (
                <TeamPosition
                  key={`desktop-enemy-back-${index}`}
                  character={char}
                  position="back"
                  index={index}
                  isEnemy={true}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onRemove={handleRemoveFromTeam}
                  onOpenSearch={openPositionSearch}
                  onDragStart={handleDragStart}
                  onMove={handleCharacterMove}
                  selectedCharacter={selectedCharacter}
                  onCharacterSelect={handleCharacterSelect}
                  onPositionSelect={handlePositionSelect}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Counter Suggestions */}
      <div className="mt-6 sm:mt-8">
        <h4 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2 justify-center">
          <Target size={24} />
          Sugerencias de Counters
        </h4>

        {/* Counter Strategy Section */}
        {counterSuggestions.length > 0 && (
          <div className="mb-6 space-y-4">
            {/* Fulfilled Suggestions */}
            {fulfilledSuggestions.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <h5 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Estrategias Completadas ({fulfilledSuggestions.length})
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {fulfilledSuggestions.map((suggestion, index) => (
                    <div key={`fulfilled-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-300 dark:border-green-600 relative">
                      <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={suggestion.enemy.image}
                          alt={suggestion.enemy.name}
                          className="w-8 h-8 rounded object-cover border-2 border-red-300"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">vs</span>
                        <img
                          src={suggestion.counter.image}
                          alt={suggestion.counter.name}
                          className="w-8 h-8 rounded object-cover border-2 border-green-300"
                        />
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>{suggestion.enemy.name}</strong> → <strong className="text-green-600 dark:text-green-400">{suggestion.counter.name} ✓</strong>
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold">
                        ¡Completado!
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unfulfilled Suggestions */}
            {unfulfilledSuggestions.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                <h5 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                  <Target size={20} />
                  Estrategias Pendientes ({unfulfilledSuggestions.length})
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {unfulfilledSuggestions.map((suggestion, index) => (
                    <div key={`unfulfilled-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-yellow-300 dark:border-yellow-600">
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={suggestion.enemy.image}
                          alt={suggestion.enemy.name}
                          className="w-8 h-8 rounded object-cover border-2 border-red-300"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">vs</span>
                        <img
                          src={suggestion.counter.image}
                          alt={suggestion.counter.name}
                          className="w-8 h-8 rounded object-cover border-2 border-orange-300"
                        />
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>{suggestion.enemy.name}</strong> → usar <strong>{suggestion.counter.name}</strong>
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Posición: {
                          suggestion.position === 'front' ? 'Línea Delantera' :
                            suggestion.position === 'back' ? 'Línea Trasera' :
                              suggestion.position === 'opposite' ? 'Posición Opuesta' :
                                'Cualquier Posición'
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Summary */}
            {counterSuggestions.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Progreso de Estrategia
                  </h6>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {fulfilledSuggestions.length}/{counterSuggestions.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${counterSuggestions.length > 0 ? (fulfilledSuggestions.length / counterSuggestions.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {fulfilledSuggestions.length === counterSuggestions.length && counterSuggestions.length > 0
                    ? '¡Todas las estrategias completadas!'
                    : `${counterSuggestions.length - fulfilledSuggestions.length} estrategia(s) pendiente(s)`
                  }
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Team Counters */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h5 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4 text-center">
              Counters de Mi Equipo
            </h5>
            <div className="space-y-3">
              {[...team.front, ...team.back].filter(Boolean).map((character, index) => (
                <div key={`my-counter-${character.id}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={character.image}
                      alt={character.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h6 className="font-semibold text-sm text-gray-800 dark:text-white">{character.name}</h6>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {character.counters?.length || 0} counters disponibles
                      </p>
                    </div>
                  </div>

                  {character.counters && character.counters.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {character.counters.slice(0, 6).map((counterData, counterIndex) => {
                        const counter = characters.find(c => c.id === counterData.id);
                        return counter ? (
                          <div key={`counter-${counterData.id}-${counterIndex}`} className="relative group">
                            <img
                              src={counter.image}
                              alt={counter.name}
                              className="w-8 h-8 rounded object-cover border-2 border-white dark:border-gray-600 hover:scale-110 transition-transform"
                              title={`${counter.name} (${counterData.position})`}
                            />
                            <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-xs px-1 rounded text-center min-w-[12px] h-3 flex items-center justify-center leading-none">
                              {counterData.position.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        ) : null;
                      })}
                      {character.counters.length > 6 && (
                        <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                          +{character.counters.length - 6}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">Sin counters configurados</p>
                  )}
                </div>
              ))}

              {[...team.front, ...team.back].filter(Boolean).length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <p>Agrega personajes a tu equipo para ver sus counters</p>
                </div>
              )}
            </div>
          </div>

          {/* Enemy Team Counters */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <h5 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 text-center">
              Counters del Equipo Enemigo
            </h5>
            <div className="space-y-3">
              {[...enemyTeam.front, ...enemyTeam.back].filter(Boolean).map((character, index) => (
                <div key={`enemy-counter-${character.id}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-red-200 dark:border-red-700">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={character.image}
                      alt={character.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h6 className="font-semibold text-sm text-gray-800 dark:text-white">{character.name}</h6>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {character.counters?.length || 0} counters disponibles
                      </p>
                    </div>
                  </div>

                  {character.counters && character.counters.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {character.counters.slice(0, 6).map((counterData, counterIndex) => {
                        const counter = characters.find(c => c.id === counterData.id);
                        return counter ? (
                          <div key={`enemy-counter-${counterData.id}-${counterIndex}`} className="relative group">
                            <img
                              src={counter.image}
                              alt={counter.name}
                              className="w-8 h-8 rounded object-cover border-2 border-white dark:border-gray-600 hover:scale-110 transition-transform"
                              title={`${counter.name} (${counterData.position})`}
                            />
                            <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-xs px-1 rounded text-center min-w-[12px] h-3 flex items-center justify-center leading-none">
                              {counterData.position.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        ) : null;
                      })}
                      {character.counters.length > 6 && (
                        <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                          +{character.counters.length - 6}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">Sin counters configurados</p>
                  )}
                </div>
              ))}

              {[...enemyTeam.front, ...enemyTeam.back].filter(Boolean).length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <p>Agrega personajes al equipo enemigo para ver sus counters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clear Teams Button */}
      <div className="mt-6 text-center">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
          <button
            onClick={handleExportTeams}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center gap-1"
          >
            <ImageIcon size={16} />
            Exportar Equipos como Imagen
          </button>

          <button
            onClick={() => {
              setTeam({ front: [null, null], back: [null, null, null] });
              localStorage.removeItem('ssloj-my-team');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Limpiar Mi Equipo
          </button>

          <button
            onClick={() => {
              setEnemyTeam({ front: [null, null], back: [null, null, null] });
              localStorage.removeItem('ssloj-enemy-team');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Limpiar Equipo Enemigo
          </button>
          <button
            onClick={() => {
              if (window.confirm('¿Estás seguro de que quieres limpiar todas las formaciones guardadas?')) {
                setTeam({ front: [null, null], back: [null, null, null] });
                setEnemyTeam({ front: [null, null], back: [null, null, null] });
                localStorage.removeItem('ssloj-my-team');
                localStorage.removeItem('ssloj-enemy-team');
              }
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Limpiar Todo
          </button>
        </div>

        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <Save size={12} />
            Las formaciones se guardan automáticamente
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamBuilder;