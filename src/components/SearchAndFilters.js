import React from "react";
import { Search, Filter, Star, X } from "lucide-react";

const SearchAndFilters = ({
  searchTerm,
  setSearchTerm,
  positionFilter,
  setPositionFilter,
  roleFilter,
  setRoleFilter,
  elementFilter,
  setElementFilter,
  favoritesFilter,
  setFavoritesFilter,
  roleNames,
  elementNames,
  RoleIcon,
  ElementIcon,
  filteredCharacters,
  totalCharacters,
  clearFilters
}) => {
  return (
    <div className="mb-6">
      <div className="flex gap-3 max-w-6xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar santos por nombre, título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {(searchTerm || roleFilter || elementFilter || favoritesFilter) && (
            <button
              onClick={clearFilters}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Limpiar filtros"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        {/* Favorites Filter */}
        <div className="relative">
          <button
            onClick={() => setFavoritesFilter(!favoritesFilter)}
            className={`px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors ${
              favoritesFilter 
                ? 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-600 text-yellow-600 dark:text-yellow-400' 
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            title="Solo Favoritos"
          >
            <Star size={20} fill={favoritesFilter ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
      
      {/* Icon Filters */}
      <div className="mt-4 flex flex-col gap-4 max-w-6xl mx-auto">
        {/* Role Icons Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filtrar por Rol:</h3>
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
              <img
                src="/images/ui/All.png"
                alt="Todos los Roles"
                className="w-6 h-6 sm:w-8 sm:h-8 mx-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = "w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-gray-200 to-gray-400 rounded flex items-center justify-center text-xs font-bold text-gray-700 mx-auto";
                  fallback.textContent = "ALL";
                  e.target.parentNode.appendChild(fallback);
                }}
              />
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
        
        {/* Element Icons Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filtrar por Elemento:</h3>
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
              <img
                src="/images/ui/All.png"
                alt="Todos los Elementos"
                className="w-6 h-6 sm:w-8 sm:h-8 mx-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = "w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-gray-200 to-gray-400 rounded flex items-center justify-center text-xs font-bold text-gray-700 mx-auto";
                  fallback.textContent = "ALL";
                  e.target.parentNode.appendChild(fallback);
                }}
              />
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
      
      {(searchTerm || roleFilter || elementFilter || favoritesFilter) && (
        <div className="text-center mt-4 flex flex-wrap gap-2 justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {filteredCharacters.length} de {totalCharacters} santos
          </p>
          <button
            onClick={clearFilters}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;
