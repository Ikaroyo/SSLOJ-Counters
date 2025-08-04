import * as XLSX from 'xlsx';

export const exportToExcel = (characters, roleNames, elementNames) => {
  const data = characters.map(char => {
    const counterNames = (char.counters || []).map(c => {
      const counterChar = characters.find(ch => ch.id === c.id);
      return counterChar ? counterChar.name : '';
    }).join('; ');
    
    const counterPositions = (char.counters || []).map(c => c.position).join('; ');
    const counterWeights = (char.counters || []).map(c => c.weight || 1).join('; ');
    
    return {
      ID: char.id,
      Name: char.name,
      Title: char.title,
      Image: char.image,
      Role: roleNames[char.role],
      Element: elementNames[char.element],
      'Counter Names': counterNames,
      'Counter Positions': counterPositions,
      'Counter Weights': counterWeights
    };
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-size columns
  const colWidths = [
    { wch: 5 },   // ID
    { wch: 20 },  // Name
    { wch: 30 },  // Title
    { wch: 50 },  // Image
    { wch: 12 },  // Role
    { wch: 12 },  // Element
    { wch: 40 },  // Counter Names
    { wch: 30 },  // Counter Positions
    { wch: 15 }   // Counter Weights
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

export const importFromExcel = async (file, existingCharacters, roleNames, elementNames) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Create reverse mappings
        const roleNameToId = Object.fromEntries(
          Object.entries(roleNames).map(([id, name]) => [name, parseInt(id)])
        );
        
        const elementNameToId = Object.fromEntries(
          Object.entries(elementNames).map(([id, name]) => [name, parseInt(id)])
        );
        
        const processedData = jsonData.map(row => {
          // Process counters
          const counterNames = row['Counter Names'] ? row['Counter Names'].split(';').map(s => s.trim()).filter(Boolean) : [];
          const counterPositions = row['Counter Positions'] ? row['Counter Positions'].split(';').map(s => s.trim()).filter(Boolean) : [];
          const counterWeights = row['Counter Weights'] ? row['Counter Weights'].split(';').map(s => parseFloat(s.trim())).filter(w => !isNaN(w)) : [];
          
          const counters = counterNames.map((name, index) => {
            const counterChar = existingCharacters.find(char => 
              char.name.toLowerCase() === name.toLowerCase()
            );
            
            if (counterChar) {
              return {
                id: counterChar.id,
                position: counterPositions[index] || 'opposite',
                weight: counterWeights[index] || 1
              };
            }
            return null;
          }).filter(Boolean);
          
          return {
            id: row.ID?.toString() || Math.random().toString(),
            name: row.Name || 'Unknown',
            title: row.Title || 'Unknown Title',
            image: row.Image || 'https://via.placeholder.com/150',
            role: roleNameToId[row.Role] || 1,
            element: elementNameToId[row.Element] || 1,
            counters: counters
          };
        });
        
        resolve(processedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
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