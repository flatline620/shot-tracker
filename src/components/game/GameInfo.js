import React, { useState } from 'react';
import './css/GameInfo.css'; // Ensure the correct path to the CSS file

const GameInfo = ({
  numStations,
  setNumStations,
  minShots,
  setMinShots,
  maxShots,
  setMaxShots,
  totalShots,
  setTotalShots,
  gameSetup,
  onGameSetupChange,
  stationPairCounts,
  setStationPairCounts,
  truePairsOption,
  setTruePairsOption,
  truePairWeighting,
  setTruePairWeighting,
  hasFourLauncherStations,
  alternateLauncherPairName,
  standardLauncherPairName,
  allowAllPairs,
  setAllowAllPairs,
  allowMixedPairs,
  setAllowMixedPairs,
  secondPairWeighting,
  setSecondPairWeighting
}) => {
  const [activeHelp, setActiveHelp] = useState(null);
  const handleNumStationsChange = (e) => {
    const value = Number(e.target.value);
    setNumStations(value);
    setStationPairCounts(currentCounts => Array.from({ length: value }, (_, index) =>
      currentCounts[index] || { reportPairs: 0, truePairs: 0 }
    ));

    if (gameSetup !== 'Custom') validateTotalShots(value, minShots, maxShots);
  };

  const handleMinShotsChange = (e) => {
    const value = Number(e.target.value);
    
    if ((value < 2) || (value > maxShots)) {
      setMinShots(minShots);
    } else {
      setMinShots(value);
      
      validateTotalShots(numStations, value, maxShots);      
    }
  };

  const handleMaxShotsChange = (e) => {
    const value = Number(e.target.value);
    
    if ((value < 2) || (value < minShots)) {
      setMaxShots(minShots);
    } else {
      setMaxShots(value);
      
      validateTotalShots(numStations, minShots, value);    
    }
  };

  const handleTotalShotsChange = (e) => {
    const value = Number(e.target.value);
    if (gameSetup !== 'Custom') {
      updateTotalShots(numStations, minShots, maxShots, value);
    } else {
      setTotalShots(value);
    }
  };

  const assignedShotCount = stationPairCounts.reduce(
    (total, station) => total + (station.reportPairs + station.truePairs) * 2,
    0
  );
  const remainingShotCount = totalShots - assignedShotCount;

  const handlePairCountChange = (stationIndex, pairType, change) => {
    const currentPairs = stationPairCounts[stationIndex][pairType];
    if (change < 0 && currentPairs === 0) return;
    if (change > 0 && assignedShotCount + 2 > totalShots) return;

    setStationPairCounts(currentCounts => currentCounts.map((station, index) =>
      index === stationIndex
        ? { ...station, [pairType]: station[pairType] + change }
        : station
    ));
  };

  function validateTotalShots(numberOfStations, minShotsPerStation, maxShotsPerStation) {
    const totalMinShots = numberOfStations * minShotsPerStation;
    const totalMaxShots = numberOfStations * maxShotsPerStation;

    if (totalShots < totalMinShots) {
      setTotalShots(totalMinShots);
    } else if (totalShots > totalMaxShots) {
      setTotalShots(totalMaxShots);
    }
  }

  
  function updateTotalShots(numberOfStations, minShotsPerStation, maxShotsPerStation, newTotalShots) {
    const totalMinShots = numberOfStations * minShotsPerStation;
    const totalMaxShots = numberOfStations * maxShotsPerStation;

    if (newTotalShots < totalMinShots) {
      setTotalShots(totalMinShots);
    } else if (newTotalShots > totalMaxShots) {
      setTotalShots(totalMaxShots);
    } else {
      setTotalShots(newTotalShots);
    }

  }

  return (
    <div>
      <h2>Game Info</h2>

      <div className="randomize-shots-setting">
        <label className="true-pairs-label">Game Setup:</label>
        <div className="toggle-group" role="radiogroup" aria-label="Game Setup">
          <input
            type="radio"
            id="gameSetupRandom"
            name="gameSetup"
            checked={gameSetup === 'Random'}
            onChange={() => onGameSetupChange('Random')}
            className="toggle-button"
          />
          <label htmlFor="gameSetupRandom" className={`toggle-button-label ${gameSetup === 'Random' ? 'active' : ''}`}>Random</label>
          <input
            type="radio"
            id="gameSetupCustom"
            name="gameSetup"
            checked={gameSetup === 'Custom'}
            onChange={() => onGameSetupChange('Custom')}
            className="toggle-button"
          />
          <label htmlFor="gameSetupCustom" className={`toggle-button-label ${gameSetup === 'Custom' ? 'active' : ''}`}>Custom</label>
          <input
            type="radio"
            id="gameSetupQuick"
            name="gameSetup"
            checked={gameSetup === 'Quick'}
            onChange={() => onGameSetupChange('Quick')}
            className="toggle-button"
          />
          <label htmlFor="gameSetupQuick" className={`toggle-button-label ${gameSetup === 'Quick' ? 'active' : ''}`}>Quick</label>
        </div>
      </div>

      <form className="game-form">
      <div className="form-row">
        <label htmlFor="numStations">Number of Stations:</label>
        <input
          id="numStations"
          type="range"
          min="1"
          max="25"
          value={numStations}
          onChange={handleNumStationsChange}
        />
        <span>{numStations}</span>
      </div>

        {gameSetup === 'Random' && (
          <div className="form-row">
            <label htmlFor="minShots">Min Shots/Station:</label>
            <input
              id="minShots"
              type="range"
              min="2"
              max="8"
              step="2"
              value={minShots}
              onChange={handleMinShotsChange}
            />
            <span>{minShots}</span>
          </div>
        )}

        {gameSetup === 'Random' && (
          <div className="form-row">
            <label htmlFor="maxShots">Max Shots/Station:</label>
            <input
              id="maxShots"
              type="range"
              min="2"
              max="8"
              step="2"
              value={maxShots}
              onChange={handleMaxShotsChange}
            />
            <span>{maxShots}</span>
          </div>
        )}

        <div className="form-row">
          <label htmlFor="totalShots">Total Shots:</label>
          <input
            id="totalShots"
            type="range"
            min="2"
            max="200"
            step="2"
            value={totalShots}
            onChange={handleTotalShotsChange}
          />
          <span>{totalShots}</span>
        </div>
      </form>

      {gameSetup === 'Custom' && (
        <div className="manual-pair-allocation">
          <div className="manual-pair-summary">
            <strong>Shot Allocation</strong>
            <span>
              Shots remaining: {Math.max(remainingShotCount, 0)}
              {remainingShotCount < 0 && ` (remove ${Math.abs(remainingShotCount)} over-allocated)`}
            </span>
          </div>
          <div className="manual-pair-header">
            <span>Station</span>
            <span>Report Pair</span>
            <span>True Pair</span>
          </div>
          {stationPairCounts.map((station, stationIndex) => (
            <div className="manual-pair-row" key={stationIndex}>
              <strong>Station {stationIndex + 1}</strong>
              {['reportPairs', 'truePairs'].map(pairType => (
                <div className="manual-pair-control" key={pairType}>
                  <button
                    type="button"
                    className="manual-pair-decrement"
                    aria-label={`Remove ${pairType === 'reportPairs' ? 'report' : 'true'} pair from station ${stationIndex + 1}`}
                    onClick={() => handlePairCountChange(stationIndex, pairType, -1)}
                    disabled={station[pairType] === 0}
                  >
                    −
                  </button>
                  <span aria-live="polite">{station[pairType] * 2}</span>
                  <button
                    type="button"
                    className="manual-pair-increment"
                    aria-label={`Add ${pairType === 'reportPairs' ? 'report' : 'true'} pair to station ${stationIndex + 1}`}
                    onClick={() => handlePairCountChange(stationIndex, pairType, 1)}
                    disabled={assignedShotCount + 2 > totalShots}
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {hasFourLauncherStations && gameSetup !== 'Custom' && (
        <div className="launcher-settings-container">
          <div className="launcher-setting">
            <div className="launcher-setting-heading">
              <label className="true-pairs-label">Allow All Pairs:</label>
              <button
                type="button"
                className="launcher-help-button"
                aria-label="Allow All Pairs information"
                title="Allow All Pairs information"
                onClick={() => setActiveHelp({
                  title: 'Allow All Pairs',
                  message: 'This location has stations that have more than 2 launchers for at least one station. Choosing Yes will indicate that all launchers should be available for assignment.',
                })}
              >
                ℹ️
              </button>
            </div>
            <div className="toggle-group" role="radiogroup" aria-label="Allow All Pairs">
              <input
                type="radio"
                id="allowAllPairsYes"
                name="allowAllPairs"
                checked={allowAllPairs}
                onChange={() => setAllowAllPairs(true)}
                className="toggle-button"
              />
              <label htmlFor="allowAllPairsYes" className={`toggle-button-label ${allowAllPairs ? 'active' : ''}`}>Yes</label>
              <input
                type="radio"
                id="allowAllPairsNo"
                name="allowAllPairs"
                checked={!allowAllPairs}
                onChange={() => {
                  setAllowAllPairs(false);
                  setAllowMixedPairs(false);
                }}
                className="toggle-button"
              />
              <label htmlFor="allowAllPairsNo" className={`toggle-button-label ${!allowAllPairs ? 'active' : ''}`}>No</label>
            </div>
          </div>

          {gameSetup === 'Random' && allowAllPairs && (
            <>
              <div className="launcher-setting">
                <div className="launcher-setting-heading">
                  <label className="true-pairs-label">Allow Mixed Pairs:</label>
                  <button
                    type="button"
                    className="launcher-help-button"
                    aria-label="Allow Mixed Pairs information"
                    title="Allow Mixed Pairs information"
                    onClick={() => setActiveHelp({
                      title: 'Allow Mixed Pairs',
                      message: `Selecting this can result in a station that has both ${standardLauncherPairName} and ${alternateLauncherPairName} pairs to shoot.`,
                    })}
                  >
                    ℹ️
                  </button>
                </div>
                <div className="toggle-group" role="radiogroup" aria-label="Allow Mixed Pairs">
                  <input
                    type="radio"
                    id="allowMixedPairsYes"
                    name="allowMixedPairs"
                    checked={allowMixedPairs}
                    onChange={() => setAllowMixedPairs(true)}
                    className="toggle-button"
                  />
                  <label htmlFor="allowMixedPairsYes" className={`toggle-button-label ${allowMixedPairs ? 'active' : ''}`}>Yes</label>
                  <input
                    type="radio"
                    id="allowMixedPairsNo"
                    name="allowMixedPairs"
                    checked={!allowMixedPairs}
                    onChange={() => setAllowMixedPairs(false)}
                    className="toggle-button"
                  />
                  <label htmlFor="allowMixedPairsNo" className={`toggle-button-label ${!allowMixedPairs ? 'active' : ''}`}>No</label>
                </div>
              </div>

              <div className="true-pair-weighting-container">
                <label htmlFor="secondPairWeighting" className="true-pair-weighting-label">
                  Second Pair Weighting:
                </label>
                <input
                  id="secondPairWeighting"
                  type="range"
                  min="1"
                  max="100"
                  value={secondPairWeighting}
                  onChange={(e) => setSecondPairWeighting(Number(e.target.value))}
                  className="true-pair-weighting-slider"
                />
                <span>{secondPairWeighting}</span>
              </div>
            </>
          )}
        </div>
      )}

      {activeHelp && (
        <div className="launcher-info-backdrop" role="presentation" onClick={() => setActiveHelp(null)}>
          <div
            className="launcher-info-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="launcher-info-title"
            onClick={event => event.stopPropagation()}
          >
            <button type="button" className="launcher-info-close" onClick={() => setActiveHelp(null)} aria-label="Close information">
              &times;
            </button>
            <h3 id="launcher-info-title">{activeHelp.title}</h3>
            <p>{activeHelp.message}</p>
          </div>
        </div>
      )}

      {gameSetup !== 'Custom' && <div className="true-pairs-container">
        <label className="true-pairs-label">True Pairs:</label>
        <div className="toggle-group">
          <input
            type="radio"
            id="truePairsAll"
            name="truePairs"
            value="All"
            checked={truePairsOption === 'All'}
            onChange={(e) => setTruePairsOption(e.target.value)}
            className="toggle-button"
          />
          <label htmlFor="truePairsAll" className={`toggle-button-label ${truePairsOption === 'All' ? 'active' : ''}`}>
            All
          </label>

          <input
            type="radio"
            id="truePairsRandom"
            name="truePairs"
            value="Random"
            checked={truePairsOption === 'Random'}
            onChange={(e) => setTruePairsOption(e.target.value)}
            className="toggle-button"
          />
          <label htmlFor="truePairsRandom" className={`toggle-button-label ${truePairsOption === 'Random' ? 'active' : ''}`}>
            Random
          </label>

          <input
            type="radio"
            id="truePairsNone"
            name="truePairs"
            value="None"
            checked={truePairsOption === 'None'}
            onChange={(e) => setTruePairsOption(e.target.value)}
            className="toggle-button"
          />
          <label htmlFor="truePairsNone" className={`toggle-button-label ${truePairsOption === 'None' ? 'active' : ''}`}>
            None
          </label>
        </div>
      </div>}

      {/* Conditionally render the slider when the option is 'Random' */}
      {gameSetup === 'Random' && truePairsOption === 'Random' && (
        <div className="true-pair-weighting-container">
          <label htmlFor="truePairWeighting" className="true-pair-weighting-label">
            True Pair Random Weighting:
          </label>
          <input
            id="truePairWeighting"
            type="range"
            min="1"
            max="100"
            value={truePairWeighting}
            onChange={(e) => setTruePairWeighting(Number(e.target.value))}
            className="true-pair-weighting-slider"
          />
          <span>{truePairWeighting}</span>
        </div>
      )}
    </div>
  );
};

export default GameInfo;
