import React from 'react';
import './css/GenericScorecard.css'; // Import CSS

const GenericScorecard = ({
  shotsDistribution,
  stationNames,
  truePairsMatrix,
  stationStatuses = [],
  launcherPairLabelsMatrix = [],
  title = 'Scorecard',
  onShotClick,
  verticalStations = false,
}) => {
  const CellElement = onShotClick ? 'button' : 'div';

  return (
    <div className={verticalStations ? 'generic-scorecard generic-scorecard-vertical' : 'generic-scorecard'}>
      {title && <h2>{title}</h2>}
      {shotsDistribution.map((shotsAtStation, stationIndex) => (
        <div key={stationIndex} className="station-row">
          <div className="station-name">
            {stationNames[stationIndex] || `Station ${stationIndex + 1}`}
            {stationStatuses[stationIndex] && (
              <span className={`station-progress station-progress-${stationStatuses[stationIndex].state}`}>
                {stationStatuses[stationIndex].label}
              </span>
            )}
          </div>
          <div className="generic-scorecard-station-grid">
            {Array.from({ length: shotsAtStation }).map((_, shotIndex) => {
              const isTruePair = truePairsMatrix[stationIndex]?.[shotIndex] || false;
              const launcherPairLabel = launcherPairLabelsMatrix[stationIndex]?.[shotIndex];
              return (
                <CellElement
                  key={shotIndex}
                  type={onShotClick ? 'button' : undefined}
                  aria-label={onShotClick ? `Edit station ${stationIndex + 1}, shot ${shotIndex + 1}` : undefined}
                  onClick={onShotClick ? () => onShotClick(stationIndex, shotIndex) : undefined}
                  className={`shot-placeholder ${isTruePair ? 'true-pair' : ''} ${onShotClick ? 'interactive' : ''}`}
                >
                  {(isTruePair || launcherPairLabel) && (
                    <span className="shot-annotations">
                      {isTruePair && <span className="tp-label">TP</span>}
                      {launcherPairLabel && <span className="launcher-pair-label">{launcherPairLabel}</span>}
                    </span>
                  )}
                </CellElement>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GenericScorecard;
