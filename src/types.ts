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
  isAREnabled: boolean
  setsToWin: number
  setLength: number
  finalSetLength: number
  isMatchRecordingOn: boolean
}

export type GameState = {
  teamOne: Team
  teamTwo: Team
  timer: TimerState
  additionalFeatures: AdditionalFeatures
  stats: Stats
}

export type Game = {
  id: number
  teamOneName: string
  teamTwoName: string
  teamOneSetsWon: number
  teamTwoSetsWon: number
  date: string
  time: string
  stats: Stats
}

export type PointCluster = {
  team: TeamKey
  points: number
}

export type SetHistory = {
  setNumber: number
  pointsHistory: PointCluster[]
}

export type Stats = {
  setsHistory: SetHistory[]
}