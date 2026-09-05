export type TeamKey = "teamOne" | "teamTwo"

export type Team = {
  name: string
  score: number
  setsWon: number
}

export type TimerState = {
  initialTimerSeconds: number
  remainingSeconds: number
  isTimerRunning: boolean
  toggleButton: string
}

export type AdditionalFeatures = {
  automaticRulesState: string
  isAREnabled: boolean
  setsToWin: number
  setLength: number
  finalSetLength: number
}

export type GameState = {
  teamOne: Team
  teamTwo: Team
  timer: TimerState
  additionalFeatures: AdditionalFeatures
  setHistory: SetHistory[]
}

export type Game = {
  id: number
  team_one_name: string
  team_two_name: string
  team_one_sets_won: number
  team_two_sets_won: number
}

export type PointCluster = {
  team: TeamKey
  pointsScored: number
}

export type SetHistory = {
  setNumber: number
  pointHistory: PointCluster[]
}