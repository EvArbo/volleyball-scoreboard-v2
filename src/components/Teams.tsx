import type { GameState, TeamKey } from "../types"

type TeamsProps = {
  gameState: GameState;
  handleScorePoint: (team: TeamKey) => void;
  handleRemovePoint: (team: TeamKey) => void;
};

function Teams({
  gameState,
  handleScorePoint,
  handleRemovePoint,
}: TeamsProps) {
  return (
    <section className="teams">
      <section className="team team-one" data-team="teamOne">
        <button className="score-button" type="button" onClick={() => handleScorePoint("teamOne")}>{gameState.teamOne.score}</button>
        <button className="subtract-button" type="button" onClick={() => handleRemovePoint("teamOne")}>-1</button>
      </section>
      
      <section className="team team-two" data-team="teamTwo">
        <button className="score-button" type="button" onClick={() => handleScorePoint("teamTwo")}>{gameState.teamTwo.score}</button>
        <button className="subtract-button" type="button" onClick={() => handleRemovePoint("teamTwo")}>-1</button>
      </section>
    </section>
  )
}

export default Teams