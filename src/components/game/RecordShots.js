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

  // Define the initial shots for each station
  const initialShots = [4, 6, 4, 6, 4, 6, 4, 8, 8]; // Example values

  // Set up local state for shots, new shot, selected station, and current station
  const [shots, setShots] = useState(shooter.shots || []);
  const [newShot, setNewShot] = useState({ station: initialStation, hit: null });
  const [selectedStation, setSelectedStation] = useState(initialStation);
  const [currentStation, setCurrentStation] = useState(initialStation);

  useEffect(() => {
    setShots(shooter.shots || []);
    setCurrentStation(shooter.currentStation || initialStation);
  }, [shooter.shots, shooter.currentStation]);

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
            currentStation: remainingShots > 0 ? s.currentStation : Math.min(currentStation + 1, maxStations)
          }
        : s
    );

    const updatedGame = { ...game, shooters: updatedShooters };
    navigate('/scoreboard', { state: { game: updatedGame } });
  };

  const handleStationChange = (e) => {
    const newStation = parseInt(e.target.value, 10);
    setSelectedStation(newStation);
    setCurrentStation(newStation); // Set current station to the selected station
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
            {Array.from({ length: maxStations }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                Station {index + 1}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <button className="shot-button hit" onClick={() => handleRecordShot(true)}>
          /
        </button>
        <button className="shot-button miss" onClick={() => handleRecordShot(false)}>
          O
        </button>
        <button className="shot-button undo" onClick={handleUndoLastShot}>
          Undo
        </button>
      </div>
      <h2>Recorded Shots</h2>
      <div className="shots-grid">
        {shotsByStation.map((stationShots, stationIndex) => (
          <div key={stationIndex} className="station-grid" style={{ gridTemplateColumns: `repeat(${initialShots[stationIndex]}, 40px)` }}>
            {Array.from({ length: initialShots[stationIndex] }).map((_, shotIndex) => {
              const shot = stationShots.find(s => s.shotIndex === shotIndex);
              return (
                <button
                  key={shotIndex}
                  className={`shot ${shot ? (shot.hit ? 'hit' : 'miss') : 'empty'}`}
                >
                  {shot ? (shot.hit ? '/' : 'O') : '-'}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <button className="record-button" onClick={handleRecordShots}>
        Record Shots
      </button>
    </div>
  );
};

export default RecordShots;
