import * as XLSX from 'xlsx';

export const exportToExcel = (characters, roleNames, elementNames) => {
  // Prepare data for Excel export with separate counter columns
  const exportData = characters.map(character => {
    const counters = character.counters || [];
    
    // Create separate arrays for counter names and positions
    const counterNames = counters.map(counter => {
      const counterChar = characters.find(c => c.id === counter.id);
      return counterChar ? counterChar.name : `ID:${counter.id}`;
    }).join('; ');
    
    const counterPositions = counters.map(counter => counter.position).join('; ');

    return {
      ID: character.id,
      Name: character.name,
      Title: character.title,
      Image: character.image,
      Role: roleNames[character.role] || character.role,
      Element: elementNames[character.element] || character.element,
      'Counter Names': counterNames || '',
      'Counter Positions': counterPositions || ''
    };
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Auto-size columns
  const colWidths = [
    { wch: 5 },   // ID
    { wch: 20 },  // Name
    { wch: 30 },  // Title
    { wch: 50 },  // Image
    { wch: 12 },  // Role
    { wch: 12 },  // Element
    { wch: 40 },  // Counter Names
    { wch: 30 }   // Counter Positions
  ];
  worksheet['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Saints Data");

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `saints_data_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
};

export const importFromExcel = (file, characters, roleNames, elementNames) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Create reverse mapping for roles and elements
        const roleMapping = {};
        const elementMapping = {};
        
        Object.entries(roleNames).forEach(([key, value]) => {
          roleMapping[value.toLowerCase()] = parseInt(key);
        });
        
        Object.entries(elementNames).forEach(([key, value]) => {
          elementMapping[value.toLowerCase()] = parseInt(key);
        });

        // Process imported data
        const processedData = jsonData.map((row, index) => {
          // Parse counters from separate columns
          const counters = [];
          
          // Check for new format with separate columns
          if (row['Counter Names'] && row['Counter Positions']) {
            const counterNames = row['Counter Names'].split(';').map(s => s.trim()).filter(s => s);
            const counterPositions = row['Counter Positions'].split(';').map(s => s.trim()).filter(s => s);
            
            // Match names with positions
            counterNames.forEach((counterName, i) => {
              const position = counterPositions[i] || 'opposite';
              const counterChar = characters.find(c => 
                c.name.toLowerCase() === counterName.toLowerCase()
              );
              if (counterChar) {
                counters.push({
                  id: counterChar.id,
                  position: position
                });
              }
            });
          }
          // Support old format for backward compatibility
          else if (row.Counters && row.Counters !== 'None') {
            const counterStrings = row.Counters.split(';');
            counterStrings.forEach(counterStr => {
              const match = counterStr.trim().match(/^(.+?)\s*\((.+?)\)$/);
              if (match) {
                const [, counterName, position] = match;
                const counterChar = characters.find(c => 
                  c.name.toLowerCase() === counterName.trim().toLowerCase()
                );
                if (counterChar) {
                  counters.push({
                    id: counterChar.id,
                    position: position.trim()
                  });
                }
              }
            });
          }

          // Convert role and element from names back to numbers
          let role = parseInt(row.Role);
          if (isNaN(role) && typeof row.Role === 'string') {
            role = roleMapping[row.Role.toLowerCase()] || 1;
          }

          let element = parseInt(row.Element);
          if (isNaN(element) && typeof row.Element === 'string') {
            element = elementMapping[row.Element.toLowerCase()] || 1;
          }

          return {
            id: row.ID ? String(row.ID) : String(Date.now() + index),
            name: row.Name || `Character ${index + 1}`,
            title: row.Title || '',
            image: row.Image || 'https://via.placeholder.com/150',
            role: role,
            element: element,
            counters: counters
          };
        });

        resolve(processedData);
      } catch (error) {
        reject(new Error(`Error processing Excel file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading Excel file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const exportTeamsToExcel = (team, enemyTeam, characters) => {
  // Prepare team data
  const teamData = [];
  
  // Add my team
  team.front.forEach((char, index) => {
    if (char) {
      teamData.push({
        Team: 'My Team',
        Position: `F${index + 1}`,
        Name: char.name,
        Title: char.title,
        Role: char.role,
        Element: char.element
      });
    }
  });

  team.back.forEach((char, index) => {
    if (char) {
      teamData.push({
        Team: 'My Team',
        Position: `B${index + 3}`,
        Name: char.name,
        Title: char.title,
        Role: char.role,
        Element: char.element
      });
    }
  });

  // Add enemy team
  enemyTeam.front.forEach((char, index) => {
    if (char) {
      teamData.push({
        Team: 'Enemy Team',
        Position: `F${index + 1}`,
        Name: char.name,
        Title: char.title,
        Role: char.role,
        Element: char.element
      });
    }
  });

  enemyTeam.back.forEach((char, index) => {
    if (char) {
      teamData.push({
        Team: 'Enemy Team',
        Position: `B${index + 3}`,
        Name: char.name,
        Title: char.title,
        Role: char.role,
        Element: char.element
      });
    }
  });

  // Create workbook
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(teamData);

  // Auto-size columns
  worksheet['!cols'] = [
    { wch: 12 }, // Team
    { wch: 10 }, // Position
    { wch: 20 }, // Name
    { wch: 30 }, // Title
    { wch: 12 }, // Role
    { wch: 12 }  // Element
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Team Formation");

  // Generate filename
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `team_formation_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
};