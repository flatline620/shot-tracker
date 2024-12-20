import React from 'react';
import './css/GenericScorecard.css'; // Import CSS

const GenericScorecard = ({ shotsDistribution, stationNames, truePairsMatrix }) => {
  return (
    <div>
      <h2>Scorecard</h2>
      {shotsDistribution.map((shotsAtStation, stationIndex) => (
        <div key={stationIndex} className="station-row">
          <div className="station-name">
            {stationNames[stationIndex] || `Station ${stationIndex + 1}`}
          </div>
          <div className="generic-scorecard-station-grid">
            {Array.from({ length: shotsAtStation }).map((_, shotIndex) => {
              const isTruePair = truePairsMatrix[stationIndex]?.[shotIndex] || false;
              return (
                <div
                  key={shotIndex}
                  className={`shot-placeholder ${isTruePair ? 'true-pair' : ''}`}
                >
                  {isTruePair ? 'TP' : ''}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GenericScorecard;
