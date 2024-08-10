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

  // Handler to record a shot (hit or miss)
  const handleRecordShot = (hit) => {
    if (newShot.station >= 1 && newShot.station <= maxStations) {
      const stationShots = shots.filter(shot => shot.station === newShot.station);
      if (stationShots.length < initialShots[newShot.station - 1]) {
        setShots([...shots, { ...newShot, hit }]);
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
    const updatedShooters = game.shooters.map((s) =>
      s.name === shooter.name
        ? { 
            ...s, 
            shotsTaken: shots.length, 
            numHits: shots.filter(s => s.hit).length, 
            shots, 
            currentStation: newShot.station + 1  // Update the station for this shooter
          }
        : s
    );

    const updatedGame = { ...game, shooters: updatedShooters };
    navigate('/scoreboard', { state: { game: updatedGame } });
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
            {stationShots.length === 0
              ? <div style={{
                  backgroundColor: 'lightgrey',
                  opacity: 0.5,
                  width: '40px',
                  height: '40px',
                  borderRadius: '5px'
                }} />
              : stationShots.map((shot, shotIndex) => (
                <button
                  key={shotIndex}
                  style={{
                    backgroundColor: shot.hit ? 'green' : 'red',
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'default'
                  }}
                >
                  {shot.hit ? '/' : 'O'}
                </button>
              ))
            }
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
        Record Shots and Return
      </button>
    </div>
  );
};

export default RecordShots;
