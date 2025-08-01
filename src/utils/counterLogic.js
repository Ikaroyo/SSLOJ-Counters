export const getCountersForCharacter = (characterId, characters) => {
  const character = characters.find(c => c.id === characterId);
  if (!character || !character.counters) return [];
  
  return character.counters.map(counterData => {
    const counter = characters.find(c => c.id === counterData.id);
    return counter ? { ...counter, counterPosition: counterData.position } : null;
  }).filter(Boolean);
};

export const getCounterSuggestions = (enemyTeam, characters, myTeam) => {
  const suggestions = { front: [], back: [] };
  
  // Get all characters already in my team to avoid duplicates
  const myTeamCharacters = [
    ...(myTeam?.front || []),
    ...(myTeam?.back || [])
  ].filter(Boolean).map(char => char.id);
  
  // For each enemy in front line, show their counters (who they counter)
  enemyTeam.front?.forEach((enemy, enemyIndex) => {
    if (!enemy || !enemy.counters) return;
    
    // For each counter that this enemy has
    enemy.counters.forEach(counterData => {
      const counterCharacter = characters.find(c => c.id === counterData.id);
      if (!counterCharacter) return;
      if (myTeamCharacters.includes(counterCharacter.id)) return; // Skip if already in my team
      
      // This enemy counters counterCharacter, so suggest placing counterCharacter
      // Check where this counter should be placed based on position
      if (counterData.position === 'back') {
        // Place counter in back line
        if (!suggestions.back.find(s => s.id === counterCharacter.id)) {
          suggestions.back.push({ 
            ...counterCharacter, 
            countersEnemyId: enemy.id, // The enemy that counters this character
            counterPosition: counterData.position,
            enemyPosition: `F${enemyIndex + 1}`,
            suggestedPosition: 'back line',
            relationship: `${enemy.name} counters ${counterCharacter.name}` // For clarity
          });
        }
      } else if (counterData.position === 'opposite') {
        // For "opposite" position, place in same position as enemy (F1->F1, F2->F2)
        if (!suggestions.front.find(s => s.id === counterCharacter.id)) {
          suggestions.front.push({ 
            ...counterCharacter, 
            countersEnemyId: enemy.id,
            counterPosition: counterData.position,
            enemyPosition: `F${enemyIndex + 1}`,
            suggestedPosition: `F${enemyIndex + 1}`, // F1->F1, F2->F2
            relationship: `${enemy.name} counters ${counterCharacter.name}`
          });
        }
      } else if (counterData.position === 'front') {
        // Place counter in front line
        if (!suggestions.front.find(s => s.id === counterCharacter.id)) {
          suggestions.front.push({ 
            ...counterCharacter, 
            countersEnemyId: enemy.id,
            counterPosition: counterData.position,
            enemyPosition: `F${enemyIndex + 1}`,
            suggestedPosition: `F${enemyIndex + 1}`,
            relationship: `${enemy.name} counters ${counterCharacter.name}`
          });
        }
      } else if (counterData.position === 'any') {
        // Character can be placed anywhere, suggest for both
        if (!suggestions.back.find(s => s.id === counterCharacter.id)) {
          suggestions.back.push({ 
            ...counterCharacter, 
            countersEnemyId: enemy.id,
            counterPosition: counterData.position,
            enemyPosition: `F${enemyIndex + 1}`,
            suggestedPosition: 'any position',
            relationship: `${enemy.name} counters ${counterCharacter.name}`
          });
        }
        if (!suggestions.front.find(s => s.id === counterCharacter.id)) {
          suggestions.front.push({ 
            ...counterCharacter, 
            countersEnemyId: enemy.id,
            counterPosition: counterData.position,
            enemyPosition: `F${enemyIndex + 1}`,
            suggestedPosition: 'any position',
            relationship: `${enemy.name} counters ${counterCharacter.name}`
          });
        }
      }
    });
  });

  // For each enemy in back line, show their counters (who they counter)
  enemyTeam.back?.forEach((enemy, enemyIndex) => {
    if (!enemy || !enemy.counters) return;
    
    // For each counter that this enemy has
    enemy.counters.forEach(counterData => {
      const counterCharacter = characters.find(c => c.id === counterData.id);
      if (!counterCharacter) return;
      if (myTeamCharacters.includes(counterCharacter.id)) return; // Skip if already in my team
      
      // This enemy counters counterCharacter, so suggest placing counterCharacter
      // Check where this counter should be placed based on position
      if (counterData.position === 'front') {
        // Place counter in front line
        if (!suggestions.front.find(s => s.id === counterCharacter.id)) {
          suggestions.front.push({ 
            ...counterCharacter, 
            countersEnemyId: enemy.id,
            counterPosition: counterData.position,
            enemyPosition: `B${enemyIndex + 3}`,
            suggestedPosition: 'front line',
            relationship: `${enemy.name} counters ${counterCharacter.name}`
          });
        }
      } else if (counterData.position === 'opposite') {
        // For "opposite" position from back line, place in same position (B3->B3, B4->B4, B5->B5)
        if (!suggestions.back.find(s => s.id === counterCharacter.id)) {
          suggestions.back.push({ 
            ...counterCharacter, 
            countersEnemyId: enemy.id,
            counterPosition: counterData.position,
            enemyPosition: `B${enemyIndex + 3}`,
            suggestedPosition: `B${enemyIndex + 3}`, // B3->B3, B4->B4, B5->B5
            relationship: `${enemy.name} counters ${counterCharacter.name}`
          });
        }
      } else if (counterData.position === 'back') {
        // Place counter in back line (same as enemy)
        if (!suggestions.back.find(s => s.id === counterCharacter.id)) {
          suggestions.back.push({ 
            ...counterCharacter, 
            countersEnemyId: enemy.id,
            counterPosition: counterData.position,
            enemyPosition: `B${enemyIndex + 3}`,
            suggestedPosition: `B${enemyIndex + 3}`,
            relationship: `${enemy.name} counters ${counterCharacter.name}`
          });
        }
      } else if (counterData.position === 'any') {
        // Character can be placed anywhere, suggest for both
        if (!suggestions.back.find(s => s.id === counterCharacter.id)) {
          suggestions.back.push({ 
            ...counterCharacter, 
            countersEnemyId: enemy.id,
            counterPosition: counterData.position,
            enemyPosition: `B${enemyIndex + 3}`,
            suggestedPosition: 'any position',
            relationship: `${enemy.name} counters ${counterCharacter.name}`
          });
        }
        if (!suggestions.front.find(s => s.id === counterCharacter.id)) {
          suggestions.front.push({ 
            ...counterCharacter, 
            countersEnemyId: enemy.id,
            counterPosition: counterData.position,
            enemyPosition: `B${enemyIndex + 3}`,
            suggestedPosition: 'any position',
            relationship: `${enemy.name} counters ${counterCharacter.name}`
          });
        }
      }
    });
  });

  return suggestions;
};
