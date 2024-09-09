import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import GenericScorecard from './GenericScorecard';
import StationNaming from './StationNaming'; // Import StationNaming
import StationGrid from './StationGrid'; // Import StationGrid
import './css/Scoreboard.css';

const Scoreboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRenamingStations, setIsRenamingStations] = useState(false);
  const [localStationNames, setLocalStationNames] = useState(location.state?.game?.stationNames || []);
  const game = location.state?.game || { shooters: [] };
  const currentShooter = location.state?.currentShooter || (game.shooters.length > 0 ? game.shooters[0] : null);
  const screenshotRef = useRef(null); // Ref to capture the content

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

  // Determine the highest score possible
  const highestScore = allShootersFinished
    ? Math.max(...shooters.map(shooter => {
        const numHits = shooter.numHits || 0;
        const shotsRemaining = shotsDistribution.reduce((acc, shotsAtStation, stationIndex) => {
          const shotsTakenByStation = (shooter.shots || []).filter(shot => shot.station === stationIndex + 1).length;
          return acc + Math.max(shotsAtStation - shotsTakenByStation, 0);
        }, 0);
        return numHits + shotsRemaining;
      }))
    : null;

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

  const handleCapture = async () => {
    if (screenshotRef.current) {
      try {
        // Capture the DOM element
        const canvas = await html2canvas(screenshotRef.current);
        
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'screenshot.png';
        link.click();
      } catch (err) {
        console.error('Failed to capture screenshot:', err);
      }
    }
  };

  return (
    <div>
      <div className="scoreboard" ref={screenshotRef}>
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
                  const isTopScore = allShootersFinished && maxScorePossible === highestScore;

                  return (
                    <tr 
                      key={index} 
                      style={{ backgroundColor: isTopScore ? 'gold' : (isCurrentShooter && !allShootersFinished ? 'lightgreen' : 'white') }}
                    >
                      <td style={{ fontStyle: isCurrentShooter && !allShootersFinished ? 'italic' : 'normal' }}>{shooter.name}</td>
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

            <div className="scorecard-container">
              {allShootersFinished ? (
                <div className="grid-container">
                  {shooters.map((shooter, index) => (
                    <div key={index} className="grid-item">
                      <h3>{shooter.name}</h3>
                      <div className="station-grid-container">
                        <StationGrid
                          stationShots={shooter.shots || []}
                          stationNames={stationNames}
                          initialShots={shotsDistribution}
                          renderStationGrid={(stationIndex) => {
                            const shotsForStation = (shooter.shots || []).filter(shot => shot.station === stationIndex + 1);
                            return (
                              <>
                                {shotsForStation.map((shot, shotIndex) => (
                                  <div
                                    key={shotIndex}
                                    className={`shot ${shot.hit ? 'hit' : 'miss'}`}
                                  >
                                    {truePairsMatrix[stationIndex]?.[shotIndex] ? (
                                      <span className="tp-label">TP</span>
                                    ) : ''}
                                  </div>
                                ))}
                              </>
                            );
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <GenericScorecard 
                  shotsDistribution={shotsDistribution} 
                  stationNames={stationNames}
                  truePairsMatrix={truePairsMatrix} 
                />
              )}
            </div>


          </>
        )}
      </div>      
      {allShootersFinished ? (
        <div className="action-buttons">
          <button onClick={copyResults}>Copy Results</button>
          <button onClick={handleCapture}>Copy Scoreboard</button>
          <button onClick={() => navigate('/')}>End Game</button>
        </div>
      ) : (
        <div className="action-buttons">
          <button onClick={() => setIsRenamingStations(true)}>Rename Stations</button>
          <button onClick={() => navigate('/')}>End Game</button>
        </div>
      )}
    </div>

  );
};

export default Scoreboard;
