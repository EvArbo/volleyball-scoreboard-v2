import type { GameState, TeamKey } from "../types"

type SetProps = {
  gameState: GameState;
  handleIncreaseSets: (team: TeamKey) => void;
  handleDecreaseSets: (team: TeamKey) => void;
};

function SetSummary({
  gameState,
  handleIncreaseSets,
  handleDecreaseSets
}: SetProps) {
  return (
    <section className="set-summary">
      <section className="set-control" data-team="teamOne">
        <button className="set-subtract-button" type="button" onClick={() => handleDecreaseSets("teamOne")}>-1</button>

        <p>
          Sets Won: 
          <span className="team-one-sets">{gameState.teamOne.setsWon}</span>
        </p>

        <button className="set-add-button" type="button" onClick={() => handleIncreaseSets("teamOne")}>+1</button>
      </section>
      
      <section className="set-control">
        <p>
          Set: 
          <span className="current-set">{gameState.teamTwo.setsWon + gameState.teamOne.setsWon}</span>
        </p>
      </section>

      <section className="set-control" data-team="teamTwo">
        <button className="set-subtract-button" type="button" onClick={() => handleDecreaseSets("teamTwo")}>-1</button>

        <p>
          Sets Won: 
          <span className="team-two-sets">{gameState.teamTwo.setsWon}</span>
        </p>

        <button className="set-add-button" type="button" onClick={() => handleIncreaseSets("teamTwo")}>+1</button>
      </section>
    </section>
  )
}

export default SetSummary