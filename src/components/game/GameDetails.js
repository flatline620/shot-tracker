import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './css/GameDetails.css'; // Ensure the correct path to the CSS file

// Function to distribute shots
const distributeShots = (numStations, minShotsPerStation, maxShotsPerStation, totalShots) => {
    if (numStations <= 0 || minShotsPerStation < 0 || maxShotsPerStation < minShotsPerStation || 
        totalShots < numStations * minShotsPerStation || totalShots > numStations * maxShotsPerStation) {
        throw new Error("Invalid parameters.");
    }

    const shots = Array(numStations).fill(minShotsPerStation);
    totalShots -= numStations * minShotsPerStation;

    const rand = (max) => Math.floor(Math.random() * max);

    while (totalShots > 0) {
        const stationIndex = rand(numStations);
        let currentShots = shots[stationIndex];
        const maxIncrease = Math.min(maxShotsPerStation - currentShots, totalShots);
        if (maxIncrease > 0) {
            let increase = 2 * rand((maxIncrease / 2) + 1);
            increase = Math.min(increase, totalShots);
            shots[stationIndex] += increase;
            totalShots -= increase;
        }
    }

    return shots;
};

const GameDetails = ({ games, onUpdateGame }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const index = parseInt(id, 10);
    const game = useMemo(() => games[index] || {}, [games, index]);

    const [numStations, setNumStations] = useState(game.numStations || '');
    const [minShots, setMinShots] = useState(game.minShots || '');
    const [maxShots, setMaxShots] = useState(game.maxShots || '');
    const [totalShots, setTotalShots] = useState(game.totalShots || '');

    const [shooters, setShooters] = useState(game.shooters || []);
    const [newShooter, setNewShooter] = useState('');

    // State for station naming
    const [stationNames, setStationNames] = useState(Array(game.numStations || 1).fill(''));
    const [isNamingStations, setIsNamingStations] = useState(false);

    useEffect(() => {
        setNumStations(game.numStations || '');
        setMinShots(game.minShots || '');
        setMaxShots(game.maxShots || '');
        setTotalShots(game.totalShots || '');
        setShooters(game.shooters || []);
        setStationNames(Array(game.numStations || 1).fill('')); // Reset station names
    }, [game]);

    // Function to validate form fields
    const validateForm = () => {
        return (
            numStations > 0 &&
            minShots > 0 &&
            maxShots > 0 &&
            totalShots > 0 &&
            shooters.length > 0
        );
    };

    // Function to handle starting shooting
    const handleStartShooting = () => {
        if (validateForm()) {
            const shotsDistribution = distributeShots(
                parseInt(numStations, 10),
                parseInt(minShots, 10),
                parseInt(maxShots, 10),
                parseInt(totalShots, 10)
            );

            const updatedGame = {
                ...game,
                numStations: parseInt(numStations, 10),
                minShots: parseInt(minShots, 10),
                maxShots: parseInt(maxShots, 10),
                totalShots: parseInt(totalShots, 10),
                shooters,
                stationNames,
                shotsDistribution // Add the shot distribution to the game state
            };
            onUpdateGame(index, updatedGame);
            navigate('/scoreboard', { state: { game: updatedGame } });
        }
    };

    const handleStationNameChange = (index, name) => {
        const updatedStationNames = [...stationNames];
        updatedStationNames[index] = name;
        setStationNames(updatedStationNames);
    };

    const handleConfirmStationNames = () => {
        const updatedGame = {
            ...game,
            numStations: parseInt(numStations, 10),
            minShots: parseInt(minShots, 10),
            maxShots: parseInt(maxShots, 10),
            totalShots: parseInt(totalShots, 10),
            shooters,
            stationNames
        };
        onUpdateGame(index, updatedGame);
        navigate('/scoreboard', { state: { game: updatedGame } });
    };

    const handleAddShooter = () => {
        if (newShooter.trim() && shooters.length < 4) {
            setShooters([...shooters, {
                name: newShooter,
                shotsTaken: 0,
                numHits: 0,
                maxScore: 0
            }]);
            setNewShooter('');
        }
    };

    const handleRemoveShooter = (shooterToRemove) => {
        setShooters(shooters.filter(shooter => shooter.name !== shooterToRemove));
    };

    // Check if the add shooter input should be marked as invalid
    const isShooterInputInvalid = newShooter.trim() === '' && shooters.length >= 4;

    return (
        <div className="game-details">
            <h1>{game.name}</h1>
            <p>Location: {game.location}</p>
            <p>Date: {game.date}</p>

            {!isNamingStations ? (
                <>
                    <form className="game-form">
                        <div className="form-row">
                            <label htmlFor="numStations">Number of Stations:</label>
                            <input
                                id="numStations"
                                type="number"
                                value={numStations}
                                onChange={(e) => setNumStations(e.target.value)}
                                className={numStations <= 0 ? 'invalid' : ''}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <label htmlFor="minShots">Min Shots per Station:</label>
                            <input
                                id="minShots"
                                type="number"
                                value={minShots}
                                onChange={(e) => setMinShots(e.target.value)}
                                className={minShots <= 0 ? 'invalid' : ''}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <label htmlFor="maxShots">Max Shots per Station:</label>
                            <input
                                id="maxShots"
                                type="number"
                                value={maxShots}
                                onChange={(e) => setMaxShots(e.target.value)}
                                className={maxShots <= 0 ? 'invalid' : ''}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <label htmlFor="totalShots">Total Shots:</label>
                            <input
                                id="totalShots"
                                type="number"
                                value={totalShots}
                                onChange={(e) => setTotalShots(e.target.value)}
                                className={totalShots <= 0 ? 'invalid' : ''}
                                required
                            />
                        </div>
                    </form>

                    <div className="shooters-section">
                        <h2>Shooters</h2>
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
                                className={isShooterInputInvalid ? 'invalid' : ''}
                            >
                                Add Shooter
                            </button>
                        </div>
                        <ul>
                            {shooters.map((shooter, idx) => (
                                <li key={idx}>
                                    {shooter.name}
                                    <button type="button" onClick={() => handleRemoveShooter(shooter.name)}>Remove</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="buttons-container">
                        <button
                            className={`start-shooting-button ${validateForm() ? 'enabled' : 'disabled'}`}
                            onClick={handleStartShooting}
                            disabled={!validateForm()}
                        >
                            Start Shooting
                        </button>
                        <button className="back-button" onClick={() => navigate('/')}>
                            Back to Game List
                        </button>
                    </div>

                    {!validateForm() && (
                        <div className="error-messages">
                            <ul>
                                {numStations <= 0 && <li>Number of Stations must be greater than zero.</li>}
                                {minShots <= 0 && <li>Min Shots per Station must be greater than zero.</li>}
                                {maxShots <= 0 && <li>Max Shots per Station must be greater than zero.</li>}
                                {totalShots <= 0 && <li>Total Shots must be greater than zero.</li>}
                                {!shooters.length && <li>At least one shooter must be added.</li>}
                            </ul>
                        </div>
                    )}
                </>
            ) : (
                <div className="station-naming">
                    <h2>Name Your Stations</h2>
                    {stationNames.map((name, index) => (
                        <div key={index} className="station-name-row">
                            <label>Station {index + 1}:</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => handleStationNameChange(index, e.target.value)}
                                placeholder={`Name for Station ${index + 1}`}
                            />
                        </div>
                    ))}
                    <button onClick={handleConfirmStationNames}>Confirm Station Names</button>
                </div>
            )}
        </div>
    );
};

export default GameDetails;
