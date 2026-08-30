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
}