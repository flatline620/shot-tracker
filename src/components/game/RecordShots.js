import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/RecordShots.css'; // Corrected import path

const RecordShots = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract game, shooter, and currentStation from location state
  const game = location.state?.game || { shooters: [] };
  const shooter = location.state?.shooter || { name: '', shots: [] };
  const initialStation = location.state?.currentStation || 1;

  // Define the initial shots for each station and True Pairs matrix
  const initialShots = game.shotsDistribution || [];
  const truePairsMatrix = game.truePairsMatrix || [];

  // Set up local state for shots, new shot, selected station, current station, and streak tracking
  const [shots, setShots] = useState(shooter.shots || []);
  const [newShot, setNewShot] = useState({ station: initialStation, hit: null });
  const [selectedStation, setSelectedStation] = useState(initialStation);
  const [currentStation, setCurrentStation] = useState(initialStation);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  // Use station names from the game object
  const stationNames = game.stationNames || Array.from({ length: initialShots.length }, (_, i) => `Station ${i + 1}`);

  useEffect(() => {
    setShots(shooter.shots || []);
    setCurrentStation(shooter.currentStation || initialStation);
  }, [shooter.shots, shooter.currentStation, initialStation]);

  useEffect(() => {
    setNewShot(prev => ({ ...prev, station: currentStation }));
    recalculateStreak();
  }, [currentStation, shots]);

  const maxStations = initialShots.length;
  const shotsByStation = Array.from({ length: maxStations }, (_, station) =>
    shots.filter(shot => shot.station === station + 1)
  );

  const calculateCurrentStationShots = () => {
    return shots.filter(s => s.station === currentStation);
  };

  const handleRecordShot = (hit) => {
    if (currentStation >= 1 && currentStation <= maxStations) {
      const stationShots = calculateCurrentStationShots();
      if (stationShots.length < initialShots[currentStation - 1]) {
        const newShotIndex = stationShots.length;
        setShots(prevShots => [...prevShots, { ...newShot, hit, shotIndex: newShotIndex }]);
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

    const updatedShooters = game.shooters.map((s) =>
      s.name === shooter.name
        ? {
            ...s,
            shotsTaken: shots.length,
            numHits: shots.filter(s => s.hit).length,
            shots,
            currentStation: remainingShots > 0 ? s.currentStation : findNextIncompleteStation()
          }
        : s
    );

    const updatedGame = { ...game, shooters: updatedShooters };
    navigate('/scoreboard', { state: { game: updatedGame } });
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

  // Function to recalculate the largest hit streak
  const recalculateStreak = () => {
    let currentStreak = 0;
    let maxStreak = 0;

    shots.forEach(shot => {
      if (shot.hit) {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    });

    setCurrentStreak(currentStreak);
    setMaxStreak(maxStreak);
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
      <h2>Current Streak: {currentStreak}</h2>
      <h2>Longest Streak: {maxStreak}</h2>
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
