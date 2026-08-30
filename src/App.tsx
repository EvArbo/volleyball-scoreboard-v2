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
    additionalFeatures: {
      automaticRulesState: "Off",
      isAREnabled: false,
      setsToWin: 2,
      setLength: 25,
      finalSetLength: 25
    }
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

  function setAutomaticRulesState() {
    setGameState(previous => ({
      ...previous,

      additionalFeatures: {
        ...previous.additionalFeatures,

        automaticRulesState:
          previous.additionalFeatures.automaticRulesState === 'On'
          ? 'Off'
          : 'On',
      },
    }))
  }

  function increaseSetsToWin() {
    setGameState(previous => ({
      ...previous,

      additionalFeatures: {
        ...previous.additionalFeatures,
        setsToWin: previous.additionalFeatures.setsToWin + 1,
      },
    }));
  }

  function decreaseSetsToWin() {
    if (gameState.additionalFeatures.setsToWin === 0) {
      return;
    }

    setGameState(previous => ({
      ...previous,

      additionalFeatures: {
        ...previous.additionalFeatures,
        setsToWin: previous.additionalFeatures.setsToWin - 1,
      },
    }));
  }

    function increaseSetLength() {
    setGameState(previous => ({
      ...previous,

      additionalFeatures: {
        ...previous.additionalFeatures,
        setLength: previous.additionalFeatures.setLength + 1,
      },
    }));
  }

  function decreaseSetLength() {
    if (gameState.additionalFeatures.setLength === 0) {
      return;
    }
    
    setGameState(previous => ({
      ...previous,

      additionalFeatures: {
        ...previous.additionalFeatures,
        setLength: previous.additionalFeatures.setLength - 1,
      },
    }));
  }
    function increaseFinalSetLength() {
    setGameState(previous => ({
      ...previous,

      additionalFeatures: {
        ...previous.additionalFeatures,
        finalSetLength: previous.additionalFeatures.finalSetLength + 1,
      },
    }));
  }

  function decreaseFinalSetLength() {
    if (gameState.additionalFeatures.finalSetLength === 0) {
      return;
    }
    
    setGameState(previous => ({
      ...previous,

      additionalFeatures: {
        ...previous.additionalFeatures,
        finalSetLength: previous.additionalFeatures.finalSetLength - 1,
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
          <AdditionalFeatures 
            gameState={gameState}
            setAutomaticRulesState={setAutomaticRulesState}
            increaseSetsToWin={increaseSetsToWin}
            decreaseSetsToWin={decreaseSetsToWin}
            increaseSetLength={increaseSetLength}
            decreaseSetLength={decreaseSetLength}
            increaseFinalSetLength={increaseFinalSetLength}
            decreaseFinalSetLength={decreaseFinalSetLength}
          />
        </section>
      </main>
    </>
  )
}

export default App
