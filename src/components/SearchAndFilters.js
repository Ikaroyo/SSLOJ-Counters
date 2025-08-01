import React from "react";
import { Search, Filter, Heart } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row gap-3 max-w-6xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar santos por nombre, título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {/* Clear Filters Button x icon svg */}
        <div className="relative">
          <button
            onClick={clearFilters}
            className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            x
          </button>
        </div>  

        {/* Role Filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer min-w-[120px]"
          >
            <option value="">Todos los Roles</option>
            {Object.entries(roleNames).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>
        
        {/* Element Filter */}
        <div className="relative">
          <select
            value={elementFilter}
            onChange={(e) => setElementFilter(e.target.value)}
            className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer min-w-[120px]"
          >
            <option value="">Todos los Elementos</option>
            {Object.entries(elementNames).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>
        
        {/* Favorites Filter */}
        <div className="relative">
          <button
            onClick={() => setFavoritesFilter(!favoritesFilter)}
            className={`px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors min-w-[120px] ${
              favoritesFilter 
                ? 'bg-pink-100 dark:bg-pink-900/20 border-pink-300 dark:border-pink-600 text-pink-600 dark:text-pink-400' 
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Solo Favoritos
          </button>
        </div>
      </div>
      
      {/* Icon Filters */}
      <div className="mt-4 flex flex-col gap-4 max-w-6xl mx-auto">
        {/* Role Icons Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filtrar por Rol:</h3>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <button
              onClick={() => setRoleFilter("")}
              className={`p-2 rounded-lg border-2 transition-all ${
                roleFilter === "" 
                  ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg shadow-yellow-400/50" 
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              title="Todos los Roles"
            >
              <img
                src="/images/ui/All.png"
                alt="Todos los Roles"
                className="w-8 h-8"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = "w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-400 rounded flex items-center justify-center text-xs font-bold text-gray-700";
                  fallback.textContent = "ALL";
                  e.target.parentNode.appendChild(fallback);
                }}
              />
            </button>
            {Object.entries(roleNames).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setRoleFilter(key)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  roleFilter === key 
                    ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg shadow-yellow-400/50" 
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                title={value}
              >
                <RoleIcon role={parseInt(key)} className="w-8 h-8" />
              </button>
            ))}
          </div>
        </div>
        
        {/* Element Icons Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filtrar por Elemento:</h3>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <button
              onClick={() => setElementFilter("")}
              className={`p-2 rounded-lg border-2 transition-all ${
                elementFilter === "" 
                  ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg shadow-yellow-400/50" 
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              title="Todos los Elementos"
            >
              <img
                src="/images/ui/All.png"
                alt="Todos los Elementos"
                className="w-8 h-8"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = "w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-400 rounded flex items-center justify-center text-xs font-bold text-gray-700";
                  fallback.textContent = "ALL";
                  e.target.parentNode.appendChild(fallback);
                }}
              />
            </button>
            {Object.entries(elementNames).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setElementFilter(key)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  elementFilter === key 
                    ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg shadow-yellow-400/50" 
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                title={value}
              >
                <ElementIcon element={parseInt(key)} className="w-8 h-8" />
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
