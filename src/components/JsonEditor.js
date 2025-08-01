import React, { useState, useRef } from "react";
import { Plus, X, Edit, Download, Save, Upload, FileSpreadsheet } from "lucide-react";
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
  const fileInputRef = useRef(null);

  const startEdit = (character) => {
    setEditingCharacter(character);
    setEditForm({ ...character });
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
    const newCounters = [...(editForm.counters || []), { id: "", position: "opposite" }];
    setEditForm({ ...editForm, counters: newCounters });
  };

  const updateCounterInEdit = (index, field, value) => {
    const newCounters = [...(editForm.counters || [])];
    newCounters[index] = { ...newCounters[index], [field]: value };
    setEditForm({ ...editForm, counters: newCounters });
  };

  const removeCounterFromEdit = (index) => {
    const newCounters = (editForm.counters || []).filter((_, i) => i !== index);
    setEditForm({ ...editForm, counters: newCounters });
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

      <div className="max-h-96 overflow-y-auto space-y-2">
        {characters.map((character) => (
          <div key={character.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            {editingCharacter?.id === character.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="px-2 py-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Título"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="px-2 py-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
                
                <input
                  type="url"
                  placeholder="URL de imagen"
                  value={editForm.image || ''}
                  onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                  className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={editForm.role || 1}
                    onChange={(e) => setEditForm({...editForm, role: parseInt(e.target.value)})}
                    className="px-2 py-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    {Object.entries(roleNames).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                  
                  <select
                    value={editForm.element || 1}
                    onChange={(e) => setEditForm({...editForm, element: parseInt(e.target.value)})}
                    className="px-2 py-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    {Object.entries(elementNames).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                {/* Counters Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Counters (Personajes para contrarrestar a este enemigo)
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Si el enemigo usa este personaje, yo debo usar estos counters
                      </p>
                    </div>
                    <button
                      onClick={addCounterToEdit}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      <Plus size={12} className="inline mr-1" />
                      Add Counter
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {(editForm.counters || []).map((counter, index) => (
                      <div key={index} className="flex gap-2 items-center bg-white dark:bg-gray-600 p-2 rounded">
                        <select
                          value={counter.id || ''}
                          onChange={(e) => updateCounterInEdit(index, 'id', e.target.value)}
                          className="flex-1 px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-500 dark:text-white"
                        >
                          <option value="">Seleccionar Counter</option>
                          {characters
                            .filter(char => char.id !== editingCharacter.id)
                            .map(char => (
                              <option key={char.id} value={char.id}>
                                {char.name}
                              </option>
                            ))}
                        </select>
                        <select
                          value={counter.position || 'opposite'}
                          onChange={(e) => updateCounterInEdit(index, 'position', e.target.value)}
                          className="px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-500 dark:text-white"
                          title="Dónde colocar este counter en mi alineación"
                        >
                          <option value="opposite">Opuesto</option>
                          <option value="front">Frente</option>
                          <option value="back">Atrás</option>
                          <option value="any">Cualquiera</option>
                        </select>
                        <button
                          onClick={() => removeCounterFromEdit(index)}
                          className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    <Save size={14} className="inline mr-1" />
                    Guardar
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancelar
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