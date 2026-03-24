import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './components/HomeScreen'
import SwipeApp from './components/SwipeApp'
import RouletteApp from './components/RouletteApp'
import PicksApp from './components/PicksApp'
import BracketApp from './components/BracketApp'
import FeedApp from './components/FeedApp'
import VersusApp from './components/VersusApp'
import QuizApp from './components/QuizApp'
import SmellsApp from './components/SmellsApp'

export default function RouterRoot() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/swipe" element={<SwipeApp />} />
        <Route path="/roulette" element={<RouletteApp />} />
        <Route path="/picks" element={<PicksApp />} />
        <Route path="/bracket" element={<BracketApp />} />
        <Route path="/feed" element={<FeedApp />} />
        <Route path="/versus" element={<VersusApp />} />
        <Route path="/quiz" element={<QuizApp />} />
        <Route path="/smells" element={<SmellsApp />} />
      </Routes>
    </BrowserRouter>
  )
}
