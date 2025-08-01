import React from "react";
import CharacterCard from './CharacterCard';

const CharacterGrid = ({
  characters,
  allCharacters,
  roleNames,
  elementNames,
  roleColors,
  elementColors,
  showTeamBuilder,
  showPositionSearch,
  onDragStart,
  onSelectForPosition,
  onAddToTeam,
  onAddToEnemyTeam,
  onToggleFavorite,
  onShowCounterInfo,
  RoleIcon,
  ElementIcon
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-4">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          characters={allCharacters}
          roleNames={roleNames}
          elementNames={elementNames}
          roleColors={roleColors}
          elementColors={elementColors}
          showTeamBuilder={showTeamBuilder}
          showPositionSearch={showPositionSearch}
          onDragStart={onDragStart}
          onSelectForPosition={onSelectForPosition}
          onAddToTeam={onAddToTeam}
          onAddToEnemyTeam={onAddToEnemyTeam}
          onToggleFavorite={onToggleFavorite}
          onShowCounterInfo={onShowCounterInfo}
          RoleIcon={RoleIcon}
          ElementIcon={ElementIcon}
        />
      ))}
    </div>
  );
};

export default CharacterGrid;
