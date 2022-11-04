/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  // TODO: ваш код будет тут
  if (index === 0) {
    return "top-left";
  }
  if (index > 0 && index < boardSize - 1) {
    return "top";
  }
  if (index === boardSize - 1) {
    return "top-right";
  }
  if (index === boardSize * boardSize - 1) {
    return "bottom-right";
  }
  if (
    index > boardSize * (boardSize - 1) &&
    index < boardSize * boardSize - 1
  ) {
    return "bottom";
  }
  if (index % boardSize === boardSize - 1) {
    return "right";
  }
  if (index === boardSize * (boardSize - 1)) {
    return "bottom-left";
  }
  if (index % boardSize === 0) {
    return "left";
  }
  return "center";
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return "critical";
  }

  if (health < 50) {
    return "normal";
  }

  return "high";
}

export function tooltipCharacter(character) {
  const level = String.fromCodePoint(0x1f396);
  const attack = String.fromCodePoint(0x2694);
  const defence = String.fromCodePoint(0x1f6e1);
  const health = String.fromCodePoint(0x2764);
  return `${level}${character.level} ${attack}${character.attack} ${defence}${character.defence} ${health}${character.health}`;
}
