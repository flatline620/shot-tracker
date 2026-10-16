import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShooterInfo from './ShooterInfo';
import GameInfo from './GameInfo';
import NewGameForm from './NewGameForm';
import StationNaming from './StationNaming';
import GenericScorecard from './GenericScorecard';
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

const createLauncherPairLabelsMatrix = (stationDetails, shotsDistribution, allowAllPairs, allowMixedPairs, secondPairWeighting) =>
    stationDetails.map((station, stationIndex) => {
        const shotCount = shotsDistribution[stationIndex] || 0;
        const alternatePair = station.launchers?.slice(2, 4).join('/');
        const launcherPairLabels = Array(shotCount).fill('');

        if (!allowAllPairs || station.birds <= 2 || !alternatePair) return launcherPairLabels;

        if (allowMixedPairs) {
            for (let pairStart = 0; pairStart < shotCount; pairStart += 2) {
                if (Math.random() >= secondPairWeighting / 100) continue;
                launcherPairLabels[pairStart] = alternatePair;
                if (pairStart + 1 < shotCount) launcherPairLabels[pairStart + 1] = alternatePair;
            }
        } else if (Math.random() < secondPairWeighting / 100) {
            launcherPairLabels.fill(alternatePair);
        }

        return launcherPairLabels;
    });

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
    const configuredStations = availableCourses.flatMap(course =>
        course.stations.map(station => ({
            ...station,
            course: course.name,
            difficulty: course.difficulty,
            launchers: createLauncherLabels(station.birds, configuredLocation.launcherNumberingScheme),
        }))
    );
    const hasFourLauncherStations = availableCourses.some(course =>
        course.stations.some(station => station.birds > 2)
    );
    const alternateLauncherPairName = configuredLocation?.launcherNumberingScheme === 'Letters' ? 'C/D' : '3/4';
    const standardLauncherPairName = configuredLocation?.launcherNumberingScheme === 'Letters' ? 'A/B' : '1/2';

    const getStationLauncherCount = (stationIndex) => {
        const stationName = game.stationNames?.[stationIndex]?.trim().toLowerCase();
        const stationDetailsForGame = game.stationDetails?.[stationIndex];
        const configuredStation = configuredStations.find(station =>
            station.name.trim().toLowerCase() === stationName
        ) || configuredStations.find(station =>
            station.name.trim().toLowerCase() === stationDetailsForGame?.configurationName?.trim().toLowerCase()
        );

        return configuredStation?.birds ?? stationDetailsForGame?.birds ?? 0;
    };

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
    const [randomizeShots, setRandomizeShots] = useState(true);
    const [stationPairCounts, setStationPairCounts] = useState(() =>
        Array.from({ length: 7 }, () => ({ reportPairs: 0, truePairs: 0 }))
    );
    const [secondPairWeighting, setSecondPairWeighting] = useState(50);
    const [allowAllPairs, setAllowAllPairs] = useState(false);
    const [allowMixedPairs, setAllowMixedPairs] = useState(false);

    // State for Rotate Shooters
    const [rotateShooters, setRotateShooters] = useState(true); // Default to true

    const [currentStep, setCurrentStep] = useState(0);

    const [errorMessages, setErrorMessages] = useState([]);

    // Modal State for Randomize Stations
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewInfoOpen, setIsPreviewInfoOpen] = useState(false);
    const [editingShotPair, setEditingShotPair] = useState(null);
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
        setStationNames(currentNames => {
            const stationCount = game.numStations || 1;
            return currentNames.length === stationCount ? currentNames : Array(stationCount).fill('');
        });
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

    const handleStationNameChange = (stationIndex, stationName) => {
        setStationNames(currentNames => currentNames.map((name, index) =>
            index === stationIndex ? stationName : name
        ));

        const configuredStation = configuredStations.find(station => station.name === stationName);
        setSelectedStations(currentStations => currentStations.map((station, index) =>
            index === stationIndex ? (configuredStation || { name: stationName, birds: 0, launchers: [] }) : station
        ));
    };
    
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
            if (totalShots <= 0) errors.push("Total shots must be greater than 0.");
            if (totalShots % 2 !== 0) errors.push("Total shots must be an even number.");

            if (randomizeShots) {
                if (minShots <= 0) errors.push("Minimum shots must be greater than 0.");
                if (minShots % 2 !== 0) errors.push("Minimum shots must be an even number.");
                if (maxShots <= 0) errors.push("Maximum shots must be greater than 0.");
                if (maxShots % 2 !== 0) errors.push("Maximum shots must be an even number.");
                if (minShots > maxShots) errors.push("Minimum shots cannot be greater than maximum shots.");
                if (numStations * minShots > totalShots) errors.push("Total shots must allow for minimum shots per station.");
                if (numStations * maxShots < totalShots) errors.push("Total shots must not exceed maximum shots per station.");
            } else {
                const assignedShots = stationPairCounts.reduce(
                    (total, station) => total + (station.reportPairs + station.truePairs) * 2,
                    0
                );
                const remainingShots = Number(totalShots) - assignedShots;
                if (remainingShots > 0) {
                    errors.push(`Assign all shots before continuing. ${remainingShots} shots remain.`);
                } else if (remainingShots < 0) {
                    errors.push(`Remove ${Math.abs(remainingShots)} over-allocated shots before continuing.`);
                }
            }
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

        let shotsDistribution;
        let truePairsMatrix;

        if (randomizeShots) {
            shotsDistribution = distributeShots(
                parseInt(numStations, 10),
                parseInt(minShots, 10),
                parseInt(maxShots, 10),
                parseInt(totalShots, 10)
            );
            truePairsMatrix = generateTruePairsMatrix(shotsDistribution, truePairsOption, truePairWeighting);
        } else {
            shotsDistribution = stationPairCounts.map(station => (station.reportPairs + station.truePairs) * 2);
            truePairsMatrix = stationPairCounts.map(station => [
                ...Array(station.reportPairs * 2).fill(false),
                ...Array(station.truePairs * 2).fill(true),
            ]);
        }

        const updatedGame = {
            ...game,
            numStations: parseInt(numStations, 10),
            minShots: parseInt(minShots, 10),
            maxShots: parseInt(maxShots, 10),
            totalShots: parseInt(totalShots, 10),
            randomizeShots,
            stationPairCounts,
            shotsDistribution,
            truePairsMatrix,
            truePairsOption,
            truePairWeighting,
            allowAllPairs,
            allowMixedPairs,
            secondPairWeighting,
        };
        onUpdateGame(index, updatedGame);
        setGame(updatedGame);
        handleNextStep();
    };

    const handlePreparePreview = () => {
        // Replace empty names with default "Station X"
        const updatedStationNames = stationNames.map((name, idx) => name.trim() ? name : `Station ${idx + 1}`);
        const hasMatchingPreview = game.stationNames?.length === updatedStationNames.length
            && game.stationNames.every((name, index) => name === updatedStationNames[index])
            && game.stationDetails?.length === updatedStationNames.length;
        const stationDetails = hasMatchingPreview
            ? game.stationDetails
            : updatedStationNames.map((stationName, index) => {
                const station = selectedStations[index] || configuredStations.find(configuredStation =>
                    configuredStation.name.trim().toLowerCase() === stationName.trim().toLowerCase()
                );
                return station
                    ? { ...station, configurationName: station.name, name: stationName }
                    : { name: stationName, birds: 0, launchers: [] };
            });
        const launcherPairLabelsMatrix = stationDetails.map((station, stationIndex) => {
            const stationNameChanged = game.stationNames?.[stationIndex] !== updatedStationNames[stationIndex];
            const currentLabels = game.launcherPairLabelsMatrix?.[stationIndex];
            const shotCount = game.shotsDistribution[stationIndex];

            if (stationNameChanged && station.birds <= 2) return Array(shotCount).fill('');
            if (currentLabels?.length === shotCount) return currentLabels;

            return createLauncherPairLabelsMatrix(
                [station],
                [shotCount],
                game.allowAllPairs,
                game.allowMixedPairs,
                game.secondPairWeighting
            )[0];
        });

        const updatedGame = {
            ...game,
            stationNames: updatedStationNames,
            stationDetails,
            launcherPairLabelsMatrix,
        };
        onUpdateGame(index, updatedGame);
        setGame(updatedGame);
        setStationNames(updatedStationNames);
        setErrorMessages([]);
        setCurrentStep(4);
    };

    const handleEditShotPair = (stationIndex, shotIndex) => {
        const pairStart = Math.floor(shotIndex / 2) * 2;
        const currentLauncherPair = game.launcherPairLabelsMatrix?.[stationIndex]?.[pairStart];
        setEditingShotPair({
            stationIndex,
            pairStart,
            isTruePair: Boolean(game.truePairsMatrix?.[stationIndex]?.[pairStart]),
            launcherPair: currentLauncherPair ? 'alternate' : 'standard',
        });
    };

    const handleUpdateShotPair = (isTruePair, launcherPair) => {
        if (!editingShotPair) return;

        const { stationIndex, pairStart } = editingShotPair;
        const pairShotIndexes = [pairStart, pairStart + 1].filter(
            shotIndex => shotIndex < game.shotsDistribution[stationIndex]
        );
        const truePairsMatrix = game.truePairsMatrix.map((stationPairs, index) =>
            index === stationIndex
                ? stationPairs.map((value, shotIndex) => pairShotIndexes.includes(shotIndex) ? isTruePair : value)
                : stationPairs
        );
        const canUseAlternatePair = getStationLauncherCount(stationIndex) > 2;
        const launcherPairLabelsMatrix = (game.launcherPairLabelsMatrix || []).map((stationLabels, index) => {
            if (index !== stationIndex || !canUseAlternatePair) return stationLabels;
            return stationLabels.map((label, shotIndex) => {
                return pairShotIndexes.includes(shotIndex)
                    ? (launcherPair === 'alternate' ? alternateLauncherPairName : '')
                    : label;
            });
        });
        const updatedGame = { ...game, truePairsMatrix, launcherPairLabelsMatrix };

        setGame(updatedGame);
        onUpdateGame(index, updatedGame);
        setEditingShotPair(null);
    };

    const handleStartShooting = () => {
        navigate('/scoreboard', { state: { game } });
    };

    const editingStationIndex = editingShotPair?.stationIndex;
    const canEditLauncherPair = Boolean(
        editingShotPair
        && getStationLauncherCount(editingStationIndex) > 2
    );

    const handleSaveShotPair = () => {
        if (!editingShotPair) return;
        handleUpdateShotPair(editingShotPair.isTruePair, editingShotPair.launcherPair);
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
                    randomizeShots={randomizeShots}
                    setRandomizeShots={setRandomizeShots}
                    stationPairCounts={stationPairCounts}
                    setStationPairCounts={setStationPairCounts}
                    truePairsOption={truePairsOption}
                    setTruePairsOption={setTruePairsOption}
                    truePairWeighting={truePairWeighting}
                    setTruePairWeighting={setTruePairWeighting}
                    hasFourLauncherStations={hasFourLauncherStations}
                    alternateLauncherPairName={alternateLauncherPairName}
                    allowAllPairs={allowAllPairs}
                    setAllowAllPairs={setAllowAllPairs}
                    allowMixedPairs={allowMixedPairs}
                    setAllowMixedPairs={setAllowMixedPairs}
                    secondPairWeighting={secondPairWeighting}
                    setSecondPairWeighting={setSecondPairWeighting}
                    standardLauncherPairName={standardLauncherPairName}
                />
            )}

            {currentStep === 3 && (
                <StationNaming
                    stationNames={stationNames}
                    stationOptions={configuredLocation ? configuredStations : []}
                    onStationNameChange={handleStationNameChange}
                />
            )}

            {currentStep === 4 && (
                <div className="scorecard-preview">
                    <div className="scorecard-preview-heading">
                        <h2>Scorecard Preview</h2>
                        <button
                            type="button"
                            className="launcher-help-button"
                            aria-label="Scorecard Preview information"
                            title="Scorecard Preview information"
                            onClick={() => setIsPreviewInfoOpen(true)}
                        >
                            ℹ️
                        </button>
                    </div>
                    <GenericScorecard
                        title={null}
                        verticalStations
                        onShotClick={handleEditShotPair}
                        shotsDistribution={game.shotsDistribution || []}
                        stationNames={game.stationNames || []}
                        truePairsMatrix={game.truePairsMatrix || []}
                        launcherPairLabelsMatrix={game.launcherPairLabelsMatrix || []}
                    />
                </div>
            )}

            {isPreviewInfoOpen && (
                <div className="launcher-info-backdrop" role="presentation" onClick={() => setIsPreviewInfoOpen(false)}>
                    <div
                        className="launcher-info-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="scorecard-preview-info-title"
                        onClick={event => event.stopPropagation()}
                    >
                        <button type="button" className="launcher-info-close" onClick={() => setIsPreviewInfoOpen(false)} aria-label="Close information">
                            &times;
                        </button>
                        <h3 id="scorecard-preview-info-title">Scorecard Preview</h3>
                        <p>Click any shot to edit its two-shot pair, including True Pair status and launcher assignment when available. Changes apply to both shots in the pair.</p>
                    </div>
                </div>
            )}

            {editingShotPair && (
                <div className="launcher-info-backdrop" role="presentation" onClick={() => setEditingShotPair(null)}>
                    <div
                        className="launcher-info-dialog shot-pair-edit-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="shot-pair-edit-title"
                        onClick={event => event.stopPropagation()}
                    >
                        <button type="button" className="launcher-info-close" onClick={() => setEditingShotPair(null)} aria-label="Close pair editor">
                            &times;
                        </button>
                        <h3 id="shot-pair-edit-title">
                            {game.stationNames[editingShotPair.stationIndex]}: shots {editingShotPair.pairStart + 1}-{Math.min(editingShotPair.pairStart + 2, game.shotsDistribution[editingShotPair.stationIndex])}
                        </h3>
                        <div className="shot-pair-edit-setting">
                            <label className="true-pairs-label">True Pair:</label>
                            <div className="toggle-group" role="radiogroup" aria-label="True Pair">
                                <input
                                    type="radio"
                                    id="previewTruePairYes"
                                    name="previewTruePair"
                                    checked={editingShotPair.isTruePair}
                                    onChange={() => setEditingShotPair(current => ({ ...current, isTruePair: true }))}
                                    className="toggle-button"
                                />
                                <label htmlFor="previewTruePairYes" className={`toggle-button-label ${editingShotPair.isTruePair ? 'active' : ''}`}>Yes</label>
                                <input
                                    type="radio"
                                    id="previewTruePairNo"
                                    name="previewTruePair"
                                    checked={!editingShotPair.isTruePair}
                                    onChange={() => setEditingShotPair(current => ({ ...current, isTruePair: false }))}
                                    className="toggle-button"
                                />
                                <label htmlFor="previewTruePairNo" className={`toggle-button-label ${!editingShotPair.isTruePair ? 'active' : ''}`}>No</label>
                            </div>
                        </div>
                        {canEditLauncherPair && (
                            <div className="shot-pair-edit-setting">
                                <label className="true-pairs-label">Launcher Pair:</label>
                                <div className="toggle-group" role="radiogroup" aria-label="Launcher Pair">
                                    <input
                                        type="radio"
                                        id="previewStandardLaunchers"
                                        name="previewLauncherPair"
                                        checked={editingShotPair.launcherPair === 'standard'}
                                        onChange={() => setEditingShotPair(current => ({ ...current, launcherPair: 'standard' }))}
                                        className="toggle-button"
                                    />
                                    <label htmlFor="previewStandardLaunchers" className={`toggle-button-label ${editingShotPair.launcherPair === 'standard' ? 'active' : ''}`}>{standardLauncherPairName}</label>
                                    <input
                                        type="radio"
                                        id="previewAlternateLaunchers"
                                        name="previewLauncherPair"
                                        checked={editingShotPair.launcherPair === 'alternate'}
                                        onChange={() => setEditingShotPair(current => ({ ...current, launcherPair: 'alternate' }))}
                                        className="toggle-button"
                                    />
                                    <label htmlFor="previewAlternateLaunchers" className={`toggle-button-label ${editingShotPair.launcherPair === 'alternate' ? 'active' : ''}`}>{alternateLauncherPairName}</label>
                                </div>
                            </div>
                        )}
                        <button type="button" className="confirm-button" onClick={handleSaveShotPair}>Save Pair</button>
                    </div>
                </div>
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
                        onClick={handlePreparePreview}
                        className="confirm-button"
                    >
                        Preview
                    </button>
                )}
                {currentStep === 4 && (
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
