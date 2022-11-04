import Character from "../Character";
import Vampire from "../characters/Vampire";

test("Should throw error while creating class from Character", () => {
  const received = () => new Character();
  expect(received).toThrow("Нельзя использовать New Character()");
});

test("Should create new type of Character level 1", () => {
  const received = new Vampire(1);
  const expected = {
    level: 1,
    attack: 25,
    defence: 25,
    health: 50,
    type: "vampire",
    distance: 2,
    distanceAttack: 2,
  };
  expect(received).toEqual(expected);
});

// Проверьте, выдаёт ли генератор characterGenerator бесконечно новые персонажи из списка (учёт аргумента allowedTypes)
// Проверьте, в нужном ли количестве и диапазоне уровней (учёт аргумента maxLevel) создаются персонажи при вызове generateTeam
