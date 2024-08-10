import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameCard from './GameCard';
import './css/GameGrid.css';

const GameGrid = ({ games }) => {
  const navigate = useNavigate();

  const handleSelectGame = (index) => {
    navigate(`/game/${index}`);
  };

  const handleAddGame = () => {
    navigate('/new');
  };

  return (
    <div className="game-grid">
      <button onClick={handleAddGame}>Add Game</button>
      {games.map((game, index) => (
        <div key={index} onClick={() => handleSelectGame(index)}>
          <GameCard game={game} />
        </div>
      ))}
    </div>
  );
};

export default GameGrid;
