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
const generateTruePairsMatrix = (shots, truePairsOption, truePairWeighting) => {
    const truePairsMatrix = [];

    for (let i = 0; i < shots.length; i++) {
        const numShots = shots[i];
        const truePairs = Array(numShots).fill(false); // Default all shots to not be True Pair

        const shouldAssignTruePairs = Math.random() < (truePairWeighting / 100);

        if (truePairsOption === 'All') {
            truePairs.fill(true);
        } else if (truePairsOption === 'Random' && shouldAssignTruePairs) {
            const numTruePairs = Math.max(2, Math.floor(Math.random() * (Math.floor(numShots / 2) + 1)) * 2);
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

    const [truePairWeighting, setTruePairWeighting] = useState(50);

    // State for Rotate Shooters
    const [rotateShooters, setRotateShooters] = useState(true); // Default to true

    const [currentStep, setCurrentStep] = useState(0);

    const [errorMessages, setErrorMessages] = useState([]);

    // Modal State for Randomize Stations
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourses, setSelectedCourses] = useState({
        Green: false,
        Orange: false,
        Pink: false,
        Black: false,
        Red: false,
        Yellow: false,
        Purple: false,
        Blue: false,
    });

    const colorOptions = ['Green', 'Orange', 'Pink', 'Black', 'Red', 'Yellow', 'Purple', 'Blue'];

    useEffect(() => {
        setNumStations(game.numStations || '');
        setMinShots(game.minShots || '');
        setMaxShots(game.maxShots || '');
        setTotalShots(game.totalShots || '');
        setShooters(game.shooters || []);
        setStationNames(Array(game.numStations || 1).fill('')); // Reset station names
    }, [game]);

    const handleRandomizeStations = () => {
        setIsModalOpen(true);
    };

    const handleCourseSelection = (course) => {
        setSelectedCourses((prevState) => ({
            ...prevState,
            [course]: !prevState[course],
        }));
    };

    const handleAssignStations = () => {
        // Call the function to assign stations
        const selectedCoursesArray = Object.keys(selectedCourses).filter(course => selectedCourses[course]);
        randomizeStations(selectedCoursesArray);

        setIsModalOpen(false);
    };

    function randomizeStations(selectedCoursesArray) {
        // If no colors were selected, do not randomize
        if (selectedCoursesArray.length === 0) return;
    
        // Generate all available stations (1-7) for each selected color
        let availableStations = [];
    
        // Generate stations for each selected color
        for (let course of selectedCoursesArray) {
            for (let i = 1; i <= 7; i++) {
                availableStations.push(`${course} ${i}`);  // "Green 1", "Red 2", etc.
            }
        }
    
        // Shuffle the available stations for randomization
        shuffleArray(availableStations);
    
        // Assign the shuffled stations to the game.stationNames list, ensuring there are enough stations
        let finalStations = [];
    
        for (let i = 0; i < numStations; i++) {
            // If we still have stations to assign, pick one from the shuffled list
            if (i < availableStations.length) {
                finalStations.push(availableStations[i]);
            } else {
                // If more stations are needed than available, reuse stations in round-robin fashion
                finalStations.push(availableStations[i % availableStations.length]);
            }
        }
    
        // Now sort the stations using the new sortStations function
        finalStations = sortStations(finalStations);
    
        // Assign the final sorted stations to the game detail
        // stationNameList = finalStations;
        setStationNames(finalStations);
    }
    
    // Helper function to shuffle an array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];  // Swap elements
        }
    }
    
    function sortStations(stations) {
        // Base case: if no stations to sort, return the list
        if (stations.length === 0) return [];
    
        // Sort stations by color and station number
        let sortedStations = stations.sort((station1, station2) => {
            let color1 = station1.split(" ")[0];
            let color2 = station2.split(" ")[0];
    
            // Find the index of the color in the colorOptions array
            let color1Index = colorOptions.indexOf(color1);
            let color2Index = colorOptions.indexOf(color2);
    
            // If color is not found, set index to maximum
            color1Index = color1Index === -1 ? Number.MAX_SAFE_INTEGER : color1Index;
            color2Index = color2Index === -1 ? Number.MAX_SAFE_INTEGER : color2Index;
    
            // First, compare by color
            if (color1Index === color2Index) {
                // If the colors are the same, compare by station number
                let num1 = parseInt(station1.split(" ")[1], 10);
                let num2 = parseInt(station2.split(" ")[1], 10);
                return num1 - num2;
            }
    
            // Otherwise, compare by color index
            return color1Index - color2Index;
        });
    
        // Set to track stations we've already added to the final list
        let finalStations = [];
        let tempStations = [];
    
        // Go through the sorted stations and handle duplicates
        for (let station of sortedStations) {
            if (finalStations.includes(station)) {
                // If the station is already in the final list, add it to the temp list
                tempStations.push(station);
            } else {
                // If the station is not a duplicate, add it to the final list
                finalStations.push(station);
            }
        }
    
        // If we have any duplicates, recursively sort them again
        if (tempStations.length > 0) {
            let tempSorted = sortStations(tempStations);
            // Append the results of the recursive sort to the final stations
            finalStations = finalStations.concat(tempSorted);
        }
    
        // Return the sorted stations
        return finalStations;
    }
    
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

        return errors;
    };

    const handleNewGame = () => {
        const errors = validateForm();
        if (errors.length > 0) {
            setErrorMessages(errors);
            return;
        }

        setGame({
            name: name,
            location: location,
            date: date,
            numStations: 7,
            minShots: 4,
            maxShots: 8,
            totalShots: 50,
            shooters: [],
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

        const truePairsMatrix = generateTruePairsMatrix(shotsDistribution, truePairsOption, truePairWeighting);

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
        setShooters([
            ...shooters,
            {
                name: newShooter,
                shotsTaken: 0,
                numHits: 0,
                maxScore: 0,
            },
        ]);
        setNewShooter('');
    };

    const handleRemoveShooter = (shooterToRemove) => {
        setShooters(shooters.filter((shooter) => shooter.name !== shooterToRemove));
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
            {currentStep > 0 && (
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
                    truePairWeighting={truePairWeighting}
                    setTruePairWeighting={setTruePairWeighting}
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

            {game.location === 'TBSC' && currentStep === 3 && (
                <button className="randomize-button" onClick={handleRandomizeStations}>
                    Randomize Stations
                </button>
            )}

            {/* Modal for Select Courses */}
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Select Courses</h2>
                        <div className="course-checkboxes-container">
                            {Object.keys(selectedCourses).map((course) => (
                                <div key={course} className="toggle-switch-container">
                                    <label htmlFor={course} className="switch">
                                        <input
                                            type="checkbox"
                                            id={course}
                                            checked={selectedCourses[course]}
                                            onChange={() => handleCourseSelection(course)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                    <label htmlFor={course}>{course}</label>
                                </div>
                            ))}
                        </div>
                        <div className="assign-stations-button-container">
                            <button onClick={handleAssignStations} className="assign-stations-button">
                                Assign Stations
                            </button>
                        </div>
                    </div>
                </div>
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
                        className="confirm-button"
                    >
                        PULL
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
