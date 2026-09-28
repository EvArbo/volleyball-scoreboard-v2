import { describe, expect, test } from "vitest"
import { gameReducer, initialGameState, getCurrentSetLength } from "./gameReducer"

describe("scoring", () => {
    test("scores a point for team one", () => {
        const result = gameReducer(initialGameState, {
            type: "SCORE_POINT",
            team: "teamOne"
        })

        expect(result.teamOne.score).toBe(1)
        expect(result.teamTwo.score).toBe(0)
    })

    test("scores a point for team two", () => {
        const result = gameReducer(initialGameState, {
            type: "SCORE_POINT",
            team: "teamTwo"
        })

        expect(result.teamOne.score).toBe(0)
        expect(result.teamTwo.score).toBe(1)
    })

    test("removes a point", () => {
        const state = {
            ...initialGameState,
            teamOne: {
                ...initialGameState.teamOne,
                score: 5
            }
        }

        const result = gameReducer(state, {
            type: "REMOVE_POINT",
            team: "teamOne"
        })

        expect(result.teamOne.score).toBe(4)
    })

    test("score cannot go below zero", () => {
        const result = gameReducer(initialGameState, {
            type: "REMOVE_POINT",
            team: "teamOne"
        })

        expect(result.teamOne.score).toBe(0)
    })
})

describe("recording point history", () => {
    test("records the first point", () => {
        let state = gameReducer(initialGameState, {
            type: "START_RECORD_MATCH"
        })

        state = gameReducer(state, {
            type: "SCORE_POINT",
            team: "teamOne"
        })

        expect(state.stats.setsHistory[0].pointsHistory).toEqual([
            {
                team: "teamOne",
                points: 1
            }
        ])
    })

    test("groups consecutive points from the same team", () => {
        let state = gameReducer(initialGameState, {
            type: "START_RECORD_MATCH"
        })

        state = gameReducer(state, {
            type: "SCORE_POINT",
            team: "teamOne"
        })

        state = gameReducer(state, {
            type: "SCORE_POINT",
            team: "teamOne"
        })

        expect(state.stats.setsHistory[0].pointsHistory).toEqual([
            {
                team: "teamOne",
                points: 2
            }
        ])
    })

    test("creates a new cluster when the scoring team changes", () => {
        let state = gameReducer(initialGameState, {
            type: "START_RECORD_MATCH"
        })

        state = gameReducer(state, {
            type: "SCORE_POINT",
            team: "teamOne"
        })

        state = gameReducer(state, {
            type: "SCORE_POINT",
            team: "teamTwo"
        })

        state = gameReducer(state, {
            type: "SCORE_POINT",
            team: "teamOne"
        })

        expect(state.stats.setsHistory[0].pointsHistory).toEqual([
            { team: "teamOne", points: 1 },
            { team: "teamTwo", points: 1 },
            { team: "teamOne", points: 1 }
        ])
    })
})

describe("removing recorded points", () => {
    test("removes a point from the latest cluster for that team", () => {
        let state = gameReducer(initialGameState, {
            type: "START_RECORD_MATCH"
        })

        state = gameReducer(state, { type: "SCORE_POINT", team: "teamOne" })
        state = gameReducer(state, { type: "SCORE_POINT", team: "teamOne" })
        state = gameReducer(state, { type: "REMOVE_POINT", team: "teamOne" })

        expect(state.teamOne.score).toBe(1)
        expect(state.stats.setsHistory[0].pointsHistory).toEqual([
            { team: "teamOne", points: 1 }
        ])
    })

    test("removes a cluster when its last point is removed", () => {
        let state = gameReducer(initialGameState, {
            type: "START_RECORD_MATCH"
        })

        state = gameReducer(state, { type: "SCORE_POINT", team: "teamOne" })
        state = gameReducer(state, { type: "SCORE_POINT", team: "teamTwo" })
        state = gameReducer(state, { type: "REMOVE_POINT", team: "teamTwo" })

        expect(state.stats.setsHistory[0].pointsHistory).toEqual([
            { team: "teamOne", points: 1 }
        ])
    })

    test("merges surrounding clusters when a middle cluster is removed", () => {
        let state = gameReducer(initialGameState, {
            type: "START_RECORD_MATCH"
        })

        state = gameReducer(state, { type: "SCORE_POINT", team: "teamOne" })
        state = gameReducer(state, { type: "SCORE_POINT", team: "teamTwo" })
        state = gameReducer(state, { type: "SCORE_POINT", team: "teamOne" })
        state = gameReducer(state, { type: "REMOVE_POINT", team: "teamTwo" })

        expect(state.stats.setsHistory[0].pointsHistory).toEqual([
            { team: "teamOne", points: 2 }
        ])
    })

    test("removing at zero does not change recorded history", () => {
        let state = gameReducer(initialGameState, {
            type: "START_RECORD_MATCH"
        })

        const previousHistory = state.stats.setsHistory
        state = gameReducer(state, {
            type: "REMOVE_POINT",
            team: "teamOne"
        })

        expect(state.teamOne.score).toBe(0)
        expect(state.stats.setsHistory).toEqual(previousHistory)
    })
})

describe("resetting", () => {
    test("reset current set clears scores", () => {
        let state = gameReducer(initialGameState, {
            type: "START_RECORD_MATCH"
        })

        state = gameReducer(state, { type: "SCORE_POINT", team: "teamOne" })
        state = gameReducer(state, { type: "SCORE_POINT", team: "teamTwo" })
        state = gameReducer(state, { type: "RESET_CURRENT_SET" })

        expect(state.teamOne.score).toBe(0)
        expect(state.teamTwo.score).toBe(0)
    })

    test("reset current set clears current recorded point history", () => {
        let state = gameReducer(initialGameState, {
            type: "START_RECORD_MATCH"
        })

        state = gameReducer(state, { type: "SCORE_POINT", team: "teamOne" })
        state = gameReducer(state, { type: "RESET_CURRENT_SET" })

        expect(state.stats.setsHistory[0].pointsHistory).toEqual([])
    })

    test("reset match clears scores, sets, and timer", () => {
        const state = {
            ...initialGameState,
            teamOne: { ...initialGameState.teamOne, score: 10, setsWon: 1 },
            teamTwo: { ...initialGameState.teamTwo, score: 8, setsWon: 1 },
            timer: {
                initialTimerSeconds: 60,
                remainingSeconds: 30,
                isTimerRunning: true
            }
        }

        const result = gameReducer(state, {
            type: "RESET_MATCH"
        })

        expect(result.teamOne.score).toBe(0)
        expect(result.teamTwo.score).toBe(0)
        expect(result.teamOne.setsWon).toBe(0)
        expect(result.teamTwo.setsWon).toBe(0)
        expect(result.timer.remainingSeconds).toBe(0)
        expect(result.timer.isTimerRunning).toBe(false)
    })
})

describe("recording", () => {
    test("starting recording creates the first set", () => {
        const state = gameReducer(initialGameState, {
            type: "START_RECORD_MATCH"
        })

        expect(state.additionalFeatures.isMatchRecordingOn).toBe(true)
        expect(state.stats.setsHistory).toEqual([
            {
                setNumber: 1,
                pointsHistory: []
            }
        ])
    })

    test("starting recording resets scores and sets", () => {
        const previous = {
            ...initialGameState,
            teamOne: { ...initialGameState.teamOne, score: 15, setsWon: 1 },
            teamTwo: { ...initialGameState.teamTwo, score: 12, setsWon: 1 }
        }

        const state = gameReducer(previous, {
            type: "START_RECORD_MATCH"
        })

        expect(state.teamOne.score).toBe(0)
        expect(state.teamTwo.score).toBe(0)
        expect(state.teamOne.setsWon).toBe(0)
        expect(state.teamTwo.setsWon).toBe(0)
    })

    test("stopping recording clears recorded history", () => {
        let state = gameReducer(initialGameState, {
            type: "START_RECORD_MATCH"
        })

        state = gameReducer(state, { type: "SCORE_POINT", team: "teamOne" })
        state = gameReducer(state, { type: "STOP_RECORD_MATCH" })

        expect(state.additionalFeatures.isMatchRecordingOn).toBe(false)
        expect(state.stats.setsHistory).toEqual([])
    })
})

describe("manual sets", () => {
    test("increases sets won", () => {
        const state = gameReducer(initialGameState, {
            type: "INCREASE_SETS",
            team: "teamOne"
        })

        expect(state.teamOne.setsWon).toBe(1)
    })

    test("decreases sets won", () => {
        const previous = {
            ...initialGameState,
            teamOne: { ...initialGameState.teamOne, setsWon: 1 }
        }

        const state = gameReducer(previous, {
            type: "DECREASE_SETS",
            team: "teamOne"
        })

        expect(state.teamOne.setsWon).toBe(0)
    })

    test("sets won cannot go below zero", () => {
        const state = gameReducer(initialGameState, {
            type: "DECREASE_SETS",
            team: "teamOne"
        })

        expect(state.teamOne.setsWon).toBe(0)
    })
})

describe("rules", () => {
    test("changes set length", () => {
        const state = gameReducer(initialGameState, {
            type: "CHANGE_RULE",
            rule: "setLength",
            amount: 5
        })

        expect(state.additionalFeatures.setLength).toBe(30)
    })

    test("rule values cannot go below zero", () => {
        const state = gameReducer(initialGameState, {
            type: "CHANGE_RULE",
            rule: "setLength",
            amount: -100
        })

        expect(state.additionalFeatures.setLength).toBe(0)
    })

    test("toggles automatic rules", () => {
        const state = gameReducer(initialGameState, {
            type: "TOGGLE_AUTOMATIC_RULES"
        })

        expect(state.additionalFeatures.isAREnabled).toBe(true)
    })
})

describe("automatic set rules", () => {
    test("does not automatically end a set when automatic rules are off", () => {
        const previous = {
            ...initialGameState,
            teamOne: { ...initialGameState.teamOne, score: 24 }
        }

        const state = gameReducer(previous, {
            type: "SCORE_POINT",
            team: "teamOne"
        })

        expect(state.teamOne.score).toBe(25)
        expect(state.teamOne.setsWon).toBe(0)
    })

    test("ends a set at the target score when automatic rules are on", () => {
        const previous = {
            ...initialGameState,
            teamOne: { ...initialGameState.teamOne, score: 24 },
            additionalFeatures: {
                ...initialGameState.additionalFeatures,
                isAREnabled: true
            }
        }

        const state = gameReducer(previous, {
            type: "SCORE_POINT",
            team: "teamOne"
        })

        expect(state.teamOne.setsWon).toBe(1)
        expect(state.teamOne.score).toBe(0)
        expect(state.teamTwo.score).toBe(0)
    })

    test("does not win 25-24 because a set requires a two-point lead", () => {
        const previous = {
            ...initialGameState,
            teamOne: { ...initialGameState.teamOne, score: 24 },
            teamTwo: { ...initialGameState.teamTwo, score: 24 },
            additionalFeatures: {
                ...initialGameState.additionalFeatures,
                isAREnabled: true
            }
        }

        const state = gameReducer(previous, {
            type: "SCORE_POINT",
            team: "teamOne"
        })

        expect(state.teamOne.score).toBe(25)
        expect(state.teamTwo.score).toBe(24)
        expect(state.teamOne.setsWon).toBe(0)
    })

    test("wins 26-24", () => {
        const previous = {
            ...initialGameState,
            teamOne: { ...initialGameState.teamOne, score: 25 },
            teamTwo: { ...initialGameState.teamTwo, score: 24 },
            additionalFeatures: {
                ...initialGameState.additionalFeatures,
                isAREnabled: true
            }
        }

        const state = gameReducer(previous, {
            type: "SCORE_POINT",
            team: "teamOne"
        })

        expect(state.teamOne.setsWon).toBe(1)
        expect(state.teamOne.score).toBe(0)
        expect(state.teamTwo.score).toBe(0)
    })
})

describe("recorded set transitions", () => {
    test("ending a recorded set creates the next set", () => {
        let state = gameReducer(initialGameState, {
            type: "START_RECORD_MATCH"
        })

        state = {
            ...state,
            teamOne: { ...state.teamOne, score: 24 }
        }

        state = gameReducer(state, {
            type: "SCORE_POINT",
            team: "teamOne"
        })

        expect(state.teamOne.setsWon).toBe(1)
        expect(state.stats.setsHistory).toHaveLength(2)
        expect(state.stats.setsHistory[1]).toEqual({
            setNumber: 2,
            pointsHistory: []
        })
    })

    test("winning the match does not create an empty next set", () => {
        let state = gameReducer(initialGameState, {
            type: "START_RECORD_MATCH"
        })

        state = {
            ...state,
            teamOne: { ...state.teamOne, score: 24, setsWon: 1 },
            stats: {
                setsHistory: [
                    { setNumber: 1, pointsHistory: [] },
                    { setNumber: 2, pointsHistory: [] }
                ]
            }
        }

        state = gameReducer(state, {
            type: "SCORE_POINT",
            team: "teamOne"
        })

        expect(state.teamOne.setsWon).toBe(2)
        expect(state.stats.setsHistory).toHaveLength(2)
    })
})

describe("timer", () => {
    test("updates timer state", () => {
        const state = gameReducer(initialGameState, {
            type: "UPDATE_TIMER",
            updates: {
                initialTimerSeconds: 60,
                remainingSeconds: 60,
                isTimerRunning: true
            }
        })

        expect(state.timer.initialTimerSeconds).toBe(60)
        expect(state.timer.remainingSeconds).toBe(60)
        expect(state.timer.isTimerRunning).toBe(true)
    })

    test("timer ticks down by one second", () => {
        const previous = {
            ...initialGameState,
            timer: {
                initialTimerSeconds: 60,
                remainingSeconds: 10,
                isTimerRunning: true
            }
        }

        const state = gameReducer(previous, {
            type: "TICK_TIMER"
        })

        expect(state.timer.remainingSeconds).toBe(9)
        expect(state.timer.isTimerRunning).toBe(true)
    })

    test("timer stops at zero", () => {
        const previous = {
            ...initialGameState,
            timer: {
                initialTimerSeconds: 60,
                remainingSeconds: 1,
                isTimerRunning: true
            }
        }

        const state = gameReducer(previous, {
            type: "TICK_TIMER"
        })

        expect(state.timer.remainingSeconds).toBe(0)
        expect(state.timer.isTimerRunning).toBe(false)
    })
})

describe("set length", () => {
    test("uses normal set length before the final possible set", () => {
        const result = getCurrentSetLength(
            0,
            0,
            2,
            25,
            15
        )

        expect(result).toBe(25)
    })

    test("uses final set length for the deciding set", () => {
        const result = getCurrentSetLength(
            1,
            1,
            2,
            25,
            15
        )

        expect(result).toBe(15)
    })
})