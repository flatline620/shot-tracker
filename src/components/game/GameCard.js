import React from 'react';
import moment from 'moment';
import './css/GameCard.css';

const GameCard = ({ game }) => {
    if (!game) return <div>No game data</div>;
  
   // Format the date as mm/dd/yyyy
   const formattedDate = moment(game.date).format('MM/DD/YYYY');

   return (
      <div className="game-card">
        <h2>{game.name}</h2>
        <p>Date: {formattedDate}</p>
        <p>Location: {game.location}</p>
        <button>Select Game</button>
      </div>
    );
  };

export default GameCard;
