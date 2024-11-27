import React from 'react';
import './css/GameInfo.css'; // Ensure the correct path to the CSS file

const GameInfo = ({ numStations, setNumStations, minShots, setMinShots, maxShots, setMaxShots, totalShots, setTotalShots, truePairsOption, setTruePairsOption }) => { 

   return (
        <div>
            <h2>Game Info</h2>

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


            <div className="true-pairs-container">
                <label className="true-pairs-label">True Pairs:</label>
                <div className="toggle-group">
                    <input
                        type="radio"
                        id="truePairsAll"
                        name="truePairs"
                        value="All"
                        checked={truePairsOption === 'All'}
                        onChange={(e) => setTruePairsOption(e.target.value)}
                        className="toggle-button"
                    />
                    <label htmlFor="truePairsAll" className={`toggle-button-label ${truePairsOption === 'All' ? 'active' : ''}`}>All</label>

                    <input
                        type="radio"
                        id="truePairsRandom"
                        name="truePairs"
                        value="Random"
                        checked={truePairsOption === 'Random'}
                        onChange={(e) => setTruePairsOption(e.target.value)}
                        className="toggle-button"
                    />
                    <label htmlFor="truePairsRandom" className={`toggle-button-label ${truePairsOption === 'Random' ? 'active' : ''}`}>Random</label>

                    <input
                        type="radio"
                        id="truePairsNone"
                        name="truePairs"
                        value="None"
                        checked={truePairsOption === 'None'}
                        onChange={(e) => setTruePairsOption(e.target.value)}
                        className="toggle-button"
                    />
                    <label htmlFor="truePairsNone" className={`toggle-button-label ${truePairsOption === 'None' ? 'active' : ''}`}>None</label>
                </div>
            </div>



        </div>
    );
};

export default GameInfo;