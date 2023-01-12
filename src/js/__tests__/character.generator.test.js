import { characterGenerator, generateTeam } from '../generators';
import Bowman from '../characters/Bowman';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';

test('should test characterGenerator Bowman(1)', () => {
  const allowedTypes = [Bowman];
  const maxLevel = 1;
  const generator = characterGenerator(allowedTypes, maxLevel);
  const generatedCharacter = generator.next().value;
  const bowman = new Bowman(1);

  expect(generatedCharacter).toEqual({
    character: bowman,
    level: maxLevel,
  });
});

test('should test characterGenerator quantity', () => {
  const allowedTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 1;
  const generator = characterGenerator(allowedTypes, maxLevel);
  const generatedCharacter = generator.next().value;
  const generatedCharacters = [];
  for (let i = 0; i < 10; i++) {
    generatedCharacters.push(generatedCharacter);
  }
  expect(generatedCharacters.length).toEqual(10);
});

test('should test generateTeam Bowman(1) quantity 2', () => {
  const allowedTypes = [Bowman];
  const maxLevel = 1;
  const generatedTeam = generateTeam(allowedTypes, maxLevel, 2);

  const iterTeam = generatedTeam.characters.values();
  expect(generatedTeam.characters.size).toBe(2);
  expect(iterTeam.next().value).toEqual(
    characterGenerator(allowedTypes, maxLevel).next().value.character,
  );
  expect(iterTeam.next().value).toEqual(
    characterGenerator(allowedTypes, maxLevel).next().value.character,
  );
});
