import type { GameState, TeamKey } from "../types"

type GameInfoProps = {
  gameState: GameState;
  updateTeamName: (team: TeamKey, name: string) => void;

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
        <button className="timer-toggle-button" type="button"></button>
        
        <input
          className="timer-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label="timer"
          placeholder="0:00"
        />
        
        <button className="timer-reset-button" type="button">Reset</button>
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