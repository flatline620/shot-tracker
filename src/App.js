import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import NewGameForm from './components/game/NewGameForm';
import GameDetails from './components/game/GameDetails';
import SetupShooters from './components/game/SetupShooters';
import Scoreboard from './components/game/Scoreboard';
import RecordShots from './components/game/RecordShots';
import Help from './components/game/Help';
import { clearSavedGameProgress, getSavedGameProgress } from './components/game/gameProgress';
import './App.css';

const GameRecovery = () => {
  const navigate = useNavigate();
  const hasCheckedProgress = useRef(false);

  useEffect(() => {
    if (hasCheckedProgress.current) return;
    hasCheckedProgress.current = true;

    const savedProgress = getSavedGameProgress();
    if (!savedProgress) return;

    const { game, currentShooterIndex } = savedProgress;
    const shouldResume = window.confirm(`Continue today's saved game "${game.name}"?`);

    if (shouldResume) {
      navigate('/scoreboard', {
        state: { game, currentShooter: game.shooters[currentShooterIndex] },
      });
    } else {
      clearSavedGameProgress();
      navigate('/');
    }
  }, [navigate]);

  return null;
};

const GameNavigationWarning = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const previousLocation = useRef(null);
  const isActiveGame = Boolean(location.state?.game)
    && ['/scoreboard', '/record-shots'].includes(location.pathname);

  useEffect(() => {
    const previous = previousLocation.current;
    previousLocation.current = location;

    if (!previous || previous.key === location.key || navigationType !== 'POP') return;

    const wasInActiveGame = Boolean(previous.state?.game)
      && ['/scoreboard', '/record-shots'].includes(previous.pathname);

    if (wasInActiveGame && !window.confirm('Leave the active game? Any shots not yet recorded may be lost.')) {
      navigate(`${previous.pathname}${previous.search}${previous.hash}`, {
        replace: true,
        state: previous.state,
      });
    }
  }, [location, navigationType, navigate]);

  useEffect(() => {
    if (!isActiveGame) return undefined;

    const warnBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [isActiveGame]);

  return null;
};

const App = () => {
  const [games, setGames] = useState([
    //{ name: "Steak and Clays", date: new Date().toISOString().split('T')[0], location: "TBSC", numStations: 7, minShots: 4, maxShots: 8, totalShots: 50, shooters: [{name: 'Sam', shotsTaken: 0, numHits: 0, maxScore: 0}, {name: 'Laura', shotsTaken: 0, numHits: 0, maxScore: 0}, {name: 'Rob', shotsTaken: 0, numHits: 0, maxScore: 0}] },
  ]);

  const handleAddGame = (newGame) => {
    const gameToAdd = {
        numStations: 7,
        minShots: 4,
        maxShots: 8,
        totalShots: 50,
      shooters: [],
      ...newGame,
    };
    
    const newIndex = games.length;
    setGames((prevGames) => {
      const updatedGames = [...prevGames, gameToAdd];

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
      <GameRecovery />
      <GameNavigationWarning />
      <Routes>
        <Route path="/" element={<GameDetails games={games} onAddGame={handleAddGame} onUpdateGame={handleUpdateGame} />} />
        <Route path="/new" element={<NewGameForm onAddGame={handleAddGame} />} />
        <Route path="/game/:id" element={<GameDetails games={games} onAddGame={handleAddGame} onUpdateGame={handleUpdateGame} />} />
        <Route path="/setup-shooters" element={<SetupShooters />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/record-shots" element={<RecordShots />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </Router>
  );
};

export default App;
