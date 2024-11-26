import React, { useState } from 'react';
import './css/ShooterInfo.css'; // Ensure the correct path to the CSS file

const ShooterInfo = ({ shooters, newShooter, setNewShooter, handleAddShooter, handleRemoveShooter, rotateShooters, setRotateShooters }) => { 
   const [showInfo, setShowInfo] = useState(false); // State to manage the visibility of the info modal

   // Check if the add shooter input should be marked as invalid
   const isShooterInputInvalid = newShooter.trim() === '';

   const handleInfoClick = () => {
       setShowInfo(true); // Show the info modal
   };

   const handleCloseModal = () => {
       setShowInfo(false); // Close the info modal
   };

   return (
    <div className="shooters-section">
        <h2>Shooter Info</h2>
        
        <div className="rotate-shooters-container">
            <label htmlFor="rotateShooters">
                <input
                    type="checkbox"
                    id="rotateShooters"
                    checked={rotateShooters}
                    onChange={(e) => setRotateShooters(e.target.checked)}
                />
                Rotate Shooters
                {/* Info Icon */}
                <span className="info-icon" onClick={handleInfoClick}>
                    ℹ️
                </span>
            </label>
        </div>

        <div className={`input-row ${isShooterInputInvalid ? 'invalid' : ''}`}>
            <input
            type="text"
            value={newShooter}
            onChange={(e) => setNewShooter(e.target.value)}
            placeholder="Add new shooter"
            className={isShooterInputInvalid ? 'invalid' : ''}
            />
            <button
            type="button"
            onClick={handleAddShooter}
            className={isShooterInputInvalid ? 'disabled' : ''}
            disabled={isShooterInputInvalid}
            >
            Add Shooter
            </button>
        </div>

        <ul>
            {shooters.map(shooter => (
            <li key={shooter.name}>
                <span className="name-column">{shooter.name}</span>
                <button className="remove-button" type="button" onClick={() => handleRemoveShooter(shooter.name)}>Remove</button>
            </li>
            ))}
        </ul>

        {/* Info Modal */}
        {showInfo && (
            <div className="info-modal">
                <div className="modal-content">
                    <span className="close-btn" onClick={handleCloseModal}>X</span>
                    <h3>Rotate Shooters Info</h3>
                    <p>
                        Selecting this option will allow the shooters to rotate who shoots first at the next station. 
                        If this is not selected, the first shooter in the list will shoot first at every station.
                    </p>
                </div>
            </div>
        )}
    </div>
   );
};

export default ShooterInfo;
