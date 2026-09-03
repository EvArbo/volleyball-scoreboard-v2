import { Link } from "react-router-dom"

function Header() {
  return (
    <header>
      <nav aria-label="Main navigation">
        <a href="#">Home</a>
        <Link to="/">Scoreboard</Link>
        <Link to="/analytics">Analytics</Link>
        <a href="#">More</a>
      </nav>
    </header>
  )
}

export default Header