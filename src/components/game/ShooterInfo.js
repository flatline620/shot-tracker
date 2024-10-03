import React from 'react';

const ShooterInfo = ({ shooters, newShooter, setNewShooter, handleAddShooter, handleRemoveShooter, rotateShooters, setRotateShooters }) => { 
   // Check if the add shooter input should be marked as invalid
   const isShooterInputInvalid = newShooter.trim() === '';

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
    </div>
   );


};

export default ShooterInfo;