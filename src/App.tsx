import { Routes, Route } from "react-router-dom"

import Header from './components/Header.tsx'
import Home from './pages/Home.tsx'
import Analytics from "./pages/Analytics.tsx"
import Scoreboard from "./pages/Scoreboard.tsx"

import './App.css'

function App() {

  return (
    <>
      <Header />

      <Routes>
        <Route path ="/" element={<Home />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>

      
    </>
  )
}

export default App
