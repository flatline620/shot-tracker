import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/Scoreboard.css'; // Import your CSS file

const Scoreboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const game = location.state?.game;

  if (!game || !game.shooters || !game.shotsDistribution) {
    return <div>No game data found.</div>;
  }

  const { shooters, shotsDistribution } = game;

  const handleRecordShots = (shooter) => {
    // Pass current station (initialize to 1 or use shooter's current station if available)
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
            <th>Shots Remaining</th> {/* New Column */}
            <th>Max Score Possible</th> {/* Updated Column */}
            <th>Current Streak</th>
            <th>Longest Streak</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shooters.map((shooter, index) => {
            const totalShots = shooter.shotsTaken || 0;
            const numHits = shooter.numHits || 0;

            // Ensure shotsDistribution and shooter.shots are defined
            const shotsTakenByStation = shooter.shots || [];
            const shotsRemaining = shotsDistribution.reduce((acc, shotsAtStation, stationIndex) => {
              const shotsAtCurrentStation = shotsTakenByStation.filter(shot => shot.station === stationIndex + 1).length;
              return acc + Math.max(shotsAtStation - shotsAtCurrentStation, 0);
            }, 0);

            // Max Score Possible = Num Hits + Remaining Shots
            const maxScorePossible = numHits + shotsRemaining;

            return (
              <tr key={index}>
                <td>{shooter.name}</td>
                <td>{totalShots}</td>
                <td>{numHits}</td>
                <td>{shotsRemaining}</td> {/* Display Shots Remaining */}
                <td>{maxScorePossible}</td> {/* Display Max Score Possible */}
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
      <button onClick={() => navigate('/')}>Back to Game List</button>
    </div>
  );
};

export default Scoreboard;
