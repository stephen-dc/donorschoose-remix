import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './components/HomeScreen'
import TinderApp from './components/TinderApp'
import RouletteApp from './components/RouletteApp'
import PicksApp from './components/PicksApp'
import BracketApp from './components/BracketApp'
import FeedApp from './components/FeedApp'
import VersusApp from './components/VersusApp'

export default function RouterRoot() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/tinder" element={<TinderApp />} />
        <Route path="/roulette" element={<RouletteApp />} />
        <Route path="/picks" element={<PicksApp />} />
        <Route path="/bracket" element={<BracketApp />} />
        <Route path="/feed" element={<FeedApp />} />
        <Route path="/versus" element={<VersusApp />} />
      </Routes>
    </BrowserRouter>
  )
}
