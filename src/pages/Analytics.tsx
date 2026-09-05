import type { Game } from "../types"
import { useEffect, useRef, useState } from 'react'

function Analytics() {
  const [games, setGames] = useState<Game[]>([])

  useEffect(() => {
    getGames()
  }, [])

  async function getGames() {
      /*
      made game object to send, sent and storing response,
      once response happens data stores response, print response
      */
  
      const response = await fetch("http://localhost:3000/games", {
        method: "GET"
      })
  
      const data = await response.json()
  
      setGames(data.games)
    }

    console.log("games state:", games)

  return (
    <main>
      <h1>Analytics</h1>
      <div>
      {games.map((game) => (
        <p key={game.id}>
          {game.team_one_name} vs {game.team_two_name}
          <br />
          {game.team_one_sets_won} to {game.team_two_sets_won}
        </p>
      ))}
      </div>
    </main>
  )
}

export default Analytics