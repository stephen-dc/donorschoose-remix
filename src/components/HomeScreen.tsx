import { useNavigate } from 'react-router-dom'
import '../styles/home.css'

const APPS = [
  {
    id: 'tinder',
    emoji: '🔥',
    title: 'DC Tinder',
    tagline: 'Swipe right on classrooms',
    description: 'Browse DonorsChoose projects like a dating app. Swipe right to fund, left to skip.',
    path: '/tinder',
    gradient: 'linear-gradient(135deg, #fd267a 0%, #ff6036 100%)',
  },
  {
    id: 'roulette',
    emoji: '🎰',
    title: 'DC Roulette',
    tagline: 'Let fate pick your classroom',
    description: 'Spin the wheel and let chance decide which classroom you fund today.',
    path: '/roulette',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
  },
  {
    id: 'picks',
    emoji: '🏆',
    title: 'DC Picks',
    tagline: 'Put your dollars where they matter',
    description: 'Set a budget. For each dollar, vote between two projects. See where your money lands.',
    path: '/picks',
    gradient: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
  },
  {
    id: 'bracket',
    emoji: '🥊',
    title: 'DC Bracket',
    tagline: 'May the best classroom win',
    description: '8 classrooms enter. Only one gets funded. Vote in head-to-head matchups until a champion emerges.',
    path: '/bracket',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
  },
  {
    id: 'feed',
    emoji: '📱',
    title: 'DC Feed',
    tagline: 'Scroll your way to impact',
    description: 'TikTok-style vertical feed. Scroll through classroom projects, heart the ones you love, checkout in seconds.',
    path: '/feed',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #a3e635 100%)',
  },
]

export default function HomeScreen() {
  const navigate = useNavigate()

  return (
    <div className="home-screen">
      <header className="home-header">
        <div className="home-logo">🍎</div>
        <h1 className="home-title">DonorsChoose Remix</h1>
        <p className="home-subtitle">Good ideas, bad ideas, and everything in between</p>
      </header>

      <main className="home-grid">
        {APPS.map(app => (
          <button
            key={app.id}
            className="app-card"
            style={{ background: app.gradient }}
            onClick={() => navigate(app.path)}
          >
            <div className="app-card-emoji">{app.emoji}</div>
            <div className="app-card-body">
              <h2 className="app-card-title">{app.title}</h2>
              <p className="app-card-tagline">{app.tagline}</p>
              <p className="app-card-description">{app.description}</p>
            </div>
            <div className="app-card-arrow">→</div>
          </button>
        ))}
      </main>

      <footer className="home-footer">
        <p>Powered by <a href="https://www.donorschoose.org" target="_blank" rel="noopener noreferrer">DonorsChoose</a></p>
      </footer>
    </div>
  )
}
