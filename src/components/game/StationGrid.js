import React from 'react';
import './css/StationGrid.css'; 

const StationGrid = ({ stationShots, stationNames, initialShots, stationStatuses, renderStationGrid }) => {
  return (
    <div className="shots-container">
      {stationNames.map((stationName, stationIndex) => (
        <div key={stationIndex} className="station-row">
          <div className="station-name">
            {stationName}
            <span className={`station-progress station-progress-${stationStatuses[stationIndex].state}`}>
              {stationStatuses[stationIndex].label}
            </span>
          </div>
          <div className="station-grid">
            {renderStationGrid(stationIndex)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StationGrid;
