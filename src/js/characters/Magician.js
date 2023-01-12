import Character from '../Character';

export default class Magician extends Character {
  constructor(level = 1) {
    super(level, 'magician');
    this.attack = 10;
    this.defence = 40;
    this.distance = 1;
    this.distanceAttack = 4;
  }
}
