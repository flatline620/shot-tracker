import React from 'react';
//import './css/NewGameForm.css';

const NewGameForm = ({ name, setName, location, setLocation, date, setDate }) => {
  // const [name, setName] = useState('');
  // const [date, setDate] = useState('');
  // const [location, setLocation] = useState('');

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const newGame = {
  //     name,
  //     date,
  //     location,
  //   };

  //   onAddGame(newGame);
  // };



  return (
    <div>
      <h1>New Game</h1>
      <form className="game-form">
        <div className="form-row">
          <label htmlFor="name">Name:</label>
          <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={(name && name.trim() === '') ? 'invalid' : ''}
          />
        </div>

        <div className="form-row">
          <label htmlFor="location">Location:</label>
          <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={(location && location.trim() === '') ? 'invalid' : ''}
          />
        </div>
        
        <div className="form-row">
          <label htmlFor="date">Date:</label>
          <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={(date && date.trim() === '') ? 'invalid' : ''}
          />
        </div>
      </form>
    </div>
  );
};

export default NewGameForm;
