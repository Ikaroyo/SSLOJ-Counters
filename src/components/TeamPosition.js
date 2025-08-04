import React from "react";
import { X, Plus, ArrowRightLeft } from "lucide-react";

const TeamPosition = ({
  character,
  position,
  index,
  isEnemy = false,
  size = "normal",
  onDragOver,
  onDrop,
  onRemove,
  onOpenSearch,
  onDragStart,
  onMove,
  shouldHighlight = false,
  suggestedCounters = [],
  selectedCharacter = null,
  onCharacterSelect = null,
  onPositionSelect = null,
  isCorrectlyPositioned = false
}) => {
  const [isTouchDragging, setIsTouchDragging] = React.useState(false);

  const sizeClasses = {
    small: "w-16 h-16",
    normal: "w-20 h-20",
    large: "w-28 h-28"
  };

  const colors = isEnemy
    ? (position === 'front' ? 'border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/30' : 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/30')
    : shouldHighlight
      ? 'border-yellow-400 dark:border-yellow-500 bg-yellow-100 dark:bg-yellow-900/40 animate-pulse'
      : (position === 'front' ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/30' : 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30');

  const hoverColors = isEnemy
    ? (position === 'front' ? 'hover:border-orange-400 hover:bg-orange-100 dark:hover:bg-orange-800/50' : 'hover:border-purple-400 hover:bg-purple-100 dark:hover:bg-purple-800/50')
    : shouldHighlight
      ? 'hover:border-yellow-500 hover:bg-yellow-200 dark:hover:bg-yellow-800/60'
      : (position === 'front' ? 'hover:border-red-400 hover:bg-red-100 dark:hover:bg-red-800/50' : 'hover:border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50');

  // Create tooltip text for suggested counters
  const getTooltipText = () => {
    if (!shouldHighlight || suggestedCounters.length === 0) {
      return `${position === 'front' ? `F${index + 1}` : `B${index + 3}`}`;
    }

    const counterNames = suggestedCounters.map(s => {
      const weight = s.weight || 1;
      const weightText = weight !== 1 ? ` (${weight}x)` : '';
      return `${s.counter.name}${weightText}`;
    }).join(', ');
    return `Sugerido: ${counterNames}`;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (onDragOver) onDragOver(e);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dragDataText = e.dataTransfer.getData('text/plain');

    // Check if it's JSON data (character movement) or just a character drag
    try {
      const dragData = JSON.parse(dragDataText);

      if (dragData.type === 'character-move') {
        // Handle moving existing character
        if (onMove) {
          onMove(dragData.character, dragData.fromPosition, dragData.fromIndex, dragData.fromIsEnemy, position, index, isEnemy);
        }
      } else {
        // Handle other JSON data
        if (onDrop) onDrop(e, position, index, isEnemy);
      }
    } catch (error) {
      // Not JSON data, handle as regular character drag from grid
      if (onDrop) onDrop(e, position, index, isEnemy);
    }
  };

  const handleDragStart = (e, char) => {
    const dragData = {
      type: 'character-move',
      character: char,
      fromPosition: position,
      fromIndex: index,
      fromIsEnemy: isEnemy
    };
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    if (onDragStart) onDragStart(e, char);
  };

  const handleTouchStart = (e) => {
    if (character) {
      setIsTouchDragging(true);
      // Store touch data for mobile drag
      const touch = e.touches[0];
      e.target.setAttribute('data-touch-start-x', touch.clientX);
      e.target.setAttribute('data-touch-start-y', touch.clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (isTouchDragging && character) {
      e.preventDefault();
      const touch = e.touches[0];
      const startX = parseFloat(e.target.getAttribute('data-touch-start-x'));
      const startY = parseFloat(e.target.getAttribute('data-touch-start-y'));

      // If moved enough, consider it a drag
      const deltaX = Math.abs(touch.clientX - startX);
      const deltaY = Math.abs(touch.clientY - startY);

      if (deltaX > 10 || deltaY > 10) {
        // Visual feedback for mobile drag
        e.target.style.transform = `translate(${touch.clientX - startX}px, ${touch.clientY - startY}px) scale(0.9)`;
        e.target.style.zIndex = '1000';
        e.target.style.opacity = '0.8';
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (isTouchDragging && character) {
      setIsTouchDragging(false);

      // Reset visual styles
      e.target.style.transform = '';
      e.target.style.zIndex = '';
      e.target.style.opacity = '';

      // Find element under touch point
      const touch = e.changedTouches[0];
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);

      if (elementBelow) {
        const dropTarget = elementBelow.closest('[data-team-position]');
        if (dropTarget && onMove) {
          const targetPosition = dropTarget.getAttribute('data-position');
          const targetIndex = parseInt(dropTarget.getAttribute('data-index'));
          const targetIsEnemy = dropTarget.getAttribute('data-is-enemy') === 'true';

          onMove(character, position, index, isEnemy, targetPosition, targetIndex, targetIsEnemy);
        }
      }
    }
  };

  const handleClick = () => {
    if (character && onCharacterSelect) {
      // Character exists - select it for mobile
      onCharacterSelect(character, position, index, isEnemy);
    } else if (!character && selectedCharacter && onPositionSelect) {
      // Empty position and character selected - place character
      onPositionSelect(position, index, isEnemy);
    } else if (!character && onOpenSearch) {
      // Empty position, no character selected - open search
      onOpenSearch(position, index, isEnemy);
    }
  };

  // Check if this position can receive the selected character
  const canReceiveSelected = selectedCharacter && !character && onPositionSelect;

  // Check if this character fulfills a counter recommendation
  const isCounterCharacter = character && suggestedCounters.some(s => s.counter.id === character.id);

  // Check if this character is a counter but in wrong position
  // suggestedCounters array contains only unfulfilled suggestions (wrong position)
  const isWrongPositionCounter = character && suggestedCounters.length > 0 &&
    suggestedCounters.some(s => s.counter.id === character.id);

  // Use the prop passed from parent to determine if correctly positioned
  const isCorrectlyPositionedCounter = character && isCorrectlyPositioned;

  // Create dynamic className for glowing effects
  const getGlowClass = () => {
    if (isCorrectlyPositionedCounter) {
      return 'glow-green';
    }
    if (isWrongPositionCounter) {
      return 'glow-orange';
    }
    return '';
  };

  return (
    <div
      className={`${sizeClasses[size]} border-2 border-dashed ${colors} ${hoverColors} ${canReceiveSelected ? 'ring-2 ring-green-400 dark:ring-green-500' : ''
        } ${isCorrectlyPositionedCounter ? 'ring-2 ring-green-500 dark:ring-green-400' : ''
        } ${isWrongPositionCounter ? 'ring-2 ring-orange-500 dark:ring-orange-400' : ''
        } ${getGlowClass()} rounded-xl flex items-center justify-center relative transition-all duration-200 hover:scale-105 cursor-pointer shadow-sm dark:shadow-slate-900/20 hover:shadow-md dark:hover:shadow-slate-900/40 backdrop-blur-sm`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      title={getTooltipText()}
      data-team-position="true"
      data-position={position}
      data-index={index}
      data-is-enemy={isEnemy}
    >
      {/* Counter fulfillment indicator - only show if correctly positioned */}
      {character && isCorrectlyPositionedCounter && (
        <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full text-center min-w-[20px] h-5 flex items-center justify-center font-bold z-10 shadow-lg shadow-green-500/50 animate-bounce">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Wrong position indicator - only show if character is counter but in wrong position */}
      {character && isWrongPositionCounter && (
        <div className="absolute -top-2 -left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full text-center min-w-[20px] h-5 flex items-center justify-center font-bold z-10 shadow-lg shadow-orange-500/50 animate-bounce">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Mobile placement indicator */}
      {canReceiveSelected && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full text-center min-w-[20px] h-5 flex items-center justify-center font-bold animate-bounce z-10">
          +
        </div>
      )}

      {/* Counter suggestion indicator */}
      {shouldHighlight && suggestedCounters.length > 0 && !character && (
        <div className="absolute -top-4 -right-4 bg-yellow-500 text-white text-sm px-3 py-2 rounded-full text-center min-w-[36px] h-9 flex items-center justify-center font-bold animate-bounce z-10 shadow-lg shadow-yellow-500/50">
          !
        </div>
      )}

      {character ? (
        <div
          className={`relative group w-full h-full ${selectedCharacter?.id === character.id ? 'ring-2 ring-blue-400 rounded-xl' : ''
            }`}
          draggable
          onDragStart={(e) => handleDragStart(e, character)}
        >
          {/* Selection indicator */}
          {selectedCharacter?.id === character.id && (
            <div className="absolute inset-0 bg-blue-500/30 rounded-xl flex items-center justify-center z-20">
              <div className="bg-blue-600 text-white px-1 py-0.5 rounded text-xs font-bold">
                SEL
              </div>
            </div>
          )}

          {/* Counter fulfillment overlay - only if correctly positioned */}
          {isCorrectlyPositionedCounter && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-l from-green-500/95 to-emerald-500/25 text-white text-sm px-2 py-1 rounded-t-xl shadow-lg z-40">
              <p className="text-center font-bold animate-pulse leading-tight">¡Counter activo!</p>
            </div>
          )}

          {/* Wrong position overlay - only if in wrong position */}
          {isWrongPositionCounter && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-l from-orange-500/95 to-red-500/25 text-white text-sm px-2 py-1 rounded-t-xl shadow-lg z-40">
              <p className="text-center font-bold animate-pulse leading-tight">¡Posición incorrecta!</p>
            </div>
          )}

          <img
            src={character.image}
            alt={character.name}
            className="w-full h-full object-cover object-top rounded-xl transition-all duration-200 group-hover:scale-95 relative z-10"
          />

          {/* Drag Indicator */}
          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white rounded p-1 z-30">
            <ArrowRightLeft size={8} />
          </div>

          {/* Remove Button - positioned to avoid conflicts */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(position, index, isEnemy);
            }}
            className="absolute -top-1 -right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110 z-50"
          >
            <X size={8} />
          </button>

          {/* Character Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent text-white text-sm p-2 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity z-30">
            <p className="truncate font-bold leading-tight">{character.name}</p>
          </div>

          {/* Counter suggestion overlay - only show if no character */}
          {shouldHighlight && suggestedCounters.length > 0 && (
            <div className="absolute top-0 left-0 right-0 bg-yellow-500/95 text-white text-sm px-2 py-2 rounded-t-xl shadow-lg z-40">
              <p className="text-center font-bold animate-pulse leading-tight">¡Sugerido aquí!</p>
            </div>
          )}

          {/* Enhanced SS Rank Badge - Only show if rank is SS */}
          {character && character.rank === "SS" && (
            <div className="absolute bottom-0.5 right-0.5 transform hover:scale-110 transition-all duration-200 z-40">
              <img
                src="/images/ui/ss.png"
                alt="SS Rank"
                className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-lg hover:drop-shadow-xl transition-all duration-200"
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 3px rgba(255, 255, 255, 0.6))',
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center group">
          <Plus size={size === 'large' ? 28 : size === 'normal' ? 24 : 20} className="mx-auto mb-2 opacity-50 group-hover:opacity-80 transition-opacity" />
          <span className={`${size === 'large' ? 'text-base' : size === 'normal' ? 'text-sm' : 'text-xs'} font-bold ${canReceiveSelected
            ? 'text-green-600 dark:text-green-400'
            : shouldHighlight
              ? 'text-yellow-600 dark:text-yellow-400'
              : isEnemy
                ? (position === 'front' ? 'text-orange-500 dark:text-orange-400' : 'text-purple-500 dark:text-purple-400')
                : (position === 'front' ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400')
            }`}>
            {position === 'front' ? `F${index + 1}` : `B${index + 3}`}
          </span>
          {canReceiveSelected && (
            <div className="mt-1">
              <span className={`${size === 'large' ? 'text-sm' : 'text-xs'} text-green-600 dark:text-green-400 font-bold leading-tight`}>
                ¡Colocar aquí!
              </span>
            </div>
          )}
          {shouldHighlight && suggestedCounters.length > 0 && !canReceiveSelected && (
            <div className="mt-2">
              <span className={`${size === 'large' ? 'text-sm' : 'text-xs'} text-yellow-600 dark:text-yellow-400 font-bold bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-lg border border-yellow-300 dark:border-yellow-600 leading-tight`}>
                ¡Counter!
                {suggestedCounters[0] && suggestedCounters[0].weight && suggestedCounters[0].weight !== 1 && (
                  <span className={`ml-1 px-1 rounded text-xs ${
                    suggestedCounters[0].weight >= 2 ? 'bg-green-500 text-white' :
                    suggestedCounters[0].weight >= 1.5 ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {suggestedCounters[0].weight}x
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamPosition;