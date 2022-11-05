import GameStateService from "../GameStateService";

test("Should alert if no game to load", () => {
  const stateService = new GameStateService(null);
  const received = () => stateService.load();
  expect(received).toThrow("Invalid state");
});
