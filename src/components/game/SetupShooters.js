import React from 'react';
import { useNavigate } from 'react-router-dom';

const SetupShooters = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Setup Shooters</h1>
      <button onClick={() => navigate('/scoreboard')}>Start Game</button>
    </div>
  );
};

export default SetupShooters;
