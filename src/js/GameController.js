import themes from "./themes";
import { generateTeam } from "./generators";
import PositionedCharacter from "./PositionedCharacter";
import Bowman from "./characters/Bowman";
import Daemon from "./characters/Daemon";
import Undead from "./characters/Undead";
import Vampire from "./characters/Vampire";
import Magician from "./characters/Magician";
import Swordsman from "./characters/Swordsman";
import cursors from "./cursors";
import { tooltipCharacter } from "./utils";
import GamePlay from "./GamePlay";
import GameState from "./GameState";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.charactersToDraw = [];
    this.players = {
      user: {
        side: "user",
        first: 0,
        second: 1,
        characters: [Swordsman, Bowman, Magician],
      },
      computer: {
        side: "computer",
        first: this.gamePlay.boardSize - 1,
        second: this.gamePlay.boardSize - 2,
        characters: [Undead, Vampire, Daemon],
      },
    };
    this.level = 1;
    this.score = 0;
    this.possibleAttackCells = [];
    this.boardCell = {
      vacantCell: "vacantCell",
      computerCell: "computerCell",
      userCell: "userCell",
      forbiddenCell: "forbiddenCell",
    };
    this.movements = [];
    this.selectedCharacter = null;
    this.currentStatus = null;
    this.charactersToDraw = [];
    this.area = this.getRowArray();
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      const loaded = JSON.parse(sessionStorage.getItem("reload"));

      if (loaded) {
        this.loadState(loaded);
      } else {
        this.theme = themes.prairie;
        this.gamePlay.drawUi(this.theme);
      }
    });
    this.gamePlay.addNewGameListener(
      this.newGame.bind(this, this.level, this.theme)
    );
    // TODO: add event listeners to gamePlay events
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    // TODO: load saved stated from stateService

    this.gamePlay.addNewGameListener(
      this.newGame.bind(this, this.level, this.theme)
    );
    this.gamePlay.addSaveGameListener(this.saveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.loadGame.bind(this));

    window.addEventListener("unload", () => {
      sessionStorage.setItem("reload", JSON.stringify(GameState.from(this)));
    });
  }

  getAllPositions() {
    const allPossiblePositions = [];
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) {
      allPossiblePositions.push(i);
    }
    const positionMap = {
      indexes: allPossiblePositions,
      lineLength: this.gamePlay.boardSize,
      length: allPossiblePositions.length,
    };
    return positionMap;
  }

  playerPossiblePositions(player) {
    const positionMap = this.getAllPositions();
    const playerPossibleCells = positionMap.indexes
      .filter(
        (item) =>
          item % positionMap.lineLength === player.first ||
          item % positionMap.lineLength === player.second
      )
      .map((item) => item);

    return playerPossibleCells;
  }

  getCharacterPosition(possibleCellsArray) {
    const cellIndex = Math.floor(Math.random() * possibleCellsArray.length);
    const characterCell = possibleCellsArray[cellIndex];
    possibleCellsArray.splice(cellIndex, 1);
    return characterCell;
  }

  loadState(load) {
    const { level, positions, theme, score } = load;
    this.level = level;
    this.charactersToDraw = positions;
    this.theme = theme;
    this.score = score;
    this.gamePlay.drawUi(this.theme);
    this.gamePlay.redrawPositions(this.charactersToDraw);
  }

  saveGame() {
    if (!this.charactersToDraw.length) {
      GamePlay.showError("Нет игры для сохранения");
    } else {
      const state = GameState.from(this);
      this.stateService.save(state);
      GamePlay.showMessage("Игра сохранена");
    }
  }

  loadGame() {
    const state = this.stateService.load();

    if (!state) {
      GamePlay.showError("Нет сохраненной игры");
    } else {
      this.loadState(state);
      GamePlay.showMessage("Игра загружена");
    }
  }

  clear() {
    this.level = 1;
    this.charactersToDraw = [];
    this.selectedCharacter = null;
    this.theme = themes.prairie;
  }

  onEsc() {
    this.clear();
    this.score = 0;
    this.gamePlay.drawUi(this.theme);
  }

  clear() {
    this.level = 1;
    this.charactersToDraw = [];
    this.selectedCharacter = null;
    this.theme = themes.prairie;
  }

  levelUp() {
    this.level += 1;
    this.charactersToDraw.forEach((hero) => {
      hero.character.level = this.level;
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
    switch (this.level) {
      case 2:
        this.gamePlay.drawUi(themes.desert);
        this.theme = themes.desert;
        break;
      case 3:
        this.gamePlay.drawUi(themes.arctic);
        this.theme = themes.arctic;
        break;
      case 4:
        this.gamePlay.drawUi(themes.mountain);
        this.theme = themes.mountain;
        break;
      default:
        this.gamePlay.drawUi(themes.prairie);
        this.theme = themes.prairie;
        break;
    }
    return this.level;
  }

  newGame(level = 1, theme = themes.prairie) {
    this.level = level;
    this.gamePlay.deselectAllCells();
    this.selectedCharacter = null;
    this.theme = theme;
    this.gamePlay.drawUi(this.theme);

    if (level === 1) {
      this.charactersToDraw = [];
    }

    const userAllPossibleCells = this.playerPossiblePositions(
      this.players.user
    );
    const computerAllPossibleCells = this.playerPossiblePositions(
      this.players.computer
    );

    if (!this.charactersToDraw.length) {
      console.log(this.players.user.characters);
      const userTeam = generateTeam(this.players.user.characters, level, 2);
      console.log(userTeam);
      const computerTeam = generateTeam(
        this.players.computer.characters,
        level,
        2
      );

      this.charactersToDraw = [
        userTeam.map(
          (item) =>
            new PositionedCharacter(
              item,
              this.players.user.side,
              this.getCharacterPosition(userAllPossibleCells)
            )
        ),
        computerTeam.map(
          (item) =>
            new PositionedCharacter(
              item,
              this.players.computer.side,
              this.getCharacterPosition(computerAllPossibleCells)
            )
        ),
      ].flat();
    } else {
      this.charactersToDraw.forEach((hero) => {
        hero.position = this.getCharacterPosition(userAllPossibleCells);
      });
      const userFiltered = this.playerPossiblePositions(
        this.players.user
      ).filter(
        (position) =>
          !this.charactersToDraw.find((hero) => hero.position === position)
      );
      const survivedUserCharacter = this.charactersToDraw.length;
      let userTeam;

      if (level === 2) {
        userTeam = generateTeam(this.players.user.characters, level - 1, 1);
      }

      if (level === 3 || level === 4) {
        userTeam = generateTeam(this.players.user.characters, level - 1, 2);
      }

      const computerTeam = generateTeam(
        this.players.computer.characters,
        level,
        userTeam.length + survivedUserCharacter
      );
      this.charactersToDraw.push(
        userTeam.map(
          (item) =>
            new PositionedCharacter(
              item,
              this.players.user.side,
              this.getCharacterPosition(userFiltered)
            )
        )
      );
      this.charactersToDraw.push(
        computerTeam.map(
          (item) =>
            new PositionedCharacter(
              item,
              this.players.computer.side,
              this.getCharacterPosition(computerAllPossibleCells)
            )
        )
      );
      this.charactersToDraw = this.charactersToDraw.flat();
    }
    this.gamePlay.redrawPositions(this.charactersToDraw);
  }
  getRowArray() {
    const area = [];
    let rowArr = [];
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) {
      rowArr.push(i);
      if (rowArr.length === this.gamePlay.boardSize) {
        area.push(rowArr);
        rowArr = [];
      }
    }
    return area;
  }

  getAreaMove(clickedCharacter, distance) {
    const { boardSize } = this.gamePlay;
    const x = clickedCharacter.position % boardSize;
    const y = Math.floor(clickedCharacter.position / boardSize);
    const areaMove = [];
    for (let i = 1; i <= distance; i += 1) {
      let xFree = x + i;
      if (xFree < boardSize) {
        areaMove.push(this.area[y][xFree]);
      }

      let yFree = y + i;
      if (yFree < boardSize) {
        areaMove.push(this.area[yFree][x]);
      }

      if (yFree < boardSize && xFree < boardSize) {
        areaMove.push(this.area[yFree][xFree]);
      }

      xFree = x - i;
      if (xFree >= 0) {
        areaMove.push(this.area[y][xFree]);
      }

      if (xFree >= 0 && yFree < boardSize) {
        areaMove.push(this.area[yFree][xFree]);
      }

      yFree = y - i;
      if (yFree >= 0) {
        areaMove.push(this.area[yFree][x]);
      }

      if (yFree >= 0 && xFree >= 0) {
        areaMove.push(this.area[yFree][xFree]);
      }

      xFree = x + i;
      if (xFree < boardSize && yFree >= 0) {
        areaMove.push(this.area[yFree][xFree]);
      }
    }

    return areaMove;
  }

  getAreaAttack(clickedCharacter, distance) {
    const areaAttack = [];

    for (
      let i = clickedCharacter.position - this.gamePlay.boardSize * distance;
      i <= clickedCharacter.position + this.gamePlay.boardSize * distance;
      i += this.gamePlay.boardSize
    ) {
      if (i >= 0 && i < this.gamePlay.boardSize ** 2) {
        for (let j = i - distance; j <= i + distance; j += 1) {
          if (
            j >= i - (i % this.gamePlay.boardSize) &&
            j < i + (this.gamePlay.boardSize - (i % this.gamePlay.boardSize))
          ) {
            areaAttack.push(j);
          }
        }
      }
    }

    areaAttack.splice(areaAttack.indexOf(clickedCharacter.position), 1);

    return areaAttack;
  }

  moveDefender(defender, attacker, enemies) {
    const movements = this.getAreaMove(
      defender,
      defender.character.distance
    ).filter(
      (item) =>
        this.charactersToDraw.findIndex((hero) => hero.position === item) === -1
    );
    const coordinates = (hero) => ({
      x: hero.position % this.gamePlay.boardSize,
      y: Math.floor(hero.position / this.gamePlay.boardSize),
    });
    const coordinatesHeroes = {
      defender: coordinates(defender),
      attacker: coordinates(attacker),
    };

    const possibleCells = () => {
      if (coordinatesHeroes.attacker.x <= coordinatesHeroes.defender.x) {
        if (coordinatesHeroes.attacker.y <= coordinatesHeroes.defender.y) {
          return movements.filter(
            (item) =>
              item % this.gamePlay.boardSize >= coordinatesHeroes.attacker.x &&
              item % this.gamePlay.boardSize <= coordinatesHeroes.defender.x &&
              Math.floor(item / this.gamePlay.boardSize) <=
                coordinatesHeroes.defender.y &&
              Math.floor(item / this.gamePlay.boardSize) >=
                coordinatesHeroes.attacker.y
          );
        }

        return movements.filter(
          (item) =>
            item % this.gamePlay.boardSize >= coordinatesHeroes.attacker.x &&
            item % this.gamePlay.boardSize <= coordinatesHeroes.defender.x &&
            Math.floor(item / this.gamePlay.boardSize) >
              coordinatesHeroes.defender.y &&
            Math.floor(item / this.gamePlay.boardSize) <=
              coordinatesHeroes.attacker.y
        );
      }

      if (coordinatesHeroes.attacker.y <= coordinatesHeroes.defender.y) {
        return movements.filter(
          (item) =>
            item % this.gamePlay.boardSize <= coordinatesHeroes.attacker.x &&
            item % this.gamePlay.boardSize > coordinatesHeroes.defender.x &&
            Math.floor(item / this.gamePlay.boardSize) <=
              coordinatesHeroes.defender.y &&
            Math.floor(item / this.gamePlay.boardSize) >=
              coordinatesHeroes.attacker.y
        );
      }

      return movements.filter(
        (item) =>
          item % this.gamePlay.boardSize <= coordinatesHeroes.attacker.x &&
          item % this.gamePlay.boardSize > coordinatesHeroes.defender.x &&
          Math.floor(item / this.gamePlay.boardSize) >
            coordinatesHeroes.defender.y &&
          Math.floor(item / this.gamePlay.boardSize) <=
            coordinatesHeroes.attacker.y
      );
    };

    const possibilities = possibleCells();
    if (!possibilities.length) {
      if (!movements.length) {
        const otherEnemies = [...enemies];
        otherEnemies.splice(enemies.indexOf(defender), 1);
        defender =
          otherEnemies[Math.floor(Math.random() * otherEnemies.length)];
      }
      const randomMovements = this.getAreaMove(
        defender,
        defender.character.distance
      ).filter(
        (item) =>
          this.charactersToDraw.findIndex((hero) => hero.position === item) ===
          -1
      );
      return randomMovements[
        Math.floor(Math.random() * randomMovements.length)
      ];
    }
    return possibilities[Math.floor(Math.random() * possibleCells.length)];
  }

  computerAction() {
    this.gamePlay.deselectAllCells();
    const enemies = this.charactersToDraw.filter(
      (hero) => hero.side === this.players.computer.side
    );
    const computerCellAttacker = enemies.find(
      (item) =>
        item.character.attack ===
        Math.max.apply(
          null,
          enemies.map((hero) => hero.character.attack)
        )
    );

    return new Promise((resolve, reject) => {
      const damageToAttacker = Math.round(
        Math.max(
          computerCellAttacker.character.attack -
            this.selectedCharacter.character.defence,
          computerCellAttacker.character.attack * 0.1
        )
      );

      if (
        this.getAreaAttack(
          computerCellAttacker,
          computerCellAttacker.character.distanceAttack
        ).find((item) => item === this.selectedCharacter.position)
      ) {
        this.selectedCharacter.character.health -= damageToAttacker;
        resolve(damageToAttacker);
      } else {
        reject({ computerCellAttacker, enemies });
      }
    });
  }

  actionAfterAttack() {
    if (this.selectedCharacter.character.health <= 0) {
      this.charactersToDraw.splice(
        this.charactersToDraw.indexOf(this.selectedCharacter),
        1
      );
    }
    this.gamePlay.redrawPositions(this.charactersToDraw);
    this.selectedCharacter = null;

    if (
      !this.charactersToDraw.find(
        (item) => item.side === this.players.user.side
      )
    ) {
      GamePlay.showMessage("Игра окончена!");
      this.clear();
      this.score = 0;
      this.gamePlay.drawUi(this.theme);
    }
  }

  onCellClick(index) {
    // TODO: react to click

    const clickedCharacter = this.charactersToDraw.find(
      (item) => item.position === index
    );
    if (this.selectedCharacter === null) {
      if (!clickedCharacter) {
      } else if (
        ["bowman", "swordsman", "magician"].includes(
          clickedCharacter.character.type
        )
      ) {
        this.selectedCharacter = clickedCharacter;
        this.gamePlay.selectCell(index);
      } else {
        GamePlay.showError("Это персонаж противника!");
      }
    } else if (this.currentStatus === this.boardCell.vacantCell) {
      [this.selectedCharacter.position, index].forEach((cell) =>
        this.gamePlay.deselectCell(cell)
      );
      this.selectedCharacter.position = index;
      this.gamePlay.redrawPositions(this.charactersToDraw);
      this.computerAction()
        .then(
          (damageToAttacker) =>
            this.gamePlay.showDamage(
              this.selectedCharacter.position,
              damageToAttacker
            ),
          (reject) => {
            reject.computerCellAttacker.position = this.moveDefender(
              reject.computerCellAttacker,
              this.selectedCharacter,
              reject.enemies
            );
          }
        )
        .then(this.actionAfterAttack.bind(this));
    } else if (
      this.currentStatus === this.boardCell.userCell &&
      this.selectedCharacter !== clickedCharacter
    ) {
      this.gamePlay.deselectCell(this.selectedCharacter.position);
      this.selectedCharacter = clickedCharacter;
      this.gamePlay.selectCell(index);
    } else if (this.currentStatus === this.boardCell.computerCell) {
      const enemy = this.charactersToDraw.find(
        (hero) => hero.position === index
      );
      const enemyDamage = Math.ceil(
        Math.max(
          this.selectedCharacter.character.attack - enemy.character.defence,
          this.selectedCharacter.character.attack * 0.1
        )
      );
      enemy.character.health -= enemyDamage;

      if (enemy.character.health <= 0) {
        this.charactersToDraw.splice(this.charactersToDraw.indexOf(enemy), 1);
        this.gamePlay.redrawPositions(this.charactersToDraw);
        this.gamePlay.deselectAllCells();

        if (
          !this.charactersToDraw.find(
            (item) => item.side === this.players.computer.side
          )
        ) {
          this.selectedCharacter = null;
          this.score = this.charactersToDraw.reduce(
            (accumulator, hero) => accumulator + hero.character.health,
            this.score
          );
          if (this.level === 4) {
            GamePlay.showMessage(`Вы выиграли! Ваш счет равен ${this.score}.`);
            this.clear();
            this.gamePlay.drawUi(this.theme);
          } else {
            GamePlay.showMessage(
              `Вы выиграли! Переход на уровень ${
                this.level + 1
              }! Ваш счет равен ${this.score}.`
            );
            this.newGame(this.levelUp(), this.theme);
          }
        } else {
          this.computerAction()
            .then(
              (damageToAttacker) =>
                this.gamePlay.showDamage(
                  this.selectedCharacter.position,
                  damageToAttacker
                ),
              (reject) => {
                reject.computerCellAttacker.position = this.moveDefender(
                  reject.computerCellAttacker,
                  this.selectedCharacter,
                  reject.enemies
                );
              }
            )
            .then(this.actionAfterAttack.bind(this));
        }
      } else {
        this.gamePlay
          .showDamage(index, enemyDamage)
          .then(() => this.gamePlay.redrawPositions(this.charactersToDraw))
          .then(() => this.computerAction())
          .then(
            (damageToAttacker) =>
              this.gamePlay.showDamage(
                this.selectedCharacter.position,
                damageToAttacker
              ),
            (reject) => {
              reject.computerCellAttacker.position = this.moveDefender(
                reject.computerCellAttacker,
                this.selectedCharacter,
                reject.enemies
              );
            }
          )
          .then(this.actionAfterAttack.bind(this));
      }
    } else {
      GamePlay.showError("Так делать нельзя");
      this.gamePlay.deselectCell(this.selectedCharacter.position);
      this.gamePlay.setCursor(cursors.notallowed);
      this.selectedCharacter = null;
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    this.charactersToDraw.forEach((positionedCharacterOnBoard) => {
      if (positionedCharacterOnBoard.position === index) {
        this.gamePlay.showCellTooltip(
          tooltipCharacter(positionedCharacterOnBoard.character),
          index
        );
      }
    });

    if (this.selectedCharacter) {
      const characterActions = {
        distance: this.selectedCharacter.character.distance,
        distanceAttack: this.selectedCharacter.character.distanceAttack,
      };
      this.movements = this.getAreaMove(
        this.selectedCharacter,
        characterActions.distance
      ).filter(
        (item) =>
          this.charactersToDraw.findIndex((hero) => hero.position === item) ===
          -1
      );
      this.possibleAttackCells = this.getAreaAttack(
        this.selectedCharacter,
        characterActions.distanceAttack
      ).filter(
        (item) =>
          this.charactersToDraw.findIndex(
            (hero) =>
              hero.position === item && hero.side === this.players.user.side
          ) === -1
      );
      if (this.movements.includes(index)) {
        this.gamePlay.selectCell(index, "green");
        this.gamePlay.setCursor(cursors.pointer);
        this.currentStatus = this.boardCell.vacantCell;
      } else if (
        this.possibleAttackCells.includes(index) &&
        this.charactersToDraw
          .filter((item) => item.side === this.players.computer.side)
          .find((item) => item.position === index)
      ) {
        this.gamePlay.selectCell(index, "red");
        this.gamePlay.setCursor(cursors.crosshair);
        this.currentStatus = this.boardCell.computerCell;
      } else if (
        this.charactersToDraw
          .filter((item) => item.side === this.players.user.side)
          .find(
            (item) =>
              item.position === index &&
              item.position !== this.selectedCharacter.position
          )
      ) {
        this.gamePlay.setCursor(cursors.pointer);
        this.currentStatus = this.boardCell.userCell;
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
        this.currentStatus = this.boardCell.forbiddenCell;
      }
    } else if (
      this.charactersToDraw
        .filter((hero) => hero.side === this.players.user.side)
        .find((item) => item.position === index)
    ) {
      this.gamePlay.setCursor(cursors.pointer);
    } else {
      this.gamePlay.setCursor(cursors.auto);
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
    if (
      index !== this.selectedCharacter ||
      index !== this.selectedCharacter.position
    ) {
      this.gamePlay.deselectCell(index);
    }
  }
}
