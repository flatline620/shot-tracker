import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // for navigation

const Help = () => {
  const navigate = useNavigate(); // using useNavigate instead of useHistory
  const [step, setStep] = useState(0);

  // List of steps: each step has an image and a description
  const steps = [
    {
      image: 'tutorial-new-game.jpg',
      description: 'When starting a new game, enter a Game Name, Location, and Date. A default Location and Date will be automatically provided for you.',
    },
    {
      image: 'tutorial-add-shooter.jpg',
      description: 'Enter the shooter\'s name and click \'Add Shooter\'. Shooters will appear in the order they are entered. The \'Rotate First Shooter\' option, when selected, will rotate the shooter who goes first at each station. If not selected, the shooter order will remain fixed.',
    },
    {
      image: 'tutorial-game-info.jpg',
      description: 'Define the game parameters by setting variables such as \'Number of Stations\', \'Min Shots per Station\', \'Max Shots per Station\', and \'Total Shots\'. These will be used to randomly generate a Scorecard for the game. You can also choose to add True Pairs by selecting \'All\', \'Random\', or \'None\'.',
    },
    {
      image: 'tutorial-true-pair-weighting.jpg',
      description: 'Selecting \'Random\' lets you define the weighting bias for True Pairs at each station. A value of 0 means no stations will have True Pairs, while a value of 100 ensures every station has at least one True Pair.',
    },
    {
      image: 'tutorial-station-names.jpg',
      description: 'Before viewing the generated scoreboard, you can choose the stations for the game. You can name them manually or, for a configured location, select courses and use \'Randomize Stations\'. During a game, use \'Edit Stations\' to change stations that have not been shot.',
    },
    {
      image: 'tutorial-assign-stations.jpg',
      description: 'If you selected \'Randomize Stations\', you can define the specific courses you want to shoot during the game. When ready, press \'Assign Stations\' to have random stations assigned for you.',
    },
    {
      image: 'tutorial-scoreboard-1.jpg',
      description: 'After starting the game by pressing the \'PULL\' button, you’ll see the Scoreboard, which displays the number of shots and types of shots at each station. Shots marked as \'TP\' are True Pairs. The current shooter will be highlighted in green, and their name will be italicized. To start recording shots, press the \'Shots\' button. On wider screens, such as landscape mode, the button may display as \'Record Shots\'.',
    },
    {
      image: 'tutorial-record-shots-1.jpg',
      description: 'On the \'Record Shots\' screen, the current shooter is displayed at the top, followed by a station selector for easy navigation if a station needs to be skipped. Below, you will find three buttons: a green \'/\' for \'Hit\', a red \'O\' for \'Miss\', and an \'Undo\' button. Record the shooter\'s results for each shot.',
    },
    {
      image: 'tutorial-record-shots-2.jpg',
      description: 'The \'Current Station Preview\' area shows the shots and their results as they are entered. Once the shooter is finished at the station, press \'Record Shots\'. You can view the shooter\'s current results by scrolling through the scoreboard below.',
    },
    {
      image: 'tutorial-scoreboard-2.jpg',
      description: 'Once the shots are recorded, you’ll return to the main scoreboard, where the next shooter will be identified. The scoreboard will also display the current overall game results, including stats for hits/total shots, Max Score, and the Current/Longest Streak.',
    },
    {
      image: 'tutorial-scoreboard-3.jpg',
      description: 'Once all shooters have finished, the winner will be highlighted in gold, and all shooters\' results can be viewed at the bottom of the scoreboard.',
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/'); // Navigate back to the home page when the last step is reached
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        zIndex: 1000,
      }}
    >
      <button
        type="button"
        onClick={() => navigate('/')}
        aria-label="Close tutorial"
        title="Close tutorial"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          border: 'none',
          borderRadius: '4px',
          background: 'white',
          color: '#000',
          fontSize: '28px',
          lineHeight: 1,
          padding: '6px 10px',
          cursor: 'pointer',
          zIndex: 1001,
        }}
      >
        &times;
      </button>
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '90%',
          maxHeight: '90%',
          overflowY: 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column', // Change to column layout
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Three-column layout: Left Arrow, Image, Right Arrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {/* Left Arrow Column */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '50px', // Fixed width for the left column
            }}
          >
            <button
              onClick={handleBack}
              disabled={step === 0}
              style={{
                border: 'none',
                fontSize: '30px',
                color: '#000',
                cursor: step === 0 ? 'not-allowed' : 'pointer',
                background: 'transparent',
                padding: '5px',
              }}
            >
              &#8592; {/* Left arrow */}
            </button>
          </div>

          {/* Image Column */}
          <div
            style={{
              flex: 1, // This will make the image take up the available space
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
            }}
          >
            <img
              src={steps[step].image}
              alt={`Step ${step + 1}`}
              style={{
                width: '100%',
                maxWidth: '400px', // Responsive image width
                height: 'auto',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          </div>

          {/* Right Arrow Column */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '50px', // Fixed width for the right column
            }}
          >
            <button
              onClick={handleNext}
              style={{
                border: 'none',
                fontSize: '30px',
                color: '#000',
                cursor: 'pointer',
                background: 'transparent',
                padding: '5px',
              }}
            >
              &#8594; {/* Right arrow */}
            </button>
          </div>
        </div>

        {/* Description - same width as the image */}
        <div
          style={{
            width: '100%', // Make sure description uses the same width as the image
            maxWidth: '400px', // Limit to the same max width as the image
            textAlign: 'center',
            marginTop: '20px',
          }}
        >
          <p style={{ fontSize: '18px' }}>{steps[step].description}</p>
        </div>
      </div>
    </div>
  );
};

export default Help;
