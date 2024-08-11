import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Scoreboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const game = location.state?.game;

  console.log(game);

  if (!game || !game.shooters) {
    return <div>No game data found.</div>;
  }

  const { shooters } = game;

  const handleRecordShots = (shooter) => {
    // Pass current station (initialize to 1 or use shooter's current station if available)
    const currentStation = shooter.currentStation || 1;
    navigate('/record-shots', { state: { game, shooter, currentStation } });
  };

  return (
    <div>
      <h1>Scoreboard</h1>
      <table>
        <thead>
          <tr>
            <th>Shooter</th>
            <th>Shots Taken</th>
            <th>Num Hits</th>
            <th>Max Score Possible</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shooters.map((shooter, index) => (
            <tr key={index}>
              <td>{shooter.name}</td>
              <td>{shooter.shotsTaken || 0}</td>
              <td>{shooter.numHits || 0}</td>
              <td>{shooter.maxScore || 0}</td>
              <td>
                <button onClick={() => handleRecordShots(shooter)}>Record Shots</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => navigate('/')}>Back to Game List</button>
    </div>
  );
};

export default Scoreboard;
