export const getCountersForCharacter = (characterId, characters) => {
  const character = characters.find(c => c.id === characterId);
  if (!character || !character.counters) return [];
  
  return character.counters.map(counterData => {
    const counter = characters.find(c => c.id === counterData.id);
    return counter ? { ...counter, counterPosition: counterData.position } : null;
  }).filter(Boolean);
};

const calculateCounterValue = (enemy, counter, position, weight = 1) => {
  let value = 100; // Base value
  
  // Apply weight multiplier - weight represents how effective the counter is
  // Weight 1 = normal effectiveness (100%)
  // Weight 2 = double effectiveness (200%)
  // Weight 0.5 = half effectiveness (50%)
  value *= weight;
  
  // Role matchup bonuses
  const roleMatchup = getRoleMatchupValue(counter.role, enemy.role);
  value += roleMatchup;
  
  // Element advantage (25% damage bonus)
  const elementAdvantage = getElementAdvantage(counter.element, enemy.element);
  value += elementAdvantage;
  
  // Position effectiveness
  const positionValue = getPositionValue(position);
  value += positionValue;
  
  // Enemy rank importance
  if (enemy.rank === 'SS') {
    value += 50; // Higher value for countering SS enemies
  }
  
  return value;
};

export const analyzeCounterEfficiency = (enemyTeam, characters, myTeam) => {
  const enemies = [...(enemyTeam?.front || []), ...(enemyTeam?.back || [])].filter(Boolean);
  const myTeamCharacterIds = [...(myTeam?.front || []), ...(myTeam?.back || [])].filter(Boolean).map(char => char.id);
  
  // Map to store counter effectiveness
  const counterEffectiveness = new Map();
  
  enemies.forEach((enemy, enemyIndex) => {
    if (!enemy || !enemy.counters) return;
    
    const enemyPosition = enemyIndex < 2 ? { line: 'front', index: enemyIndex } : { line: 'back', index: enemyIndex - 2 };
    
    enemy.counters.forEach(counterData => {
      const counter = characters.find(c => c.id === counterData.id);
      if (!counter || myTeamCharacterIds.includes(counter.id)) return;
      
      // Extract weight from counter data, default to 1 if not specified
      const weight = counterData.weight || 1;
      
      if (!counterEffectiveness.has(counter.id)) {
        counterEffectiveness.set(counter.id, {
          character: counter,
          targets: [],
          totalValue: 0,
          versatility: 0,
          priority: 0,
          totalWeight: 0 // Track total weight across all targets
        });
      }
      
      const effectiveness = counterEffectiveness.get(counter.id);
      const counterValue = calculateCounterValue(enemy, counter, counterData.position, weight);
      
      effectiveness.targets.push({
        enemy,
        position: counterData.position,
        enemyPosition,
        value: counterValue,
        weight: weight // Store individual weight for display
      });
      
      effectiveness.totalValue += counterValue;
      effectiveness.totalWeight += weight;
      effectiveness.versatility = effectiveness.targets.length;
    });
  });
  
  // Calculate priority scores (now includes weight consideration)
  counterEffectiveness.forEach((effectiveness, counterId) => {
    const char = effectiveness.character;
    
    // Base priority from total value, versatility, and average weight
    const averageWeight = effectiveness.totalWeight / effectiveness.versatility;
    let priority = effectiveness.totalValue * Math.log(effectiveness.versatility + 1) * averageWeight;
    
    // Bonus for multiple targets (shared counters)
    if (effectiveness.versatility > 1) {
      priority *= 1.5; // 50% bonus for versatility
    }
    
    // Updated role-based bonuses
    switch (char.role) {
      case 1: // Protector
        priority *= 1.2;
        break;
      case 2: // Warrior
        priority *= 1.1;
        break;
      case 3: // Skilled
        priority *= 1.15;
        break;
      case 4: // Assassin
        priority *= 1.3;
        break;
      case 5: // Assist
        priority *= 1.25;
        break;
    }
    
    // Element synergy bonus
    const elementBonus = calculateElementSynergy(char, effectiveness.targets.map(t => t.enemy));
    priority *= (1 + elementBonus);
    
    // SS rank bonus
    if (char.rank === 'SS') {
      priority *= 1.4;
    }
    
    // Favorite bonus
    if (char.isFavorite) {
      priority *= 1.1;
    }
    
    effectiveness.priority = priority;
    effectiveness.averageWeight = averageWeight;
  });
  
  return counterEffectiveness;
};

const getRoleMatchupValue = (counterRole, enemyRole) => {
  // Updated role counter matrix
  const matchups = {
    1: { 2: 20, 4: 30 }, // Protector vs Warrior/Assassin
    2: { 3: 25, 5: 20 }, // Warrior vs Skilled/Assist
    3: { 1: 15, 4: 25 }, // Skilled vs Protector/Assassin
    4: { 2: 30, 5: 35 }, // Assassin vs Warrior/Assist
    5: { 1: 20, 3: 15 }  // Assist vs Protector/Skilled
  };
  
  return matchups[counterRole]?.[enemyRole] || 0;
};

const getElementAdvantage = (counterElement, enemyElement) => {
  // Updated element advantage matrix (25% damage)
  const advantages = {
    1: { 2: 25 }, // Water vs Fire
    2: { 3: 25 }, // Fire vs Air
    3: { 4: 25 }, // Air vs Earth
    4: { 1: 25 }, // Earth vs Water
    5: { 6: 25 }, // Light vs Darkness
    6: { 5: 25 }  // Darkness vs Light
  };
  
  return advantages[counterElement]?.[enemyElement] || 0;
};

const getPositionValue = (position) => {
  switch (position) {
    case 'opposite': return 30; // Most strategic
    case 'front': return 20;
    case 'back': return 15;
    case 'any': return 10; // Flexible but less strategic
    default: return 0;
  }
};

const calculateElementSynergy = (counter, enemies) => {
  let synergy = 0;
  const uniqueElements = new Set(enemies.map(e => e.element));
  
  // Bonus for countering multiple different elements
  synergy += (uniqueElements.size - 1) * 0.1;
  
  return Math.min(synergy, 0.3); // Cap at 30% bonus
};

export const getOptimizedCounterSuggestions = (enemyTeam, characters, myTeam) => {
  const effectiveness = analyzeCounterEfficiency(enemyTeam, characters, myTeam);
  
  // Sort by priority (highest first)
  const sortedCounters = Array.from(effectiveness.values())
    .sort((a, b) => b.priority - a.priority);
  
  const suggestions = {
    highPriority: [], // Multi-target counters
    medium: [], // Single target but high value
    low: [], // Situational
    shared: [] // Counters that hit multiple enemies
  };
  
  sortedCounters.forEach(effectiveness => {
    const suggestion = {
      counter: effectiveness.character,
      targets: effectiveness.targets,
      priority: effectiveness.priority,
      versatility: effectiveness.versatility,
      totalValue: effectiveness.totalValue,
      recommendations: generatePositionRecommendations(effectiveness.targets)
    };
    
    if (effectiveness.versatility > 2) {
      suggestions.highPriority.push(suggestion);
    } else if (effectiveness.versatility > 1) {
      suggestions.shared.push(suggestion);
    } else if (effectiveness.priority > 150) {
      suggestions.medium.push(suggestion);
    } else {
      suggestions.low.push(suggestion);
    }
  });
  
  return suggestions;
};

const generatePositionRecommendations = (targets) => {
  // Analyze the best positions for this counter based on all targets
  const positionScores = {
    'front-0': 0, 'front-1': 0,
    'back-0': 0, 'back-1': 0, 'back-2': 0
  };
  
  targets.forEach(target => {
    const { position, enemyPosition } = target;
    
    switch (position) {
      case 'opposite':
        // Place in exact same position as enemy
        const key = `${enemyPosition.line}-${enemyPosition.index}`;
        positionScores[key] += target.value;
        break;
      case 'front':
        positionScores['front-0'] += target.value * 0.6;
        positionScores['front-1'] += target.value * 0.6;
        break;
      case 'back':
        positionScores['back-0'] += target.value * 0.4;
        positionScores['back-1'] += target.value * 0.4;
        positionScores['back-2'] += target.value * 0.4;
        break;
      case 'any':
        // Distribute value across all positions
        Object.keys(positionScores).forEach(pos => {
          positionScores[pos] += target.value * 0.2;
        });
        break;
    }
  });
  
  // Sort positions by score
  const sortedPositions = Object.entries(positionScores)
    .sort(([, a], [, b]) => b - a)
    .map(([pos, score]) => ({
      position: pos,
      score,
      line: pos.split('-')[0],
      index: parseInt(pos.split('-')[1])
    }));
  
  return sortedPositions.slice(0, 3); // Top 3 positions
};

export const getCounterSuggestions = (enemyTeam, characters, myTeam) => {
  // Use the new optimized logic
  const optimized = getOptimizedCounterSuggestions(enemyTeam, characters, myTeam);
  
  // Convert to legacy format for compatibility
  const suggestions = { front: [], back: [] };
  
  [...optimized.highPriority, ...optimized.shared, ...optimized.medium, ...optimized.low]
    .forEach(suggestion => {
      suggestion.recommendations.forEach(rec => {
        const counterData = {
          ...suggestion.counter,
          countersEnemyId: suggestion.targets[0].enemy.id,
          counterPosition: suggestion.targets[0].position,
          enemyPosition: `${suggestion.targets[0].enemyPosition.line === 'front' ? 'F' : 'B'}${suggestion.targets[0].enemyPosition.index + (suggestion.targets[0].enemyPosition.line === 'front' ? 1 : 3)}`,
          suggestedPosition: `${rec.line} line`,
          relationship: `Counters ${suggestion.targets.length} enemy(ies)`,
          priority: suggestion.priority,
          versatility: suggestion.versatility,
          multiTarget: suggestion.targets.length > 1,
          targets: suggestion.targets.map(t => t.enemy.name).join(', ')
        };
        
        if (rec.line === 'front') {
          const existing = suggestions.front.find(s => s.id === suggestion.counter.id);
          if (!existing) {
            suggestions.front.push(counterData);
          }
        } else {
          const existing = suggestions.back.find(s => s.id === suggestion.counter.id);
          if (!existing) {
            suggestions.back.push(counterData);
          }
        }
      });
    });
  
  return suggestions;
};

// Additional utility functions for advanced counter analysis
export const getTeamSynergy = (team, characters) => {
  const teamMembers = [...(team?.front || []), ...(team?.back || [])].filter(Boolean);
  if (teamMembers.length < 2) return 0;
  
  let synergy = 0;
  
  // Role diversity bonus
  const roles = new Set(teamMembers.map(char => char.role));
  synergy += roles.size * 0.1;
  
  // Element coverage bonus
  const elements = new Set(teamMembers.map(char => char.element));
  synergy += elements.size * 0.08;
  
  // SS rank bonus
  const ssCount = teamMembers.filter(char => char.rank === 'SS').length;
  synergy += ssCount * 0.15;
  
  // Element composition bonus
  const elementBonus = calculateTeamElementBonus(team);
  synergy += (elementBonus.damage + elementBonus.hp) / 200; // Convert percentage to decimal
  
  return Math.min(synergy, 1.5); // Cap at 150%
};

export const getCounterCoverage = (myTeam, enemyTeam, characters) => {
  const enemies = [...(enemyTeam?.front || []), ...(enemyTeam?.back || [])].filter(Boolean);
  const allies = [...(myTeam?.front || []), ...(myTeam?.back || [])].filter(Boolean);
  
  let coveredEnemies = 0;
  
  enemies.forEach(enemy => {
    const isCovered = allies.some(ally => {
      return enemy.counters?.some(counter => counter.id === ally.id);
    });
    
    if (isCovered) coveredEnemies++;
  });
  
  return enemies.length > 0 ? coveredEnemies / enemies.length : 0;
};

// New function to calculate team element bonuses
export const calculateTeamElementBonus = (team) => {
  const teamMembers = [...(team?.front || []), ...(team?.back || [])].filter(Boolean);
  if (teamMembers.length < 3) return { damage: 0, hp: 0, description: 'Necesitas al menos 3 personajes' };
  
  // Count elements
  const elementCounts = {};
  teamMembers.forEach(char => {
    elementCounts[char.element] = (elementCounts[char.element] || 0) + 1;
  });
  
  // Sort by count
  const sortedElements = Object.entries(elementCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([element, count]) => ({ element: parseInt(element), count }));
  
  const primary = sortedElements[0];
  const secondary = sortedElements[1] || { count: 0 };
  
  // Calculate bonuses based on element composition
  if (primary.count === 5) {
    return { 
      damage: 25, 
      hp: 25, 
      description: `5 ${getElementName(primary.element)}: +25% Daño y PV` 
    };
  } else if (primary.count === 4) {
    return { 
      damage: 20, 
      hp: 20, 
      description: `4 ${getElementName(primary.element)}: +20% Daño y PV` 
    };
  } else if (primary.count === 3 && secondary.count === 2) {
    return { 
      damage: 15, 
      hp: 15, 
      description: `3 ${getElementName(primary.element)} + 2 ${getElementName(secondary.element)}: +15% Daño y PV` 
    };
  } else if (primary.count === 3) {
    return { 
      damage: 10, 
      hp: 10, 
      description: `3 ${getElementName(primary.element)}: +10% Daño y PV` 
    };
  }
  
  return { damage: 0, hp: 0, description: 'Sin bonus de elemento' };
};

const getElementName = (element) => {
  const names = {
    1: "Water",
    2: "Fire", 
    3: "Air",
    4: "Earth",
    5: "Light",
    6: "Darkness"
  };
  return names[element] || "Unknown";
};
