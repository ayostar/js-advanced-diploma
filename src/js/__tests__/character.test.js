import Character from "../Character";
import Swordsman from "../characters/Swordsman";
import Bowman from "../characters/Swordsman";
import Magician from "../characters/Swordsman";
import Vampire from "../characters/Vampire";
import characterGenerator from "../generators";

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

// test("should test characterGenerator", () => {
//   const allowedTypes = [Swordsman, Bowman, Magician];
//   const received = characterGenerator(allowedTypes, 1);
//   const expected = {
//     character: Vampire,
//   };
// });

// export function* characterGenerator(allowedTypes, maxLevel) {
//   // TODO: write logic here
//   while (true) {
//     const i = Math.floor(Math.random() * allowedTypes.length);
//     const level = Math.ceil(Math.random() * maxLevel);

//     yield { character: new allowedTypes[i](level), level };
//   }
// }

// export function generateTeam(allowedTypes, maxLevel, characterCount) {
//   // TODO: write logic here
//   const newHero = characterGenerator(allowedTypes, maxLevel);
//   const team = new Team();

//   for (let i = 0; i < characterCount; i += 1) {
//     const nextHero = newHero.next().value;
//     team.add(nextHero.character);
//   }

//   team.toArray();
//   // console.log(team.characters);
//   return team.characters;
// }
