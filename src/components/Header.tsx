import { Link } from "react-router-dom"

function Header() {
  return (
    <header>
      <nav aria-label="Main navigation">
        <Link to="/">Home</Link>
        <Link to="/scoreboard">Scoreboard</Link>
        <Link to="/analytics">Analytics</Link>
        <a href="#">More</a>
      </nav>
    </header>
  )
}

export default Header