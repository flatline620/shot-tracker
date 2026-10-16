// src/components/StationNaming.js
import React from 'react';

const StationNaming = ({
    stationNames,
    stationOptions = [],
    onStationNameChange,
    heading = 'Station Names',
    stationShotsDistribution,
    truePairsMatrix = [],
    launcherPairLabelsMatrix = [],
    lockedStations = [],
    onShotClick,
}) => {
    return (
        <div>
            <h2>{heading}</h2>
            <form className="game-form">
                {stationNames.map((name, idx) => (
                    <div className="station-naming-row" key={idx}>
                        <div className="form-row">
                            <label htmlFor={`stationName${idx}`}>Station {idx + 1}:</label>
                            {stationOptions.length > 0 ? (
                                <select
                                    id={`stationName${idx}`}
                                    value={name}
                                    disabled={lockedStations.includes(idx)}
                                    onChange={(e) => onStationNameChange(idx, e.target.value)}
                                >
                                    <option value="">Select a station</option>
                                    {stationOptions.map(station => (
                                        <option key={station.name} value={station.name}>
                                            {station.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    id={`stationName${idx}`}
                                    value={name}
                                    disabled={lockedStations.includes(idx)}
                                    onChange={(e) => onStationNameChange(idx, e.target.value)}
                                />
                            )}
                            {lockedStations.includes(idx) && <span className="station-already-shot">Already shot</span>}
                        </div>
                        {stationShotsDistribution && (
                            <div className="station-edit-shot-grid">
                                {Array.from({ length: stationShotsDistribution[idx] || 0 }).map((_, shotIndex) => {
                                    const isTruePair = Boolean(truePairsMatrix[idx]?.[shotIndex]);
                                    const launcherPairLabel = launcherPairLabelsMatrix[idx]?.[shotIndex];
                                    const ShotElement = onShotClick ? 'button' : 'div';

                                    return (
                                        <ShotElement
                                            key={shotIndex}
                                            type={onShotClick ? 'button' : undefined}
                                            className={`station-edit-shot ${onShotClick ? 'interactive' : ''} ${isTruePair ? 'true-pair' : ''} ${launcherPairLabel ? 'alternate-pair' : ''}`}
                                            disabled={onShotClick ? lockedStations.includes(idx) : undefined}
                                            aria-label={onShotClick ? `Edit station ${idx + 1}, shot ${shotIndex + 1}` : undefined}
                                            onClick={onShotClick && !lockedStations.includes(idx) ? () => onShotClick(idx, shotIndex) : undefined}
                                        >
                                            {launcherPairLabel && <span className="station-edit-launcher-label">{launcherPairLabel}</span>}
                                            {isTruePair && <span className="station-edit-true-pair-label">TP</span>}
                                        </ShotElement>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </form>
        </div>
    );
};

export default StationNaming;
