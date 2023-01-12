/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = "generic") {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
    // TODO: выбросите исключение, если кто-то использует "new Character()"
    if (new.target.name === "Character") {
      throw new Error("Нельзя использовать New Character()");
    }
  }

  static levelUp(charactersToLevelUp, currentLevel) {
    charactersToLevelUp.forEach((hero) => {
      hero.character.level = currentLevel;
      hero.character.attack = Math.ceil(
        Math.max(
          hero.character.attack,
          hero.character.attack *
            (1.8 -
              (hero.character.health === 1 ? 80 : hero.character.health) / 100)
        )
      );
      hero.character.defence = Math.ceil(
        Math.max(
          hero.character.defence,
          hero.character.defence *
            (1.8 -
              (hero.character.health === 1 ? 80 : hero.character.health) / 100)
        )
      );
      hero.character.health = Math.ceil(
        hero.character.health + 80 > 100 ? 100 : hero.character.health + 80
      );
    });
  }
}
