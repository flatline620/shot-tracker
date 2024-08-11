import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/NewGameForm.css';

const NewGameForm = ({ onAddGame }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newGame = {
      name,
      date,
      location,
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
        <button type="submit">Add Game</button>
      </form>
    </div>
  );
};

export default NewGameForm;
