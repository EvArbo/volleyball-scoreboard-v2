import { useEffect, useRef, useReducer } from "react"
import type { GameState, TeamKey } from "../types"

import {
    gameReducer,
    initialGameState,
    buildGamePayload,
    hasWonGame
} from "../game/gameReducer"

import AdditionalFeatures from "../components/AdditionalFeatures.tsx"
import SetSummary from "../components/SetSummary.tsx"
import Teams from "../components/Teams.tsx"
import GameInfo from "../components/GameInfo.tsx"

function Scoreboard() {
    const [gameState, dispatch] = useReducer(gameReducer, initialGameState)

    const isEnteringTimer = useRef(false)
    const alarmOscillators = useRef<OscillatorNode[]>([])
    const timerEntryDigits = useRef("")
    const audioContext = useRef<AudioContext | null>(null)

    useEffect(() => {
        if (!gameState.timer.isTimerRunning) {
            return }

        const intervalId = setInterval(() => {
            dispatch({ type: "TICK_TIMER" })
        }, 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [gameState.timer.isTimerRunning])

    useEffect(() => {
        if ( !gameState.timer.isTimerRunning &&
            gameState.timer.remainingSeconds === 0 &&
            gameState.timer.initialTimerSeconds > 0
        ) {
            playTimerSound()
        }
    }, [
        gameState.timer.isTimerRunning,
        gameState.timer.remainingSeconds
    ])

    useEffect(() => {
        const teamOneWon = hasWonGame(
            gameState.teamOne.setsWon,
            gameState.additionalFeatures.setsToWin
        )

        const teamTwoWon = hasWonGame(
            gameState.teamTwo.setsWon,
            gameState.additionalFeatures.setsToWin
        )

        if (!teamOneWon && !teamTwoWon) {
            return
        }

        async function finishMatch() {
            const winningTeam = teamOneWon
                ? gameState.teamOne
                : gameState.teamTwo

            const saved = await saveGame(gameState)

            if (!saved) {
                window.alert("The match could not be saved.")
                return
            }

            window.alert(`${winningTeam.name} wins the match!`)

            dispatch({
                type: "FINISH_MATCH"
            })
        }

        finishMatch()
    }, [
        gameState.teamOne.setsWon,
        gameState.teamTwo.setsWon
    ])

    function handleUpdateTeamName( team: TeamKey,
        name: string
    ) {
        dispatch({
            type: "UPDATE_TEAM_NAME",
            team,
            name
        })
    }

    function changeIsTimerRunning() {
        isEnteringTimer.current = false
        stopTimerSound()

        const willStart = !gameState.timer.isTimerRunning

        if ( willStart &&
            gameState.timer.remainingSeconds <= 0
        ) {
            if ( gameState.timer.initialTimerSeconds <= 0
            ) {
                return }

            dispatch({
                type: "UPDATE_TIMER",
                updates: {
                    remainingSeconds:
                        gameState.timer.initialTimerSeconds,
                    isTimerRunning: true
                }
            })

            return }

        dispatch({
            type: "UPDATE_TIMER",
            updates: {
                isTimerRunning: willStart
            }
        })
    }

    function handleScorePoint(team: TeamKey) {
        dispatch({
            type: "SCORE_POINT",
            team
        })
    }

    function handleRemovePoint(team: TeamKey) {
        dispatch({
            type: "REMOVE_POINT",
            team
        })
    }

    function handleResetCurrentSet() {
        dispatch({
            type: "RESET_CURRENT_SET"
        })
    }

    function requestResetMatch() {
        const shouldReset = window.confirm( "Press 'Ok' to reset scores, sets, and timer"
        )

        if (!shouldReset) {
            return }

        dispatch({
            type: "RESET_MATCH"
        })
    }

    function handleIncreaseSets(team: TeamKey) {
        dispatch({
            type: "INCREASE_SETS",
            team
        })
    }

    function handleDecreaseSets(team: TeamKey) {
        dispatch({
            type: "DECREASE_SETS",
            team
        })
    }

    function handleToggleAutomaticRules() {
        dispatch({
            type: "TOGGLE_AUTOMATIC_RULES"
        })
    }

    function handleStartRecordMatch() {
        dispatch({
            type: "START_RECORD_MATCH"
        })
    }

    function handleStopRecordMatch() {
        dispatch({
            type: "STOP_RECORD_MATCH"
        })
    }

    function handleIncreaseSetsToWin() {
        dispatch({
            type: "CHANGE_RULE",
            rule: "setsToWin",
            amount: 1
        })
    }

    function handleDecreaseSetsToWin() {
        dispatch({
            type: "CHANGE_RULE",
            rule: "setsToWin",
            amount: -1
        })
    }

    function handleIncreaseSetLength() {
        dispatch({
            type: "CHANGE_RULE",
            rule: "setLength",
            amount: 1
        })
    }

    function handleDecreaseSetLength() {
        dispatch({
            type: "CHANGE_RULE",
            rule: "setLength",
            amount: -1
        })
    }

    function handleIncreaseFinalSetLength() {
        dispatch({
            type: "CHANGE_RULE",
            rule: "finalSetLength",
            amount: 1
        })
    }

    function handleDecreaseFinalSetLength() {
        dispatch({
            type: "CHANGE_RULE",
            rule: "finalSetLength",
            amount: -1
        })
    }

    async function saveGame(completedState: GameState) {
        try {
            const completedGame = buildGamePayload(
                completedState,
                new Date()
            )

            const response = await fetch("http://localhost:3000/games", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(completedGame)
            })

            if (!response.ok) {
                return false
            }

            const data = await response.json()
            console.log(data)

            return true
        } catch (error) {
            console.error("Failed to save game:", error)
            return false
        }
    }

    function formatTimer(seconds: number) {
        const minutes = Math.floor(seconds / 60)

        const remainingSeconds = seconds % 60

        return `${minutes}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`
    }

    function updateTimerState( updates: Partial<GameState["timer"]>
    ) {
        dispatch({
            type: "UPDATE_TIMER",
            updates
        })
    }

    function resetTimer() {
        stopTimerSound()
        isEnteringTimer.current = false

        if ( !gameState.timer.isTimerRunning &&
            gameState.timer.remainingSeconds === gameState.timer.initialTimerSeconds
        ) {
            updateTimerState({
                initialTimerSeconds: 0,
                remainingSeconds: 0,
                isTimerRunning: false
            })

            return }

        updateTimerState({
            remainingSeconds:
                gameState.timer.initialTimerSeconds,
            isTimerRunning: false
        })
    }

    const alarmSound = [
        { freq: 293.66, duration: 192 },
        { freq: 369.99, duration: 192 },
        { freq: 392.00, duration: 192 },
        { freq: 293.66, duration: 192 },
        { freq: 0, duration: 192 },

        { freq: 369.99, duration: 192 },
        { freq: 392.00, duration: 192 },
        { freq: 293.66, duration: 192 },

        { freq: 0, duration: 192 },
        { freq: 293.66, duration: 192 },
        { freq: 369.99, duration: 192 },
        { freq: 392.00, duration: 192 },
        { freq: 440.00, duration: 192 },
        { freq: 493.88, duration: 192 },
        { freq: 440.00, duration: 192 },
        { freq: 392.00, duration: 192 },

        { freq: 369.99, duration: 192 },
        { freq: 0, duration: 192 },
        { freq: 0, duration: 192 },
        { freq: 369.99, duration: 192 },

        { freq: 0, duration: 192 },
        { freq: 0, duration: 192 },
        { freq: 369.99, duration: 192 },
        { freq: 392.00, duration: 192 },
        { freq: 392.00, duration: 192 }
    ]

    function getAudioContext() {
        if (!audioContext.current) {
            audioContext.current = new AudioContext()
        }

        return audioContext.current
    }

    function playTimerSound() {
        const context = getAudioContext()

        let noteStartTime = context.currentTime

        for (const note of alarmSound) {
            const durationInSeconds = note.duration / 1000

            if (note.freq !== 0) {
                const oscillator = context.createOscillator()

                const gainNode = context.createGain()

                oscillator.type = "triangle"
                oscillator.frequency.value = note.freq

                oscillator.connect(gainNode)
                gainNode.connect( context.destination
                )

                gainNode.gain.value = 0.2

                alarmOscillators.current.push( oscillator
                )

                oscillator.start(noteStartTime)

                oscillator.stop( noteStartTime +
                        durationInSeconds
                )
            }

            noteStartTime += durationInSeconds
        }
    }

    function stopTimerSound() {
        for ( const oscillator
            of alarmOscillators.current
        ) {
            try {
                oscillator.stop()
            } catch {
                // oscillator already stopped
            }
        }

        alarmOscillators.current = []
    }

    function timerDigitsToSeconds( digits: string
    ) {
        const placeValues = [1, 10, 60, 600]

        const reversedDigits = digits.split("").reverse()

        let totalSeconds = 0

        for ( let i = 0;
            i < reversedDigits.length;
            i++
        ) {
            totalSeconds += Number(reversedDigits[i]) *
                placeValues[i]
        }

        return totalSeconds
    }

    function setTimerSeconds( seconds: number
    ) {
        dispatch({
            type: "UPDATE_TIMER",
            updates: {
                initialTimerSeconds: seconds,
                remainingSeconds: seconds
            }
        })
    }

    function handleTimerKeydown( event: React.KeyboardEvent<HTMLInputElement>
    ) {
        const allowedKeys = [
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "Tab",
            "Enter"
        ]

        const isDigit = /^[0-9]$/.test(event.key)

        if ( !isDigit &&
            !allowedKeys.includes(event.key)
        ) {
            event.preventDefault()
            return }

        if (isDigit) {
            event.preventDefault()

            updateTimerState({
                isTimerRunning: false
            })

            if (!isEnteringTimer.current) {
                timerEntryDigits.current = ""
                isEnteringTimer.current = true
            }

            timerEntryDigits.current = ( timerEntryDigits.current +
                    event.key
                ).slice(-4)

            const enteredSeconds = timerDigitsToSeconds( timerEntryDigits.current
                )

            setTimerSeconds( enteredSeconds
            )

            return }

        if (event.key === "Backspace") {
            event.preventDefault()

            updateTimerState({
                isTimerRunning: false
            })

            timerEntryDigits.current = timerEntryDigits.current.slice( 0,
                    -1
                )

            const enteredSeconds = timerEntryDigits.current === ""
                    ? 0
                    : timerDigitsToSeconds( timerEntryDigits.current
                    )

            setTimerSeconds( enteredSeconds
            )

            isEnteringTimer.current = true
        }
    }

    return ( <main>
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
                    handleIncreaseSetsToWin={handleIncreaseSetsToWin}
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