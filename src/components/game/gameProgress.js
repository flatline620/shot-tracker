const SAVED_GAME_KEY = 'shotTrackerSavedGame';

const getLocalDateString = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${today.getFullYear()}-${month}-${day}`;
};

export const saveGameProgress = (game, currentShooterIndex) => {
  localStorage.setItem(SAVED_GAME_KEY, JSON.stringify({
    game,
    currentShooterIndex,
    savedDate: getLocalDateString(),
  }));
};

export const getSavedGameProgress = () => {
  try {
    const savedProgress = JSON.parse(localStorage.getItem(SAVED_GAME_KEY));
    const shooterIndexIsValid = Number.isInteger(savedProgress?.currentShooterIndex)
      && Boolean(savedProgress.game?.shooters?.[savedProgress.currentShooterIndex]);

    if (savedProgress?.savedDate !== getLocalDateString() || !shooterIndexIsValid) {
      clearSavedGameProgress();
      return null;
    }

    return savedProgress;
  } catch {
    clearSavedGameProgress();
    return null;
  }
};

export const clearSavedGameProgress = () => {
  localStorage.removeItem(SAVED_GAME_KEY);
};