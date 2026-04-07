import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { fetchProjects } from '../api'
import type { Project } from '../types'
import BingoBoard, { STEAM_SUBJECTS } from './BingoBoard'
import type { BingoCellData } from './BingoCell'
import BingoProjectDrawer from './BingoProjectDrawer'
import CartDrawer from './CartDrawer'
import '../styles/app.css'
import '../styles/bingo.css'

type Screen = 'loading' | 'board' | 'error'

function categorizeProject(project: Project): number {
  const text = `${project.subject} ${project.title}`.toLowerCase()
  for (let i = 0; i < STEAM_SUBJECTS.length; i++) {
    if (STEAM_SUBJECTS[i].keywords.some(kw => text.includes(kw))) {
      return i
    }
  }
  return -1
}

function buildGrid(projects: Project[]): BingoCellData[][] {
  const buckets: Project[][] = [[], [], [], [], []]
  const overflow: Project[] = []

  for (const p of projects) {
    const idx = categorizeProject(p)
    if (idx >= 0 && buckets[idx].length < 5) {
      buckets[idx].push(p)
    } else {
      overflow.push(p)
    }
  }

  // Fill under-stocked buckets from overflow pool
  for (let row = 0; row < 5; row++) {
    while (buckets[row].length < 5 && overflow.length > 0) {
      buckets[row].push(overflow.shift()!)
    }
  }

  return buckets.map(rowProjects =>
    Array.from({ length: 5 }, (_, col) => ({
      project: rowProjects[col] ?? null,
      marked: false,
    }))
  )
}

function checkBingo(grid: BingoCellData[][]): [number, number][][] {
  const lines: [number, number][][] = []

  // Rows
  for (let r = 0; r < 5; r++) {
    if (grid[r].every(cell => cell.marked && cell.project)) {
      lines.push(grid[r].map((_, c) => [r, c] as [number, number]))
    }
  }

  // Columns
  for (let c = 0; c < 5; c++) {
    if (grid.every(row => row[c].marked && row[c].project)) {
      lines.push(grid.map((_, r) => [r, c] as [number, number]))
    }
  }

  // Diagonal top-left → bottom-right
  if (Array.from({ length: 5 }, (_, i) => i).every(i => grid[i][i].marked && grid[i][i].project)) {
    lines.push(Array.from({ length: 5 }, (_, i) => [i, i] as [number, number]))
  }

  // Diagonal top-right → bottom-left
  if (Array.from({ length: 5 }, (_, i) => i).every(i => grid[i][4 - i].marked && grid[i][4 - i].project)) {
    lines.push(Array.from({ length: 5 }, (_, i) => [i, 4 - i] as [number, number]))
  }

  return lines
}

export default function BingoApp() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<Screen>('loading')
  const [grid, setGrid] = useState<BingoCellData[][]>([])
  const [cart, setCart] = useState<Project[]>([])
  const [amounts, setAmounts] = useState<Record<string, number>>({})
  const [cartOpen, setCartOpen] = useState(false)
  const [bingoLines, setBingoLines] = useState<[number, number][][]>([])
  const [hasBingo, setHasBingo] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)

  const load = useCallback(async () => {
    setScreen('loading')
    setHasBingo(false)
    setBingoLines([])
    setCart([])
    setAmounts({})
    try {
      const projects = await fetchProjects({})
      if (projects.length === 0) throw new Error('No projects found')
      setGrid(buildGrid(projects))
      setScreen('board')
    } catch {
      setScreen('error')
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCellClick = useCallback((row: number, col: number) => {
    const cell = grid[row]?.[col]
    if (!cell?.project) return
    setSelectedCell({ row, col })
  }, [grid])

  const handleMark = useCallback((row: number, col: number, amount: number) => {
    setGrid(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })))
      const cell = next[row][col]
      if (!cell.project) return prev

      if (!cell.marked) {
        cell.marked = true
        setCart(c => [...c, cell.project!])
        setAmounts(a => ({ ...a, [cell.project!.id]: amount }))
      } else {
        cell.marked = false
        setCart(c => c.filter(p => p.id !== cell.project!.id))
        setAmounts(a => { const n = { ...a }; delete n[cell.project!.id]; return n })
      }

      const newLines = checkBingo(next)
      setBingoLines(newLines)
      if (newLines.length > 0) setHasBingo(true)

      return next
    })
    setSelectedCell(null)
  }, [grid])

  const selectedProject = selectedCell
    ? grid[selectedCell.row]?.[selectedCell.col]?.project ?? null
    : null

  const selectedMarked = selectedCell
    ? grid[selectedCell.row]?.[selectedCell.col]?.marked ?? false
    : false

  return (
    <div className="bingo-screen">
      {screen === 'loading' && (
        <div className="bingo-loading">
          <div className="bingo-loading-emoji">🎱</div>
          <p>Loading your STEAM Bingo card…</p>
        </div>
      )}

      {screen === 'error' && (
        <div className="bingo-error">
          <div className="bingo-error-emoji">😬</div>
          <h2>Couldn't load projects</h2>
          <p>Check your connection and try again.</p>
          <button className="bingo-retry-btn" onClick={load}>Try again</button>
        </div>
      )}

      {screen === 'board' && (
        <>
          <header className="bingo-header">
            <div className="bingo-header-left">
              <button className="bingo-home-btn" onClick={() => navigate('/')}>🏠 Home</button>
              <h1 className="bingo-title">🎱 STEAM Bingo</h1>
            </div>
            <button className="bingo-cart-btn" onClick={() => setCartOpen(true)}>
              🛒 Cart
              {cart.length > 0 && (
                <span className="bingo-cart-badge">{cart.length}</span>
              )}
            </button>
          </header>

          <AnimatePresence>
            {hasBingo && (
              <div className="bingo-toast">
                🎉 BINGO! You funded a full line of classrooms!
              </div>
            )}
          </AnimatePresence>

          <BingoBoard
            grid={grid}
            bingoLines={bingoLines}
            onCellClick={handleCellClick}
          />
        </>
      )}

      <AnimatePresence>
        {selectedCell && selectedProject && (
          <BingoProjectDrawer
            project={selectedProject}
            marked={selectedMarked}
            onMark={(amount) => handleMark(selectedCell.row, selectedCell.col, amount)}
            onClose={() => setSelectedCell(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            cart={cart}
            amounts={amounts}
            onAmountChange={(id, amount) => setAmounts(a => ({ ...a, [id]: amount }))}
            onRemove={id => {
              setCart(c => c.filter(p => p.id !== id))
              setAmounts(a => { const n = { ...a }; delete n[id]; return n })
              setGrid(prev => prev.map(row =>
                row.map(cell =>
                  cell.project?.id === id ? { ...cell, marked: false } : cell
                )
              ))
            }}
            onClose={() => setCartOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
