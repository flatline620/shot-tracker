import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShooterInfo from './ShooterInfo';
import GameInfo from './GameInfo';
import NewGameForm from './NewGameForm';
import StationNaming from './StationNaming';
import './css/GameDetails.css'; // Ensure the correct path to the CSS file

// Function to distribute shots
const distributeShots = (numStations, minShotsPerStation, maxShotsPerStation, totalShots) => {
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

// Function to assign True Pairs as a matrix
const generateTruePairsMatrix = (shots, truePairsOption) => {
    const truePairsMatrix = [];

    for (let i = 0; i < shots.length; i++) {
        const numShots = shots[i];
        const truePairs = Array(numShots).fill(false); // Default all shots to not be True Pair

        // Randomly decide whether to assign True Pairs 50% of the time
        const shouldAssignTruePairs = Math.random() < 0.5;

        if (truePairsOption === 'All') {
            // Set all shots as True Pairs
            truePairs.fill(true);
        } else if (truePairsOption === 'Random' && shouldAssignTruePairs) {
            // Assign True Pairs randomly
            const numTruePairs = Math.floor(Math.random() * (Math.floor(numShots / 2) + 1)) * 2;
            for (let j = numShots - numTruePairs; j < numShots; j++) {
                truePairs[j] = true;
            }
        }

        truePairsMatrix.push(truePairs);
    }
    return truePairsMatrix;
};

const GameDetails = ({ games, onAddGame, onUpdateGame }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const index = parseInt(id, 10);
    const [game, setGame] = useState({});

    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [location, setLocation] = useState('TBSC');

    const [numStations, setNumStations] = useState(game.numStations || '');
    const [minShots, setMinShots] = useState(game.minShots || '');
    const [maxShots, setMaxShots] = useState(game.maxShots || '');
    const [totalShots, setTotalShots] = useState(game.totalShots || '');

    const [shooters, setShooters] = useState(game.shooters || []);
    const [newShooter, setNewShooter] = useState('');

    // State for station naming
    const [stationNames, setStationNames] = useState(Array(game.numStations || 1).fill(''));

    // State for True Pairs option
    const [truePairsOption, setTruePairsOption] = useState('None');

    // State for Rotate Shooters
    const [rotateShooters, setRotateShooters] = useState(true); // Default to true

    const [currentStep, setCurrentStep] = useState(0);

    const [errorMessages, setErrorMessages] = useState([]);

    useEffect(() => {
        setNumStations(game.numStations || '');
        setMinShots(game.minShots || '');
        setMaxShots(game.maxShots || '');
        setTotalShots(game.totalShots || '');
        setShooters(game.shooters || []);
        setStationNames(Array(game.numStations || 1).fill('')); // Reset station names
    }, [game]);

    const validateForm = () => {
        const errors = [];
        if (currentStep === 0) {
            if (name.length === 0) errors.push("Name is required.");
            if (location.length === 0) errors.push("Location is required.");
            if (date.length === 0) errors.push("Date is required.");
        }
        
        if (currentStep === 1) {
            if (shooters.length === 0) errors.push("At least one shooter is required.");
        }
        
        if (currentStep === 2) {
            if (numStations <= 0) errors.push("Number of stations must be greater than 0.");
            if (minShots <= 0) errors.push("Minimum shots must be greater than 0.");
            if (minShots % 2 !== 0) errors.push("Minimum shots must be an even number.");
            if (maxShots <= 0) errors.push("Maximum shots must be greater than 0.");
            if (maxShots % 2 !== 0) errors.push("Maximum shots must be an even number.");
            if (totalShots <= 0) errors.push("Total shots must be greater than 0.");
            if (totalShots % 2 !== 0) errors.push("Total shots must be an even number.");
            if (minShots > maxShots) errors.push("Minimum shots cannot be greater than maximum shots.");
            if (numStations * minShots > totalShots) errors.push("Total shots must allow for minimum shots per station.");
            if (numStations * maxShots < totalShots) errors.push("Total shots must not exceed maximum shots per station.");
        }
        
        if (currentStep === 3) {

        }
        
        return errors;
    };

    const handleNewGame = () => {
        const errors = validateForm();
        if (errors.length > 0) {
            setErrorMessages(errors);
            return;
        }
        
        setGame({name: name,
            location: location,
            date: date, 
            numStations: 7,
            minShots: 4,
            maxShots: 8,
            totalShots: 50,
            shooters: []
        });

        onAddGame(game);

        handleNextStep();
    };

    const handleShooterInfo = () => {
        const errors = validateForm();
        if (errors.length > 0) {
            setErrorMessages(errors);
            return;
        }
    
        const updatedGame = {
            ...game,
            shooters,
            rotateShooters,
        };
        onUpdateGame(index, updatedGame);
        setGame(updatedGame);
        handleNextStep();
    };
    
    const handleGameInfo = () => {
        const errors = validateForm();
        if (errors.length > 0) {
            setErrorMessages(errors);
            return;
        }
    
        let shotsDistribution = distributeShots(
            parseInt(numStations, 10),
            parseInt(minShots, 10),
            parseInt(maxShots, 10),
            parseInt(totalShots, 10)
        );
    
        const truePairsMatrix = generateTruePairsMatrix(shotsDistribution, truePairsOption);
    
        const updatedGame = {
            ...game,
            numStations: parseInt(numStations, 10),
            minShots: parseInt(minShots, 10),
            maxShots: parseInt(maxShots, 10),
            totalShots: parseInt(totalShots, 10),
            shotsDistribution,
            truePairsMatrix,
        };
        onUpdateGame(index, updatedGame);
        setGame(updatedGame);
        handleNextStep();
    };
    

    // Function to handle starting shooting
    const handleStartShooting = () => {
        // Replace empty names with default "Station X"
        const updatedStationNames = stationNames.map((name, idx) => name.trim() ? name : `Station ${idx + 1}`);

        const updatedGame = {
            ...game,
            stationNames: updatedStationNames
        };
        onUpdateGame(index, updatedGame);
        setGame(updatedGame);

        navigate('/scoreboard', { state: { game: updatedGame } });

    };

    const handleAddShooter = () => {
        setShooters([...shooters, {
            name: newShooter,
            shotsTaken: 0,
            numHits: 0,
            maxScore: 0
        }]);
        setNewShooter('');
    };

    const handleRemoveShooter = (shooterToRemove) => {
        setShooters(shooters.filter(shooter => shooter.name !== shooterToRemove));
    };

    const handleNextStep = () => {
        setErrorMessages([]); // Clear errors on success
        
        setCurrentStep((prevStep) => prevStep + 1);
    };

    const handlePreviousStep = () => {
        setErrorMessages([]);
        setCurrentStep((prevStep) => prevStep - 1);
    };

    return (
        <div className="game-details">
            { currentStep > 0 && (
                <div>
                    <h1>{game.name}</h1>
                    <h3>Location: {game.location}</h3>
                    <h3>Date: {game.date}</h3>
                    <hr />
                </div>
            )}

            {currentStep === 0 && (
                <NewGameForm name={name} setName={setName} location={location} setLocation={setLocation} date={date} setDate={setDate} />
            )}

            {currentStep === 1 && (
                <ShooterInfo 
                    shooters={shooters}
                    newShooter={newShooter}
                    setNewShooter={setNewShooter}
                    handleAddShooter={handleAddShooter}
                    handleRemoveShooter={handleRemoveShooter}
                    rotateShooters={rotateShooters}
                    setRotateShooters={setRotateShooters}
                />
            )}

            {currentStep === 2 && (
                <GameInfo 
                    numStations={numStations}
                    setNumStations={setNumStations}
                    minShots={minShots}
                    setMinShots={setMinShots}
                    maxShots={maxShots}
                    setMaxShots={setMaxShots}
                    totalShots={totalShots}
                    setTotalShots={setTotalShots}
                    truePairsOption={truePairsOption}
                    setTruePairsOption={setTruePairsOption}
                />
            )}

            {currentStep === 3 && (
                <StationNaming
                    stationNames={stationNames}
                    onStationNameChange={(index, name) => {
                        const updatedStationNames = [...stationNames];
                        updatedStationNames[index] = name;
                        setStationNames(updatedStationNames);
                    }}
                />
            )}

            <div className="buttons-container">
                {currentStep > 0 && (
                    <button type="button" onClick={handlePreviousStep} className="back-button">
                        Back
                    </button>
                )}
                {currentStep === 0 && (
                    <button type="button" onClick={handleNewGame} className="confirm-button">
                        Next
                    </button>
                )}
                {currentStep === 1 && (
                    <button type="button" onClick={handleShooterInfo} className="confirm-button">
                        Next
                    </button>
                )}
                {currentStep === 2 && (
                    <button type="button" onClick={handleGameInfo} className="confirm-button">
                        Next
                    </button>
                )}
                {currentStep === 3 && (
                    <button 
                        type="button" 
                        onClick={handleStartShooting}
                        className="confirm-button finish-button"
                    >
                        Start Game
                    </button>
                )}
            </div>


            <div className="error-messages">
                <ul>
                    {errorMessages.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            </div>


        </div>
    );
};

export default GameDetails;
