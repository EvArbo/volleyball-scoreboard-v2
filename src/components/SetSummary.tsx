import type { GameState, TeamKey } from "../types"

type SetProps = {
  gameState: GameState;
  increaseSets: (team: TeamKey) => void;
  decreaseSets: (team: TeamKey) => void;
};

function SetSummary({
  gameState,
  increaseSets,
  decreaseSets,
}: SetProps) {
  return (
    <section className="set-summary">
      <section className="set-control" data-team="teamOne">
        <button className="set-subtract-button" type="button" onClick={() => decreaseSets("teamOne")}>-1</button>

        <p>
          Sets Won: 
          <span className="team-one-sets">{gameState.teamOne.setsWon}</span>
        </p>

        <button className="set-add-button" type="button" onClick={() => increaseSets("teamOne")}>+1</button>
      </section>
      
      <section className="set-control">
        <p>
          Set: 
          <span className="current-set">{gameState.teamTwo.setsWon + gameState.teamOne.setsWon}</span>
        </p>
      </section>

      <section className="set-control" data-team="teamTwo">
        <button className="set-subtract-button" type="button" onClick={() => decreaseSets("teamTwo")}>-1</button>

        <p>
          Sets Won: 
          <span className="team-two-sets">{gameState.teamTwo.setsWon}</span>
        </p>

        <button className="set-add-button" type="button" onClick={() => increaseSets("teamTwo")}>+1</button>
      </section>
    </section>
  )
}

export default SetSummary