import React, { useState, useRef } from "react";
import { Plus, X, Edit, Download, Save, Upload, FileSpreadsheet, Search, Target } from "lucide-react";
import { exportToExcel, importFromExcel } from '../utils/excelUtils';

const JsonEditor = ({
  characters,
  setCharacters,
  roleNames,
  elementNames,
  downloadJsonFile
}) => {
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [importing, setImporting] = useState(false);
  const [searchTerms, setSearchTerms] = useState({}); // Store search terms for each counter dropdown
  const [showDropdowns, setShowDropdowns] = useState({}); // Control dropdown visibility
  const fileInputRef = useRef(null);

  const startEdit = (character) => {
    setEditingCharacter(character);
    setEditForm({ ...character });

    // Initialize search terms with current counter names
    const initialSearchTerms = {};
    if (character.counters) {
      character.counters.forEach((counter, index) => {
        const counterChar = characters.find(c => c.id === counter.id);
        if (counterChar) {
          initialSearchTerms[index] = `${counterChar.name} - ${counterChar.title}`;
        }
      });
    }
    setSearchTerms(initialSearchTerms);
    setShowDropdowns({});
  };

  const saveEdit = () => {
    setCharacters(chars =>
      chars.map(char =>
        char.id === editingCharacter.id ? editForm : char
      )
    );
    setEditingCharacter(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingCharacter(null);
    setEditForm({});
    setSearchTerms({});
    setShowDropdowns({});
  };

  const deleteCharacter = (characterId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este personaje?')) {
      setCharacters(chars => chars.filter(char => char.id !== characterId));
    }
  };

  const addNewCharacter = () => {
    const newId = Math.max(...characters.map(c => parseInt(c.id))) + 1;
    const newCharacter = {
      id: newId.toString(),
      name: "Nuevo Santo",
      title: "Título",
      image: "https://via.placeholder.com/150",
      role: 1,
      element: 1,
      counters: []
    };
    setCharacters(chars => [...chars, newCharacter]);
    startEdit(newCharacter);
  };

  const addCounterToEdit = () => {
    const newIndex = (editForm.counters || []).length;
    const newCounters = [...(editForm.counters || []), { id: "", position: "opposite" }];
    setEditForm({ ...editForm, counters: newCounters });
    setSearchTerms({ ...searchTerms, [newIndex]: "" });
    setShowDropdowns({ ...showDropdowns, [newIndex]: false });
  };

  const updateCounterInEdit = (index, field, value) => {
    const newCounters = [...(editForm.counters || [])];
    newCounters[index] = { ...newCounters[index], [field]: value };
    setEditForm({ ...editForm, counters: newCounters });

    if (field === 'id') {
      // Update search term when selecting a character
      const selectedChar = characters.find(char => char.id === value);
      if (selectedChar) {
        setSearchTerms({ ...searchTerms, [index]: `${selectedChar.name} - ${selectedChar.title}` });
      }
      setShowDropdowns({ ...showDropdowns, [index]: false });
    }
  };

  const removeCounterFromEdit = (index) => {
    const newCounters = (editForm.counters || []).filter((_, i) => i !== index);
    setEditForm({ ...editForm, counters: newCounters });

    // Clean up search terms and dropdown states
    const newSearchTerms = { ...searchTerms };
    const newShowDropdowns = { ...showDropdowns };
    delete newSearchTerms[index];
    delete newShowDropdowns[index];
    setSearchTerms(newSearchTerms);
    setShowDropdowns(newShowDropdowns);
  };

  const handleSearchChange = (index, value) => {
    setSearchTerms({ ...searchTerms, [index]: value });
    setShowDropdowns({ ...showDropdowns, [index]: true });
  };

  const getFilteredCharacters = (index) => {
    const searchTerm = searchTerms[index] || "";
    return characters
      .filter(char => char.id !== editingCharacter.id)
      .filter(char => {
        if (!searchTerm) return true;
        const fullName = `${char.name} - ${char.title}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      });
  };

  const handleExcelExport = () => {
    try {
      exportToExcel(characters, roleNames, elementNames);
    } catch (error) {
      alert(`Error exporting to Excel: ${error.message}`);
    }
  };

  const handleExcelImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const importedData = await importFromExcel(file, characters, roleNames, elementNames);

      if (window.confirm(`¿Importar ${importedData.length} personajes? Esto reemplazará todos los datos actuales.`)) {
        setCharacters(importedData);
        alert('Datos importados exitosamente desde Excel');
      }
    } catch (error) {
      alert(`Error importing from Excel: ${error.message}`);
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add click outside handler to close dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setShowDropdowns({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Editor JSON - Saints Database
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configura qué personajes usar para contrarrestar a cada enemigo
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={addNewCharacter}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
          >
            <Plus size={16} className="inline mr-1" />
            Nuevo Santo
          </button>

          {/* Excel Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
          >
            <Upload size={16} className="inline mr-1" />
            {importing ? 'Importando...' : 'Importar Excel'}
          </button>

          {/* Excel Export */}
          <button
            onClick={handleExcelExport}
            className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors text-sm"
          >
            <FileSpreadsheet size={16} className="inline mr-1" />
            Exportar Excel
          </button>

          <button
            onClick={downloadJsonFile}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            <Download size={16} className="inline mr-1" />
            Descargar JSON
          </button>

          <button
            onClick={() => {
              if (window.confirm('¿Estás seguro de que quieres restaurar los datos originales? Se perderán todos los counters editados.')) {
                localStorage.removeItem('ssloj-characters');
                localStorage.removeItem('ssloj-my-team');
                localStorage.removeItem('ssloj-enemy-team');
                window.location.reload();
              }
            }}
            className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm"
            title="Restaurar datos originales"
          >
            <X size={16} className="inline mr-1" />
            Restaurar
          </button>
        </div>
      </div>

      {/* Import Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 Instrucciones para Excel:</h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li><strong>Exportar:</strong> Descarga todos los datos en formato Excel para editar fácilmente</li>
          <li><strong>Importar:</strong> Sube un archivo Excel con las columnas: ID, Name, Title, Image, Role, Element, Counter Names, Counter Positions</li>
          <li><strong>Counter Names:</strong> "Seiya; Shiryu; Hyoga" (nombres separados por punto y coma)</li>
          <li><strong>Counter Positions:</strong> "front; back; opposite" (posiciones separadas por punto y coma)</li>
          <li><strong>Nota:</strong> Los nombres y posiciones deben estar en el mismo orden</li>
        </ul>
      </div>

      <div className="max-h-[80vh] overflow-y-auto space-y-2">
        {characters.map((character) => (
          <div key={character.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            {editingCharacter?.id === character.id ? (
              <div className="space-y-6">
                {/* Character Basic Info Section */}
                <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Información del Personaje</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título</label>
                      <input
                        type="text"
                        placeholder="Título"
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL de Imagen</label>
                      <input
                        type="url"
                        placeholder="URL de imagen"
                        value={editForm.image || ''}
                        onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rol</label>
                      <select
                        value={editForm.role || 1}
                        onChange={(e) => setEditForm({ ...editForm, role: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white"
                      >
                        {Object.entries(roleNames).map(([key, value]) => (
                          <option key={key} value={key}>{value}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Elemento</label>
                      <select
                        value={editForm.element || 1}
                        onChange={(e) => setEditForm({ ...editForm, element: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white"
                      >
                        {Object.entries(elementNames).map(([key, value]) => (
                          <option key={key} value={key}>{value}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Counters Section - Enhanced for Desktop */}
                <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Configuración de Counters
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Define qué personajes usar para contrarrestar a este enemigo
                      </p>
                    </div>
                    <button
                      onClick={addCounterToEdit}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                      <Plus size={16} />
                      Agregar Counter
                    </button>
                  </div>

                  {/* Counter List */}
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                    {(editForm.counters || []).length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <Target size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="text-lg font-medium">No hay counters configurados</p>
                        <p className="text-sm">Agrega counters para definir estrategias contra este personaje</p>
                      </div>
                    ) : (
                      (editForm.counters || []).map((counter, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                            {/* Counter Number */}
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>

                            {/* Character Search */}
                            <div className="flex-1 relative">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Personaje Counter
                              </label>
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                  type="text"
                                  placeholder="Buscar personaje..."
                                  value={searchTerms[index] || (counter.id ?
                                    (() => {
                                      const char = characters.find(c => c.id === counter.id);
                                      return char ? `${char.name} - ${char.title}` : '';
                                    })() : ''
                                  )}
                                  onChange={(e) => handleSearchChange(index, e.target.value)}
                                  onFocus={() => setShowDropdowns({ ...showDropdowns, [index]: true })}
                                  className="w-full pl-10 pr-4 py-3 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              {showDropdowns[index] && (
                                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-lg mt-1 max-h-64 overflow-y-auto z-20 shadow-xl">
                                  {getFilteredCharacters(index).length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                      <Search size={20} className="mx-auto mb-2 opacity-50" />
                                      No se encontraron resultados
                                    </div>
                                  ) : (
                                    getFilteredCharacters(index).map(char => (
                                      <div
                                        key={char.id}
                                        onClick={() => updateCounterInEdit(index, 'id', char.id)}
                                        className="px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white flex items-center gap-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                                      >
                                        <img
                                          src={char.image}
                                          alt={char.name}
                                          className="w-8 h-8 rounded object-cover"
                                        />
                                        <div>
                                          <div className="font-medium">{char.name}</div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">{char.title}</div>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Position Selection */}
                            <div className="flex-shrink-0 w-32">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Posición
                              </label>
                              <select
                                value={counter.position || 'opposite'}
                                onChange={(e) => updateCounterInEdit(index, 'position', e.target.value)}
                                className="w-full px-3 py-3 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                title="Dónde colocar este counter en mi alineación"
                              >
                                <option value="opposite">Opuesto</option>
                                <option value="front">Frente</option>
                                <option value="back">Atrás</option>
                                <option value="any">Cualquiera</option>
                              </select>
                            </div>

                            {/* Remove Button */}
                            <div className="flex-shrink-0">
                              <button
                                onClick={() => removeCounterFromEdit(index)}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
                                title="Eliminar counter"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Selected Character Preview */}
                          {counter.id && (() => {
                            const selectedChar = characters.find(c => c.id === counter.id);
                            return selectedChar ? (
                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={selectedChar.image}
                                    alt={selectedChar.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium text-sm text-blue-800 dark:text-blue-200">
                                      {selectedChar.name} - {selectedChar.title}
                                    </div>
                                    <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                      {roleNames[selectedChar.role]} • {elementNames[selectedChar.element]}
                                    </div>
                                  </div>
                                  <div className="text-right text-xs text-blue-600 dark:text-blue-300">
                                    <div className="font-medium">Posición:</div>
                                    <div className="capitalize">
                                      {counter.position === 'any' ? 'Cualquiera' :
                                        counter.position === 'opposite' ? 'Opuesto' :
                                          counter.position === 'front' ? 'Frente' : 'Atrás'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={cancelEdit}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Save size={16} />
                    Guardar Cambios
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-white">
                      {character.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {character.title} | {roleNames[character.role]} | {elementNames[character.element]}
                    </p>
                    <p className="text-xs text-gray-500">
                      Counters: {character.counters?.length || 0} | ID: {character.id}
                    </p>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      Si el enemigo usa este → Yo debo usar: {
                        (character.counters || []).map(c => {
                          const counterChar = characters.find(ch => ch.id === c.id);
                          return counterChar ? `${counterChar.name}(${c.position})` : c.id;
                        }).join(', ') || 'Ninguno'
                      }
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(character)}
                    className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => deleteCharacter(character.id)}
                    className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JsonEditor;