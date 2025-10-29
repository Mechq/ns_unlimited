import {useEffect} from "react";
import './Modal.css'
export default function Modal({
                                  gameType,
                                  gameStatus,
                                  solution,
                                  amountOfGuesses,
                                  playAgain,
                                  closeModal,
                              }) {

    useEffect(() => {
        console.log("Winning modal activated",
        "gameType:", gameType,
            "gameStatus:", gameStatus,
            "solution:", solution,
            "amountOfGuesses:", amountOfGuesses,
            "playAgain:", playAgain,
            "closeModal:", closeModal,
        );
    }, []);
    let gameStats = {}
    if (gameType === 'Dagelijks'){
        gameStats = JSON.parse(localStorage.getItem('dailyStats'));
    }
    else if (gameType === 'Oneindig'){
        gameStats = JSON.parse(localStorage.getItem('infiniteStats'));

    }



    const isWin = gameStatus === 'won';
    const isUnlimited = gameType === 'Oneindig';

    const modalTitle = isWin ? "Gefeliciteerd! 🎉" : "Helaas... 😔";
    const statusText = isWin
        ? `Je hebt de bestemming in ${amountOfGuesses} beurten geraden!`
        : `De correcte bestemming was:`;

    const statusIcon = isWin ? (
        <span className="status-icon win-icon">✓</span>
    ) : (
        <span className="status-icon lose-icon">✕</span>
    );


    // Calculate Stats
    const totalGames = gameStats.wins + gameStats.losses;
    const winPercentage = totalGames > 0 ? Math.round((gameStats.wins / totalGames) * 100) : 0;
    const currentStreak = gameStats.streak;
    const maxStreak = gameStats.streak;

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <button className="modal-close" onClick={closeModal}>
                        ✕
                    </button>
                    {/*<div className="icon-wrapper">
                        {statusIcon}
                    </div>*/}
                    <h2 className="modal-title">{modalTitle}</h2>
                </div>

                <div className="modal-body">
                    <p className="status-message">{statusText}</p>
                    <p className={`correct-answer ${!isWin ? 'highlight' : ''}`}>
                        {solution}
                    </p>
                </div>

                <div className="modal-stats">
                    <h3>Statistieken ({gameType})</h3>
                    <div className="stats-grid">
                        <StatItem label="Gespeeld" value={totalGames}/>
                        <StatItem label="Winst %" value={winPercentage + '%'}/>
                        <StatItem label="Reeks" value={currentStreak}/>
                        <StatItem label="Max. Reeks" value={maxStreak}/>
                    </div>
                </div>

                <div className="modal-footer">
                    {/* Conditional button based on gameType */}
                    {isUnlimited ? (
                        <button className="new-game-button" onClick={() => {
                            playAgain();
                            closeModal();
                        }}>
                            Speel Opnieuw! 🔁
                        </button>
                    ) : (
                        <button className="new-game-button" onClick={closeModal}>
                            Sluiten 🚪
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const StatItem = ({label, value}) => (
    <div className="stat-item">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
    </div>
);