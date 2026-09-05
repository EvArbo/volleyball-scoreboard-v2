/*
express is what recieves and responds to incomming https requests
cors to allow for cross-site resource sharing, meant to protect against csrf attacks
pool lets you interact with postgres database
made vars that will receive and respond to incoming http requests and interact with volleyball_tracker database we have locally
port is where this http server (express variable) is on our computer
telling express to use json
how to respond to posts to /games endpoint: create an insert sql statement
telling express server to listen for https requests
*/

import express, { Request, Response } from 'express'
import cors from "cors"
import { Pool } from "pg"

const app = express ();
const pool = new Pool({
    database: "volleyball_tracker"
})
const PORT = process.env.PORT || 3000;

app.use(cors())
app.use(express.json());

app.post('/games', async (req: Request, res: Response) => {
    const {
        teamOneName,
        teamTwoName,
        teamOneSetsWon,
        teamTwoSetsWon
    } = req.body

    console.log(req.body)

    const result = await pool.query(
    `
    INSERT INTO games (
        team_one_name,
        team_two_name,
        team_one_sets_won,
        team_two_sets_won
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [
        teamOneName,
        teamTwoName,
        teamOneSetsWon,
        teamTwoSetsWon
    ]
    )

    res.json({
        message: "Game saved",
        games: result.rows[0]
    })
});

app.get('/games', async (req: Request, res: Response) => {
    console.log(req.body)

    const result = await pool.query(
    `
    SELECT 
        id,
        team_one_name,
        team_two_name,
        team_one_sets_won,
        team_two_sets_won
        from games;

    `
    )

    res.json({
        message: "Game retrieved",
        games: result.rows
    })
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})