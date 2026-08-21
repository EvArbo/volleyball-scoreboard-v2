import { useState } from 'react'
import type { GameState, TeamKey } from "./types"
import './App.css'

function Header() {
  return (
    <header>
      <nav aria-label="Main navigation">
        <a href="#">Home</a>
        <a href="#">Scoreboard</a>
        <a href="#">Analytics</a>
        <a href="#">More</a>
      </nav>
    </header>
  )
}

function GameInfo() {
  return (
    <section className="game-info">
      <input
        className="team-name-input"
        id="team-one-name"
        type="text"
        defaultValue="Team 1"
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
        defaultValue="Team 2"
      />
    </section>
  )
}

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
          Team 1 Sets: 
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
          Team 2 Sets: 
          <span className="team-two-sets">{gameState.teamTwo.setsWon}</span>
        </p>

        <button className="set-add-button" type="button" onClick={() => increaseSets("teamTwo")}>+1</button>
      </section>
    </section>
  )
}

function AdditionalFeatures() {
  return (
    <section className="additional-features">
      <button
          className="features-toggle-button"
          type="button"
          aria-expanded="false"
      >
          Additional Features
      </button>

      <div className="features-menu" hidden>
        <button
            className="reset-scores-button"
            type="button"
        >
            Reset Scores
        </button>

        <button
            className="reset-match-button"
            type="button"
        >
            Reset Match
        </button>

        <button
            className="auto-ruling-button"
            type="button"
        >
        </button>

        <div className="configure-rules">
          <button
              className="configure-rules-button"
              type="button"
              aria-expanded="false"
          >
              Configure Rules ▲
          </button>

          <section
              className="rules-menu"
              hidden
          >
            <div
                className="rule-control"
                data-rule="setsToWin"
            >
                <button
                    className="rule-subtract-button"
                    type="button"
                >
                    -
                </button>

                <p>
                    Sets to Win:
                    <span className="sets-to-win-display"></span>
                </p>

                <button
                    className="rule-add-button"
                    type="button"
                >
                    +
                </button>
            </div>

            <div
                className="rule-control"
                data-rule="setLength"
            >
              <button
                  className="rule-subtract-button"
                  type="button"
              >
                  -
              </button>

              <p>
                  Set Length:
                  <span className="set-length-display"></span>
              </p>

              <button
                  className="rule-add-button"
                  type="button"
              >
                  +
              </button>
            </div>

            <div
                className="rule-control"
                data-rule="lastSetLength"
            >
              <button
                  className="rule-subtract-button"
                  type="button"
              >
                  -
              </button>

              <p>
                  Final Set Length:
                  <span className="last-set-length-display"></span>
              </p>

              <button
                  className="rule-add-button"
                  type="button"
              >
                  +
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}

function App() {
  const [gameState, setGameState] = useState<GameState>({
    teamOne: {
        name: "Team 1",
        score: 0,
        setsWon: 0,
    },
    teamTwo: {
        name: "Team 2",
        score: 0,
        setsWon: 0
    },
    timer: {
      initialTimerSeconds: 0,
      remainingSeconds: 0,
      isTimerRunning: false,
    },

    rules: {
        isAREnabled: false,
        setsToWin: 2,
        setLength: 25,
        lastSetLength: 25
    },
  });

  function increaseScore(team: TeamKey) {
    setGameState(previous => ({
      ...previous,

      [team]: {
        ...previous[team],
        score: previous[team].score + 1,
      },
    }));
  }

  function decreaseScore(team: TeamKey) {
    if (gameState[team].score === 0) {
      return;
    }
    
    setGameState(previous => ({
      ...previous,

      [team]: {
        ...previous[team],
        score: previous[team].score - 1,
      },
    }));
  }

  function increaseSets(team: TeamKey) {
    setGameState(previous => ({
      ...previous,

      [team]: {
        ...previous[team],
        setsWon: previous[team].setsWon + 1,
      },
    }));
  }

  function decreaseSets(team: TeamKey) {
    if (gameState[team].setsWon === 0) {
      return;
    }
    
    setGameState(previous => ({
      ...previous,

      [team]: {
        ...previous[team],
        setsWon: previous[team].setsWon - 1,
      },
    }));
  }

  return (
    <>
      <Header />

      <main>
        <section className="scoreboard">
          <GameInfo />
          <Teams
            gameState={gameState}
            increaseScore={increaseScore}
            decreaseScore={decreaseScore}
          />
          <SetSummary 
            gameState={gameState}
            increaseSets={increaseSets}
            decreaseSets={decreaseSets}
          />
          <AdditionalFeatures />
        </section>
      </main>
    </>
  )
}

export default App
