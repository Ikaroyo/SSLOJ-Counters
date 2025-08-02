import React, { useState } from "react";
import { Eye, Users, Target, Star } from "lucide-react";

const CharacterCard = ({
  character,
  characters,
  roleNames,
  elementNames,
  roleColors,
  elementColors,
  showTeamBuilder,
  showPositionSearch,
  onDragStart,
  onSelectForPosition,
  onShowCounterInfo,
  onAddToTeam,
  onAddToEnemyTeam,
  onToggleFavorite,
  RoleIcon,
  ElementIcon
}) => {
  const [showPositionMenu, setShowPositionMenu] = useState(false);

  const handleSendToPosition = (position, index, isEnemy = false) => {
    if (isEnemy) {
      onAddToEnemyTeam(character, position, index);
    } else {
      onAddToTeam(character, position, index);
    }
    setShowPositionMenu(false);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-102 cursor-move border ${
        character.isFavorite 
          ? 'border-yellow-400 dark:border-yellow-500 shadow-yellow-300/30 dark:shadow-yellow-500/30' 
          : 'border-gray-100 dark:border-gray-700'
      } hover:border-blue-300 dark:hover:border-blue-500 group`}
      draggable={showTeamBuilder}
      onDragStart={(e) => showTeamBuilder && onDragStart(e, character)}
      onClick={() => showPositionSearch && onSelectForPosition(character)}
    >
      {/* Character Image */}
      <div className="relative overflow-hidden">
        <img
          src={character.image}
          alt={character.name}
          className="w-full h-32 sm:h-48 object-cover object-center transition-transform duration-300 group-hover:scale-110"
          style={{ objectPosition: 'center top' }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favorite Badge */}
        {character.isFavorite && (
          <div className="absolute top-2 left-12 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-xl border-2 border-yellow-300 transform transition-all duration-200" 
               style={{ 
                 boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
               }}>
            <Star size={10} className="inline fill-current" />
          </div>
        )}

        {/* Enhanced SS Badge */}
        <div className="absolute top-2 left-2 bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 text-black px-3 py-1 rounded-lg text-xs font-black shadow-xl border-2 border-yellow-200 transform hover:scale-110 transition-all duration-200" 
             style={{ 
               textShadow: '0 1px 2px rgba(0,0,0,0.3)',
               boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4), inset 0 1px 0 rgba(255,255,255,0.5)'
             }}>
          <span className="bg-gradient-to-b from-transparent to-black/10 bg-clip-text">SS</span>
        </div>

        {/* Enhanced Role & Element Indicators with Better Glow */}
        <div className="absolute bottom-2 left-2 flex gap-3">
          <div className="relative">
            <RoleIcon 
              role={character.role} 
              className="w-8 h-8 sm:w-10 sm:h-10 filter brightness-125 contrast-110" 
              style={{ 
                filter: 'drop-shadow(0 0 12px rgba(255, 255, 0, 1)) drop-shadow(0 0 6px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 3px rgba(255, 255, 255, 0.6))',
                transform: 'translateZ(0)'
              }} 
            />
            <div className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-radial from-yellow-300/40 via-yellow-200/20 to-transparent rounded-full blur-lg -z-10 animate-pulse"></div>
            <div className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400/20 rounded-full blur-md -z-20"></div>
          </div>
          <div className="relative">
            <ElementIcon 
              element={character.element} 
              className="w-8 h-8 sm:w-10 sm:h-10 filter brightness-125 contrast-110" 
              style={{ 
                filter: 'drop-shadow(0 0 12px rgba(255, 255, 0, 1)) drop-shadow(0 0 6px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 3px rgba(255, 255, 255, 0.6))',
                transform: 'translateZ(0)'
              }} 
            />
            <div className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-radial from-yellow-300/40 via-yellow-200/20 to-transparent rounded-full blur-lg -z-10 animate-pulse"></div>
            <div className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400/20 rounded-full blur-md -z-20"></div>
          </div>
        </div>

        {/* Quick Actions Overlay */}
        {showTeamBuilder && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white text-center">
              <Users size={20} className="mx-auto mb-1" />
              <p className="text-xs font-medium">Arrastra o haz clic</p>
            </div>
          </div>
        )}
      </div>

      {/* Character Info */}
      <div className="p-3 space-y-3">
        {/* Name and Title with Favorite Button */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-gray-800 dark:text-white truncate">
              {character.name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate hidden sm:block">
              {character.title}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(character.id);
            }}
            className={`ml-2 p-1 rounded-full transition-all duration-200 hover:scale-110 ${
              character.isFavorite
                ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
            }`}
            title={character.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Star size={14} className={character.isFavorite ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Role and Element Labels - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 px-2 py-1 rounded-full text-gray-700 dark:text-gray-300 font-medium">
            {roleNames[character.role]}
          </span>
          <span className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 px-2 py-1 rounded-full text-gray-700 dark:text-gray-300 font-medium">
            {elementNames[character.element]}
          </span>
        </div>

        {/* Counters Display */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
              <Target size={12} />
              Counters: {character.counters?.length || 0}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {character.counters?.slice(0, 4).map((counterData, index) => {
              const counter = characters.find((c) => c.id === counterData.id);
              return counter ? (
                <div key={`${counterData.id}-${index}`} className="relative group/counter">
                  <img
                    src={counter.image}
                    alt={counter.name}
                    className="w-7 h-7 rounded-lg object-cover cursor-pointer hover:scale-125 transition-all duration-200 border-2 border-white dark:border-gray-600 shadow-sm hover:shadow-md"
                    title={`${counter.name} (${counterData.position})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowCounterInfo(character);
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-1 rounded-md font-bold leading-none shadow-sm">
                    {counterData.position.charAt(0).toUpperCase()}
                  </div>
                </div>
              ) : null;
            })}
            {(character.counters?.length || 0) > 4 && (
              <div 
                className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center cursor-pointer hover:scale-125 transition-all duration-200 shadow-sm border-2 border-white dark:border-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowCounterInfo(character);
                }}
              >
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  +{(character.counters?.length || 0) - 4}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {showTeamBuilder && (
            <div className="relative flex-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPositionMenu(!showPositionMenu);
                }}
                className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-1"
              >
                <Users size={12} />
                <span className="hidden sm:inline">Enviar a Equipo</span>
                <span className="sm:hidden">Equipo</span>
              </button>

              {/* Position Menu */}
              {showPositionMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-50 overflow-hidden">
                  <div className="p-2 space-y-1">
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-2 py-1">
                      Mi Equipo
                    </div>
                    <button
                      onClick={() => handleSendToPosition('front', 0)}
                      className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    >
                      F1 - Frente Izquierda
                    </button>
                    <button
                      onClick={() => handleSendToPosition('front', 1)}
                      className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    >
                      F2 - Frente Derecha
                    </button>
                    <button
                      onClick={() => handleSendToPosition('back', 0)}
                      className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    >
                      B3 - Atrás Izquierda
                    </button>
                    <button
                      onClick={() => handleSendToPosition('back', 1)}
                      className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    >
                      B4 - Atrás Centro
                    </button>
                    <button
                      onClick={() => handleSendToPosition('back', 2)}
                      className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    >
                      B5 - Atrás Derecha
                    </button>
                    
                    <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-2 py-1">
                        Equipo Enemigo
                      </div>
                      <button
                        onClick={() => handleSendToPosition('front', 0, true)}
                        className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        F1 - Frente Izquierda
                      </button>
                      <button
                        onClick={() => handleSendToPosition('front', 1, true)}
                        className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        F2 - Frente Derecha
                      </button>
                      <button
                        onClick={() => handleSendToPosition('back', 0, true)}
                        className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        B3 - Atrás Izquierda
                      </button>
                      <button
                        onClick={() => handleSendToPosition('back', 1, true)}
                        className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        B4 - Atrás Centro
                      </button>
                      <button
                        onClick={() => handleSendToPosition('back', 2, true)}
                        className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        B5 - Atrás Derecha
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowCounterInfo(character);
            }}
            className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            title="Ver Counters"
          >
            <Eye size={12} />
          </button>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showPositionMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowPositionMenu(false)}
        />
      )}
    </div>
  );
};

export default CharacterCard;