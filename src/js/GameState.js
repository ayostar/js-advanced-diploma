export default class GameState {
  static from(object) {
    // TODO: create object
    if (typeof object === "object") {
      return {
        level: object.level,
        positions: object.charactersToDraw,
        theme: object.theme,
        score: object.score,
      };
    }
    return null;
  }
}
