import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NewGameForm from './components/game/NewGameForm';
import GameDetails from './components/game/GameDetails';
import SetupShooters from './components/game/SetupShooters';
import Scoreboard from './components/game/Scoreboard';
import RecordShots from './components/game/RecordShots';
import './App.css';

const App = () => {
  const [games, setGames] = useState([
    //{ name: "Steak and Clays", date: new Date().toISOString().split('T')[0], location: "TBSC", numStations: 7, minShots: 4, maxShots: 8, totalShots: 50, shooters: [{name: 'Sam', shotsTaken: 0, numHits: 0, maxScore: 0}, {name: 'Laura', shotsTaken: 0, numHits: 0, maxScore: 0}, {name: 'Rob', shotsTaken: 0, numHits: 0, maxScore: 0}] },
  ]);

  const handleAddGame = (newGame) => {
    newGame = {...newGame, 
        numStations: 7,
        minShots: 4,
        maxShots: 8,
        totalShots: 50,
        shooters: []
    };
    
    const newIndex = games.length;
    setGames((prevGames) => {
      const updatedGames = [...prevGames, newGame];

      return updatedGames;
    });
    return newIndex;
  };

  const handleUpdateGame = (index, updatedGame) => {
    if (typeof index !== 'number' || index < 0 || index >= games.length) {
      console.error('Invalid index:', index);
      return;
    }
  
    setGames((prevGames) => {
      const updatedGames = prevGames.map((game, i) =>
        i === parseInt(index, 10) ? updatedGame : game
      );

      return updatedGames;
    });
  };

  return (
    <Router basename="/shot-tracker">
      <Routes>
        <Route path="/" element={<GameDetails games={games} onAddGame={handleAddGame} onUpdateGame={handleUpdateGame} />} />
        <Route path="/new" element={<NewGameForm onAddGame={handleAddGame} />} />
        <Route path="/game/:id" element={<GameDetails games={games} onAddGame={handleAddGame} onUpdateGame={handleUpdateGame} />} />
        <Route path="/setup-shooters" element={<SetupShooters />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/record-shots" element={<RecordShots />} />
      </Routes>
    </Router>
  );
};

export default App;
