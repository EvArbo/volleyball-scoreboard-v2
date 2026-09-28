import type {
    GameState,
    TeamKey,
    SetHistory,
    PointCluster,
    RuleKey
} from "../types"

export type GameAction = | {
        type: "UPDATE_TEAM_NAME"
        team: TeamKey
        name: string
    }
    | {
        type: "SCORE_POINT"
        team: TeamKey
    }
    | {
        type: "REMOVE_POINT"
        team: TeamKey
    }
    | {
        type: "RESET_CURRENT_SET"
    }
    | {
        type: "RESET_MATCH"
    }
    | {
        type: "INCREASE_SETS"
        team: TeamKey
    }
    | {
        type: "DECREASE_SETS"
        team: TeamKey
    }
    | {
        type: "TOGGLE_AUTOMATIC_RULES"
    }
    | {
        type: "START_RECORD_MATCH"
    }
    | {
        type: "STOP_RECORD_MATCH"
    }
    | {
        type: "CHANGE_RULE"
        rule: RuleKey
        amount: number
    }
    | {
        type: "UPDATE_TIMER"
        updates: Partial<GameState["timer"]>
    }
    | {
        type: "TICK_TIMER"
    }
    | {
        type: "FINISH_MATCH"
    }

export const initialGameState: GameState = {
    teamOne: {
        name: "Team 1",
        score: 0,
        setsWon: 0
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
}

export function gameReducer( state: GameState,
    action: GameAction
): GameState {
    switch (action.type) {
        case "UPDATE_TEAM_NAME":
            return updateTeamName( state,
                action.team,
                action.name
            )

        case "SCORE_POINT": {
            const scoredState = scorePoint( state,
                    action.team
                )

            return resolveAutomaticRules( scoredState
            )
        }

        case "REMOVE_POINT":
            return removePoint( state,
                action.team
            )

        case "RESET_CURRENT_SET":
            return resetCurrentSet(state)

        case "RESET_MATCH":
            return resetMatch(state)

        case "INCREASE_SETS":
            return increaseSets( state,
                action.team
            )

        case "DECREASE_SETS":
            return decreaseSets( state,
                action.team
            )

        case "TOGGLE_AUTOMATIC_RULES":
            return toggleAutomaticRules( state
            )

        case "START_RECORD_MATCH":
            return startRecordMatch( state
            )

        case "STOP_RECORD_MATCH":
            return stopRecordMatch( state
            )

        case "CHANGE_RULE":
            return changeRule( state,
                action.rule,
                action.amount
            )

        case "UPDATE_TIMER":
            return {
                ...state,

                timer: {
                    ...state.timer,
                    ...action.updates
                }
            }

        case "TICK_TIMER":
            if ( state.timer.remainingSeconds <= 1
            ) {
                return {
                    ...state,

                    timer: {
                        ...state.timer,
                        remainingSeconds: 0,
                        isTimerRunning: false
                    }
                }
            }

            return {
                ...state,

                timer: {
                    ...state.timer,
                    remainingSeconds:
                        state.timer.remainingSeconds - 1
                }
            }

        case "FINISH_MATCH":
            return finishMatchState(state)

        default:
            return state
    }
}

export function updateTeamName( previous: GameState,
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

export function scorePoint( previous: GameState,
    team: TeamKey
): GameState {
    const newState: GameState = {
        ...previous,

        [team]: {
            ...previous[team],
            score:
                previous[team].score + 1
        }
    }

    if ( !previous.additionalFeatures.isMatchRecordingOn
    ) {
        return newState
    }

    const currentSet = previous.stats.setsHistory[
            previous.stats.setsHistory.length - 1
        ]

    const lastPointCluster = currentSet.pointsHistory[
            currentSet.pointsHistory.length - 1
        ]

    let newPointsHistory: PointCluster[]

    if ( lastPointCluster != null &&
        team === lastPointCluster.team
    ) {
        newPointsHistory = [
            ...currentSet.pointsHistory.slice( 0,
                -1
            ),
            {
                ...lastPointCluster,
                points:
                    lastPointCluster.points + 1
            }
        ]
    } else {
        const newPointCluster: PointCluster = {
            team,
            points: 1
        }

        newPointsHistory = [
            ...currentSet.pointsHistory,
            newPointCluster
        ]
    }

    const newSetsHistory = [
        ...newState.stats.setsHistory.slice( 0,
            -1
        ),
        {
            ...currentSet,
            pointsHistory: newPointsHistory
        }
    ]

    return {
        ...newState,

        stats: {
            ...newState.stats,
            setsHistory: newSetsHistory
        }
    }
}

export function removePoint( previous: GameState,
    team: TeamKey
): GameState {
    if (previous[team].score === 0) {
        return previous
    }

    const newState: GameState = {
        ...previous,

        [team]: {
            ...previous[team],
            score:
                previous[team].score - 1
        }
    }

    if ( !previous.additionalFeatures.isMatchRecordingOn
    ) {
        return newState
    }

    const currentSet: SetHistory = previous.stats.setsHistory[
            previous.stats.setsHistory.length - 1
        ]

    let currentPointClusterIdx = 0

    let currentPointCluster: PointCluster = {
        team: null,
        points: null
    }

    for ( let idx = currentSet.pointsHistory.length - 1;
        idx >= 0;
        idx--
    ) {
        const pointCluster = currentSet.pointsHistory[idx]

        if (pointCluster.team === team) {
            currentPointClusterIdx = idx
            currentPointCluster = pointCluster
            break
        }
    }

    const newPointCluster: PointCluster = {
        ...currentPointCluster,
        points:
            currentPointCluster.points - 1
    }

    let newPointsHistory: PointCluster[] = []
    let newSetsHistory: SetHistory[] = []

    if (newPointCluster.points === 0) {
        if ( currentPointClusterIdx <
                currentSet.pointsHistory.length - 1 &&
            currentPointClusterIdx > 0
        ) {
            const mergedPointCluster:
                PointCluster = {
                    team:
                        currentSet.pointsHistory[
                            currentPointClusterIdx - 1
                        ].team,

                    points:
                        currentSet.pointsHistory[
                            currentPointClusterIdx - 1
                        ].points +
                        currentSet.pointsHistory[
                            currentPointClusterIdx + 1
                        ].points
                }

            newPointsHistory = [
                ...currentSet.pointsHistory.slice( 0,
                    currentPointClusterIdx - 1
                ),
                mergedPointCluster,
                ...currentSet.pointsHistory.slice( currentPointClusterIdx + 2
                )
            ]
        } else {
            newPointsHistory = [
                ...currentSet.pointsHistory.slice( 0,
                    currentPointClusterIdx
                ),
                ...currentSet.pointsHistory.slice( currentPointClusterIdx + 1
                )
            ]
        }

        newSetsHistory = [
            ...newState.stats.setsHistory.slice( 0,
                -1
            ),
            {
                ...currentSet,
                pointsHistory:
                    newPointsHistory
            }
        ]
    } else {
        newPointsHistory = [
            ...currentSet.pointsHistory.slice( 0,
                currentPointClusterIdx
            ),
            newPointCluster,
            ...currentSet.pointsHistory.slice( currentPointClusterIdx + 1
            )
        ]

        newSetsHistory = [
            ...newState.stats.setsHistory.slice( 0,
                -1
            ),
            {
                ...currentSet,
                pointsHistory:
                    newPointsHistory
            }
        ]
    }

    return {
        ...newState,

        stats: {
            ...newState.stats,
            setsHistory: newSetsHistory
        }
    }
}

export function resetCurrentSet( previous: GameState
): GameState {
    const newState: GameState = {
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

    if ( !previous.additionalFeatures.isMatchRecordingOn
    ) {
        return newState
    }

    return {
        ...newState,

        stats: {
            ...newState.stats,

            setsHistory: [
                ...newState.stats.setsHistory.slice( 0,
                    -1
                ),
                {
                    setNumber:
                        newState.stats.setsHistory[
                            newState.stats
                                .setsHistory.length - 1
                        ].setNumber,

                    pointsHistory: []
                }
            ]
        }
    }
}

export function resetMatch( previous: GameState
): GameState {
    return {
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
}

export function increaseSets( previous: GameState,
    team: TeamKey
): GameState {
    return {
        ...previous,

        [team]: {
            ...previous[team],
            setsWon:
                previous[team].setsWon + 1
        }
    }
}

export function decreaseSets( previous: GameState,
    team: TeamKey
): GameState {
    if ( previous[team].setsWon === 0
    ) {
        return previous
    }

    return {
        ...previous,

        [team]: {
            ...previous[team],
            setsWon:
                previous[team].setsWon - 1
        }
    }
}

export function toggleAutomaticRules( previous: GameState
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

export function startRecordMatch( previous: GameState
): GameState {
    const setOne: SetHistory = {
        setNumber: 1,
        pointsHistory: []
    }

    return {
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
}

export function stopRecordMatch( previous: GameState
): GameState {
    return {
        ...previous,

        additionalFeatures: {
            ...previous.additionalFeatures,
            isMatchRecordingOn: false
        },

        stats: {
            setsHistory: []
        }
    }
}

export function changeRule( previous: GameState,
    rule: RuleKey,
    amount: number
): GameState {
    const currentValue = previous.additionalFeatures[rule]

    const newValue = Math.max( 0,
            currentValue + amount
        )

    return {
        ...previous,

        additionalFeatures: {
            ...previous.additionalFeatures,
            [rule]: newValue
        }
    }
}

export function getCurrentSetLength( teamOneSetsWon: number,
    teamTwoSetsWon: number,
    setsToWin: number,
    setLength: number,
    finalSetLength: number
): number {
    const currentSet = teamOneSetsWon +
        teamTwoSetsWon +
        1

    const finalPossibleSet = setsToWin * 2 - 1

    if ( currentSet === finalPossibleSet
    ) {
        return finalSetLength
    }

    return setLength
}

export function hasWonSet( teamScore: number,
    opponentScore: number,
    state: GameState
): boolean {
    const targetScore = getCurrentSetLength( state.teamOne.setsWon,
            state.teamTwo.setsWon,
            state.additionalFeatures.setsToWin,
            state.additionalFeatures.setLength,
            state.additionalFeatures.finalSetLength
        )

    return ( teamScore >= targetScore &&
        teamScore >= opponentScore + 2
    )
}

export function hasWonGame( setsWon: number,
    setsToWin: number
): boolean {
    return setsWon >= setsToWin
}

export function endSet( previous: GameState,
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

    const matchIsOver = hasWonGame( newState[winningTeamKey].setsWon,
            newState.additionalFeatures.setsToWin
        )

    if ( !newState.additionalFeatures.isMatchRecordingOn
    ) {
        return newState
    }

    if (matchIsOver) {
        return newState
    }

    const currentSet = previous.stats.setsHistory[
            previous.stats.setsHistory.length - 1
        ]

    const nextSet: SetHistory = {
        setNumber:
            currentSet.setNumber + 1,
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

export function resolveAutomaticRules( state: GameState
): GameState {
    if ( !state.additionalFeatures.isAREnabled
    ) {
        return state
    }

    if ( hasWonSet( state.teamOne.score,
            state.teamTwo.score,
            state
        )
    ) {
        return endSet( state,
            "teamOne"
        )
    }

    if ( hasWonSet( state.teamTwo.score,
            state.teamOne.score,
            state
        )
    ) {
        return endSet( state,
            "teamTwo"
        )
    }

    return state
}

export function finishMatchState( completedState: GameState
): GameState {
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

export function buildGamePayload( completedState: GameState,
    dateTime: Date
) {
    return {
        teamOneName:
            completedState.teamOne.name,

        teamTwoName:
            completedState.teamTwo.name,

        teamOneSetsWon:
            completedState.teamOne.setsWon,

        teamTwoSetsWon:
            completedState.teamTwo.setsWon,

        date:
            dateTime.toLocaleDateString(),

        time:
            dateTime.toLocaleTimeString(),

        stats:
            completedState.additionalFeatures.isMatchRecordingOn
                ? completedState.stats
                : { setsHistory: [] }
    }
}