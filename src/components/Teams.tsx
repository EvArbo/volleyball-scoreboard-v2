import type { GameState, TeamKey } from "../types"

type TeamsProps = {
  gameState: GameState;
  increaseScore: (team: TeamKey) => void;
  decreaseScore: (team: TeamKey) => void;
};

function Teams({
  gameState,
  increaseScore,
  decreaseScore,
}: TeamsProps) {
  return (
    <section className="teams">
      <section className="team team-one" data-team="teamOne">
        <button className="score-button" type="button" onClick={() => increaseScore("teamOne")}>{gameState.teamOne.score}</button>
        <button className="subtract-button" type="button" onClick={() => decreaseScore("teamOne")}>-1</button>
      </section>
      
      <section className="team team-two" data-team="teamTwo">
        <button className="score-button" type="button" onClick={() => increaseScore("teamTwo")}>{gameState.teamTwo.score}</button>
        <button className="subtract-button" type="button" onClick={() => decreaseScore("teamTwo")}>-1</button>
      </section>
    </section>
  )
}

export default Teams