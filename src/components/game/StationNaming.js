// src/components/StationNaming.js
import React from 'react';

const StationNaming = ({ stationNames, onStationNameChange }) => {
    return (
        <div className="station-naming">
            <h2>Station Names</h2>
            {stationNames.map((name, idx) => (
                <div className="form-row" key={idx}>
                    <label htmlFor={`stationName${idx}`}>Station {idx + 1}:</label>
                    <input
                        type="text"
                        id={`stationName${idx}`}
                        value={name}
                        onChange={(e) => onStationNameChange(idx, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
};

export default StationNaming;
