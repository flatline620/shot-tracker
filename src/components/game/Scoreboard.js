import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import html2canvas from 'html2canvas';
import GenericScorecard from './GenericScorecard';
import StationNaming from './StationNaming'; 
import StationGrid from './StationGrid';
import './css/Scoreboard.css';
import { clearSavedGameProgress } from './gameProgress';
import locationConfiguration from '../../data/locations.json';

const Scoreboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRenamingStations, setIsRenamingStations] = useState(false);
  const [localStationNames, setLocalStationNames] = useState(location.state?.game?.stationNames || []);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth); // State to track screen width
  const game = location.state?.game || { shooters: [] };
  const [editGame, setEditGame] = useState(null);
  const [editingShotPair, setEditingShotPair] = useState(null);
  const currentShooter = location.state?.currentShooter || (game.shooters.length > 0 ? game.shooters[0] : null);
  const screenshotRef = useRef(null); // Ref to capture the content
  const configuredLocation = locationConfiguration.locations.find(
    configured => configured.name.trim().toLowerCase() === (game.location || '').trim().toLowerCase()
  );
  const configuredStations = configuredLocation?.courses.flatMap(course => course.stations.map(station => ({
    ...station,
    course: course.name,
    difficulty: course.difficulty,
    launchers: Array.from({ length: station.birds }, (_, launcherIndex) =>
      configuredLocation.launcherNumberingScheme === 'Letters'
        ? String.fromCharCode(65 + launcherIndex)
        : String(launcherIndex + 1)
    ),
  }))) || [];
  const alternateLauncherPairName = configuredLocation?.launcherNumberingScheme === 'Letters' ? 'C/D' : '3/4';
  const standardLauncherPairName = configuredLocation?.launcherNumberingScheme === 'Letters' ? 'A/B' : '1/2';

  useEffect(() => {
    // Update the screen width on window resize
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!game || !game.shooters || !game.shotsDistribution || !game.stationNames || !game.truePairsMatrix) {
    return <div>No game data found.</div>;
  }

  const { shooters, shotsDistribution, stationNames, truePairsMatrix } = game;
  const launcherPairLabelsMatrix = game.launcherPairLabelsMatrix || [];

  const handleRecordShots = (shooter) => {
    navigate('/record-shots', { state: { game, shooter } });
  };

  const allShootersFinished = shooters.every(shooter => {
    const shotsTakenByStation = shooter.shots || [];
    const shotsRemaining = shotsDistribution.reduce((acc, shotsAtStation, stationIndex) => {
      const shotsAtCurrentStation = shotsTakenByStation.filter(shot => shot.station === stationIndex + 1).length;
      return acc + Math.max(shotsAtStation - shotsAtCurrentStation, 0);
    }, 0);
    return shotsRemaining <= 0;
  });

  const stationStatuses = shotsDistribution.map((requiredShots, stationIndex) => {
    const shotsPerShooter = shooters.map(shooter =>
      (shooter.shots || []).filter(shot => shot.station === stationIndex + 1).length
    );
    const noShotsRecorded = shotsPerShooter.every(shotsTaken => shotsTaken === 0);
    const allShootersComplete = shotsPerShooter.every(shotsTaken => shotsTaken >= requiredShots);

    if (noShotsRecorded) return { state: 'not-started', label: 'Not shot yet' };
    if (allShootersComplete) return { state: 'complete', label: 'Complete' };
    return { state: 'in-progress', label: 'In progress' };
  });

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

  const handleEndGame = () => {
    const isConfirmed = window.confirm("Are you sure you want to end the game?");
    if (isConfirmed) {
      clearSavedGameProgress();
      navigate('/'); // Navigate to the home page or any other route you need
    }
  };


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

    const selectedStation = configuredStations.find(station => station.name === newName);
    setEditGame(currentGame => {
      const stationDetails = [...currentGame.stationDetails];
      stationDetails[index] = selectedStation
        ? { ...selectedStation, configurationName: selectedStation.name, name: newName }
        : { name: newName, birds: 0, launchers: [] };
      const launcherPairLabelsMatrix = currentGame.launcherPairLabelsMatrix.map((labels, stationIndex) =>
        stationIndex === index
          ? (selectedStation?.birds > 2 ? labels : Array(currentGame.shotsDistribution[index]).fill(''))
          : labels
      );

      return { ...currentGame, stationDetails, launcherPairLabelsMatrix };
    });
  };

  const handleConfirmStationNames = () => {
    Object.assign(game, editGame, { stationNames: localStationNames });
    setIsRenamingStations(false);
    setEditGame(null);
  };

  const handleStartStationEditing = () => {
    setLocalStationNames([...stationNames]);
    setEditGame({
      ...game,
      stationDetails: (game.stationDetails || stationNames.map(name => ({ name, birds: 0, launchers: [] })))
        .map(station => ({ ...station })),
      truePairsMatrix: truePairsMatrix.map(station => [...station]),
      launcherPairLabelsMatrix: shotsDistribution.map((shotsAtStation, stationIndex) =>
        [...(launcherPairLabelsMatrix[stationIndex] || Array(shotsAtStation).fill(''))]
      ),
    });
    setIsRenamingStations(true);
  };

  const stationHasBeenShot = (stationIndex) => shooters.some(shooter =>
    (shooter.shots || []).some(shot => shot.station === stationIndex + 1)
  );

  const handleEditShotPair = (stationIndex, shotIndex) => {
    if (!editGame || stationHasBeenShot(stationIndex)) return;
    const pairStart = Math.floor(shotIndex / 2) * 2;
    const currentLauncherPair = editGame.launcherPairLabelsMatrix[stationIndex]?.[pairStart];
    setEditingShotPair({
      stationIndex,
      pairStart,
      isTruePair: Boolean(editGame.truePairsMatrix[stationIndex]?.[pairStart]),
      launcherPair: currentLauncherPair ? 'alternate' : 'standard',
    });
  };

  const handleSaveShotPair = () => {
    if (!editingShotPair || !editGame) return;

    const { stationIndex, pairStart } = editingShotPair;
    const pairShotIndexes = [pairStart, pairStart + 1].filter(
      shotIndex => shotIndex < editGame.shotsDistribution[stationIndex]
    );
    const truePairsMatrix = editGame.truePairsMatrix.map((station, index) =>
      index === stationIndex
        ? station.map((value, shotIndex) => pairShotIndexes.includes(shotIndex) ? editingShotPair.isTruePair : value)
        : station
    );
    const launcherPairLabelsMatrix = editGame.launcherPairLabelsMatrix.map((station, index) =>
      index === stationIndex
        ? station.map((value, shotIndex) => pairShotIndexes.includes(shotIndex)
          ? (editingShotPair.launcherPair === 'alternate' ? alternateLauncherPairName : '')
          : value)
        : station
    );

    setEditGame(currentGame => ({ ...currentGame, truePairsMatrix, launcherPairLabelsMatrix }));
    setEditingShotPair(null);
  };

  const handleCancelStationNaming = () => {
    setIsRenamingStations(false);
    setEditGame(null);
    setEditingShotPair(null);
  };

  const editingStationDetails = editGame?.stationDetails?.[editingShotPair?.stationIndex];
  const canEditLauncherPair = Boolean(
    editingShotPair
    && editingStationDetails?.birds > 2
  );

  // const handleCapture = async () => {
  //   if (screenshotRef.current) {
  //     try {
  //       const canvas = await html2canvas(screenshotRef.current);
  //       const dataURL = canvas.toDataURL('image/png');
  //       const link = document.createElement('a');
  //       link.href = dataURL;
  //       link.download = 'screenshot.png';
  //       link.click();
  //     } catch (err) {
  //       console.error('Failed to capture screenshot:', err);
  //     }
  //   }
  // };

  // Column names for different screen sizes
  const columnNames = screenWidth < 675 ? 
    ['Shooter', 'Hits', 'Max', 'Streaks', 'Action'] : 
    ['Shooter', 'Num Hits', 'Max Score', 'Current / Longest Streak', 'Action'];

  // Button names for different screen sizes
  const recordShotsName = screenWidth < 675 ? 
    'Shots' : 'Record Shots';

  return (
    <div>
      <div className="scoreboard" ref={screenshotRef}>
        {isRenamingStations ? (
          <>
            <StationNaming
              heading="Edit Stations"
              stationNames={localStationNames}
              stationOptions={configuredLocation ? configuredStations : []}
              stationShotsDistribution={shotsDistribution}
              truePairsMatrix={editGame?.truePairsMatrix || truePairsMatrix}
              launcherPairLabelsMatrix={editGame?.launcherPairLabelsMatrix || launcherPairLabelsMatrix}
              lockedStations={stationNames.map((_, index) => stationHasBeenShot(index) ? index : null).filter(index => index !== null)}
              onShotClick={handleEditShotPair}
              onStationNameChange={handleStationNameChange}
              onConfirm={handleConfirmStationNames}
              onCancel={handleCancelStationNaming}
            />
            <div className="buttons-container">
              <button type="button" onClick={handleConfirmStationNames} className="confirm-button">Confirm</button>
              <button type="button" onClick={handleCancelStationNaming} className="back-button">Cancel</button>
            </div>
          </>
        ) : (
          <>
            <h1>Scoreboard</h1>
            <table>
              <thead>
                <tr>
                  {columnNames.map((colName, index) => (
                    <th key={index}>{colName}</th>
                  ))}
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
                    <tr key={index} style={{ backgroundColor: isTopScore ? 'gold' : (isCurrentShooter && !allShootersFinished ? 'lightgreen' : 'white') }}>
                      <td style={{ fontStyle: isCurrentShooter && !allShootersFinished ? 'italic' : 'normal' }}>{shooter.name}</td>
                      <td>{numHits} / {totalShots}</td>
                      <td>{maxScorePossible}</td>
                      <td>{shooter.currentStreak || 0} / {shooter.maxStreak || 0}</td>
                      <td>
                        <button onClick={() => handleRecordShots(shooter)} disabled={shotsRemaining <= 0}>{recordShotsName}</button>
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
                      <StationGrid
                        stationShots={shooter.shots || []}
                        stationNames={stationNames}
                        initialShots={shotsDistribution}
                        stationStatuses={stationStatuses}
                        renderStationGrid={(stationIndex) => {
                          const shotsForStation = (shooter.shots || []).filter(shot => shot.station === stationIndex + 1);
                          return (
                            <>
                              {Array.from({ length: shotsDistribution[stationIndex] }).map((_, shotIndex) => {
                                const shot = shotsForStation.find(recordedShot => recordedShot.shotIndex === shotIndex);
                                const isTruePair = truePairsMatrix[stationIndex]?.[shotIndex];
                                const launcherPairLabel = launcherPairLabelsMatrix[stationIndex]?.[shotIndex];

                                return (
                                  <div key={shotIndex} className={`shot ${shot ? (shot.hit ? 'hit' : 'miss') : 'empty'}`}>
                                    {shot && <span className="shot-result">{shot.hit ? '/' : 'O'}</span>}
                                    {(isTruePair || launcherPairLabel) && (
                                      <span className="shot-annotations">
                                        {isTruePair && <span className="tp-label">TP</span>}
                                        {launcherPairLabel && <span className="launcher-pair-label">{launcherPairLabel}</span>}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </>
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <GenericScorecard 
                  shotsDistribution={shotsDistribution} 
                  stationNames={stationNames}
                  truePairsMatrix={truePairsMatrix}
                  stationStatuses={stationStatuses}
                  launcherPairLabelsMatrix={launcherPairLabelsMatrix}
                />
              )}
            </div>
          </>
        )}
      </div>

      {editingShotPair && (
        <div className="launcher-info-backdrop" role="presentation" onClick={() => setEditingShotPair(null)}>
          <div
            className="launcher-info-dialog shot-pair-edit-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scoreboard-pair-edit-title"
            onClick={event => event.stopPropagation()}
          >
            <button type="button" className="launcher-info-close" onClick={() => setEditingShotPair(null)} aria-label="Close pair editor">
              &times;
            </button>
            <h3 id="scoreboard-pair-edit-title">
              {localStationNames[editingShotPair.stationIndex]}: shots {editingShotPair.pairStart + 1}-{Math.min(editingShotPair.pairStart + 2, shotsDistribution[editingShotPair.stationIndex])}
            </h3>
            <div className="shot-pair-edit-setting">
              <label className="true-pairs-label">True Pair:</label>
              <div className="toggle-group" role="radiogroup" aria-label="True Pair">
                <input
                  type="radio"
                  id="scoreboardTruePairYes"
                  name="scoreboardTruePair"
                  checked={editingShotPair.isTruePair}
                  onChange={() => setEditingShotPair(current => ({ ...current, isTruePair: true }))}
                  className="toggle-button"
                />
                <label htmlFor="scoreboardTruePairYes" className={`toggle-button-label ${editingShotPair.isTruePair ? 'active' : ''}`}>Yes</label>
                <input
                  type="radio"
                  id="scoreboardTruePairNo"
                  name="scoreboardTruePair"
                  checked={!editingShotPair.isTruePair}
                  onChange={() => setEditingShotPair(current => ({ ...current, isTruePair: false }))}
                  className="toggle-button"
                />
                <label htmlFor="scoreboardTruePairNo" className={`toggle-button-label ${!editingShotPair.isTruePair ? 'active' : ''}`}>No</label>
              </div>
            </div>
            {canEditLauncherPair && (
              <div className="shot-pair-edit-setting">
                <label className="true-pairs-label">Launcher Pair:</label>
                <div className="toggle-group" role="radiogroup" aria-label="Launcher Pair">
                  <input
                    type="radio"
                    id="scoreboardStandardLaunchers"
                    name="scoreboardLauncherPair"
                    checked={editingShotPair.launcherPair === 'standard'}
                    onChange={() => setEditingShotPair(current => ({ ...current, launcherPair: 'standard' }))}
                    className="toggle-button"
                  />
                  <label htmlFor="scoreboardStandardLaunchers" className={`toggle-button-label ${editingShotPair.launcherPair === 'standard' ? 'active' : ''}`}>{standardLauncherPairName}</label>
                  <input
                    type="radio"
                    id="scoreboardAlternateLaunchers"
                    name="scoreboardLauncherPair"
                    checked={editingShotPair.launcherPair === 'alternate'}
                    onChange={() => setEditingShotPair(current => ({ ...current, launcherPair: 'alternate' }))}
                    className="toggle-button"
                  />
                  <label htmlFor="scoreboardAlternateLaunchers" className={`toggle-button-label ${editingShotPair.launcherPair === 'alternate' ? 'active' : ''}`}>{alternateLauncherPairName}</label>
                </div>
              </div>
            )}
            <button type="button" className="confirm-button" onClick={handleSaveShotPair}>Save Pair</button>
          </div>
        </div>
      )}

      {allShootersFinished ? (
        <div className="buttons-container">
          <button onClick={copyResults} className="results-button">Copy Results</button>
          {/* <button onClick={handleCapture} className="scoreboard-button">Copy Scoreboard</button> */}
          <button onClick={handleEndGame} className="end-button">End Game</button>
        </div>
      ) : (
        !isRenamingStations && !game.isTemplateLoaded && (
          <div className="buttons-container">
            <button onClick={handleStartStationEditing} className="rename-button">Edit Stations</button>
            <button onClick={handleEndGame} className="end-button">End Game</button>
          </div>
        )
      )}
    </div>
  );
};

export default Scoreboard;
