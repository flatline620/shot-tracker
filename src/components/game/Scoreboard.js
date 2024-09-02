import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GenericScorecard from './GenericScorecard';
import StationNaming from './StationNaming'; // Import StationNaming
import './css/Scoreboard.css';

const Scoreboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRenamingStations, setIsRenamingStations] = useState(false);
  const [localStationNames, setLocalStationNames] = useState(location.state?.game?.stationNames || []);
  const game = location.state?.game || { shooters: [] };
  const currentShooter = location.state?.currentShooter || (game.shooters.length > 0 ? game.shooters[0] : null);

  if (!game || !game.shooters || !game.shotsDistribution || !game.stationNames || !game.truePairsMatrix) {
    return <div>No game data found.</div>;
  }

  const { shooters, shotsDistribution, stationNames, truePairsMatrix } = game;

  const getStationsShotAt = (shooter) => {
    const shots = shooter.shots || [];
    const uniqueStations = new Set(shots.map(shot => shot.station));
    return uniqueStations.size;
  };

  const handleRecordShots = (shooter) => {
    navigate('/record-shots', { state: { game, shooter } });
  };

  // Check if all shooters have finished
  const allShootersFinished = shooters.every(shooter => {
    const shotsTakenByStation = shooter.shots || [];
    const shotsRemaining = shotsDistribution.reduce((acc, shotsAtStation, stationIndex) => {
      const shotsAtCurrentStation = shotsTakenByStation.filter(shot => shot.station === stationIndex + 1).length;
      return acc + Math.max(shotsAtStation - shotsAtCurrentStation, 0);
    }, 0);
    return shotsRemaining <= 0;
  });

  // Helper function to pad text to a fixed width with extra space
  const padText = (text, width) => {
    return text.toString().padEnd(width, ' ');
  };

  // Copy results to clipboard
  const copyResults = () => {
    let resultText = '';

    // Add GenericScorecard content if available
    if (allShootersFinished) {
      resultText += 'Generic Scorecard:\n';
      resultText += `Shots Distribution: ${JSON.stringify(shotsDistribution)}\n`;
      resultText += `Station Names: ${JSON.stringify(stationNames)}\n`;
      resultText += `True Pairs Matrix: ${JSON.stringify(truePairsMatrix)}\n\n`;
    }

    // Define column widths for clipboard (excluding removed columns)
    const columnWidths = {
      shooter: 30,
      shotsTaken: 15,
      numHits: 10,
      longestStreak: 18,
    };

    // Add scoreboard header with extra space between columns
    resultText += `${padText('Shooter', columnWidths.shooter)} ${padText('Shots Taken', columnWidths.shotsTaken)} ${padText('Num Hits', columnWidths.numHits)} ${padText('Longest Streak', columnWidths.longestStreak)}\n`;

    // Add scoreboard rows
    shooters.forEach(shooter => {
      const totalShots = shooter.shotsTaken || 0;
      const numHits = shooter.numHits || 0;

      resultText += `${padText(shooter.name, columnWidths.shooter)} ${padText(totalShots, columnWidths.shotsTaken)} ${padText(numHits, columnWidths.numHits)} ${padText(shooter.maxStreak || 0, columnWidths.longestStreak)}\n`;
    });

    // Add hit/miss details with / for hit and O for miss, station names if provided
    resultText += '\nHit/Miss Details:\n';
    shooters.forEach(shooter => {
      resultText += `${shooter.name}:\n`;
      
      // Collect hits/misses by station in the order they were shot
      const stationResults = (shooter.shots || []).reduce((acc, shot) => {
        const stationIndex = shot.station - 1; // Zero-based index for station names
        const stationName = stationNames ? stationNames[stationIndex] : `Station ${shot.station}`;
        acc[stationName] = acc[stationName] || [];
        acc[stationName].push(shot.hit ? '/' : 'O');
        return acc;
      }, {});

      // Format each station's results
      Object.entries(stationResults).forEach(([stationName, results]) => {
        resultText += `${stationName}: ${results.join(' ')}\n`;
      });
      
      resultText += '\n';
    });

    navigator.clipboard.writeText(resultText).then(() => {
      alert('Results copied to clipboard!');
    }).catch(err => {
      alert('Failed to copy results: ' + err);
    });
  };

  const handleStationNameChange = (index, newName) => {
    const updatedStationNames = [...localStationNames];
    updatedStationNames[index] = newName;
    setLocalStationNames(updatedStationNames);
  };

  const handleConfirmStationNames = () => {
    // Update the station names in the game object or backend
    game.stationNames = localStationNames;
    setIsRenamingStations(false);
  };

  const handleCancelStationNaming = () => {
    setIsRenamingStations(false);
  };

  return (
    <div className="scoreboard">
      {isRenamingStations ? (
        <StationNaming
          stationNames={localStationNames}
          onStationNameChange={handleStationNameChange}
          onConfirm={handleConfirmStationNames}
          onCancel={handleCancelStationNaming}
        />
      ) : (
        <>
          <h1>Scoreboard</h1>
          <table>
            <thead>
              <tr>
                <th>Shooter</th>
                <th>Stations Shot</th>
                <th>Shots Taken</th>
                <th>Num Hits</th>
                <th>Shots Remaining</th>
                <th>Max Score Possible</th>
                <th>Current Streak</th>
                <th>Longest Streak</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shooters.map((shooter, index) => {
                const totalShots = shooter.shotsTaken || 0;
                const numHits = shooter.numHits || 0;

                const shotsTakenByStation = shooter.shots || [];
                const shotsRemaining = shotsDistribution.reduce((acc, shotsAtStation, stationIndex) => {
                  const shotsAtCurrentStation = shotsTakenByStation.filter(shot => shot.station === stationIndex + 1).length;
                  return acc + Math.max(shotsAtStation - shotsAtCurrentStation, 0);
                }, 0);

                const maxScorePossible = numHits + shotsRemaining;

                const isCurrentShooter = shooter === currentShooter;

                return (
                  <tr 
                    key={index} 
                    style={{ backgroundColor: isCurrentShooter ? 'lightgreen' : 'white' }}
                  >
                    <td style={{ fontStyle: isCurrentShooter ? 'italic' : 'normal' }}>{shooter.name}</td>
                    <td>{getStationsShotAt(shooter)}</td>
                    <td>{totalShots}</td>
                    <td>{numHits}</td>
                    <td>{shotsRemaining}</td>
                    <td>{maxScorePossible}</td>
                    <td>{shooter.currentStreak || 0}</td>
                    <td>{shooter.maxStreak || 0}</td>
                    <td>
                      <button 
                        onClick={() => handleRecordShots(shooter)} 
                        disabled={shotsRemaining <= 0}
                      >
                        Record Shots
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {allShootersFinished ? (
            <div>
              <button onClick={copyResults}>Copy Results</button>
            </div>
          ) : (
            <GenericScorecard 
              shotsDistribution={shotsDistribution} 
              stationNames={stationNames}
              truePairsMatrix={truePairsMatrix} 
            />
          )}

          <div className="action-buttons">
            <button onClick={() => setIsRenamingStations(true)}>Rename Stations</button>
            <button onClick={() => navigate('/')}>End Game</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Scoreboard;
