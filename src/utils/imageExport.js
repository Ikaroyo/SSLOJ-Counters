export const exportTeamAsImage = async (team, enemyTeam, roleNames, elementNames) => {
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Canvas dimensions
  canvas.width = 1400;
  canvas.height = 900;
  
  // Background image pattern
  const bgPattern = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgPattern.addColorStop(0, '#0f172a');
  bgPattern.addColorStop(0.3, '#1e293b');
  bgPattern.addColorStop(0.7, '#334155');
  bgPattern.addColorStop(1, '#475569');
  ctx.fillStyle = bgPattern;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add decorative pattern
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < canvas.width; i += 100) {
    for (let j = 0; j < canvas.height; j += 100) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(i, j, 50, 50);
    }
  }
  ctx.globalAlpha = 1;
  
  // Title with better styling
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeText('Saint Seiya - Formación de Equipos', canvas.width / 2, 60);
  ctx.fillText('Saint Seiya - Formación de Equipos', canvas.width / 2, 60);
  
  // Team sections
  const teamWidth = 650;
  const teamHeight = 700;
  const teamY = 120;
  
  // My Team (left side)
  await drawTeam(ctx, team, 50, teamY, teamWidth, teamHeight, 'Mi Equipo', '#3b82f6', roleNames, elementNames);
  
  // Enemy Team (right side)
  await drawTeam(ctx, enemyTeam, 700, teamY, teamWidth, teamHeight, 'Equipo Enemigo', '#ef4444', roleNames, elementNames);
  
  // Export as image
  const link = document.createElement('a');
  link.download = `team_formation_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
};

const drawTeam = async (ctx, team, x, y, width, height, title, color, roleNames, elementNames) => {
  // Team container with gradient background
  const teamGradient = ctx.createLinearGradient(x, y, x, y + height);
  teamGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
  teamGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
  ctx.fillStyle = teamGradient;
  ctx.fillRect(x, y, width, height);
  
  // Team border
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, width, height);
  
  // Team title background
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, 50);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, x + width / 2, y + 35);
  
  // Character card dimensions
  const cardWidth = 140;
  const cardHeight = 180;
  const cardSpacing = 25;
  
  // Front line (F1, F2)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Línea Delantera', x + width / 2, y + 90);
  
  const frontY = y + 110;
  const frontStartX = x + (width - (2 * cardWidth + cardSpacing)) / 2;
  
  if (team.front[0]) {
    await drawCharacterCard(ctx, team.front[0], frontStartX, frontY, cardWidth, cardHeight, 'F1', roleNames, elementNames);
  } else {
    drawEmptySlot(ctx, frontStartX, frontY, cardWidth, cardHeight, 'F1');
  }
  
  if (team.front[1]) {
    await drawCharacterCard(ctx, team.front[1], frontStartX + cardWidth + cardSpacing, frontY, cardWidth, cardHeight, 'F2', roleNames, elementNames);
  } else {
    drawEmptySlot(ctx, frontStartX + cardWidth + cardSpacing, frontY, cardWidth, cardHeight, 'F2');
  }
  
  // Back line (B3, B4, B5)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Línea Trasera', x + width / 2, y + 360);
  
  const backY = y + 380;
  const backStartX = x + (width - (3 * cardWidth + 2 * cardSpacing)) / 2;
  
  for (let i = 0; i < 3; i++) {
    const cardX = backStartX + i * (cardWidth + cardSpacing);
    if (team.back[i]) {
      await drawCharacterCard(ctx, team.back[i], cardX, backY, cardWidth, cardHeight, `B${i + 3}`, roleNames, elementNames);
    } else {
      drawEmptySlot(ctx, cardX, backY, cardWidth, cardHeight, `B${i + 3}`);
    }
  }
};

const drawCharacterCard = async (ctx, character, x, y, width, height, position, roleNames, elementNames) => {
  // Card shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(x + 3, y + 3, width, height);
  
  // Card background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, width, height);
  
  // Card border with gradient
  const borderGradient = ctx.createLinearGradient(x, y, x + width, y + height);
  borderGradient.addColorStop(0, '#d1d5db');
  borderGradient.addColorStop(1, '#6b7280');
  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, width, height);
  
  try {
    // Character image as background
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      img.onload = () => {
        // Draw character image covering the entire card background
        ctx.save();
        ctx.globalAlpha = 0.3; // Make it semi-transparent background
        ctx.drawImage(img, x + 2, y + 2, width - 4, height - 4);
        ctx.restore();
        
        // Draw character image in main area
        const imageHeight = height * 0.6;
        const imageY = y + 5;
        const imgAspect = img.width / img.height;
        const availableWidth = width - 10;
        const availableHeight = imageHeight - 10;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > availableWidth / availableHeight) {
          drawWidth = availableWidth;
          drawHeight = drawWidth / imgAspect;
          drawX = x + 5;
          drawY = imageY + (availableHeight - drawHeight) / 2;
        } else {
          drawHeight = availableHeight;
          drawWidth = drawHeight * imgAspect;
          drawX = x + (availableWidth - drawWidth) / 2 + 5;
          drawY = imageY;
        }
        
        drawWidth = Math.min(drawWidth, availableWidth);
        drawHeight = Math.min(drawHeight, availableHeight);
        drawX = Math.max(drawX, x + 5);
        drawY = Math.max(drawY, imageY);
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        resolve();
      };
      img.onerror = () => {
        // Fallback background
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(x + 5, y + 5, width - 10, height * 0.6 - 10);
        resolve();
      };
      img.src = character.image;
    });
  } catch (error) {
    // Fallback background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(x + 5, y + 5, width - 10, height * 0.6 - 10);
  }
  
  // Position badge with better styling
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(x + width - 35, y + 5, 30, 20);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + width - 35, y + 5, 30, 20);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(position, x + width - 20, y + 18);
  
  // Character name with background
  const nameY = y + height * 0.6 + 25;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(x + 5, nameY - 15, width - 10, 20);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.textAlign = 'center';
  const nameText = character.name.length > 15 ? character.name.substring(0, 15) + '...' : character.name;
  ctx.fillText(nameText, x + width / 2, nameY);
  
  // Role and Element text with background
  const infoY = y + height * 0.6 + 45;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(x + 5, infoY - 12, width - 10, 16);
  ctx.fillStyle = '#ffffff';
  ctx.font = '11px Arial, sans-serif';
  ctx.textAlign = 'center';
  const roleText = roleNames[character.role] || `Role ${character.role}`;
  const elementText = elementNames[character.element] || `Element ${character.element}`;
  ctx.fillText(`${roleText} | ${elementText}`, x + width / 2, infoY);
  
  // Role and Element icons as colored circles with letters
  const iconSize = 18;
  const iconY = y + height * 0.6 + 65;
  
  // Role icon (left)
  const roleColors = {
    1: '#ef4444', // red - Protector
    2: '#f97316', // orange - Guerrero
    3: '#3b82f6', // blue - Experto
    4: '#8b5cf6', // purple - Asesino
    5: '#10b981'  // green - Asistente
  };
  ctx.fillStyle = roleColors[character.role] || '#6b7280';
  ctx.beginPath();
  ctx.arc(x + width / 2 - 15, iconY, iconSize / 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Role letter
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.textAlign = 'center';
  const roleInitials = { 1: 'P', 2: 'G', 3: 'E', 4: 'A', 5: 'S' };
  ctx.fillText(roleInitials[character.role] || 'R', x + width / 2 - 15, iconY + 4);
  
  // Element icon (right)
  const elementColors = {
    1: '#9ca3af', // gray (agua)
    2: '#eab308', // yellow (fuego)
    3: '#06b6d4', // cyan (aire)
    4: '#ec4899', // pink (tierra)
    5: '#6366f1', // indigo (luz)
    6: '#374151'  // gray-dark (oscuridad)
  };
  ctx.fillStyle = elementColors[character.element] || '#6b7280';
  ctx.beginPath();
  ctx.arc(x + width / 2 + 15, iconY, iconSize / 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Element letter
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.textAlign = 'center';
  const elementInitials = { 1: 'A', 2: 'F', 3: 'I', 4: 'T', 5: 'L', 6: 'O' };
  ctx.fillText(elementInitials[character.element] || 'E', x + width / 2 + 15, iconY + 4);
  
  // Counters count with background
  if (character.counters && character.counters.length > 0) {
    const counterY = y + height * 0.6 + 85;
    ctx.fillStyle = 'rgba(5, 150, 105, 0.9)';
    ctx.fillRect(x + 5, counterY - 10, width - 10, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Counters: ${character.counters.length}`, x + width / 2, counterY);
  }
};

const drawEmptySlot = (ctx, x, y, width, height, position) => {
  // Empty slot background with pattern
  ctx.fillStyle = '#f9fafb';
  ctx.fillRect(x, y, width, height);
  
  // Dashed border with better styling
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 10]);
  ctx.strokeRect(x, y, width, height);
  ctx.setLineDash([]);
  
  // Plus icon (larger and better styled)
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(x + width / 2 - 2, y + height / 2 - 20, 4, 40);
  ctx.fillRect(x + width / 2 - 20, y + height / 2 - 2, 40, 4);
  
  // Position label with background
  ctx.fillStyle = 'rgba(107, 114, 128, 0.9)';
  ctx.fillRect(x + 10, y + height / 2 + 20, width - 20, 25);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(position, x + width / 2, y + height / 2 + 38);
};
