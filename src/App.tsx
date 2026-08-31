import { useEffect, useState } from 'react'
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

  useEffect(() => {
    evaluateRules()
  }, [
    gameState.teamOne.score,
    gameState.teamTwo.score,
    gameState.teamOne.setsWon,
    gameState.teamTwo.setsWon
  ])

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

  function getCurrentSetLength() {
    const currentSet = 
        gameState.teamOne.setsWon +
        gameState.teamTwo.setsWon +
        1;
    const finalPossibleSet = 
        gameState.additionalFeatures.setsToWin * 2 - 1;

    if (currentSet == finalPossibleSet) {
        return gameState.additionalFeatures.finalSetLength;
    }

    return gameState.additionalFeatures.setLength;
}

  function hasWonSet(teamScore: number, opponentScore: number) {
    const targetScore = getCurrentSetLength();
    if (teamScore >= targetScore && teamScore >= opponentScore + 2) {
      return true;
    }
    return false;
  }

  function hasWonGame(setsWon) {
    const targetSetsToWin = gameState.additionalFeatures.setsToWin;
    if (setsWon >= targetSetsToWin) {
      return true
    }
    return false
  }

  function endSet(winningTeamKey) {
    gameState[winningTeamKey].setsWon +=1;

    gameState.teamOne.score = 0;
    gameState.teamTwo.score = 0;
  }

  function endGame(winningTeamKey) {
    const winningTeamName =
        winningTeamKey === "teamOne"
            ? gameState.teamOne.name
            : gameState.teamTwo.name;

    alert(`${winningTeamName} won the match! 🏐`);
}

  function evaluateRules() {
    if (gameState.additionalFeatures.automaticRulesState === "Off") {
      return
    }
    const teamOneScore = gameState.teamOne.score;
    const teamTwoScore = gameState.teamTwo.score;

    if (hasWonSet(teamOneScore, teamTwoScore)) {
        endSet("teamOne");
        if (hasWonGame(gameState.teamOne.setsWon)) {
          endGame("teamOne");
        }
    } else if (hasWonSet(teamTwoScore, teamOneScore)) {
        endSet("teamTwo");
        if (hasWonGame(gameState.teamTwo.setsWon)) {
          endGame("teamTwo");
        }
    }
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
