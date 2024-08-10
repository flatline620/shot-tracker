import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RecordShots = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract game, shooter, and currentStation from location state
  const game = location.state?.game || { shooters: [] };
  const shooter = location.state?.shooter || { name: '', shots: [] };
  const initialStation = location.state?.currentStation || 1;

  // Define the initial shots for each station
  const initialShots = [4, 6, 4, 6, 4, 6, 4, 8, 8]; // Example values

  // Set up local state for shots and new shot
  const [shots, setShots] = useState(shooter.shots || []);
  const [newShot, setNewShot] = useState({ station: initialStation, hit: null });

  // Effect to update the shots state when the shooter changes
  useEffect(() => {
    setShots(shooter.shots || []);
  }, [shooter.shots]);

  // Create a grid of shots by station
  const maxStations = initialShots.length;
  const shotsByStation = Array.from({ length: maxStations }, (_, station) =>
    shots.filter(shot => shot.station === station + 1)
  );

  // Calculate the current station shots and remaining shots
  const calculateCurrentStationShots = () => {
    return shots.filter(s => s.station === newShot.station);
  };

  // Handler to record a shot (hit or miss)
  const handleRecordShot = (hit) => {
    if (newShot.station >= 1 && newShot.station <= maxStations) {
      const stationShots = calculateCurrentStationShots();
      if (stationShots.length < initialShots[newShot.station - 1]) {
        // Determine the index of the new shot
        const newShotIndex = stationShots.length;
        setShots([...shots, { ...newShot, hit, shotIndex: newShotIndex }]);
        setNewShot({ station: newShot.station, hit: null }); // Keep station the same
      }
    }
  };

  // Handler to remove the last recorded shot
  const handleUndoLastShot = () => {
    setShots(shots.slice(0, -1)); // Remove the last shot
  };

  // Handler to save recorded shots and navigate back to scoreboard
  const handleRecordShots = () => {
    const currentShots = calculateCurrentStationShots();
    const totalShotsAtCurrentStation = initialShots[newShot.station - 1];
    const remainingShots = totalShotsAtCurrentStation - currentShots.length;

    if (remainingShots > 0) {
      // If there are remaining shots, do not move to the next station
      const updatedShooters = game.shooters.map((s) =>
        s.name === shooter.name
          ? { 
              ...s, 
              shotsTaken: shots.length, 
              numHits: shots.filter(s => s.hit).length, 
              shots // No change in station
            }
          : s
      );

      const updatedGame = { ...game, shooters: updatedShooters };
      navigate('/scoreboard', { state: { game: updatedGame } });
    } else {
      // No remaining shots, just record and move on
      const updatedShooters = game.shooters.map((s) =>
        s.name === shooter.name
          ? { 
              ...s, 
              shotsTaken: shots.length, 
              numHits: shots.filter(s => s.hit).length, 
              shots, 
              currentStation: newShot.station + 1 // Move to next station
            }
          : s
      );

      const updatedGame = { ...game, shooters: updatedShooters };
      navigate('/scoreboard', { state: { game: updatedGame } });
    }
  };

  return (
    <div>
      <h1>Record Shots for {shooter.name}</h1>
      <div>
        <label>
          Station:
          <input
            type="number"
            value={newShot.station}
            readOnly
            style={{ marginBottom: '10px', padding: '5px', fontSize: '16px' }}
          />
        </label>
      </div>
      <div>
        <button
          style={{
            backgroundColor: 'green',
            color: 'white',
            padding: '20px',
            margin: '10px',
            border: 'none',
            borderRadius: '10px',
            fontSize: '24px',
            width: '100px',
            height: '100px',
            cursor: 'pointer'
          }}
          onClick={() => handleRecordShot(true)}
        >
          /
        </button>
        <button
          style={{
            backgroundColor: 'red',
            color: 'white',
            padding: '20px',
            margin: '10px',
            border: 'none',
            borderRadius: '10px',
            fontSize: '24px',
            width: '100px',
            height: '100px',
            cursor: 'pointer'
          }}
          onClick={() => handleRecordShot(false)}
        >
          O
        </button>
        <button
          style={{
            backgroundColor: 'grey',
            color: 'white',
            padding: '20px',
            margin: '10px',
            border: 'none',
            borderRadius: '10px',
            fontSize: '24px',
            width: '100px',
            height: '100px',
            cursor: 'pointer'
          }}
          onClick={handleUndoLastShot}
        >
          Undo
        </button>
      </div>
      <h2>Recorded Shots</h2>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {shotsByStation.map((stationShots, stationIndex) => (
          <div key={stationIndex} style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${initialShots[stationIndex] || 1}, 40px)`,
            gap: '5px'
          }}>
            {Array.from({ length: initialShots[stationIndex] }).map((_, shotIndex) => {
              const shot = stationShots.find(s => s.shotIndex === shotIndex);
              return (
                <button
                  key={shotIndex}
                  style={{
                    backgroundColor: shot ? (shot.hit ? 'green' : 'red') : 'lightgrey',
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'default'
                  }}
                >
                  {shot ? (shot.hit ? '/' : 'O') : '-'}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <button
        style={{
          backgroundColor: 'blue',
          color: 'white',
          padding: '10px 20px',
          marginTop: '20px',
          border: 'none',
          borderRadius: '5px',
          fontSize: '18px',
          cursor: 'pointer'
        }}
        onClick={handleRecordShots}
      >
        Record Shots
      </button>
    </div>
  );
};

export default RecordShots;
