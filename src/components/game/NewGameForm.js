import React from 'react';
import { Link } from 'react-router-dom';

const NewGameForm = ({ name, setName, location, setLocation, date, setDate }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>New Games</h1>
        <Link to="/help" style={{ textDecoration: 'none', fontSize: '20px' }}>
          ❓
        </Link>
      </div>
      <form className="game-form">
        <div className="form-row">
          <label htmlFor="name">Game Name:</label>
          <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={(name && name.trim() === '') ? 'invalid' : ''}
          />
        </div>

        <div className="form-row">
          <label htmlFor="location">Location:</label>
          <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={(location && location.trim() === '') ? 'invalid' : ''}
          />
        </div>
        
        <div className="form-row">
          <label htmlFor="date">Date:</label>
          <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={(date && date.trim() === '') ? 'invalid' : ''}
          />
        </div>
      </form>
    </div>
  );
};

export default NewGameForm;
