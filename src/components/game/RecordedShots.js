import React from 'react';
import './css/RecordedShots.css'; 

const RecordedShots = ({ stationShots, stationNames, initialShots, truePairsMatrix }) => {
    const renderRecordShots = (stationIndex) => {
        const shotsForStation = stationShots[stationIndex];
        return (
          <div className="recorded-shots-grid">
            {Array.from({ length: initialShots[stationIndex] }).map((_, shotIndex) => {
              const shot = shotsForStation.find(s => s.shotIndex === shotIndex);
              const isTruePair = truePairsMatrix[stationIndex][shotIndex] || false;
              return (
                <button
                  key={shotIndex}
                  className={`recorded-shots-shot ${shot ? (shot.hit ? 'hit' : 'miss') : isTruePair ? 'true-pair' : 'empty'}`}
                >
                  {shot ? (shot.hit ? '/' : 'O') : isTruePair ? 'TP' : '-'}
                </button>
              );
            })}
          </div>
        );
      };
      
    return (
    <div className="recorded-shots-container">
      {stationNames.map((stationName, stationIndex) => (
        <div key={stationIndex} className="recorded-shots-row">
          <div className="recorded-shots-station-name">{stationName}</div>
          <div className="recorded-shots-station-grid">
            {renderRecordShots(stationIndex)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecordedShots;
