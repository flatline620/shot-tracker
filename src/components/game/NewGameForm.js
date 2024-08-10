import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/NewGameForm.css';

const NewGameForm = ({ onAddGame }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [numStations, setNumStations] = useState('');
  const [minShots, setMinShots] = useState('');
  const [maxShots, setMaxShots] = useState('');
  const [totalShots, setTotalShots] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newGame = {
      name,
      date,
      location,
      numStations: parseInt(numStations, 10),
      minShots: parseInt(minShots, 10),
      maxShots: parseInt(maxShots, 10),
      totalShots: parseInt(totalShots, 10),
    };
    const newIndex = onAddGame(newGame);
    navigate(`/game/${newIndex}`);
  };

  return (
    <div>
      <h1>Add New Game</h1>
      <form onSubmit={handleSubmit} className="new-game-form">
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <label>
          Location:
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </label>
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
        <button type="submit">Add Game</button>
      </form>
    </div>
  );
};

export default NewGameForm;
