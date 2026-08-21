import { useState } from 'react'
import type { GameState, TeamKey } from "./types"

import AdditionalFeatures from "./components/AdditionalFeatures.tsx"
import SetSummary from "./components/SetSummary.tsx"
import Teams from "./components/Teams.tsx"
import GameInfo from './components/GameInfo.tsx'
import Header from './components/Header.tsx'

import './App.css'

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

  function updateTeamName(team: TeamKey, name: string) {
    setGameState(previous => ({
      ...previous,

      [team]: {
        ...previous[team],
        name: name,
      }
    }))
  }

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
          <GameInfo 
          gameState={gameState}
          updateTeamName={updateTeamName}
          />
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
