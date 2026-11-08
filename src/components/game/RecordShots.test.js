import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RecordShots from './RecordShots';
import { clearSavedGameProgress, getSavedGameProgress } from './gameProgress';

const createGame = () => ({
  name: 'Test Game',
  currentStation: 1,
  shotsDistribution: [2],
  stationNames: ['Station 1'],
  truePairsMatrix: [[false, false]],
  shooters: [{
    name: 'Shooter 1',
    shotsTaken: 0,
    numHits: 0,
    shots: [],
  }],
});

const renderRecordShots = game => {
  const shooter = game.shooters[0];
  render(
    <MemoryRouter
      initialEntries={[{ pathname: '/record-shots', state: { game, shooter } }]}
    >
      <Routes>
        <Route path="/record-shots" element={<RecordShots />} />
      </Routes>
    </MemoryRouter>
  );
};

beforeEach(() => {
  clearSavedGameProgress();
});

afterEach(() => {
  clearSavedGameProgress();
});

test('persists each shot before the station is complete', () => {
  const game = createGame();
  renderRecordShots(game);

  fireEvent.click(screen.getByRole('button', { name: '/' }));

  const savedProgress = getSavedGameProgress();
  expect(savedProgress.currentShooterIndex).toBe(0);
  expect(savedProgress.game.shooters[0].shots).toHaveLength(1);
  expect(savedProgress.game.shooters[0].shots[0].hit).toBe(true);
});
