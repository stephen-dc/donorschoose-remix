import { useRef, useEffect, useCallback, useState } from 'react'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'
import { useNavigate } from 'react-router-dom'
import '../styles/ascii-art.css'

// --- ASCII art definitions ---
const ASCII_PIECES = [
  {
    id: 'cat',
    lines: [
      '  /\\_/\\  ',
      ' ( o.o ) ',
      '  > ^ <  ',
      ' /|   |\\',
      '(_|   |_)',
    ],
    x: 20,
    y: 40,
    color: '#ff6b9d',
  },
  {
    id: 'heart',
    lines: [
      ' ♥♥   ♥♥ ',
      '♥♥♥♥ ♥♥♥♥',
      '♥♥♥♥♥♥♥♥♥',
      ' ♥♥♥♥♥♥♥ ',
      '  ♥♥♥♥♥  ',
      '   ♥♥♥   ',
      '    ♥    ',
    ],
    x: 260,
    y: 30,
    color: '#ff4757',
  },
  {
    id: 'star-cluster',
    lines: [
      '  ✦   ✧  ',
      ' ✧ ★ ✦   ',
      '✦  ✧  ★ ✧',
      ' ★  ✦  ✧ ',
      '  ✧ ★ ✦  ',
    ],
    x: 140,
    y: 180,
    color: '#ffd700',
  },
  {
    id: 'anime-face',
    lines: [
      '  .-"""-.  ',
      ' /  ◕  ◕ \\ ',
      '|    △    |',
      ' \\  ╰╯  / ',
      '  \'-----\'  ',
      '   |   |   ',
    ],
    x: 30,
    y: 320,
    color: '#a29bfe',
  },
  {
    id: 'sparkle-grid',
    lines: [
      '✧ · ✦ · ✧ · ✦',
      '· ✦ · ✧ · ✦ · ',
      '✦ · ✧ · ✦ · ✧',
      '· ✧ · ✦ · ✧ · ',
      '✧ · ✦ · ✧ · ✦',
    ],
    x: 180,
    y: 460,
    color: '#74b9ff',
  },
  {
    id: 'bunny',
    lines: [
      ' (\\(\\  ',
      ' ( -.-)  ',
      ' o_(")(") ',
    ],
    x: 50,
    y: 560,
    color: '#fd79a8',
  },
  {
    id: 'sakura',
    lines: [
      '  🌸    🌸  ',
      '🌸  🌸🌸  🌸',
      '  🌸    🌸  ',
      '    🌸🌸    ',
    ],
    x: 230,
    y: 290,
    color: '#fab1a0',
  },
  {
    id: 'katana',
    lines: [
      '     />  ',
      '    /  フ',
      '   |  _  _|',
      '   /`ミ _x ノ',
      '  /      |',
      ' /  ヽ   ﾉ',
      ' │  | | |',
      ' /￣|   | |',
      '(￣ヽ＿_ヽ_)__)',
    ],
    x: 240,
    y: 570,
    color: '#dfe6e9',
  },
  {
    id: 'diamond',
    lines: [
      '    /\\    ',
      '   /  \\   ',
      '  / ◆◆ \\  ',
      ' / ◆◆◆◆ \\ ',
      ' \\ ◆◆◆◆ / ',
      '  \\ ◆◆ /  ',
      '   \\  /   ',
      '    \\/    ',
    ],
    x: 100,
    y: 700,
    color: '#00cec9',
  },
  {
    id: 'tiny-stars',
    lines: [
      '★  ·  ★',
      ' · ★ · ',
      '★  ·  ★',
    ],
    x: 310,
    y: 770,
    color: '#fdcb6e',
  },
]

const FONT = '14px "Courier New", monospace'
const LINE_HEIGHT = 18
const CHAR_WIDTH = 8.4 // monospace approximate
const SQUARE_SIZE = 60
const GRAVITY = 0.4
const BOUNCE = 0.5
const FRICTION = 0.98
const REPEL_RADIUS = 90
const REPEL_FORCE = 12
const SPRING = 0.08
const DAMPING = 0.85

type CharData = {
  char: string
  baseX: number
  baseY: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  pieceId: string
}

type PhysicsSquare = {
  x: number
  y: number
  vx: number
  vy: number
  dragging: boolean
}

export default function AsciiArtDemo() {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const charsRef = useRef<CharData[]>([])
  const squareRef = useRef<PhysicsSquare>({ x: 176, y: -80, vx: 0, vy: 0, dragging: false })
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const animRef = useRef<number>(0)
  const [ready, setReady] = useState(false)

  // Measure ASCII art with pretext and build character array
  useEffect(() => {
    const chars: CharData[] = []

    for (const piece of ASCII_PIECES) {
      let cy = piece.y
      for (const line of piece.lines) {
        // Use pretext to measure the line precisely
        const prepared = prepareWithSegments(line, FONT)
        const result = layoutWithLines(prepared, 9999, LINE_HEIGHT)

        // Walk characters and compute x positions
        let cx = piece.x
        if (result.lines.length > 0) {
          // Use measured line width to verify, but position char-by-char
          const lineText = result.lines[0]!.text
          for (let i = 0; i < lineText.length; i++) {
            const ch = lineText[i]!
            if (ch !== ' ') {
              // Measure individual character width with pretext
              const charPrepared = prepareWithSegments(ch, FONT)
              const charResult = layoutWithLines(charPrepared, 9999, LINE_HEIGHT)
              const charW = charResult.lines.length > 0 ? charResult.lines[0]!.width : CHAR_WIDTH

              chars.push({
                char: ch,
                baseX: cx,
                baseY: cy,
                x: cx,
                y: cy,
                vx: 0,
                vy: 0,
                color: piece.color,
                pieceId: piece.id,
              })
              cx += charW
            } else {
              cx += CHAR_WIDTH
            }
          }
        }
        cy += LINE_HEIGHT
      }
    }

    charsRef.current = chars
    setReady(true)
  }, [])

  // Physics loop
  const tick = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const sq = squareRef.current
    const chars = charsRef.current

    // --- Square physics ---
    if (!sq.dragging) {
      sq.vy += GRAVITY
      sq.vx *= FRICTION
      sq.vy *= FRICTION
      sq.x += sq.vx
      sq.y += sq.vy

      // Floor bounce
      if (sq.y + SQUARE_SIZE > H - 20) {
        sq.y = H - 20 - SQUARE_SIZE
        sq.vy *= -BOUNCE
        if (Math.abs(sq.vy) < 1) sq.vy = 0
      }
      // Walls
      if (sq.x < 0) { sq.x = 0; sq.vx *= -BOUNCE }
      if (sq.x + SQUARE_SIZE > W) { sq.x = W - SQUARE_SIZE; sq.vx *= -BOUNCE }
      // Ceiling
      if (sq.y < 0) { sq.y = 0; sq.vy *= -BOUNCE }
    }

    const sqCenterX = sq.x + SQUARE_SIZE / 2
    const sqCenterY = sq.y + SQUARE_SIZE / 2

    // --- Character physics ---
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i]!
      const dx = c.x - sqCenterX
      const dy = c.y - sqCenterY
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Repulsion from square
      if (dist < REPEL_RADIUS && dist > 0.1) {
        const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE
        c.vx += (dx / dist) * force
        c.vy += (dy / dist) * force
      }

      // Spring back to base position
      const restoreDx = c.baseX - c.x
      const restoreDy = c.baseY - c.y
      c.vx += restoreDx * SPRING
      c.vy += restoreDy * SPRING

      // Damping
      c.vx *= DAMPING
      c.vy *= DAMPING

      c.x += c.vx
      c.y += c.vy
    }

    // --- Render ---
    ctx.clearRect(0, 0, W, H)

    // Background subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.lineWidth = 1
    for (let gx = 0; gx < W; gx += 20) {
      ctx.beginPath()
      ctx.moveTo(gx, 0)
      ctx.lineTo(gx, H)
      ctx.stroke()
    }
    for (let gy = 0; gy < H; gy += 20) {
      ctx.beginPath()
      ctx.moveTo(0, gy)
      ctx.lineTo(W, gy)
      ctx.stroke()
    }

    // Draw characters
    ctx.font = FONT
    ctx.textBaseline = 'top'
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i]!
      const displacement = Math.sqrt((c.x - c.baseX) ** 2 + (c.y - c.baseY) ** 2)
      const alpha = Math.min(1, 0.7 + displacement * 0.02)
      ctx.fillStyle = c.color + alphaHex(alpha)
      // Slight glow for displaced chars
      if (displacement > 3) {
        ctx.shadowColor = c.color
        ctx.shadowBlur = Math.min(12, displacement * 0.5)
      } else {
        ctx.shadowBlur = 0
      }
      ctx.fillText(c.char, c.x, c.y)
    }
    ctx.shadowBlur = 0

    // Draw the physics square
    const squareGrad = ctx.createLinearGradient(sq.x, sq.y, sq.x + SQUARE_SIZE, sq.y + SQUARE_SIZE)
    squareGrad.addColorStop(0, '#6c5ce7')
    squareGrad.addColorStop(1, '#a29bfe')
    ctx.fillStyle = squareGrad
    ctx.shadowColor = '#6c5ce7'
    ctx.shadowBlur = 20
    ctx.beginPath()
    ctx.roundRect(sq.x, sq.y, SQUARE_SIZE, SQUARE_SIZE, 8)
    ctx.fill()
    ctx.shadowBlur = 0

    // Square label
    ctx.fillStyle = '#fff'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('drag me', sq.x + SQUARE_SIZE / 2, sq.y + SQUARE_SIZE / 2)
    ctx.textAlign = 'start'
    ctx.textBaseline = 'top'
    ctx.font = FONT

    animRef.current = requestAnimationFrame(tick)
  }, [])

  // Start animation
  useEffect(() => {
    if (!ready) return
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [ready, tick])

  // Pointer events for dragging
  const getPos = useCallback((e: React.PointerEvent | PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const pos = getPos(e)
    const sq = squareRef.current
    if (
      pos.x >= sq.x && pos.x <= sq.x + SQUARE_SIZE &&
      pos.y >= sq.y && pos.y <= sq.y + SQUARE_SIZE
    ) {
      sq.dragging = true
      sq.vx = 0
      sq.vy = 0
      dragOffsetRef.current = { x: pos.x - sq.x, y: pos.y - sq.y }
      canvasRef.current?.setPointerCapture(e.pointerId)
    }
  }, [getPos])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const sq = squareRef.current
    if (!sq.dragging) return
    const pos = getPos(e)
    const newX = pos.x - dragOffsetRef.current.x
    const newY = pos.y - dragOffsetRef.current.y
    sq.vx = newX - sq.x
    sq.vy = newY - sq.y
    sq.x = newX
    sq.y = newY
  }, [getPos])

  const onPointerUp = useCallback(() => {
    squareRef.current.dragging = false
  }, [])

  return (
    <div className="ascii-demo" ref={containerRef}>
      <button className="ascii-demo-back" onClick={() => navigate('/')}>
        ← back
      </button>
      <h1 className="ascii-demo-title">ASCII Physics</h1>
      <p className="ascii-demo-subtitle">drag the square to disrupt the art</p>
      <canvas
        ref={canvasRef}
        className="ascii-demo-canvas"
        width={412}
        height={820}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </div>
  )
}

function alphaHex(a: number): string {
  const byte = Math.round(Math.min(1, Math.max(0, a)) * 255)
  return byte.toString(16).padStart(2, '0')
}
