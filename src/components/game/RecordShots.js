import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/RecordShots.css'; // Corrected import path

const RecordShots = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract game, shooter, and currentStation from location state
  const game = location.state?.game || { shooters: [] };
  const shooter = location.state?.shooter || { name: '', shots: [], currentStreak: 0, maxStreak: 0 };
  const initialStation = location.state?.currentStation || 1;

  // Define the initial shots for each station and True Pairs matrix
  const initialShots = game.shotsDistribution || [];
  const truePairsMatrix = game.truePairsMatrix || [];
  const rotateShooters = game.rotateShooters || false; // Assuming this flag is part of game object

  // Set up local state for shots, new shot, selected station, and current station
  const [shots, setShots] = useState(shooter.shots || []);
  const [newShot, setNewShot] = useState({ station: initialStation, hit: null });
  const [selectedStation, setSelectedStation] = useState(initialStation);
  const [currentStation, setCurrentStation] = useState(initialStation);

  // Use station names from the game object
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

  // Function to recalculate streak
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
        setNewShot(prev => ({ ...prev, hit: null })); // Keep station the same
      }
    }
  };

  const handleUndoLastShot = () => {
    // Get all shots for the current station
    const stationShots = calculateCurrentStationShots();
    
    if (stationShots.length > 0) {
      // Get the index of the last shot for the current station
      const lastShotIndex = stationShots[stationShots.length - 1].shotIndex;
      
      // Filter out the last shot for the current station
      setShots(prevShots => prevShots.filter(shot => !(shot.station === currentStation && shot.shotIndex === lastShotIndex)));
    }
  };

  const handleRecordShots = () => {
    const currentShots = calculateCurrentStationShots();
    const totalShotsAtCurrentStation = initialShots[currentStation - 1];
    const remainingShots = totalShotsAtCurrentStation - currentShots.length;
  
    const { currentStreak, maxStreak } = recalculateStreak();
  
    const updatedShooters = game.shooters.map((s) =>
      s.name === shooter.name
        ? {
            ...s,
            shotsTaken: shots.length,
            numHits: shots.filter(s => s.hit).length,
            shots,
            currentStation: remainingShots > 0 ? s.currentStation : findNextIncompleteStation(),
            currentStreak,
            maxStreak
          }
        : s
    );
  
    const updatedGame = { ...game, shooters: updatedShooters };
    const nextShooter = findNextShooter(updatedShooters);
    navigate('/scoreboard', { state: { game: updatedGame, currentShooter: nextShooter } });
  };

  const findNextIncompleteStation = () => {
    // Find the next incomplete station
    for (let i = 0; i < maxStations; i++) {
      const station = i + 1;
      const shotsAtStation = shots.filter(shot => shot.station === station).length;
      if (shotsAtStation < initialShots[i]) {
        return station;
      }
    }
    return null; // All stations are complete
  };

  const findNextShooter = () => {
    console.log('Rotate Shooters:', rotateShooters);
    if (rotateShooters) {
      // Find index of the current shooter
      const currentShooterIndex = game.shooters.findIndex(s => s.name === shooter.name);
      // Determine the next shooter after the one who shot first
      const nextShooterIndex = (currentShooterIndex + 1) % game.shooters.length;
      return game.shooters[nextShooterIndex];
    } else {
      // Default logic: move to next shooter in list
      // for (let i = 0; i < maxStations; i++) {
      //   console.log('Validating Station:', i);

      //   const station = i + 1;
      //   const shotsAtStation = shots.filter(shot => shot.station === station).length;
      //   if (shotsAtStation < initialShots[i]) {
      //     console.log('Incomplete Shooter', shooter);
      //     return shooter; // Remain as the current shooter if incomplete
      //   }
      // }

      console.log('Moving to next shooter');

      // Find next shooter
      const currentIndex = game.shooters.indexOf(shooter);
      const nextIndex = (currentIndex + 1) % game.shooters.length;

      console.log('Next Index:', nextIndex);
      console.log('Next Shooter:', game.shooters[nextIndex]);
      return game.shooters[nextIndex];
    }
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
    navigate('/scoreboard', { state: { game } }); // Navigate to scoreboard without saving changes
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
      <h2>Recorded Shots</h2>
      <div className="shots-container">
        {shotsByStation.map((stationShots, stationIndex) => (
          <div key={stationIndex} className="station-row">
            <div className="station-name">{stationNames[stationIndex]}</div>
            <div
              className="station-grid"
              style={{ gridTemplateColumns: `repeat(${initialShots[stationIndex]}, 40px)` }}
            >
              {Array.from({ length: initialShots[stationIndex] }).map((_, shotIndex) => {
                const shot = stationShots.find(s => s.shotIndex === shotIndex);
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
          </div>
        ))}
      </div>
      <div className="button-container">
        <button className="record-button" onClick={handleRecordShots}>
          Record Shots
        </button>
        <button className="return-button" onClick={handleCancelShooter}>
          Cancel Shooter
        </button>
      </div>
    </div>
  );
};

export default RecordShots;
