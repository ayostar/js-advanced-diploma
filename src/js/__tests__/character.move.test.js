import Bowman from '../characters/Bowman';
import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';
import PositionedCharacter from '../PositionedCharacter';

const stateService = new GameStateService(localStorage);
const gameController = new GameController(new GamePlay(), stateService);

test('should test movement area of character', () => {
  const bowman = new Bowman(1);
  const positionedCharacter = new PositionedCharacter(bowman, 'user', 17);
  const characterDistance = positionedCharacter.character.distance;
  const received = [18, 25, 26, 16, 24, 9, 8, 10, 19, 33, 35, 1, 3];
  expect(
    gameController.getAreaMove(positionedCharacter, characterDistance),
  ).toEqual(received);
});
