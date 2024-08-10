import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GameDetails = ({ games, onUpdateGame }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const index = parseInt(id, 10);
  const game = useMemo(() => games[index] || {}, [games, index]);

  const [numStations, setNumStations] = useState(game.numStations || '');
  const [minShots, setMinShots] = useState(game.minShots || '');
  const [maxShots, setMaxShots] = useState(game.maxShots || '');
  const [totalShots, setTotalShots] = useState(game.totalShots || '');

  const [shooters, setShooters] = useState(game.shooters || []);
  const [newShooter, setNewShooter] = useState('');

  useEffect(() => {
    setNumStations(game.numStations || '');
    setMinShots(game.minShots || '');
    setMaxShots(game.maxShots || '');
    setTotalShots(game.totalShots || '');
    setShooters(game.shooters || []);
  }, [game]);

  const handleSetupShooters = () => {
    const updatedGame = {
      ...game,
      numStations: parseInt(numStations, 10),
      minShots: parseInt(minShots, 10),
      maxShots: parseInt(maxShots, 10),
      totalShots: parseInt(totalShots, 10),
      shooters
    };

    onUpdateGame(index, updatedGame);
  };

  const handleStartShooting = () => {
    const updatedGame = {
      ...game,
      numStations: parseInt(numStations, 10),
      minShots: parseInt(minShots, 10),
      maxShots: parseInt(maxShots, 10),
      totalShots: parseInt(totalShots, 10),
      shooters
    };

    onUpdateGame(index, updatedGame);
    navigate('/scoreboard', { state: { game: updatedGame } });
  };

  const handleAddShooter = () => {
    if (newShooter.trim() && shooters.length < 4) {
      setShooters([...shooters, {
        name: newShooter,
        shotsTaken: 0,
        numHits: 0,
        maxScore: 0
      }]);
      setNewShooter('');
    }
  };

  const handleRemoveShooter = (shooterToRemove) => {
    setShooters(shooters.filter(shooter => shooter.name !== shooterToRemove));
  };

  return (
    <div>
      <h1>{game.name}</h1>
      <p>Location: {game.location}</p>
      <p>Date: {game.date}</p>

      <form>
        <label>
          Number of Stations:
          <input
            type="number"
            value={numStations}
            onChange={(e) => setNumStations(e.target.value)}
            required
          />
        </label>
        <label>
          Min Shots per Station:
          <input
            type="number"
            value={minShots}
            onChange={(e) => setMinShots(e.target.value)}
            required
          />
        </label>
        <label>
          Max Shots per Station:
          <input
            type="number"
            value={maxShots}
            onChange={(e) => setMaxShots(e.target.value)}
            required
          />
        </label>
        <label>
          Total Shots:
          <input
            type="number"
            value={totalShots}
            onChange={(e) => setTotalShots(e.target.value)}
            required
          />
        </label>
        {/* Removed the Setup Shooters button from here */}
      </form>

      <div>
        <h2>Shooters</h2>
        <input
          type="text"
          value={newShooter}
          onChange={(e) => setNewShooter(e.target.value)}
          placeholder="Add new shooter"
        />
        <button type="button" onClick={handleAddShooter}>Add Shooter</button>
        <ul>
          {shooters.map((shooter, idx) => (
            <li key={idx}>
              {shooter.name}
              <button type="button" onClick={() => handleRemoveShooter(shooter.name)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Moved the button here and changed the text */}
      <button
        style={{
          backgroundColor: 'blue',
          color: 'white',
          padding: '10px 20px',
          marginTop: '20px',
          border: 'none',
          borderRadius: '5px',
          fontSize: '18px',
          cursor: 'pointer'
        }}
        onClick={handleStartShooting}
      >
        Start Shooting
      </button>
    </div>
  );
};

export default GameDetails;
