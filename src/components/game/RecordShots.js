import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/RecordShots.css'; 
import StationGrid from './StationGrid'; // Adjust the path as necessary

const RecordShots = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const game = location.state?.game || { shooters: [] };
  const shooter = location.state?.shooter || { name: '', shots: [], currentStreak: 0, maxStreak: 0 };
  const initialStation = game.currentStation || 1;

  const initialShots = game.shotsDistribution || [];
  const truePairsMatrix = game.truePairsMatrix || [];
  const rotateShooters = game.rotateShooters || false;

  const [shots, setShots] = useState(shooter.shots || []);
  const [newShot, setNewShot] = useState({ station: initialStation, hit: null });
  const [selectedStation, setSelectedStation] = useState(initialStation);
  const [currentStation, setCurrentStation] = useState(initialStation);

  const stationNames = game.stationNames || Array.from({ length: initialShots.length }, (_, i) => `Station ${i + 1}`);

  useEffect(() => {
    setShots(shooter.shots || []);
    setCurrentStation(shooter.currentStation || initialStation);
  }, [shooter.shots, shooter.currentStation, initialStation]);

  useEffect(() => {
    setNewShot(prev => ({ ...prev, station: currentStation }));
  }, [currentStation]);

  const maxStations = initialShots.length;
  const shotsByStation = Array.from({ length: maxStations }, (_, station) =>
    shots.filter(shot => shot.station === station + 1)
  );

  const calculateCurrentStationShots = () => {
    return shots.filter(s => s.station === currentStation);
  };

  const recalculateStreak = useCallback(() => {
    let currentStreak = 0;
    let maxStreak = shooter.maxStreak || 0;

    for (const shot of shots) {
      if (shot.station === currentStation) {
        if (shot.hit) {
          currentStreak += 1;
        } else {
          currentStreak = 0;
        }
      } else {
        if (shot.hit) {
          currentStreak += 1;
        } else {
          currentStreak = 0;
        }
      }

      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    }

    return { currentStreak, maxStreak };
  }, [shots, currentStation, shooter.maxStreak]);

  useEffect(() => {
    const { currentStreak, maxStreak } = recalculateStreak();
    setNewShot(prev => ({ ...prev, currentStreak, maxStreak }));
  }, [recalculateStreak]);

  const handleRecordShot = (hit) => {
    if (currentStation >= 1 && currentStation <= maxStations) {
      const stationShots = calculateCurrentStationShots();
      if (stationShots.length < initialShots[currentStation - 1]) {
        const newShotIndex = stationShots.length;
        const { currentStreak, maxStreak } = recalculateStreak();
        setShots(prevShots => [
          ...prevShots,
          { ...newShot, hit, shotIndex: newShotIndex, currentStreak, maxStreak }
        ]);
        setNewShot(prev => ({ ...prev, hit: null }));
      }
    }
  };

  const handleUndoLastShot = () => {
    const stationShots = calculateCurrentStationShots();
    
    if (stationShots.length > 0) {
      const lastShotIndex = stationShots[stationShots.length - 1].shotIndex;
      
      setShots(prevShots => prevShots.filter(shot => !(shot.station === currentStation && shot.shotIndex === lastShotIndex)));
    }
  };

  const areAllShootersDoneForStation = (station, updatedShooters) => {
    return updatedShooters.every(shooter => {
      if (!shooter || !Array.isArray(shooter.shots)) {
        return false;
      }
      const shotsForStation = shooter.shots.filter(shot => shot.station === station);
      return shotsForStation.length >= (initialShots[station - 1] || 0);
    });
  };

  const handleRecordShots = () => {
    const { currentStreak, maxStreak } = recalculateStreak();

    const updatedShooters = game.shooters.map((s) =>
      s.name === shooter.name
        ? {
            ...s,
            shotsTaken: shots.length,
            numHits: shots.filter(s => s.hit).length,
            shots,
            currentStreak,
            maxStreak
          }
        : s
    );

    const allShootersDone = areAllShootersDoneForStation(currentStation, updatedShooters);

    const updatedGame = { ...game, shooters: updatedShooters, currentStation: findNextIncompleteStation(allShootersDone) };

    const nextShooter = findNextShooter(allShootersDone);
    navigate('/scoreboard', { state: { game: updatedGame, currentShooter: nextShooter } });
  };

  const findNextIncompleteStation = (allShootersDone) => {
    if (!allShootersDone) {
      return currentStation;
    }

    const startStationIndex = currentStation - 1; // Convert to zero-based index
  
    for (let i = 0; i < maxStations; i++) {
      // Calculate the index to check, wrapping around to the beginning if necessary
      const stationIndex = (startStationIndex + i) % maxStations;
      const station = stationIndex + 1;
      const shotsAtStation = shots.filter(shot => shot.station === station).length;

      if (shotsAtStation < initialShots[stationIndex]) {
        return station;
      }
    }
  
    // If all stations are complete, return null
    return null;
  };

  const findNextShooter = (allShootersDone) => {
    const currentIndex = game.shooters.indexOf(shooter);
    let nextIndex = (currentIndex + 1) % game.shooters.length;

    if (allShootersDone && rotateShooters) {
      nextIndex = (nextIndex + 1) % game.shooters.length;
    }

    return game.shooters[nextIndex];
  };

  const handleStationChange = (e) => {
    const newStation = parseInt(e.target.value, 10);
    const isStationComplete = initialShots[newStation - 1] <= calculateCurrentStationShots().length;
    
    if (!isStationComplete) {
      setSelectedStation(newStation);
      setCurrentStation(newStation);
    }
  };

  const isRecordingAllowed = () => {
    return calculateCurrentStationShots().length < initialShots[currentStation - 1];
  };

  const handleCancelShooter = () => {
    navigate('/scoreboard', { state: { game } });
  };

  const renderStationGrid = (stationIndex) => {
    const shotsForStation = shotsByStation[stationIndex];
    return (
      <div className="station-grid" style={{ gridTemplateColumns: `repeat(${initialShots[stationIndex]}, 40px)` }}>
        {Array.from({ length: initialShots[stationIndex] }).map((_, shotIndex) => {
          const shot = shotsForStation.find(s => s.shotIndex === shotIndex);
          const isTruePair = truePairsMatrix[stationIndex][shotIndex] || false;
          return (
            <button
              key={shotIndex}
              className={`shot ${shot ? (shot.hit ? 'hit' : 'miss') : isTruePair ? 'true-pair' : 'empty'}`}
            >
              {shot ? (shot.hit ? '/' : 'O') : isTruePair ? 'TP' : '-'}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="record-shots">
      <h1>Record Shots for {shooter.name}</h1>
      <div>
        <label>
          Select Station:
          <select
            value={selectedStation}
            onChange={handleStationChange}
            className="station-select"
          >
            {stationNames.map((name, index) => {
              const station = index + 1;
              const isComplete = initialShots[index] <= shots.filter(shot => shot.station === station).length;
              return (
                <option key={station} value={station} disabled={isComplete}>
                  {name}
                </option>
              );
            })}
          </select>
        </label>
      </div>
      <div className="button-container">
        <button
          className="shot-button hit"
          onClick={() => handleRecordShot(true)}
          disabled={!isRecordingAllowed()}
        >
          /
        </button>
        <button
          className="shot-button miss"
          onClick={() => handleRecordShot(false)}
          disabled={!isRecordingAllowed()}
        >
          O
        </button>
        <button
          className="shot-button undo"
          onClick={handleUndoLastShot}
        >
          Undo
        </button>
      </div>
      <div className="selected-station-preview">
        <h2>Current Station Preview</h2>
        {renderStationGrid(currentStation - 1)}
      </div>
      <div className="button-container">
        <button className="record-button" onClick={handleRecordShots}>
          Record Shots
        </button>
        <button className="return-button" onClick={handleCancelShooter}>
          Cancel Shooter
        </button>
      </div>
      <h2>Recorded Shots</h2>
      <StationGrid
        stationShots={shotsByStation}
        stationNames={stationNames}
        initialShots={initialShots}
        renderStationGrid={renderStationGrid}
      />

    </div>
  );
};

export default RecordShots;
