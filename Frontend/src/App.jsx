import './App.css'
import {useEffect, useState} from "react";
import Keypad from "./components/keypad/Keypad.jsx";
import keys from "./components/keypad/keys.js";
import {stations} from "../data.js";
import ConfettiManager from "./components/confetti/Confetti-manager.jsx";
import Modal from "./components/modal/Modal.jsx";


function App() {
    const [gameType, setGameType] = useState('Dagelijks');
    const [solution, setSolution] = useState('');
    const [scrambledSolution, setScrambledSolution] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [guesses, setGuesses] = useState(['', '', '', '', '']);
    const [currentGuess, setCurrentGuess] = useState('');
    const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
    const [gameStatus, setGameStatus] = useState('playing');
    const [winningModal, setWinningModal] = useState(false);
    const [hasWonDaily, setHasWonDaily] = useState(false);
    const [maxStreak, setMaxStreak] = useState(0);

    function closeModal() {
        setWinningModal(false);
    }

    const max_guesses = 5;
    const max_guess_length = 22;


    useEffect(() => {
        if (gameStatus === 'won') {
            setWinningModal(true);
        }
    }, [gameStatus]);

    useEffect(() => {
        console.log("Game status changed:", gameStatus);
        console.log("Winning modal:", winningModal);
    }, [gameStatus, winningModal]);


    // Reset game when game type changes
    const resetGame = () => {
        setGuesses(['', '', '', '', '']);
        setCurrentGuess('');
        setCurrentGuessIndex(0);
        setGameStatus('playing');
        setWinningModal(false);

    }

    useEffect(() => {
        resetGame();
        if (gameType === "Dagelijks") {
            //if local storage already has a station that equals the daily station then dont reset the game.
            // If local storage has a station that does not equal the daily it means that game is from a different date

            fetch("http://localhost:3000/daily-station/")
                .then(res => res.json())
                .then(data => {
                    const currentDate = getFormattedDate();
                    const savedState = JSON.parse(localStorage.getItem('dailyGameState'));
                    const savedStation = localStorage.getItem('station');

                    // If same station and date, restore progress
                    if (savedStation === data.station && savedState?.date === currentDate) {
                        setGuesses(savedState.guesses);
                        const nextIndex = savedState.guesses.findIndex(g => g === '');
                        setCurrentGuessIndex(nextIndex === -1 ? savedState.guesses.length : nextIndex);

                        const dailyGameStatus = localStorage.getItem('dailyGameStatus') || 'playing';
                        setGameStatus(dailyGameStatus);
                        if (dailyGameStatus === 'won') setWinningModal(true);
                    } else {
                        // Otherwise, reset new daily game
                        const newState = { date: currentDate, guesses: ['', '', '', '', ''] };
                        localStorage.setItem('dailyGameState', JSON.stringify(newState));
                        localStorage.setItem('station', data.station);
                        localStorage.setItem('shuffledStation', data.anagrams[0]);
                        localStorage.setItem('dailyGameStatus', 'playing');
                    }

                    setSolution(data.station);
                    setScrambledSolution(data.anagrams[0]);

                    if (!localStorage.getItem('dailyStats')) {
                        const dailyStatsJSON = { streak: 0, wins: 0, losses: 0, maxStreak: 0, lastWinDate: undefined };
                        localStorage.setItem('dailyStats', JSON.stringify(dailyStatsJSON));
                    }
                });

        } else if (gameType === "Oneindig") {
            const { solution, scrambledSolution } = selectRandomStation(stations);
            setSolution(solution);
            setScrambledSolution(scrambledSolution);

            const infiniteGameStatus = localStorage.getItem('infiniteGameStatus') || 'playing';
            setGameStatus(infiniteGameStatus);

            if (!localStorage.getItem('infiniteStats')) {
                const infStatsJSON = { streak: 0, wins: 0, losses: 0, maxStreak: 0, lastWinDate: undefined };
                localStorage.setItem('infiniteStats', JSON.stringify(infStatsJSON));
            }
        }
    }, [gameType]);




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
        }
        else if (keyValue === '␣') {
            //handle spacebar
            setCurrentGuess((prev) => prev + " ");
        }
        else {
            if (currentGuess.length <= max_guess_length) {
                setCurrentGuess((prev) => prev + keyValue);
            }
        }
    };

    const isStreak = (lastWinDate) => {
        // check if lastWinDate is equal to yesterdays date
        if (!lastWinDate) return false;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const dd = String(yesterday.getDate()).padStart(2, '0');
        const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
        const yyyy = yesterday.getFullYear();

        const formattedYesterday = `${dd}/${mm}/${yyyy}`;

        return lastWinDate === formattedYesterday;

    }

    const getFormattedDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        return dd + '/' + mm + '/' + yyyy;
    }

    const handleGuessSubmit = () => {
        // don't allow empty guesses or if you already have won or lost
        if (currentGuess.trim() === '' || gameStatus !== 'playing') {
            return;
        }

        const isCorrect = currentGuess.toUpperCase() === solution.toUpperCase();

        const currentDate = getFormattedDate();
        // Update guesses array
        setGuesses(prevGuesses => {
            const newGuesses = [...prevGuesses];
            newGuesses[currentGuessIndex] = currentGuess;

            //Save to localstorage if playing daily
            if (gameType === 'Dagelijks'){
                const dailyGameState = {date: currentDate, guesses: newGuesses};
                localStorage.setItem('dailyGameState', JSON.stringify(dailyGameState));
            }
            else if (gameType === 'Oneindig') {
                const infiniteGameState = {date: currentDate, guesses: newGuesses};
                localStorage.setItem('infiniteGameState', JSON.stringify(infiniteGameState));
            }


            return newGuesses;
        });



        // Check win/loss conditions
        if (gameType === 'Dagelijks') {
            if (isCorrect) {
                handleDailyWinLoss('won')
                setHasWonDaily(true)
            }
            else if (currentGuessIndex === max_guesses - 1){
                handleDailyWinLoss('lost')
            }
            else {
                handleDailyWinLoss('playing')
            }
        }

        if (gameType === 'Oneindig') {
            if (isCorrect) {
                handleInfiniteWinLoss('won')
            }
            else if (currentGuessIndex === max_guesses - 1){
                handleInfiniteWinLoss('lost')
            }
            else {
                handleInfiniteWinLoss('playing')
            }
        }
        setCurrentGuess('');

    };

    const handleDailyWinLoss = (status) => {
        let stats = JSON.parse(localStorage.getItem('dailyStats'))
        let statsJSON = {};

        if (!stats || stats.wins === undefined || stats.losses === undefined || stats.streak === undefined || stats.maxStreak === undefined) {
            stats = { streak: 0, wins: 0, losses: 0, maxStreak: 0, lastWinDate: undefined };
        }
        if (status === 'won') {
            localStorage.setItem("dailyGameStatus", 'won'); // save first
            setGameStatus('won');
            setWinningModal(true);

            const newWins = stats.wins + 1;
            let newStreak;
            let newMaxStreak;
            if (isStreak(stats.lastWinDate)) {
                newStreak = stats.streak + 1;
            }
            else {
                newStreak = 1;
            }
            if (stats.maxStreak < newStreak) {
                newMaxStreak = stats.maxStreak + 1;
            }
            else {
                newMaxStreak = stats.maxStreak;
            }
            statsJSON = {streak: newStreak, wins: newWins, losses: stats.losses, maxStreak: newMaxStreak, lastWinDate: getFormattedDate()};

        }
        else if (status === 'lost') {
            setGameStatus('lost');
            //TODO implement losing modal
            localStorage.setItem("dailyGameStatus", 'lost');
            const newLosses = stats.losses +1;
            statsJSON = {streak: 0, wins: stats.wins, losses: newLosses, maxStreak: stats.maxStreak, lastWinDate: stats.lastWinDate};
        }
        else if (status === 'playing') {
            setCurrentGuessIndex(prev => prev + 1);
            localStorage.setItem("dailyGameStatus", 'playing');
            setCurrentGuess('');


        }
        localStorage.setItem('dailyStats', JSON.stringify(statsJSON));

    }

    const handleInfiniteWinLoss = (status) => {
        let stats = JSON.parse(localStorage.getItem('infiniteStats'))
        let statsJSON = {};

        if (!stats || stats.wins === undefined || stats.losses === undefined || stats.streak === undefined) {
            stats = { streak: 0, wins: 0, losses: 0};
        }
        if (status === 'won') {
            localStorage.setItem("infiniteGameStatus", 'won');
            setGameStatus('won');
            setWinningModal(true);

            const newWins = stats.wins + 1;
            let newStreak = stats.streak + 1;

        statsJSON = {streak: newStreak, wins: newWins, losses: stats.losses};
            localStorage.setItem('infiniteStats', JSON.stringify(statsJSON));

        }
        else if (status === 'lost') {
            setGameStatus('lost');
            //TODO implement losing modal
            localStorage.setItem("infiniteGameStatus", 'lost');
            const newLosses = stats.losses +1;
            statsJSON = {streak: 0, wins: stats.wins, losses: newLosses};
            localStorage.setItem('infiniteStats', JSON.stringify(statsJSON));

        }
        else if (status === 'playing') {
            setCurrentGuessIndex(prev => prev + 1);
            localStorage.setItem("infiniteGameStatus", 'playing');
            setCurrentGuess('');

        }

    }

    const playAgain = () => {
        resetGame()
        const { solution, scrambledSolution } = selectRandomStation(stations);
        setSolution(solution);
        setScrambledSolution(scrambledSolution);
    }

    const getAmountOfGuesses = () => {
        return guesses.filter(g => g && g.trim() !== '').length;
    }

    const handleGameTypeChange = (newGameType) => {
        if (newGameType === gameType) return;
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
                                <div className="dropdown-content">
                                    <div className="tabs">
                                        <span className="tab"></span>
                                        <span className="tab"></span>
                                    </div>
                                    <div className="menu-box">
                                        <ul>
                                            <li onChange={() => handleGameTypeChange("Dagelijks")}>
                                                <label className="radio-option">
                                                    <input
                                                        type="radio"
                                                        name="gameType"
                                                        value="Dagelijks"
                                                        checked={gameType === "Dagelijks"}

                                                    />
                                                    Dagelijks
                                                </label>
                                            </li>
                                            <li
                                                onChange={() => handleGameTypeChange("Oneindig")}
                                            >
                                                <label className="radio-option"
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
            {winningModal ?
                <Modal gameStatus={gameStatus}
                                   gameType={gameType}
                                   solution={solution}
                                   playAgain={playAgain}
                                   amountOfGuesses={getAmountOfGuesses()}
                                   closeModal={closeModal}
                />
                : null}
          <ConfettiManager  trigger={hasWonDaily}/>
        </>
    );
}

export default App