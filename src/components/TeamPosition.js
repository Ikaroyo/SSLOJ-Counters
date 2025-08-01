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
  onDragStart
}) => {
  const sizeClasses = {
    small: "w-16 h-16",
    normal: "w-20 h-20",
    large: "w-24 h-24"
  };
  
  const colors = isEnemy 
    ? (position === 'front' ? 'border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/30' : 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/30')
    : (position === 'front' ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/30' : 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30');

  const hoverColors = isEnemy 
    ? (position === 'front' ? 'hover:border-orange-400 hover:bg-orange-100 dark:hover:bg-orange-800/50' : 'hover:border-purple-400 hover:bg-purple-100 dark:hover:bg-purple-800/50')
    : (position === 'front' ? 'hover:border-red-400 hover:bg-red-100 dark:hover:bg-red-800/50' : 'hover:border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50');

  return (
    <div
      className={`${sizeClasses[size]} border-2 border-dashed ${colors} ${hoverColors} rounded-xl flex items-center justify-center relative transition-all duration-200 hover:scale-105 cursor-pointer shadow-sm hover:shadow-md backdrop-blur-sm`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, position, index, isEnemy)}
      onClick={() => !character && onOpenSearch(position, index, isEnemy)}
    >
      {character ? (
        <div 
          className="relative group w-full h-full"
          draggable
          onDragStart={(e) => onDragStart && onDragStart(e, character)}
        >
          <img
            src={character.image}
            alt={character.name}
            className="w-full h-full object-cover rounded-xl transition-all duration-200 group-hover:scale-95"
          />
          
          {/* Drag Indicator */}
          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white rounded p-1">
            <ArrowRightLeft size={8} />
          </div>
          
          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(position, index, isEnemy);
            }}
            className="absolute -top-1 -right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110"
          >
            <X size={8} />
          </button>
          
          {/* Character Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-2 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="truncate font-medium">{character.name}</p>
          </div>
        </div>
      ) : (
        <div className="text-center group">
          <Plus size={16} className="mx-auto mb-2 opacity-50 group-hover:opacity-80 transition-opacity" />
          <span className={`text-xs font-medium ${isEnemy ? (position === 'front' ? 'text-orange-500 dark:text-orange-400' : 'text-purple-500 dark:text-purple-400') : (position === 'front' ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400')}`}>
            {position === 'front' ? `F${index + 1}` : `B${index + 3}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default TeamPosition;
