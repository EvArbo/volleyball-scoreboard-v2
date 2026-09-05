import { useEffect, useRef, useState } from 'react'
import type { GameState, TeamKey } from "../types"


import AdditionalFeatures from "../components/AdditionalFeatures.tsx"
import SetSummary from "../components/SetSummary.tsx"
import Teams from "../components/Teams.tsx"
import GameInfo from '../components/GameInfo.tsx'


function Scoreboard() {
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
        toggleButton: "start"
      },
      additionalFeatures: {
        automaticRulesState: "Off",
        isAREnabled: false,
        setsToWin: 2,
        setLength: 25,
        finalSetLength: 25
      }
    });
  
    const isEnteringTimer = useRef(false);
    const alarmOscillators = useRef<OscillatorNode[]>([]);
    const timerEntryDigits = useRef("");
    const audioContext = useRef<AudioContext | null>(null);
  
  
    useEffect(() => {
        evaluateRules()
      }, [
        gameState.teamOne.score,
        gameState.teamTwo.score,
        gameState.teamOne.setsWon,
        gameState.teamTwo.setsWon
      ])
  
      useEffect(() => {
      if (!gameState.timer.isTimerRunning) {
        return
      }
  
      const intervalId = setInterval(() => {
        setGameState(previous => {
          if (previous.timer.remainingSeconds <= 1) {
            return {
              ...previous,
              timer: {
                ...previous.timer,
                remainingSeconds: 0,
                isTimerRunning: false,
                toggleButton: "Start",
              },
            }
          }
  
          return {
            ...previous,
            timer: {
              ...previous.timer,
              remainingSeconds:
                previous.timer.remainingSeconds - 1,
            },
          }
        })
      }, 1000)
  
      return () => {
        clearInterval(intervalId)
      }
    }, [gameState.timer.isTimerRunning])
  
    useEffect(() => {
      if (
        !gameState.timer.isTimerRunning &&
        gameState.timer.remainingSeconds === 0 &&
        gameState.timer.initialTimerSeconds > 0
      ) {
        playTimerSound()
      }
    }, [
      gameState.timer.isTimerRunning,
      gameState.timer.remainingSeconds,
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
  
    function changeIsTimerRunning() {
      isEnteringTimer.current = false
      stopTimerSound()
  
      setGameState(previous => {
        const willStart = !previous.timer.isTimerRunning
  
        if (willStart && previous.timer.remainingSeconds <= 0) {
          if (previous.timer.initialTimerSeconds <= 0) {
            return previous
          }
  
          return {
            ...previous,
            timer: {
              ...previous.timer,
              remainingSeconds: previous.timer.initialTimerSeconds,
              isTimerRunning: true,
              toggleButton: "Pause",
            },
          }
        }
  
        return {
          ...previous,
          timer: {
            ...previous.timer,
            isTimerRunning: willStart,
            toggleButton: willStart ? "Pause" : "Start",
          },
        }
      })
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
  
    function resetScores() {
      setGameState(previous => ({
        ...previous,
  
        teamOne: {
          ...previous.teamOne,
          score: 0
        },
  
        teamTwo: {
          ...previous.teamTwo,
          score: 0
        }
      }))
    }
  
    function resetMatch() {
      const shouldReset =
        window.confirm(
          "Press 'Ok' to reset scores, sets, and timer"
        );
  
      if (!shouldReset) {
        return
      }
      
      setGameState(previous => ({
        ...previous,
  
        teamOne: {
          ...previous.teamOne,
          score: 0,
          setsWon: 0
        },
  
        teamTwo: {
          ...previous.teamTwo,
          score: 0,
          setsWon: 0
        },
  
        timer: {
          ...previous.timer,
          initialTimerSeconds: 0,
          remainingSeconds: 0,
          isTimerRunning: false,
          toggleButton: "start"
        }
      }))
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
      setGameState(previous => ({
        ...previous,
  
        [winningTeamKey]: {
          ...previous[winningTeamKey],
          setsWon: gameState[winningTeamKey].setsWon + 1,
        },
  
        teamOne: {
          ...previous.teamOne,
          score: 0
        },
  
        teamTwo: {
          ...previous.teamTwo,
          score: 0
        }
  
      }));
    }
  
    async function saveGame() {
      /*
      made game object to send, sent and storing response,
      once response happens data stores response, print response
      */
      const completedGame = {
        teamOneName: gameState.teamOne.name,
        teamTwoName: gameState.teamTwo.name,
        teamOneSetsWon: gameState.teamOne.setsWon,
        teamTwoSetsWon: gameState.teamTwo.setsWon
      }
  
      const response = await fetch("http://localhost:3000/games", {
        method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
        body: JSON.stringify(completedGame)
      })
  
      const data = await response.json()
  
      console.log(data)
    }
  
    function endGame(winningTeamKey) {
      saveGame();
  
      const winningTeamName =
          winningTeamKey === "teamOne"
              ? gameState.teamOne.name
              : gameState.teamTwo.name;
  
      setGameState(previous => ({
          ...previous,
        teamOne: {
            ...previous.teamOne,
            score: 0,
            setsWon: 0
          },
  
          teamTwo: {
            ...previous.teamTwo,
            score: 0,
            setsWon: 0
          }
      }));
  
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
  
    // function parseTimerInput(timerText) {
    //   const parts = timerText.split(":");
  
    //   if (parts.length !== 2) {
    //       return null;
    //   }
  
    //   const minutes = Number(parts[0]);
    //   const seconds = Number(parts[1]);
  
    //   if (
    //       !Number.isInteger(minutes) ||
    //       !Number.isInteger(seconds) ||
    //       minutes < 0 ||
    //       seconds < 0 ||
    //       seconds > 59
    //   ) {
    //       return null;
    //   }
  
    //   return minutes * 60 + seconds;
    // }
  
  function formatTimer(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
  
      return `${minutes}:${remainingSeconds
          .toString()
          .padStart(2, "0")}`;
  }
  
  function updateTimerState(
    updates: Partial<GameState["timer"]>
  ) {
    setGameState(previous => ({
      ...previous,
      timer: {
        ...previous.timer,
        ...updates,
      },
    }))
  }
  
    function resetTimer() {
      stopTimerSound()
      isEnteringTimer.current = false
  
      if (
        !gameState.timer.isTimerRunning &&
        gameState.timer.remainingSeconds ===
          gameState.timer.initialTimerSeconds
      ) {
        updateTimerState({
          initialTimerSeconds: 0,
          remainingSeconds: 0,
          isTimerRunning: false,
          toggleButton: "Start",
        })
  
        return
      }
  
      updateTimerState({
        remainingSeconds: gameState.timer.initialTimerSeconds,
        isTimerRunning: false,
        toggleButton: "Start",
      })
    }
  
    const alarmSound = [
      // Main melody
      { freq: 293.66, duration: 192 }, // D4
      { freq: 369.99, duration: 192 }, // F#4
      { freq: 392.00, duration: 192 }, // G4
      { freq: 293.66, duration: 192 }, // D4
      { freq: 0,      duration: 192 },
  
      { freq: 369.99, duration: 192 }, // F#4
      { freq: 392.00, duration: 192 }, // G4
      { freq: 293.66, duration: 192 }, // D4
  
      { freq: 0,      duration: 192 },
      { freq: 293.66, duration: 192 }, // D4
      { freq: 369.99, duration: 192 }, // F#4
      { freq: 392.00, duration: 192 }, // G4
      { freq: 440.00, duration: 192 }, // A4
      { freq: 493.88, duration: 192 }, // B4
      { freq: 440.00, duration: 192 }, // A4
      { freq: 392.00, duration: 192 }, // G4
  
      { freq: 369.99, duration: 192 }, // F#4 / Gb4
      { freq: 0,      duration: 192 },
      { freq: 0,      duration: 192 },
      { freq: 369.99, duration: 192 }, // F#4 / Gb4
  
      { freq: 0,      duration: 192 },
      { freq: 0,      duration: 192 },
      { freq: 369.99, duration: 192 }, // F#4 / Gb4
      { freq: 392.00, duration: 192 }, // G4
      { freq: 392.00, duration: 192 }, // G4
  ];

  function getAudioContext() {
    if (!audioContext.current) {
        audioContext.current = new AudioContext();
    }

    return audioContext.current;
}
  
  function playTimerSound() {
    const context = getAudioContext();

    let noteStartTime = context.currentTime;

    for (const note of alarmSound) {
        const durationInSeconds = note.duration / 1000;

        if (note.freq !== 0) {
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.type = "triangle";
            oscillator.frequency.value = note.freq;

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            gainNode.gain.value = 0.2;

            alarmOscillators.current.push(oscillator);

            oscillator.start(noteStartTime);
            oscillator.stop(noteStartTime + durationInSeconds);
        }

        noteStartTime += durationInSeconds;
    }
}
  
  function stopTimerSound() {
      for (const oscillator of alarmOscillators.current) {
          try {
            oscillator.stop()
          } catch {
  
          }
      }
  
      alarmOscillators.current = [];
  }
  
  function timerDigitsToSeconds(digits) {
      const placeValues = [1, 10, 60, 600];
      const reversedDigits =
          digits.split("").reverse();
  
      let totalSeconds = 0;
  
      for (
          let i = 0;
          i < reversedDigits.length;
          i++
      ) {
          totalSeconds +=
              Number(reversedDigits[i])
              * placeValues[i];
      }
  
      return totalSeconds;
  }
  
  function setTimerSeconds(seconds: number) {
    setGameState(previous => ({
      ...previous,
      timer: {
        ...previous.timer,
        initialTimerSeconds: seconds,
        remainingSeconds: seconds,
      },
    }))
  }
  
  function handleTimerKeydown(event) {
      const allowedKeys = [
          "Backspace",
          "Delete",
          "ArrowLeft",
          "ArrowRight",
          "Tab",
          "Enter"
      ];
  
      const isDigit = /^[0-9]$/.test(event.key);
  
      if (!isDigit && !allowedKeys.includes(event.key)) {
          event.preventDefault();
          return;
      }
  
      const isNumberKey = /^[0-9]$/.test(event.key);
  
      if (isNumberKey) {
        event.preventDefault()
        updateTimerState({
          isTimerRunning: false,
          toggleButton: "Start",
        })
  
        if (!isEnteringTimer.current) {
          timerEntryDigits.current = ""
          isEnteringTimer.current = true
        }
  
        timerEntryDigits.current =
          (timerEntryDigits.current + event.key).slice(-4)
  
        const enteredSeconds =
          timerDigitsToSeconds(timerEntryDigits.current)
  
        setTimerSeconds(enteredSeconds)
  
        return
      }
  
      if (event.key === "Backspace") {
        event.preventDefault()
        updateTimerState({
          isTimerRunning: false,
          toggleButton: "Start",
        })
        timerEntryDigits.current =
          timerEntryDigits.current.slice(0, -1)
  
        const enteredSeconds =
          timerEntryDigits.current === ""
            ? 0
            : timerDigitsToSeconds(timerEntryDigits.current)
  
        setTimerSeconds(enteredSeconds)
  
        isEnteringTimer.current = true
  
        return
      }
    }

  return (

    <main>
        <section className="scoreboard">
        <GameInfo 
        gameState={gameState}
        updateTeamName={updateTeamName}
        changeIsTimerRunning={changeIsTimerRunning}
        formatTimer={formatTimer}
        resetTimer={resetTimer}
        handleTimerKeyDown={handleTimerKeydown}
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
            saveGame={saveGame}
            resetScores={resetScores}
            resetMatch={resetMatch}
        />
        </section>
    </main>

  )
}

export default Scoreboard