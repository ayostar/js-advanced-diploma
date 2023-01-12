import Team from "./Team";
/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  while (true) {
    const type = Math.floor(Math.random() * allowedTypes.length);

    const level = Math.ceil(Math.random() * maxLevel);

    yield { character: new allowedTypes[type](level), level };
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const newHero = characterGenerator(allowedTypes, maxLevel);
  const team = new Team();

  for (let i = 0; i < characterCount; i += 1) {
    const nextHero = newHero.next().value;
    team.add(nextHero.character);
  }

  // Написано возвращает экземляр Team, а на самом деле массив персонажей
  // ++++ ТЕСТЫ

  return team;
}
