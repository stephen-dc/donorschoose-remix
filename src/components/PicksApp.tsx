import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProjects } from '../api'
import type { Project } from '../types'
import BudgetScreen from './BudgetScreen'
import PicksVsScreen from './PicksVsScreen'
import PicksResultsScreen from './PicksResultsScreen'
import '../styles/app.css'
import '../styles/picks.css'

type PicksScreen = 'budget' | 'pick' | 'results'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickPair(projects: Project[]): [Project, Project] {
  const i = Math.floor(Math.random() * projects.length)
  let j = Math.floor(Math.random() * (projects.length - 1))
  if (j >= i) j++
  return [projects[i], projects[j]]
}

export default function PicksApp() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<PicksScreen>('budget')
  const [projects, setProjects] = useState<Project[]>([])
  const [budget, setBudget] = useState(0)
  const [round, setRound] = useState(0)
  const [pair, setPair] = useState<[Project, Project] | null>(null)
  const [pickMap, setPickMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = useCallback(async ({
    city,
    state,
    budget: b,
  }: { city: string; state: string; budget: number }) => {
    setLoading(true)
    setError(null)
    try {
      const results = await fetchProjects({ city, state })
      if (results.length < 2) {
        setError('Not enough projects found. Try a different location.')
        return
      }
      const pool = shuffle(results)
      setBudget(b)
      setProjects(pool)
      setRound(0)
      setPickMap({})
      setPair(pickPair(pool))
      setScreen('pick')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handlePick = useCallback((winner: Project) => {
    setPickMap(prev => ({
      ...prev,
      [winner.id]: (prev[winner.id] ?? 0) + 1,
    }))

    setRound(prev => {
      const next = prev + 1
      if (next >= budget) {
        setScreen('results')
      } else {
        setPair(pickPair(projects))
      }
      return next
    })
  }, [budget, projects])

  const handlePlayAgain = useCallback(() => {
    setScreen('budget')
    setProjects([])
    setBudget(0)
    setRound(0)
    setPair(null)
    setPickMap({})
  }, [])

  return (
    <>
      {screen === 'budget' && (
        <BudgetScreen
          onStart={handleStart}
          loading={loading}
          error={error}
          onHome={() => navigate('/')}
        />
      )}

      {screen === 'pick' && pair && (
        <PicksVsScreen
          pair={pair}
          round={round}
          budget={budget}
          onPick={handlePick}
          onHome={() => navigate('/')}
        />
      )}

      {screen === 'results' && (
        <PicksResultsScreen
          projects={projects}
          pickMap={pickMap}
          budget={budget}
          onPlayAgain={handlePlayAgain}
          onHome={() => navigate('/')}
        />
      )}
    </>
  )
}
