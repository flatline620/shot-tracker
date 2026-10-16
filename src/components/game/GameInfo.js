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
    setNumStations(e.target.value);
    
    validateTotalShots(e.target.value, minShots, maxShots);
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
    updateTotalShots(numStations, minShots, maxShots, Number(e.target.value));
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

        <div className="form-row">
          <label htmlFor="minShots">Min Shots per Station:</label>
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

        <div className="form-row">
          <label htmlFor="maxShots">Max Shots per Station:</label>
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

      {hasFourLauncherStations && (
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

          {allowAllPairs && (
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

      <div className="true-pairs-container">
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
      </div>

      {/* Conditionally render the slider when the option is 'Random' */}
      {truePairsOption === 'Random' && (
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
