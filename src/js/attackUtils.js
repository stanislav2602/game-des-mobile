export function getDistance(index1, index2, boardSize) {
  const row1 = Math.floor(index1 / boardSize);
  const col1 = index1 % boardSize;
  const row2 = Math.floor(index2 / boardSize);
  const col2 = index2 % boardSize;

  return Math.max(Math.abs(row1 - row2), Math.abs(col1 - col2));
}

export function canMove(character, fromIndex, toIndex, boardSize) {
  const distance = getDistance(fromIndex, toIndex, boardSize);
  const moveDistances = {
    swordsman: 4,
    bowman: 2,
    magician: 1,
    daemon: 4,
    undead: 4,
    vampire: 2,
  };

  const maxMove = moveDistances[character.type] || 1;
  return distance <= maxMove;
}

export function canAttack(character, fromIndex, toIndex, boardSize) {
  const distance = getDistance(fromIndex, toIndex, boardSize);
  const attackDistances = {
    swordsman: 1,
    bowman: 2,
    magician: 4,
    daemon: 4,
    undead: 1,
    vampire: 2,
  };

  const maxAttack = attackDistances[character.type] || 1;
  return distance <= maxAttack;
}

export function getCellsInRadius(index, radius, boardSize) {
  const row = Math.floor(index / boardSize);
  const col = index % boardSize;
  const cells = [];

  for (let dr = -radius; dr <= radius; dr += 1) {
    for (let dc = -radius; dc <= radius; dc += 1) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
        const newIndex = newRow * boardSize + newCol;
        if (newIndex !== index) {
          cells.push(newIndex);
        }
      }
    }
  }

  return cells;
}
