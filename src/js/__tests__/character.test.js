import Character from "../Character";
import Swordsman from "../characters/Swordsman";
import Bowman from "../characters/Bowman";
import Magician from "../characters/Magician";
import Vampire from "../characters/Vampire";
import Daemon from "../characters/Daemon";
import Undead from "../characters/Undead";
import PositionedCharacter from "../PositionedCharacter";
import Team from "../Team";

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

test.each([
  [new Bowman(1)],
  [new Daemon(1)],
  [new Magician(1)],
  [new Swordsman(1)],
  [new Undead(1)],
  [new Vampire(1)],
])("should not throw error", (character) => {
  expect(() => character).not.toThrow();
});

test("Should throw error while creating class PositionedCharacter from Character", () => {
  const received = () => new PositionedCharacter(new Team(), "user", 0);
  expect(received).toThrow(
    "character must be instance of Character or its children"
  );
});
