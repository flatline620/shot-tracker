// src/components/StationNaming.js
import React from 'react';

const StationNaming = ({ stationNames, onStationNameChange }) => {
    return (
        <div>
            <h2>Station Names</h2>
            <form className="game-form">
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
            </form>
        </div>
    );
};

export default StationNaming;
