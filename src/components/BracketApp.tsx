import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProjects, type SearchParams } from '../api'
import type { Project } from '../types'
import SearchScreen from './SearchScreen'
import BracketMatchup from './BracketMatchup'
import BracketChampion from './BracketChampion'
import { buildCartUrl } from '../utils/cartUrl'
import '../styles/app.css'
import '../styles/bracket.css'

type BracketScreen = 'search' | 'matchup' | 'champion'

export default function BracketApp() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<BracketScreen>('search')
  const [remaining, setRemaining] = useState<Project[]>([])
  const [roundWinners, setRoundWinners] = useState<Project[]>([])
  const [matchupIndex, setMatchupIndex] = useState(0)
  const [round, setRound] = useState(1)
  const [champion, setChampion] = useState<Project | null>(null)
  const [budget, setBudget] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(async (params: SearchParams) => {
    setLoading(true)
    setError(null)
    try {
      const results = await fetchProjects(params)
      if (results.length < 2) {
        setError('Not enough projects found for that location. Try a different city or state.')
        return
      }
      // Need a power of 2; take up to 8, pad down if needed to nearest power of 2
      const pool = results.slice(0, 8)
      const size = [8, 4, 2].find(n => pool.length >= n) ?? 2
      setRemaining(pool.slice(0, size))
      setRoundWinners([])
      setMatchupIndex(0)
      setRound(1)
      setChampion(null)
      setBudget(params.budget ?? null)
      setScreen('matchup')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handlePick = useCallback((winner: Project) => {
    const newWinners = [...roundWinners, winner]
    const nextIndex = matchupIndex + 1

    if (nextIndex * 2 >= remaining.length) {
      // Round is over
      if (newWinners.length === 1) {
        // Final just played — we have a champion
        setChampion(newWinners[0])
        setScreen('champion')
      } else {
        // Advance to next round
        setRemaining(newWinners)
        setRoundWinners([])
        setMatchupIndex(0)
        setRound(r => r + 1)
      }
    } else {
      setRoundWinners(newWinners)
      setMatchupIndex(nextIndex)
    }
  }, [roundWinners, matchupIndex, remaining])

  const handleReset = useCallback(() => {
    setScreen('search')
    setRemaining([])
    setRoundWinners([])
    setMatchupIndex(0)
    setRound(1)
    setChampion(null)
    setBudget(null)
  }, [])

  const currentPair = remaining.length >= 2
    ? [remaining[matchupIndex * 2], remaining[matchupIndex * 2 + 1]] as [Project, Project]
    : null

  return (
    <>
      {screen === 'search' && (
        <SearchScreen
          onSearch={handleSearch}
          loading={loading}
          error={error}
          title="DC Bracket"
          tagline="May the best classroom win"
          emoji="🥊"
          accentClass="search-screen--bracket"
          onHome={() => navigate('/')}
          showBudget
        />
      )}

      {screen === 'matchup' && currentPair && (
        <BracketMatchup
          pair={currentPair}
          round={round}
          matchupIndex={matchupIndex}
          totalMatchups={remaining.length / 2}
          onPick={handlePick}
          onHome={() => navigate('/')}
        />
      )}

      {screen === 'champion' && champion && (
        <BracketChampion
          project={champion}
          budget={budget}
          onFund={() => {
            window.location.href = buildCartUrl([{
              proposalId: champion.id,
              amount: budget ?? champion.costToComplete,
            }])
          }}
          onPlayAgain={handleReset}
          onHome={() => navigate('/')}
        />
      )}
    </>
  )
}
