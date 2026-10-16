import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShooterInfo from './ShooterInfo';
import GameInfo from './GameInfo';
import NewGameForm from './NewGameForm';
import StationNaming from './StationNaming';
import locationConfiguration from '../../data/locations.json';
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

const createLauncherLabels = (birdCount, numberingScheme) =>
    Array.from({ length: birdCount }, (_, index) =>
        numberingScheme === 'Letters' ? String.fromCharCode(65 + index) : String(index + 1)
    );

const GameDetails = ({ games, onAddGame, onUpdateGame }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const index = parseInt(id, 10);
    const [game, setGame] = useState({});

    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [location, setLocation] = useState('TBSC');
    const configuredLocation = locationConfiguration.locations.find(
        configured => configured.name.trim().toLowerCase() === location.trim().toLowerCase()
    );
    const availableCourses = configuredLocation?.courses || [];

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
    const [selectedCourses, setSelectedCourses] = useState({});
    const [selectedStations, setSelectedStations] = useState([]);

    useEffect(() => {
        setSelectedCourses(Object.fromEntries(availableCourses.map(course => [course.name, false])));
        setSelectedStations([]);
    }, [configuredLocation]);

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
        const selectedCoursesArray = availableCourses.filter(course => selectedCourses[course.name]);
        if (randomizeStations(selectedCoursesArray)) setIsModalOpen(false);
    };

    function randomizeStations(selectedCoursesArray) {
        if (selectedCoursesArray.length === 0) {
            setErrorMessages(['Select at least one course.']);
            return false;
        }

        const availableStations = selectedCoursesArray.flatMap(course =>
            course.stations.map(station => ({
                ...station,
                course: course.name,
                difficulty: course.difficulty,
                launchers: createLauncherLabels(station.birds, configuredLocation.launcherNumberingScheme),
            }))
        );
        const stationCount = Number(numStations);

        if (availableStations.length < stationCount) {
            setErrorMessages([`The selected courses have ${availableStations.length} stations, but ${stationCount} are required.`]);
            return false;
        }

        const randomizedStations = [...availableStations];
        shuffleArray(randomizedStations);
        const chosenStations = new Set(randomizedStations.slice(0, stationCount));
        const finalStations = availableStations.filter(station => chosenStations.has(station));

        setSelectedStations(finalStations);
        setStationNames(finalStations.map(station => station.name));
        setErrorMessages([]);
        return true;
    }
    
    // Helper function to shuffle an array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let index = array.length - 1; index > 0; index--) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
        }
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
            truePairsOption,
            truePairWeighting,
        };
        onUpdateGame(index, updatedGame);
        setGame(updatedGame);
        handleNextStep();
    };

    // Function to handle starting shooting
    const handleStartShooting = () => {
        // Replace empty names with default "Station X"
        const updatedStationNames = stationNames.map((name, idx) => name.trim() ? name : `Station ${idx + 1}`);
        const stationDetails = selectedStations.map((station, index) => ({
            ...station,
            name: updatedStationNames[index],
        }));

        const updatedGame = {
            ...game,
            stationNames: updatedStationNames,
            stationDetails,
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
                    onReorderShooters={setShooters}
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

            {configuredLocation && currentStep === 3 && (
                <button className="randomize-button" onClick={handleRandomizeStations}>
                    Randomize Stations
                </button>
            )}

            {/* Modal for Select Courses */}
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Select {configuredLocation.name} Courses</h2>
                        <div className="course-checkboxes-container">
                            {availableCourses.map((course) => (
                                <div key={course.name} className="toggle-switch-container">
                                    <label htmlFor={`course-${course.name}`} className="switch">
                                        <input
                                            type="checkbox"
                                            id={`course-${course.name}`}
                                            checked={Boolean(selectedCourses[course.name])}
                                            onChange={() => handleCourseSelection(course.name)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                    <label htmlFor={`course-${course.name}`} className="course-option-label">
                                        <span className="course-option-name">{course.name}</span>
                                        <span className="course-option-difficulty">{course.difficulty}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                        {errorMessages.length > 0 && (
                            <div className="error-messages">
                                <ul>
                                    {errorMessages.map((error, index) => <li key={index}>{error}</li>)}
                                </ul>
                            </div>
                        )}
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
