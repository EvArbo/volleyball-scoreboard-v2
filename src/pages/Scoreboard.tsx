import { useEffect, useRef, useState } from 'react'
import type { GameState, TeamKey, SetHistory, PointCluster, RuleKey } from "../types"


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
        isTimerRunning: false
      },
      additionalFeatures: {
        isAREnabled: false,
        setsToWin: 2,
        setLength: 25,
        finalSetLength: 25,
        isMatchRecordingOn: false
      },
      stats: {
        setsHistory: []
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
                isTimerRunning: false
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

    // #region GameInfo

    function handleUpdateTeamName(
        team: TeamKey,
        name: string
    ) {
        setGameState(previous =>
            updateTeamName(previous, team, name)
        )
    }
  
    function updateTeamName(
        previous: GameState,
        team: TeamKey,
        name: string
    ): GameState {
        return {
            ...previous,

            [team]: {
                ...previous[team],
                name
            }
        }
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
              isTimerRunning: true
            },
          }
        }
  
        return {
          ...previous,
          timer: {
            ...previous.timer,
            isTimerRunning: willStart
          },
        }
      })
    }
    // #endregion

    // #region Scoring
    function handleScorePoint(team: TeamKey) {
        setGameState(previous =>
            scorePoint(team, previous)
        )
    }

    function handleRemovePoint(team: TeamKey) {
        setGameState(previous =>
            removePoint(team, previous)
        )
    }

    function scorePoint(team: TeamKey, previous: GameState): GameState {
        const newState = {
            ...previous,
  
            [team]: {
            ...previous[team],
            score: previous[team].score + 1,
            }
        }

        if (!previous.additionalFeatures.isMatchRecordingOn) {
            return newState
        }

        const currentSet = previous.stats.setsHistory[previous.stats.setsHistory.length - 1]
        const lastPointCluster = currentSet.pointsHistory[currentSet.pointsHistory.length - 1]
        let newPointsHistory: PointCluster[]

        if (lastPointCluster != null && team === lastPointCluster.team) {
            newPointsHistory = [
                ...currentSet.pointsHistory.slice(0, -1),
                {
                    ...lastPointCluster,
                    points: lastPointCluster.points + 1
                }
            ]
        } else {
            const newPointCluster: PointCluster = {
                        team: team,
                        points: 1
                    }
            newPointsHistory = [
                ...currentSet.pointsHistory,
                newPointCluster
            ]
        }
        const newSetsHistory = [
            ...newState.stats.setsHistory.slice(0, -1),
            {
                ...currentSet,
                pointsHistory: newPointsHistory
            }
        ]

        console.log(newSetsHistory[newSetsHistory.length - 1].pointsHistory)

        return {
            ...newState,

            stats: {
                ...newState.stats,

                setsHistory: newSetsHistory
            }
        }
    }
  
    function removePoint(team: TeamKey, previous: GameState): GameState {
      if (previous[team].score === 0) {
        return previous
      }
      
        const newState = {
            ...previous,
  
            [team]: {
            ...previous[team],
            score: previous[team].score - 1,
            }
        }

        if (!previous.additionalFeatures.isMatchRecordingOn) {
            return newState
        }

        const currentSet: SetHistory = previous.stats.setsHistory[previous.stats.setsHistory.length - 1]
        let currentPointClusterIdx = 0
        let currentPointCluster: PointCluster = {
            team: null, points: null
        }

        for (let idx = currentSet.pointsHistory.length - 1; idx >= 0; idx--) {
            let pointCluster = currentSet.pointsHistory[idx]
            if (pointCluster.team === team) {
                currentPointClusterIdx = idx
                currentPointCluster = pointCluster
                break
            }
        }
        
        const newPointCluster: PointCluster = {
                ...currentPointCluster,
                points: currentPointCluster.points - 1
            }

        let newPointsHistory: PointCluster[] = []
        let newSetsHistory: SetHistory[] = []

        if (newPointCluster.points === 0) {
            // remove cluster, if clusters before and after currentPointCluster then merge
            if (currentPointClusterIdx < currentSet.pointsHistory.length - 1 &&
                currentPointClusterIdx > 0
            ) {
                const mergedPointCluster: PointCluster = {
                    team: currentSet.pointsHistory[currentPointClusterIdx - 1].team,
                    points: currentSet.pointsHistory[currentPointClusterIdx - 1].points +
                            currentSet.pointsHistory[currentPointClusterIdx + 1].points
                }
                newPointsHistory = [
                ...currentSet.pointsHistory.slice(0, currentPointClusterIdx - 1),
                mergedPointCluster,
                ...currentSet.pointsHistory.slice(currentPointClusterIdx + 2)
                ]
            } else {
                // one or both are empty so either new set 0 0, or opponent team has 1 cluster of points
                newPointsHistory = [
                    ...currentSet.pointsHistory.slice(0, currentPointClusterIdx),
                ...currentSet.pointsHistory.slice(currentPointClusterIdx + 1)
                ]
            }

            newSetsHistory = [
                ...newState.stats.setsHistory.slice(0, -1),
                {
                    ...currentSet,
                    pointsHistory: newPointsHistory
                }
            ]
            
        } else {
            newPointsHistory = [
                ...currentSet.pointsHistory.slice(0, currentPointClusterIdx),
                newPointCluster,
                ...currentSet.pointsHistory.slice(currentPointClusterIdx + 1)
            ]
            newSetsHistory = [
                ...newState.stats.setsHistory.slice(0, -1),
                {
                    ...currentSet,
                    pointsHistory: newPointsHistory
                }
            ]
        }

        console.log(newSetsHistory[newSetsHistory.length - 1].pointsHistory)

        return {
            ...newState,

            stats: {
                ...newState.stats,
                setsHistory: newSetsHistory
            }
        }
    }

    function handleResetCurrentSet() {
        setGameState(previous =>
            resetCurrentSet(previous)
        )
    }
  
    function resetCurrentSet(previous: GameState) {
        const newState = {
            ...previous,
    
            teamOne: {
            ...previous.teamOne,
            score: 0
            },
    
            teamTwo: {
            ...previous.teamTwo,
            score: 0
            }
        }

        if (!previous.additionalFeatures.isMatchRecordingOn) {
            return newState
        }

        return {
            ...newState,

            stats: {
                ...newState.stats,

                setsHistory: [
                    ...newState.stats.setsHistory.slice(0, -1),
                    {
                    setNumber: newState.stats.setsHistory[newState.stats.setsHistory.length - 1].setNumber,
                    pointsHistory: []
                    }
                ]
            }
        }
    }

    function requestResetMatch() {
        const shouldReset =
        window.confirm(
          "Press 'Ok' to reset scores, sets, and timer"
        );
  
      if (!shouldReset) {
        return
      }
      
      handleResetMatch()
    }

    function handleResetMatch() {
        setGameState(previous =>
            resetMatch(previous)
        )
    }
  
    function resetMatch(previous: GameState) {
        const newState = {
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
            isTimerRunning: false
            }
        }

        return newState
    }

    function handleIncreaseSets(team: TeamKey) {
        setGameState(previous =>
            increaseSets(previous, team)
        )
    }

    function handleDecreaseSets(team: TeamKey) {
        setGameState(previous =>
            decreaseSets(previous, team)
        )
    }
  
    function increaseSets(
        previous: GameState,
        team: TeamKey
    ): GameState {
        return {
            ...previous,
            [team]: {
                ...previous[team],
                setsWon: previous[team].setsWon + 1
            }
        }
    }
  
    function decreaseSets(
        previous: GameState,
        team: TeamKey
    ): GameState {
        if (previous[team].setsWon === 0) {
            return previous
        }

        return {
            ...previous,
            [team]: {
                ...previous[team],
                setsWon: previous[team].setsWon - 1
            }
        }
    }

    // #endregion

    // #region Automatic Rules
  
    function handleToggleAutomaticRules() {
        setGameState(previous =>
            toggleAutomaticRules(previous)
        )
    }

    function toggleAutomaticRules(
        previous: GameState
    ): GameState {
        return {
            ...previous,

            additionalFeatures: {
                ...previous.additionalFeatures,
                isAREnabled:
                    !previous.additionalFeatures.isAREnabled
            }
        }
    }

    function handleStartRecordMatch() {
        setGameState(previous =>
            startRecordMatch(previous)
        )
    }

    function handleStopRecordMatch() {
        setGameState(previous =>
            stopRecordMatch(previous)
        )
    }

    function startRecordMatch(previous: GameState): GameState {
        const setOne: SetHistory = {
                    setNumber: 1,
                    pointsHistory: []
                }

        const newState = {
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
            isTimerRunning: false
            },

            additionalFeatures: {
                ...previous.additionalFeatures,
                isAREnabled: true,
                isMatchRecordingOn: true
            },
    
            stats: {
                setsHistory: [setOne]
            }
        }

        return newState    
    }

    function stopRecordMatch(previous: GameState): GameState {
        const newState = {
            ...previous,

            additionalFeatures: {
                ...previous.additionalFeatures,
                isMatchRecordingOn: false
            },
    
            stats: {
                setsHistory: []
            }
        }

        return newState
    }

    function changeRule(
        previous: GameState,
        rule: RuleKey,
        amount: number
    ): GameState {
        const currentValue =
            previous.additionalFeatures[rule]

        const newValue =
            Math.max(0, currentValue + amount)

        return {
            ...previous,

            additionalFeatures: {
                ...previous.additionalFeatures,
                [rule]: newValue
            }
        }
    }

    function handleIncreaseSetsToWin() {
        setGameState(previous =>
            changeRule(previous, "setsToWin", 1)
        )
    }

    function handleDecreaseSetsToWin() {
        setGameState(previous =>
            changeRule(previous, "setsToWin", -1)
        )
    }

    function handleIncreaseSetLength() {
        setGameState(previous =>
            changeRule(previous, "setLength", 1)
        )
    }

    function handleDecreaseSetLength() {
        setGameState(previous =>
            changeRule(previous, "setLength", -1)
        )
    }

    function handleIncreaseFinalSetLength() {
        setGameState(previous =>
            changeRule(previous, "finalSetLength", 1)
        )
    }

    function handleDecreaseFinalSetLength() {
        setGameState(previous =>
            changeRule(previous, "finalSetLength", -1)
        )
    }
  
    function getCurrentSetLength(
        teamOneSetsWon: number,
        teamTwoSetsWon: number,
        setsToWin: number,
        setLength: number,
        finalSetLength: number
    ) {
        const currentSet =
            teamOneSetsWon + teamTwoSetsWon + 1

        const finalPossibleSet =
            setsToWin * 2 - 1

        if (currentSet === finalPossibleSet) {
            return finalSetLength
        }

        return setLength
    }
  
    function hasWonSet(
        teamScore: number,
        opponentScore: number,
        state: GameState
    ) {
        const targetScore = getCurrentSetLength(
            state.teamOne.setsWon,
            state.teamTwo.setsWon,
            state.additionalFeatures.setsToWin,
            state.additionalFeatures.setLength,
            state.additionalFeatures.finalSetLength
        )

        return (
            teamScore >= targetScore &&
            teamScore >= opponentScore + 2
        )
    }
    
    function hasWonGame(
        setsWon: number,
        setsToWin: number
    ) {
        return setsWon >= setsToWin
    }
  
    function endSet(
        previous: GameState,
        winningTeamKey: TeamKey
    ): GameState {

        const newState: GameState = {
            ...previous,

            teamOne: {
                ...previous.teamOne,
                score: 0,
                setsWon:
                    winningTeamKey === "teamOne"
                        ? previous.teamOne.setsWon + 1
                        : previous.teamOne.setsWon
            },

            teamTwo: {
                ...previous.teamTwo,
                score: 0,
                setsWon:
                    winningTeamKey === "teamTwo"
                        ? previous.teamTwo.setsWon + 1
                        : previous.teamTwo.setsWon
            }
        }

        const matchIsOver = hasWonGame(
            newState[winningTeamKey].setsWon,
            newState.additionalFeatures.setsToWin
        )

        // Casual game: no history to maintain
        if (!newState.additionalFeatures.isMatchRecordingOn) {
            return newState
        }

        // Match finished: don't create another empty set
        if (matchIsOver) {
            return newState
        }

        const currentSet =
            previous.stats.setsHistory[
                previous.stats.setsHistory.length - 1
            ]

        const nextSet: SetHistory = {
            setNumber: currentSet.setNumber + 1,
            pointsHistory: []
        }

        return {
            ...newState,

            stats: {
                ...newState.stats,

                setsHistory: [
                    ...previous.stats.setsHistory,
                    nextSet
                ]
            }
        }
    }

    function buildGamePayload(completedState: GameState) {
        const dateTime = new Date()

        return {
            teamOneName: completedState.teamOne.name,
            teamTwoName: completedState.teamTwo.name,
            teamOneSetsWon: completedState.teamOne.setsWon,
            teamTwoSetsWon: completedState.teamTwo.setsWon,
            date: dateTime.toLocaleDateString(),
            time: dateTime.toLocaleTimeString(),
            stats: completedState.additionalFeatures.isMatchRecordingOn
                ? completedState.stats
                : { setsHistory: [] }
        }
    }
  
    async function saveGame(completedState: GameState) {
        const completedGame = buildGamePayload(completedState)

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

    function finishMatchState(completedState: GameState): GameState {
        return {
            ...completedState,

            teamOne: {
                ...completedState.teamOne,
                score: 0,
                setsWon: 0
            },

            teamTwo: {
                ...completedState.teamTwo,
                score: 0,
                setsWon: 0
            },

            additionalFeatures: {
                ...completedState.additionalFeatures,
                isMatchRecordingOn: false
            },

            stats: {
                setsHistory: []
            }
        }
    }
  
    function endGame(
        winningTeamKey: TeamKey,
        completedState: GameState
    ) {
        saveGame(completedState)

        const winningTeamName =
            completedState[winningTeamKey].name

        const finishedState =
            finishMatchState(completedState)
        
        setGameState(finishedState)

        alert(`${winningTeamName} won the match! 🏐`)
    }
  
    function evaluateRules() {
        if (
            !gameState.additionalFeatures.isAREnabled
        ) {
            return
        }

        const teamOneScore = gameState.teamOne.score
        const teamTwoScore = gameState.teamTwo.score

        let winningTeamKey: TeamKey | null = null

        if (
            hasWonSet(
                teamOneScore,
                teamTwoScore,
                gameState
            )
        ) {
            winningTeamKey = "teamOne"

        } else if (
            hasWonSet(
                teamTwoScore,
                teamOneScore,
                gameState
            )
        ) {
            winningTeamKey = "teamTwo"
        }

        if (winningTeamKey === null) {
            return
        }

        const completedSetState =
            endSet(gameState, winningTeamKey)

        const matchIsOver = hasWonGame(
            completedSetState[winningTeamKey].setsWon,
            completedSetState.additionalFeatures.setsToWin
        )

        if (matchIsOver) {
            endGame(
                winningTeamKey,
                completedSetState
            )

            return
        }

        setGameState(completedSetState)
    }

    // #

    // #region Timer
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
          isTimerRunning: false
        })
  
        return
      }
  
      updateTimerState({
        remainingSeconds: gameState.timer.initialTimerSeconds,
        isTimerRunning: false
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
          isTimerRunning: false
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
          isTimerRunning: false
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

    // #endregion

  return (

    <main>
        <section className="scoreboard">
        <GameInfo 
        gameState={gameState}
        handleUpdateTeamName={handleUpdateTeamName}
        changeIsTimerRunning={changeIsTimerRunning}
        formatTimer={formatTimer}
        resetTimer={resetTimer}
        handleTimerKeyDown={handleTimerKeydown}
        />
        <Teams
            gameState={gameState}
            handleScorePoint={handleScorePoint}
            handleRemovePoint={handleRemovePoint}
        />
        <SetSummary 
            gameState={gameState}
            handleIncreaseSets={handleIncreaseSets}
            handleDecreaseSets={handleDecreaseSets}
        />
        <AdditionalFeatures 
            gameState={gameState}
            handleIncreaseSetsToWin={handleDecreaseSetsToWin}
            handleDecreaseSetsToWin={handleDecreaseSetsToWin}
            handleIncreaseSetLength={handleIncreaseSetLength}
            handleDecreaseSetLength={handleDecreaseSetLength}
            handleIncreaseFinalSetLength={handleIncreaseFinalSetLength}
            handleDecreaseFinalSetLength={handleDecreaseFinalSetLength}
            saveGame={saveGame}
            handleResetCurrentSet={handleResetCurrentSet}
            requestResetMatch={requestResetMatch}
            handleToggleAutomaticRules={handleToggleAutomaticRules}
            handleStartRecordMatch={handleStartRecordMatch}
            handleStopRecordMatch={handleStopRecordMatch}
        />
        </section>
    </main>

  )
}

export default Scoreboard