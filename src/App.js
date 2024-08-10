import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GameGrid from './components/game/GameGrid';
import NewGameForm from './components/game/NewGameForm';
import GameDetails from './components/game/GameDetails';
import SetupShooters from './components/game/SetupShooters';
import Scoreboard from './components/game/Scoreboard';
import RecordShots from './components/game/RecordShots';
import './App.css';

const App = () => {
  const [games, setGames] = useState([
    { name: "Steak and Clays", date: "2024-08-01", location: "TBSC", numStations: 7, minShots: 4, maxShots: 8, totalShots: 50, shooters: [] },
    { name: "Game 2", date: "2024-08-02", location: "Location 2", numStations: null, minShots: null, maxShots: null, totalShots: null, shooters: [] },
  ]);

  const handleAddGame = (newGame) => {
    const newIndex = games.length;
    setGames((prevGames) => {
      const updatedGames = [...prevGames, newGame];
      console.log('Games after adding:', updatedGames); // Log to check
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
      console.log('Games after update:', updatedGames);
      return updatedGames;
    });
  };

  useEffect(() => {
    console.log('Games state updated:', games); // Log to check
  }, [games]);


  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameGrid games={games} />} />
        <Route path="/new" element={<NewGameForm onAddGame={handleAddGame} />} />
        <Route path="/game/:id" element={<GameDetails games={games} onUpdateGame={handleUpdateGame} />} />
        <Route path="/setup-shooters" element={<SetupShooters />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/record-shots" element={<RecordShots />} />
      </Routes>
    </Router>
  );
};

export default App;
