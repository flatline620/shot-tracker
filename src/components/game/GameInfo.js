import React from 'react';
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
  setTruePairWeighting
}) => {
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
