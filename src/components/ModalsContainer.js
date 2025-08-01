import React from "react";
import { X, Search, Filter } from "lucide-react";
import { getCountersForCharacter } from '../utils/counterLogic';

const ModalsContainer = ({
  showPositionSearch,
  showCounterInfo,
  showCounterModal,
  selectedCharacter,
  searchingPosition,
  characters,
  filteredCharacters,
  searchTerm,
  setSearchTerm,
  roleNames,
  elementNames,
  RoleIcon,
  ElementIcon,
  onClosePositionSearch,
  onCloseCounterInfo,
  onCloseCounterModal,
  onSelectCharacterForPosition,
  onRemoveCounter,
  onAddCounter
}) => {
  return (
    <>
      {/* Position Search Modal */}
      {showPositionSearch && searchingPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                    Seleccionar Personaje para {searchingPosition.isEnemy ? 'Equipo Enemigo' : 'Mi Equipo'}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Posición: {searchingPosition.position === 'front' ? 'frente' : 'atrás'} {searchingPosition.index + (searchingPosition.position === 'front' ? 1 : 3)}
                  </p>
                </div>
                <button
                  onClick={onClosePositionSearch}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Search Bar in Modal */}
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar personajes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {filteredCharacters.map((character) => (
                  <div
                    key={character.id}
                    className="cursor-pointer hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 p-3 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg border border-transparent hover:border-blue-200 dark:hover:border-gray-600"
                    onClick={() => onSelectCharacterForPosition(character)}
                  >
                    <div className="relative">
                      <img
                        src={character.image}
                        alt={character.name}
                        className="w-full h-16 sm:h-20 object-cover rounded-lg mb-2 shadow-sm"
                      />
                      <div className="absolute top-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                        {character.position}
                      </div>
                    </div>
                    <p className="text-xs text-center text-gray-800 dark:text-white truncate font-medium">
                      {character.name}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <RoleIcon role={character.role} className="w-3 h-3" />
                      <ElementIcon element={character.element} className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredCharacters.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-2">
                    <Search size={48} className="mx-auto opacity-50" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No se encontraron personajes</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Counter Information Modal */}
      {showCounterInfo && selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {selectedCharacter.name} - Información de Counters
                </h2>
                <button
                  onClick={onCloseCounterInfo}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <div className="flex gap-6 mb-6">
                <img
                  src={selectedCharacter.image}
                  alt={selectedCharacter.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {selectedCharacter.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {selectedCharacter.title}
                  </p>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      Rol: 
                      <RoleIcon role={selectedCharacter.role} />
                      {roleNames[selectedCharacter.role]}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      Elemento: 
                      <ElementIcon element={selectedCharacter.element} />
                      {elementNames[selectedCharacter.element]}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Posición de Counter: <span className="font-semibold">{selectedCharacter.position || 'Cualquiera'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Counters ({getCountersForCharacter(selectedCharacter.id, characters).length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getCountersForCharacter(selectedCharacter.id, characters).map((counter) => (
                  <div
                    key={counter.id}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                  >
                    <img
                      src={counter.image}
                      alt={counter.name}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                    <h5 className="font-semibold text-sm text-gray-800 dark:text-white truncate">
                      {counter.name}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {counter.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <RoleIcon role={counter.role} className="w-3 h-3" />
                      <ElementIcon element={counter.element} className="w-3 h-3" />
                      <span className="text-xs text-gray-500">
                        Counter: {counter.counterPosition}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveCounter(selectedCharacter.id, counter.id)}
                      className="mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Counter Selection Modal */}
      {showCounterModal && selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Agregar Counter para {selectedCharacter.name}
                </h2>
                <button
                  onClick={onCloseCounterModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {characters
                  .filter((char) => char.id !== selectedCharacter.id)
                  .map((character) => (
                    <div key={character.id} className="space-y-2">
                      <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                        <img
                          src={character.image}
                          alt={character.name}
                          className="w-full h-20 object-cover rounded-lg mb-2"
                        />
                        <p className="text-xs text-center text-gray-800 dark:text-white truncate">
                          {character.name}
                        </p>
                        <p className="text-xs text-center text-gray-500 truncate">
                          Pos counter: {character.position}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <RoleIcon role={character.role} className="w-3 h-3" />
                          <ElementIcon element={character.element} className="w-3 h-3" />
                        </div>
                      </div>
                      <select
                        onChange={(e) => {
                          if (e.target.value && !(selectedCharacter.counters || []).find(c => c.id === character.id)) {
                            onAddCounter(selectedCharacter.id, character.id, e.target.value);
                            onCloseCounterModal();
                          }
                        }}
                        className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        defaultValue=""
                      >
                        <option value="">Seleccionar Posición</option>
                        <option value="opposite">Opuesto</option>
                        <option value="front">Frente</option>
                        <option value="back">Atrás</option>
                        <option value="any">Cualquiera</option>
                      </select>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalsContainer;