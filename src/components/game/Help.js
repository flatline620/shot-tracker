import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // for navigation

const Help = () => {
  const navigate = useNavigate(); // using useNavigate instead of useHistory
  const [step, setStep] = useState(0);

  // List of steps: each step has an image and a description
  const steps = [
    {
        image: 'tutorial-new-game.jpg', // Updated image reference
        description: 'When starting a new game, enter a Game Name, Location, and Date. A default Location and Date will be automatically provided for you.',
    },
    {
        image: 'tutorial-add-shooter.jpg', // Replace with actual image URLs
        description: 'Enter the shooter\'s name and click \'Add Shooter\'. Shooters will appear in the order they are entered. The \'Rotate First Shooter\' option, when selected, will rotate the shooter who goes first at each station. If not selected, the shooter order will remain fixed.',
    },
    {
        image: 'tutorial-game-info.jpg', // Replace with actual image URLs
        description: 'Define the game parameters by setting variables such as \'Number of Stations\', \'Min Shots per Station\', \'Max Shots per Station\', and \'Total Shots\'. These will be used to randomly generate a Scorecard for the game. You can also choose to add True Pairs by selecting \'All\', \'Random\', or \'None\'.',
    },
    {
        image: 'tutorial-true-pair-weighting.jpg', // Replace with actual image URLs
        description: 'Selecting \'Random\' lets you define the weighting bias for True Pairs at each station. A value of 0 means no stations will have True Pairs, while a value of 100 ensures every station has at least one True Pair.',
    },
    {
        image: 'tutorial-station-names.jpg', // Replace with actual image URLs
        description: 'Before viewing the generated scoreboard, you can choose the stations for the game. You can either name the stations manually or, if shooting at TBSC, select \'Randomize Stations\'. If a station is not functioning properly, you can edit the station names during the game by pressing the \'Rename Stations\' button on the Scoreboard.',
    },
    {
        image: 'tutorial-assign-stations.jpg', // Replace with actual image URLs
        description: 'If you selected \'Randomize Stations\', you can define the specific courses you want to shoot during the game. When ready, press \'Assign Stations\' to have random stations assigned for you.',
    },
    {
        image: 'tutorial-scoreboard-1.jpg', // Replace with actual image URLs
        description: 'After starting the game by pressing the \'PULL\' button, you’ll see the Scoreboard, which displays the number of shots and types of shots at each station. Shots marked as \'TP\' are True Pairs. The current shooter will be highlighted in green, and their name will be italicized. To start recording shots, press the \'Shots\' button. On wider screens, such as landscape mode, the button may display as \'Record Shots\'.',
    },
    {
        image: 'tutorial-record-shots-1.jpg', // Replace with actual image URLs
        description: 'On the \'Record Shots\' screen, the current shooter is displayed at the top, followed by a station selector for easy navigation if a station needs to be skipped. Below, you will find three buttons: a green \'/\' for \'Hit\', a red \'O\' for \'Miss\', and an \'Undo\' button. Record the shooter\'s results for each shot.',
    },
    {
        image: 'tutorial-record-shots-2.jpg', // Replace with actual image URLs
        description: 'The \'Current Station Preview\' area shows the shots and their results as they are entered. Once the shooter is finished at the station, press \'Record Shots\'. You can view the shooter\'s current results by scrolling through the scoreboard below.',
    },
    {
        image: 'tutorial-scoreboard-2.jpg', // Replace with actual image URLs
        description: 'Once the shots are recorded, you’ll return to the main scoreboard, where the next shooter will be identified. The scoreboard will also display the current overall game results, including stats for hits/total shots, Max Score, and the Current/Longest Streak.',
    },
    {
        image: 'tutorial-scoreboard-3.jpg', // Replace with actual image URLs
        description: 'Once all shooters have finished, the winner will be highlighted in gold, and all shooters\' results can be viewed at the bottom of the scoreboard.',
    },
];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Navigate back to home page when the last step is reached
      navigate('/');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
    <img
        src={steps[step].image}
        alt={`Step ${step + 1}`}
        style={{
        width: '300px',        // Set the image width to 400px
        height: 'auto',        // Automatically adjust the height to maintain aspect ratio
        objectFit: 'cover',    // Ensure the image maintains its aspect ratio and is cropped if necessary
        borderRadius: '10px',  // Optional: Add rounded corners for a smoother appearance
        }}
    />
      <p style={{ marginTop: '20px', fontSize: '18px' }}>
        {steps[step].description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button
          onClick={handleBack}
          disabled={step === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f0f0f0',
            border: 'none',
            borderRadius: '5px',
            cursor: step === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {step === steps.length - 1 ? 'End' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Help;
