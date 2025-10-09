import './App.css'
import { useState, useEffect } from "react";
import Keypad from "./components/Keypad.jsx";
import keys from "./components/keys.js";



function App() {
    const [gameType, setGameType] = useState('Daily');
    const [solution, setSolution] = useState('Barendrecht');
    const [scrambledSolution, setScrambledSolution] = useState('Rech te brand');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [guesses, setGuesses] = useState(['', '', '', '', '']);
    const [currentGuess, setCurrentGuess] = useState('');
    const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
    const [gameStatus, setGameStatus] = useState('playing');

    const max_guesses = 5;
    const max_guess_length = 22;
    // Reset game when game type changes
    useEffect(() => {
        resetGame();
    }, [gameType]);

    const resetGame = () => {
        setGuesses(['', '', '', '', '']);
        setCurrentGuess('');
        setCurrentGuessIndex(0);
        setGameStatus('playing');
        // TODO: Load new scrambled solution if playing unlimited and reset daily for daily game
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
            console.log("You win!");
            // TODO: Implement winning scene
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
        <div className="App">
            <div className="game">
                {/* Top Bar with logo and gameType */}
                <div className="topbar">
                    {/* The logo svg */}
                    <img src="/logo.svg" alt="logo"/>

                    {/* The dropdown for gameType */}
                    <div className="gameType">
                        <button onClick={toggleDropdown}>
                            <img src="/down_arrow.svg" alt="down_arrow"/>
                        </button>
                        {gameType}
                        {dropdownOpen && (
                            <div className="dropdown-content">
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    handleGameTypeChange('Daily');
                                }}>Daily</a>
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    handleGameTypeChange('Unlimited');
                                }}>Unlimited</a>
                            </div>
                        )}
                    </div>
                </div>

                {/* The station to guess */}
                <div className="wordToGuess">{scrambledSolution}</div>

                {/* Your guesses */}
                <div className="guessList">
                    {Array.from({ length: max_guesses }, (_, i) => renderGuess(i))}
                </div>
            </div>

            <div className="keyboard">
                <Keypad keys={keys} onKeyClick={handleKeypadInput} />
            </div>
        </div>
    );
}

export default App