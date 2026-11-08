import {
  clearSavedGameProgress,
  getSavedGameProgress,
  saveGameProgress,
} from './gameProgress';

const savedGame = {
  name: 'Test Game',
  shooters: [{ name: 'Shooter 1', shots: [{ station: 1, hit: true }] }],
};

afterEach(() => {
  clearSavedGameProgress();
});

test('saves and restores the current game progress', () => {
  saveGameProgress(savedGame, 0);

  expect(getSavedGameProgress()).toEqual({
    game: savedGame,
    currentShooterIndex: 0,
    savedDate: expect.any(String),
  });
});

test('discards progress for a different date', () => {
  localStorage.setItem('shotTrackerSavedGame', JSON.stringify({
    game: savedGame,
    currentShooterIndex: 0,
    savedDate: '2000-01-01',
  }));

  expect(getSavedGameProgress()).toBeNull();
  expect(localStorage.getItem('shotTrackerSavedGame')).toBeNull();
});
