// src/components/Scoreboard.js

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GenericScorecard from './GenericScorecard'; // Import the new component
import './css/Scoreboard.css'; // Ensure this is correct

const Scoreboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const game = location.state?.game;

  if (!game || !game.shooters || !game.shotsDistribution || !game.stationNames || !game.truePairsMatrix) {
    return <div>No game data found.</div>;
  }

  const { shooters, shotsDistribution, stationNames, truePairsMatrix } = game;

  const handleRecordShots = (shooter) => {
    const currentStation = shooter.currentStation || 1;
    navigate('/record-shots', { state: { game, shooter, currentStation } });
  };

  return (
    <div className="scoreboard">
      <h1>Scoreboard</h1>

      <table>
        <thead>
          <tr>
            <th>Shooter</th>
            <th>Shots Taken</th>
            <th>Num Hits</th>
            <th>Shots Remaining</th>
            <th>Max Score Possible</th>
            <th>Current Streak</th>
            <th>Longest Streak</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shooters.map((shooter, index) => {
            const totalShots = shooter.shotsTaken || 0;
            const numHits = shooter.numHits || 0;

            const shotsTakenByStation = shooter.shots || [];
            const shotsRemaining = shotsDistribution.reduce((acc, shotsAtStation, stationIndex) => {
              const shotsAtCurrentStation = shotsTakenByStation.filter(shot => shot.station === stationIndex + 1).length;
              return acc + Math.max(shotsAtStation - shotsAtCurrentStation, 0);
            }, 0);

            const maxScorePossible = numHits + shotsRemaining;

            return (
              <tr key={index}>
                <td>{shooter.name}</td>
                <td>{totalShots}</td>
                <td>{numHits}</td>
                <td>{shotsRemaining}</td>
                <td>{maxScorePossible}</td>
                <td>{shooter.currentStreak || 0}</td>
                <td>{shooter.maxStreak || 0}</td>
                <td>
                  <button onClick={() => handleRecordShots(shooter)}>Record Shots</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Add the Generic Scorecard at the bottom */}
      <GenericScorecard 
        shotsDistribution={shotsDistribution} 
        stationNames={stationNames}
        truePairsMatrix={truePairsMatrix} // Pass the True Pairs Matrix
      />

      <button onClick={() => navigate('/')}>Back to Game List</button>
    </div>
  );
};

export default Scoreboard;
