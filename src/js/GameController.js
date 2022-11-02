import themes from "./themes";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
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
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    window.addEventListener("unload", () => {
      sessionStorage.setItem("reload", JSON.stringify(GameState.from(this)));
    });
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
