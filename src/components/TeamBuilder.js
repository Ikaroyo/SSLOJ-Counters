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
  const handleExportTeams = async () => {
    try {
      await exportTeamAsImage(team, enemyTeam, roleNames, elementNames);
    } catch (error) {
      alert(`Error exporting teams: ${error.message}`);
    }
  };

  return (
    <div className="mb-8 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
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
                className={`flex-1 sm:flex-none p-2 rounded-lg border-2 transition-all ${
                  roleFilter === "" 
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
                  className={`flex-1 sm:flex-none p-2 rounded-lg border-2 transition-all ${
                    roleFilter === key 
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
                className={`flex-1 sm:flex-none p-2 rounded-lg border-2 transition-all ${
                  elementFilter === "" 
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
                  className={`flex-1 sm:flex-none p-2 rounded-lg border-2 transition-all ${
                    elementFilter === key 
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
              className="relative group cursor-pointer bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 border border-gray-100 dark:border-gray-600"
              draggable
              onDragStart={(e) => handleDragStart(e, character)}
              title={`${character.name} - Counters: ${character.counters?.length || 0}`}
            >
              <img
                src={character.image}
                alt={character.name}
                className="w-full h-12 sm:h-16 object-cover rounded"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="truncate text-center">{character.name}</p>
                <p className="text-center text-xs">Counters: {character.counters?.length || 0}</p>
              </div>
              <div className="absolute top-1 right-1 flex gap-1">
                <RoleIcon role={character.role} className="w-3 h-3" />
                <ElementIcon element={character.element} className="w-3 h-3" />
              </div>
              {/* Counter indicator */}
              {character.counters && character.counters.length > 0 && (
                <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded-full text-center min-w-[16px] h-4 flex items-center justify-center">
                  {character.counters.length}
                </div>
              )}
              {/* Favorite indicator */}
              {character.isFavorite && (
                <div className="absolute top-1 left-1 bg-yellow-400 text-white rounded-full p-0.5">
                  <Star size={8} fill="currentColor" />
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Arrastra los personajes a las posiciones del equipo o usa el botón "Enviar a Equipo"
        </p>
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