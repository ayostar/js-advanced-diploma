import themes from "./themes";
import GameState from "./GameState";
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

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.charactersToDraw = [];
    this.players = {
      user: {
        name: "user",
        first: 0,
        second: 1,
        characters: [Swordsman, Bowman, Magician],
      },
      computer: {
        name: "computer",
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

    // function getCharacterPosition(possibleCellsArray) {
    //   const cellIndex = Math.floor(Math.random() * possibleCellsArray.length);
    //   const characterCell = possibleCellsArray[cellIndex];
    //   possibleCellsArray.splice(cellIndex, 1);
    //   return characterCell;
    // }

    if (!this.charactersToDraw.length) {
      const userTeam = generateTeam(this.players.user.characters, level, 2);
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
              this.players.user.name,
              this.getCharacterPosition(userAllPossibleCells)
            )
        ),
        computerTeam.map(
          (item) =>
            new PositionedCharacter(
              item,
              this.players.computer.name,
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
      const survivorsuser = this.charactersToDraw.length;
      // let userTeam;

      if (level === 2) {
        userTeam = generateTeam(this.players.user.characters, level - 1, 1);
      }

      if (level === 3 || level === 4) {
        userTeam = generateTeam(this.players.user.characters, level - 1, 2);
      }

      const computerTeam = generateTeam(
        this.players.computer.characters,
        level,
        userTeam.length + survivorsuser
      );
      this.charactersToDraw.push(
        userTeam.map(
          (item) =>
            new PositionedCharacter(
              item,
              this.players.user.name,
              this.getCharacterPosition(userFiltered)
            )
        )
      );
      this.charactersToDraw.push(
        computerTeam.map(
          (item) =>
            new PositionedCharacter(
              item,
              this.players.computer.name,
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
      // Движемся вправо
      let xFree = x + i;
      if (xFree < boardSize) {
        areaMove.push(this.area[y][xFree]);
      }
      // Движемся вниз
      let yFree = y + i;
      if (yFree < boardSize) {
        areaMove.push(this.area[yFree][x]);
      }
      // Движемся по диагонали вправо и вниз
      if (yFree < boardSize && xFree < boardSize) {
        areaMove.push(this.area[yFree][xFree]);
      }
      // Движемся влево
      xFree = x - i;
      if (xFree >= 0) {
        areaMove.push(this.area[y][xFree]);
      }
      // Движемся по диагонали влево и вниз
      if (xFree >= 0 && yFree < boardSize) {
        areaMove.push(this.area[yFree][xFree]);
      }
      // Движемся вверх
      yFree = y - i;
      if (yFree >= 0) {
        areaMove.push(this.area[yFree][x]);
      }
      // Движемся по диагонали влево и вверх
      if (yFree >= 0 && xFree >= 0) {
        areaMove.push(this.area[yFree][xFree]);
      }
      // Движемся по диагонали в право и вверх
      xFree = x + i;
      if (xFree < boardSize && yFree >= 0) {
        areaMove.push(this.area[yFree][xFree]);
      }
    }
    return areaMove;
  }

  getAreaAttack(clickedCharacter, distance) {
    const areaAttack = [];
    // Определяем пространство по вертикали
    for (
      let i = clickedCharacter.position - this.gamePlay.boardSize * distance;
      i <= clickedCharacter.position + this.gamePlay.boardSize * distance;
      i += this.gamePlay.boardSize
    ) {
      // Определяем пространство по горизонтали
      if (i >= 0 && i < this.gamePlay.boardSize ** 2) {
        for (let j = i - distance; j <= i + distance; j += 1) {
          if (
            // Ограничиваем слева
            j >= i - (i % this.gamePlay.boardSize) &&
            // Ограничиваем справа
            j < i + (this.gamePlay.boardSize - (i % this.gamePlay.boardSize))
          ) {
            areaAttack.push(j);
          }
        }
      }
    }
    // Удаляем клетку героя из списка возможных ходов
    areaAttack.splice(areaAttack.indexOf(clickedCharacter.position), 1);
    return areaAttack;
  }

  moveDefending(defending, attacker, enemies) {
    const movements = this.getAreaMove(
      defending,
      defending.character.distance
    ).filter(
      (item) =>
        this.charactersToDraw.findIndex((hero) => hero.position === item) === -1
    );
    const coordinates = (hero) => ({
      x: hero.position % this.gamePlay.boardSize,
      y: Math.floor(hero.position / this.gamePlay.boardSize),
    });
    const coordinatesHeroes = {
      defending: coordinates(defending),
      attacker: coordinates(attacker),
    };

    const probablePlaces = () => {
      // Вариант 1: движемся влево
      if (coordinatesHeroes.attacker.x <= coordinatesHeroes.defending.x) {
        // Вариант 1.1: движемся влево и вверх
        if (coordinatesHeroes.attacker.y <= coordinatesHeroes.defending.y) {
          return movements.filter(
            // Ограничиваем слева
            (item) =>
              item % this.gamePlay.boardSize >= coordinatesHeroes.attacker.x &&
              // Ограничиваем справа
              item % this.gamePlay.boardSize <= coordinatesHeroes.defending.x &&
              // Ограничиваем снизу
              Math.floor(item / this.gamePlay.boardSize) <=
                coordinatesHeroes.defending.y &&
              // Ограничиваем сверху
              Math.floor(item / this.gamePlay.boardSize) >=
                coordinatesHeroes.attacker.y
          );
        }
        //  Вариант 1.2: движемся влево и вниз
        return movements.filter(
          // Ограничиваем слева
          (item) =>
            item % this.gamePlay.boardSize >= coordinatesHeroes.attacker.x &&
            // Ограничиваем справа
            item % this.gamePlay.boardSize <= coordinatesHeroes.defending.x &&
            // Ограничиваем сверху
            Math.floor(item / this.gamePlay.boardSize) >
              coordinatesHeroes.defending.y &&
            // Ограничиваем снизу
            Math.floor(item / this.gamePlay.boardSize) <=
              coordinatesHeroes.attacker.y
        );
      }
      //  Вариант 2: движемся вправо
      // Вариант 2.1: движемся вправо и вверх
      if (coordinatesHeroes.attacker.y <= coordinatesHeroes.defending.y) {
        return movements.filter(
          // Ограничиваем справа
          (item) =>
            item % this.gamePlay.boardSize <= coordinatesHeroes.attacker.x &&
            // Ограничиваем слева
            item % this.gamePlay.boardSize > coordinatesHeroes.defending.x &&
            // Ограничиваем снизу
            Math.floor(item / this.gamePlay.boardSize) <=
              coordinatesHeroes.defending.y &&
            // Ограничиваем сверху
            Math.floor(item / this.gamePlay.boardSize) >=
              coordinatesHeroes.attacker.y
        );
      }
      //  Вариант 2.2: движемся вправо и вниз
      return movements.filter(
        // Ограничиваем справа
        (item) =>
          item % this.gamePlay.boardSize <= coordinatesHeroes.attacker.x &&
          // Ограничиваем слева
          item % this.gamePlay.boardSize > coordinatesHeroes.defending.x &&
          // Ограничиваем сверху
          Math.floor(item / this.gamePlay.boardSize) >
            coordinatesHeroes.defending.y &&
          // Ограничиваем снизу
          Math.floor(item / this.gamePlay.boardSize) <=
            coordinatesHeroes.attacker.y
      );
    };

    const probables = probablePlaces();
    if (!probables.length) {
      if (!movements.length) {
        const otherEnemies = [...enemies];
        otherEnemies.splice(enemies.indexOf(defending), 1);
        defending =
          otherEnemies[Math.floor(Math.random() * otherEnemies.length)];
      }
      const randomMovements = this.getAreaMove(
        defending,
        defending.character.distance
      ).filter(
        (item) =>
          this.charactersToDraw.findIndex((hero) => hero.position === item) ===
          -1
      );
      return randomMovements[
        Math.floor(Math.random() * randomMovements.length)
      ];
    }
    return probables[Math.floor(Math.random() * probablePlaces.length)];
  }

  movecomputerCellAttack() {
    this.gamePlay.deselectAllCells();
    const enemies = this.charactersToDraw.filter(
      (hero) => hero.side === this.players.computer.name
    );
    // Атаковать будет самый сильный персонаж
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
      // Если цель в пределах атаки - к бою!
      if (
        this.getAreaAttack(
          computerCellAttacker,
          computerCellAttacker.character.distanceAttack
        ).find((item) => item === this.selectedCharacter.position)
      ) {
        this.selectedCharacter.character.health -= damageToAttacker;
        resolve(damageToAttacker);
        //  Иначе - движемся к нему
      } else {
        reject({ computerCellAttacker, enemies });
      }
    });
  }
  onCellClick(index) {
    // TODO: react to click
    function actionAfterAttack() {
      if (
        this.selectedCharacter <= 0 ||
        this.selectedCharacter.character.health <= 0
      ) {
        this.charactersToDraw.splice(
          this.charactersToDraw.indexOf(this.selectedCharacter),
          1
        );
      }
      this.gamePlay.redrawPositions(this.charactersToDraw);
      this.selectedCharacter = null;

      if (
        !this.charactersToDraw.find(
          (item) => item.side === this.players.user.name
        )
      ) {
        GamePlay.showMessage("Игра окончена!");
        this.clear();
        this.score = 0;
        this.gamePlay.drawUi(this.theme);
      }
    }

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
      // Чтобы двигать
      [this.selectedCharacter.position, index].forEach((cell) =>
        this.gamePlay.deselectCell(cell)
      );
      this.selectedCharacter.position = index;
      this.gamePlay.redrawPositions(this.charactersToDraw);
      this.movecomputerCellAttack()
        .then(
          (damageToAttacker) =>
            this.gamePlay.showDamage(
              this.selectedCharacter.position,
              damageToAttacker
            ),
          (reject) => {
            reject.computerCellAttacker.position = this.moveDefending(
              reject.computerCellAttacker,
              this.selectedCharacter,
              reject.enemies
            );
          }
        )
        .then(actionAfterAttack.bind(this));
      // Щёлкнули по союзнику
    } else if (
      this.currentStatus === this.boardCell.userCell &&
      this.selectedCharacter !== clickedCharacter
    ) {
      this.gamePlay.deselectCell(this.selectedCharacter.position);
      this.selectedCharacter = clickedCharacter;
      this.gamePlay.selectCell(index);
      // Щёлкнули по врагу
    } else if (this.currentStatus === this.boardCell.computerCell) {
      const opponent = this.charactersToDraw.find(
        (hero) => hero.position === index
      );
      const damageToOpponent = Math.ceil(
        Math.max(
          this.selectedCharacter.character.attack - opponent.character.defence,
          this.selectedCharacter.character.attack * 0.1
        )
      );
      opponent.character.health -= damageToOpponent;
      // Если убили - удаляем с поля
      if (opponent.character.health <= 0) {
        this.charactersToDraw.splice(
          this.charactersToDraw.indexOf(opponent),
          1
        );
        this.gamePlay.redrawPositions(this.charactersToDraw);
        this.gamePlay.deselectAllCells();
        // Убил противника: либо победа, либо он отвечает
        if (
          !this.charactersToDraw.find(
            (item) => item.side === this.players.computer.name
          )
        ) {
          this.selectedCharacter = null;
          this.score = this.charactersToDraw.reduce(
            (accumulator, hero) => accumulator + hero.character.health,
            this.score
          );
          if (this.level === 4) {
            GamePlay.showMessage(`Победа! Ваш счет равен ${this.score}.`);
            this.clear();
            this.gamePlay.drawUi(this.theme);
          } else {
            GamePlay.showMessage(
              `Победа! Переход на уровень ${this.level + 1}! Ваш счет равен ${
                this.score
              }.`
            );
            this.newGame(this.levelUp(), this.theme);
          }
        } else {
          this.movecomputerCellAttack()
            .then(
              (damageToAttacker) =>
                this.gamePlay.showDamage(
                  this.selectedCharacter.position,
                  damageToAttacker
                ),
              (reject) => {
                reject.computerCellAttacker.position = this.moveDefending(
                  reject.computerCellAttacker,
                  this.selectedCharacter,
                  reject.enemies
                );
              }
            )
            .then(actionAfterAttack.bind(this));
        }
      } else {
        this.gamePlay
          .showDamage(index, damageToOpponent)
          .then(() => this.gamePlay.redrawPositions(this.charactersToDraw))
          // Ответ компьютера
          .then(() => this.movecomputerCellAttack())
          .then(
            (damageToAttacker) =>
              this.gamePlay.showDamage(
                this.selectedCharacter.position,
                damageToAttacker
              ),
            (reject) => {
              reject.computerCellAttacker.position = this.moveDefending(
                reject.computerCellAttacker,
                this.selectedCharacter,
                reject.enemies
              );
            }
          )
          .then(actionAfterAttack.bind(this));
      }
      //  В ином случае - ошибка
    } else {
      GamePlay.showError("Это действие запрещено!");
      this.gamePlay.deselectCell(this.selectedCharacter.position);
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
              hero.position === item && hero.side === this.players.user.name
          ) === -1
      );
      if (this.movements.includes(index)) {
        this.gamePlay.selectCell(index, "green");
        this.gamePlay.setCursor(cursors.pointer);
        this.currentStatus = this.boardCell.vacantCell;
      } else if (
        this.possibleAttackCells.includes(index) &&
        this.charactersToDraw
          .filter((item) => item.side === this.players.computer.name)
          .find((item) => item.position === index)
      ) {
        this.gamePlay.selectCell(index, "red");
        this.gamePlay.setCursor(cursors.crosshair);
        this.currentStatus = this.boardCell.computerCell;
      } else if (
        this.charactersToDraw
          .filter((item) => item.side === this.players.user.name)
          .find(
            (item) =>
              item.position === index &&
              item.position !== this.selectedCharacter.position
          )
      ) {
        this.gamePlay.setCursor(cursors.pointer);
        this.currentStatus = this.boardCell.userCell;
      } else {
        this.gamePlay.setCursor(cursors.forbiddenCell);
        this.currentStatus = this.boardCell.forbiddenCell;
      }
    } else if (
      this.charactersToDraw
        .filter((hero) => hero.side === this.players.user.name)
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
