import { Fragment } from 'react'
import BingoCell, { type BingoCellData } from './BingoCell'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export const STEAM_SUBJECTS = [
  { key: 'S', label: 'Science',     emoji: '🔬', color: '#0ea5e9',
    keywords: ['science', 'environment', 'biology', 'chemistry', 'physics'] },
  { key: 'T', label: 'Technology',  emoji: '💻', color: '#8b5cf6',
    keywords: ['technology', 'computer', 'coding', 'digital', 'stem'] },
  { key: 'E', label: 'Engineering', emoji: '⚙️', color: '#f59e0b',
    keywords: ['engineering', 'applied learning', 'maker', 'robotics'] },
  { key: 'A', label: 'Arts',        emoji: '🎨', color: '#ec4899',
    keywords: ['art', 'music', 'visual', 'theater', 'dance', 'literature', 'writing'] },
  { key: 'M', label: 'Math',        emoji: '🔢', color: '#10b981',
    keywords: ['math', 'mathematics', 'algebra', 'geometry', 'numeracy'] },
]

interface Props {
  grid: BingoCellData[][]
  bingoLines: [number, number][][]
  onCellClick: (row: number, col: number) => void
}

function isCellInBingoLine(
  row: number,
  col: number,
  bingoLines: [number, number][][],
): boolean {
  return bingoLines.some(line => line.some(([r, c]) => r === row && c === col))
}

export default function BingoBoard({ grid, bingoLines, onCellClick }: Props) {
  return (
    <div className="bingo-board-wrapper">
      <div className="bingo-board">
        {/* Top-left corner spacer */}
        <div />

        {/* Column headers */}
        {DAYS.map(day => (
          <div key={day} className="bingo-col-header">
            <span className="bingo-col-header-day">{day}</span>
          </div>
        ))}

        {/* Rows */}
        {STEAM_SUBJECTS.map((subject, rowIdx) => (
          <Fragment key={subject.key}>
            {/* Row header */}
            <div
              className="bingo-row-header"
              style={{ background: `${subject.color}22` }}
              title={subject.label}
            >
              <span className="bingo-row-header-emoji">{subject.emoji}</span>
              <span className="bingo-row-header-key" style={{ color: subject.color }}>
                {subject.key}
              </span>
            </div>

            {/* Cells for this row */}
            {DAYS.map((_, colIdx) => (
              <BingoCell
                key={`${rowIdx}-${colIdx}`}
                cell={grid[rowIdx]?.[colIdx] ?? { project: null, marked: false }}
                isBingoLine={isCellInBingoLine(rowIdx, colIdx, bingoLines)}
                onClick={() => onCellClick(rowIdx, colIdx)}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
