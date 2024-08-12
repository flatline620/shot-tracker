import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GenericScorecard from './GenericScorecard';
import './css/Scoreboard.css';

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

  // Helper function to calculate the number of stations a shooter has shot at
  const getStationsShotAt = (shooter) => {
    // Ensure shooter.shots is an array
    const shots = shooter.shots || [];
    const uniqueStations = new Set(shots.map(shot => shot.station));
    return uniqueStations.size;
  };

  return (
    <div className="scoreboard">
      <h1>Scoreboard</h1>

      <table>
        <thead>
          <tr>
            <th>Shooter</th>
            <th>Stations Shot</th> {/* Moved to second position */}
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
                <td>{getStationsShotAt(shooter)}</td> {/* Stations Shot at */}
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

      <GenericScorecard 
        shotsDistribution={shotsDistribution} 
        stationNames={stationNames}
        truePairsMatrix={truePairsMatrix} 
      />

      <button onClick={() => navigate('/')}>Back to Game List</button>
    </div>
  );
};

export default Scoreboard;
