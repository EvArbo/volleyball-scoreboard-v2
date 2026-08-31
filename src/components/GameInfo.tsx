import type { GameState, TeamKey } from "../types"

type GameInfoProps = {
  gameState: GameState;
  updateTeamName: (team: TeamKey, name: string) => void;
  changeIsTimerRunning: () => void;
  formatTimer: (seconds) => string;
  resetTimer: () => void;
  handleTimerKeyDown: (event) => void;
};

function handleEnterKey(
  event: React.KeyboardEvent<HTMLInputElement>
) {
  if (event.key === "Enter") {
    event.currentTarget.blur();
  }
}

function GameInfo({
    gameState,
    updateTeamName,
    changeIsTimerRunning,
    formatTimer,
    resetTimer,
    handleTimerKeyDown
}: GameInfoProps ) {
  return (
    <section className="game-info">
      <input
        className="team-name-input"
        id="team-one-name"
        type="text"
        value={gameState.teamOne.name}
        maxLength={15}
        onChange={(event) => updateTeamName("teamOne", event.target.value)}
        onKeyDown={handleEnterKey}
      />
      <section className="timer">
        <button
          className="timer-toggle-button"
          type="button"
          onClick={() => changeIsTimerRunning()}
        >{gameState.timer.toggleButton}</button>
        
        <input
          className="timer-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label="timer"
          placeholder="0:00"
          maxLength={5}
          onKeyDown={(event) => {
                                  handleTimerKeyDown(event)
                                  handleEnterKey(event)
                                }}
          value={formatTimer(gameState.timer.remainingSeconds)}
          readOnly
        />
        
        <button
          className="timer-reset-button"
          type="button"
          onClick={() => resetTimer()}
          >Reset</button>
      </section>
      <input
        className="team-name-input"
        id="team-two-name"
        type="text"
        value={gameState.teamTwo.name}
        maxLength={15}
        onChange={(event) => updateTeamName("teamTwo", event.target.value)}
        onKeyDown={handleEnterKey}
      />
    </section>
  )
}

export default GameInfo