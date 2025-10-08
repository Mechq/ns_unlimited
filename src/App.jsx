import './App.css'
import {useState} from "react";
import Keypad from "./components/Keypad.jsx";
import keys from "./components/keys.js";
function App() {
    const [gameType, setGameType] = useState('Weekly');
    const [stationToGuess, setStationToGuess] = useState('Rech te brand');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [guesses, setGuesses] = useState(['', '', '', '', '']);
    const [currentGuess, setCurrentGuess] = useState('');

    const guessList = [];
    for (let i = 0; i < guesses.length; i++) {
        const isIncorrect = guesses[i] !== '';
        const isCurrentGuess = guesses[i] === '' && guesses.slice(0, i).every(g => g !== '');

        guessList.push(
            <div key={i} className="guess">
                <span className={`guess-circle ${isIncorrect ? 'incorrect' : ''}`}></span>
                {isCurrentGuess ? (
                    <input
                        type="text"
                        className="guess-input"
                        value={currentGuess}
                        onChange={e => setCurrentGuess(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleGuessSubmit();
                        }}
                        autoFocus
                    />
                ) : (
                    <span className="guessText">{guesses[i]}</span>
                )}
            </div>
        );
    }

    function handleGuessSubmit() {
        setGuesses(prevGuesses => {
            const newGuesses = [...prevGuesses];
            const firstEmptyIndex = newGuesses.indexOf('');
            if (firstEmptyIndex !== -1) {
                newGuesses[firstEmptyIndex] = currentGuess;
            }
            return newGuesses;
        });
        setCurrentGuess('');
    }

    function toggleDropdown() {
        setDropdownOpen(!dropdownOpen);
    }

    function handleStationToGuess() {
        setStationToGuess(null);
    }

    function handleGameTypeChange(gameTypeClicked) {
        if (gameTypeClicked === 'Weekly') {
            setGameType('Weekly');
        } else {
            setGameType('Unlimited');
        }
        setDropdownOpen(false);
    }

    return (
        <div className="App">

            <div className="game">
                {/*Top Bar with logo and gameType*/}
                <div className="topbar">

                    {/*The logo svg*/}
                    <img src="/logo.svg" alt="logo"/>

                    {/*The dropdown for gameType*/}
                    <div className="gameType">
                        <button onClick={toggleDropdown}>
                            <img src="/down_arrow.svg" alt="down_arrow"/>

                        </button>
                        {gameType}
                        {dropdownOpen && (
                            <div className="dropdown-content">
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    handleGameTypeChange('Weekly');
                                }}>Weekly</a>
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    handleGameTypeChange('Unlimited');
                                }}>Unlimited</a>
                            </div>
                        )}
                    </div>

                </div>

                {/*The station to guess*/}
                <div className="wordToGuess">{stationToGuess}</div>

                {/*Your guesses*/}
                <div className="guessList">
                    {guessList}
                </div>

            </div>


            <div className="keyboard">
                <Keypad keys={keys}/>
            </div>
        </div>
    )
}

export default App
