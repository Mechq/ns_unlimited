import './App.css'
import {useCallback, useEffect, useState} from "react";
import Keypad from "./components/Keypad.jsx";
import keys from "./components/keys.js";
import {stations} from "../data.js";


function App() {
    const [gameType, setGameType] = useState('Dagelijks');
    const [solution, setSolution] = useState('sssss');
    const [scrambledSolution, setScrambledSolution] = useState('aaaaaa');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [guesses, setGuesses] = useState(['', '', '', '', '']);
    const [currentGuess, setCurrentGuess] = useState('');
    const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
    const [gameStatus, setGameStatus] = useState('playing');
    const [winningModal, setWinningModal] = useState(false);

    function closeModal() {
        setWinningModal(false);
    }

    const max_guesses = 5;
    const max_guess_length = 22;
    // Reset game when game type changes
    const resetGame = useCallback(() => {
        setGuesses(['', '', '', '', '']);
        setCurrentGuess('');
        setCurrentGuessIndex(0);
        setGameStatus('playing');
        setWinningModal(false);
        const {solution, scrambledSolution} = selectRandomStation(stations);
        setScrambledSolution(scrambledSolution);
        setSolution(solution);
    }, []);

    useEffect(() => {
        resetGame();
    }, [gameType, resetGame]);


    const selectRandomStation = (stationsData) => {
        const stations = stationsData[0];

        const stationNames = Object.keys(stations);
        const randStationIndex = Math.floor(Math.random() * stationNames.length);
        const randSolution = stationNames[randStationIndex];

        const scrambledList = stations[randSolution];
        const randScrambledIndex = Math.floor(Math.random() * scrambledList.length);
        const scrambledSolution = scrambledList[randScrambledIndex];

        return {solution: randSolution, scrambledSolution};
    };

    const handleKeypadInput = (keyValue) => {
        if (gameStatus !== 'playing') return;

        if (keyValue === 'ENTER') {
            handleGuessSubmit();
        } else if (keyValue === '⌫') {
            setCurrentGuess((prev) => prev.slice(0, -1));
        } else {
            if (currentGuess.length < max_guess_length) {
                setCurrentGuess((prev) => prev + keyValue);
            }
        }
    };

    const handleGuessSubmit = () => {
        // don't allow empty guesses or if you already have won or lost
        if (currentGuess.trim() === '' || gameStatus !== 'playing') {
            return;
        }

        const isCorrect = currentGuess.toUpperCase() === solution.toUpperCase();

        // Update guesses array
        setGuesses(prevGuesses => {
            const newGuesses = [...prevGuesses];
            newGuesses[currentGuessIndex] = currentGuess;
            return newGuesses;
        });

        // Check win/loss conditions
        if (isCorrect) {
            setGameStatus('won');
            setWinningModal(true)
            console.log("You win!");
        } else if (currentGuessIndex === max_guesses - 1) {
            setGameStatus('lost');
            console.log(`Game over! The answer was: ${solution}`);
            // TODO: Implement game over scene
        } else {
            setCurrentGuessIndex(prev => prev + 1);
        }

        setCurrentGuess('');
    };

    const handleGameTypeChange = (newGameType) => {
        setGameType(newGameType);
        setDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const renderGuess = (index) => {
        const guess = guesses[index];
        const isSubmitted = guess !== '';
        const isCorrect = isSubmitted && guess.toUpperCase() === solution.toUpperCase();
        const isIncorrect = isSubmitted && !isCorrect;
        const isActiveInput = !isSubmitted && index === currentGuessIndex && gameStatus === 'playing';

        return (
            <div key={index} className="guess">
                <span className={`guess-circle ${isIncorrect ? 'incorrect' : ''} ${isCorrect ? 'correct' : ''}`}></span>
                {isActiveInput ? (
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
                    <span className="guessText">{guess}</span>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="App">
                <div className="game">
                    {/* Top Bar with logo and gameType */}
                    <div className="topbar">
                        {/* The logo svg */}
                        <img src="/logo.svg" alt="logo"/>

                        {/* The dropdown for gameType */}
                        <div onClick={toggleDropdown} className="gameType">
                            <button>
                                <img src="/down_arrow.svg" alt="down_arrow"/>
                            </button>
                            {gameType}
                            {dropdownOpen && (
                                /*<div className="dropdown-content">
                                       <li><a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                handleGameTypeChange('Dagelijks');
                                            }}>Dagelijks</a></li>
                                            <li><a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                handleGameTypeChange('Oneindig');
                                            }}>Oneindig</a></li>
                                </div>*/
                                <div className="dropdown-content">
                                    <div className="tabs">
                                        <span className="tab"></span>
                                        <span className="tab"></span>
                                    </div>
                                    <div className="menu-box">
                                        <ul>
                                            <li>
                                                <label className="radio-option"
                                                       onChange={() => handleGameTypeChange("Dagelijks")}>
                                                    <input
                                                        type="radio"
                                                        name="gameType"
                                                        value="Dagelijks"
                                                        checked={gameType === "Dagelijks"}

                                                    />
                                                    Dagelijks
                                                </label>
                                            </li>
                                            <li>
                                                <label className="radio-option"
                                                       onChange={() => handleGameTypeChange("Oneindig")}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="gameType"
                                                        value="Oneindig"
                                                        checked={gameType === "Oneindig"}
                                                    />
                                                    Oneindig
                                                </label>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* The station to guess */}
                    <div className="wordToGuess">{scrambledSolution}</div>

                    {/* Your guesses */}
                    <div className="guessList">
                        {Array.from({length: max_guesses}, (_, i) => renderGuess(i))}
                    </div>
                </div>

                <div className="keyboard">
                    <Keypad keys={keys} onKeyClick={handleKeypadInput}/>
                </div>
            </div>
            {winningModal ? <div className="modal">

                    <div className="modal-inner">
                        <div className="modal-header">
                            <p>
                                <span id="congrats">Gefeliciteerd!</span>
                                <br/>Je raadde het station in {currentGuessIndex + 1} pogingen.
                            </p></div>
                        {gameType === 'Dagelijks' ?
                            <div className="share">
                                <button>Deel dit resultaat met je vrienden.</button>
                            </div>
                            :
                            <div className="share play-again">
                                <button onClick={resetGame} id="play-again">Speel opnieuw! ↺</button>
                                <button>Deel dit resultaat met je vrienden.</button>
                            </div>
                        }
                        <div className="close" onClick={closeModal}></div>
                    </div>
                </div>
                : null}
        </>
    );
}

export default App