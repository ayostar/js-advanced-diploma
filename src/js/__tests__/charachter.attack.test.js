import Bowman from '../characters/Bowman';
import Vampire from '../characters/Vampire';
import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';
import PositionedCharacter from '../PositionedCharacter';

const stateService = new GameStateService(localStorage);
const gameController = new GameController(new GamePlay(), stateService);

test('should test attack area of character', () => {
  const bowman = new Bowman(1);

  const positionedCharacter = new PositionedCharacter(bowman, 'user', 0);
  const characterDistanceAttack = positionedCharacter.character.distanceAttack;

  const received = [1, 2, 8, 9, 10, 16, 17, 18];
  expect(
    gameController.getAreaAttack(positionedCharacter, characterDistanceAttack),
  ).toEqual(received);
});

test('should test attack area of character', () => {
  const vampire = new Vampire(1);

  const positionedCharacter = new PositionedCharacter(vampire, 'user', 0);
  const characterDistanceAttack = positionedCharacter.character.distanceAttack;

  const received = [1, 2, 8, 9, 10, 16, 17, 18];

  expect(
    gameController.getAreaAttack(positionedCharacter, characterDistanceAttack),
  ).toEqual(received);
});
