import React from 'react';
import './css/StationGrid.css'; 

const StationGrid = ({ stationShots, stationNames, initialShots, renderStationGrid }) => {
  return (
    <div className="shots-container">
      {stationNames.map((stationName, stationIndex) => (
        <div key={stationIndex} className="station-row">
          <div className="station-name">{stationName}</div>
          <div className="station-grid">
            {renderStationGrid(stationIndex)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StationGrid;
