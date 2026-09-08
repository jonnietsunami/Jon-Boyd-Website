import { useEffect, useMemo, useRef, useState } from 'react'
import { ClubStage, Crowd, JonSprite, PopcornSprite, TomatoSprite } from './tough-crowd/Artwork'
import './tough-crowd/game.css'

type Tomato = { id: number; x: number; y: number; vx: number; vy: number }
type Popcorn = { id: number; x: number; y: number }

const ROUND_LENGTH = 45
const ROUND_LABELS = ['OPENER', 'FEATURE', 'HEADLINER']

export function ToughCrowdGame() {
  const arenaRef = useRef<HTMLDivElement>(null)
  const keys = useRef({ left: false, right: false })
  const tomatoId = useRef(0)
  const popcornId = useRef(0)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [round, setRound] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_LENGTH)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [playerX, setPlayerX] = useState(50)
  const [tomatoes, setTomatoes] = useState<Tomato[]>([])
  const [popcorn, setPopcorn] = useState<Popcorn[]>([])
  const [heckle, setHeckle] = useState('')

  const heckles = useMemo(
    () => [
      ['HEARD THAT ONE BEFORE!', 'THAT WAS THE PUNCHLINE?', 'DO THE FUNNY ONE!', 'YOU GOT ANY CROWD WORK?'],
      ['GET NEW MATERIAL!', 'MY FRIEND SAID YOU WERE GOOD!', 'BRING BACK THE OPENER!', 'THAT WORKED BETTER ONLINE!'],
      ['WE PAID FOR THIS?', 'MY UBER IS OUTSIDE!', 'REFUND!', 'THIS IS THE HEADLINER?!'],
    ],
    [],
  )

  const resetGame = () => {
    setStarted(false)
    setGameOver(false)
    setWon(false)
    setRound(0)
    setTimeLeft(ROUND_LENGTH)
    setScore(0)
    setLives(3)
    setPlayerX(50)
    setTomatoes([])
    setPopcorn([])
    setHeckle('')
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.current.left = true
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.current.right = true
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.current.left = false
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.current.right = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useEffect(() => {
    if (!started || gameOver || won) return
    const timer = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t > 1) return t - 1
        if (round < 2) {
          setRound((r) => r + 1)
          return ROUND_LENGTH
        }
        setWon(true)
        return 0
      })
      setScore((s) => s + 10)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [started, gameOver, won, round])

  useEffect(() => {
    if (!started || gameOver || won) return
    let raf = 0
    let last = performance.now()
    let spawnClock = 0
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      spawnClock += dt

      setPlayerX((x) => {
        let next = x
        if (keys.current.left) next -= 42 * dt
        if (keys.current.right) next += 42 * dt
        return Math.max(7, Math.min(93, next))
      })

      const spawnEvery = [0.95, 0.7, 0.5][round]
      if (spawnClock >= spawnEvery) {
        spawnClock = 0
        const startX = 8 + Math.random() * 84
        const targetX = playerX + (Math.random() - 0.5) * [18, 12, 8][round]
        setTomatoes((ts) => [
          ...ts,
          {
            id: tomatoId.current++,
            x: startX,
            y: 8,
            vx: (targetX - startX) * 0.55,
            vy: 52 + round * 6 + Math.random() * 8,
          },
        ])
      }

      setTomatoes((ts) =>
        ts
          .map((t) => ({ ...t, x: t.x + t.vx * dt, y: t.y + t.vy * dt }))
          .filter((t) => t.y < 96),
      )

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [started, gameOver, won, round, playerX])

  useEffect(() => {
    if (!started || gameOver || won) return
    for (const t of tomatoes) {
      if (Math.abs(t.x - playerX) < 4.2 && t.y > 67 && t.y < 84) {
        setTomatoes((ts) => ts.filter((x) => x.id !== t.id))
        setLives((l) => {
          const next = l - 1
          if (next <= 0) setGameOver(true)
          return next
        })
        setHeckle(heckles[round][Math.floor(Math.random() * heckles[round].length)])
        window.setTimeout(() => setHeckle(''), 1100)
        if (lives > 1 && Math.random() < 0.45) {
          setPopcorn((p) => [...p, { id: popcornId.current++, x: 12 + Math.random() * 76, y: 72 }])
        }
        break
      }
    }
  }, [tomatoes, playerX, started, gameOver, won, round, heckles, lives])

  useEffect(() => {
    if (!started || gameOver || won) return
    for (const p of popcorn) {
      if (Math.abs(p.x - playerX) < 5 && Math.abs(p.y - 72) < 8) {
        setPopcorn((items) => items.filter((x) => x.id !== p.id))
        setLives((l) => Math.min(3, l + 1))
        setScore((s) => s + 150)
        break
      }
    }
  }, [popcorn, playerX, started, gameOver, won])

  const simulated = round === 0 ? 5 : round === 1 ? 10 : 20
  const elapsed = ROUND_LENGTH - timeLeft
  const simRemaining = Math.max(0, Math.ceil(simulated * 60 * (1 - elapsed / ROUND_LENGTH)))
  const mm = String(Math.floor(simRemaining / 60)).padStart(2, '0')
  const ss = String(simRemaining % 60).padStart(2, '0')

  return (
    <main className="tc-game min-h-screen px-3 py-5 md:px-8 md:py-8 flex items-center justify-center">
      <div className="w-full max-w-5xl">
        <div className="tc-title text-center mb-4">
          <h1 className="text-4xl md:text-7xl font-black tracking-tight text-[#f7c56d]">TOUGH CROWD</h1>
          <p className="text-xs md:text-sm tracking-[0.35em] text-white/60 mt-1">A JON BOYD GAME</p>
        </div>

        <div className="tc-hud grid grid-cols-3 gap-2 mb-2 text-[11px] md:text-sm font-bold tracking-wider">
          <div className="bg-[#1b1513] border border-white/10 rounded-lg p-2">SCORE<br /><span className="text-lg md:text-2xl">{String(score).padStart(6, '0')}</span></div>
          <div className="bg-[#1b1513] border border-white/10 rounded-lg p-2 text-center">{ROUND_LABELS[round]}<br /><span className="text-lg md:text-2xl">{mm}:{ss}</span></div>
          <div className="bg-[#1b1513] border border-white/10 rounded-lg p-2 text-right">PATIENCE<br /><span className="text-lg md:text-2xl">{'❤'.repeat(Math.max(0, lives))}{'♡'.repeat(Math.max(0, 3 - lives))}</span></div>
        </div>

        <div
          ref={arenaRef}
          className="tc-arena relative overflow-hidden aspect-[16/10] select-none touch-none"
        >
          <ClubStage />
          {heckle && <div role="status" className="tc-heckle">{heckle}</div>}
          {tomatoes.map((t) => (
            <div key={t.id} className="tc-tomato" style={{ left: `${t.x}%`, top: `${t.y}%` }}><TomatoSprite /></div>
          ))}
          {popcorn.map((p) => (
            <div key={p.id} className="tc-popcorn" style={{ left: `${p.x}%`, top: `${p.y}%` }}><PopcornSprite /></div>
          ))}
          <div className="tc-player" style={{ left: `${playerX}%` }}><JonSprite /></div>
          <Crowd />

          {!started && !gameOver && !won && (
            <div className="tc-overlay absolute inset-0 z-40 bg-black/60 flex flex-col items-center justify-center text-center p-6">
              <h2 className="text-3xl md:text-5xl font-black">SURVIVE THE SET</h2>
              <p className="mt-3 text-sm md:text-lg text-white/75 max-w-xl">Move left and right. Dodge tomatoes. Grab popcorn to restore the crowd's patience.</p>
              <button onClick={() => setStarted(true)} className="mt-6 bg-[#f7c56d] text-black font-black px-7 py-3 rounded-lg text-lg hover:scale-105 transition">START SET</button>
            </div>
          )}

          {(gameOver || won) && (
            <div className="tc-overlay absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center text-center p-6">
              <h2 className="text-3xl md:text-5xl font-black text-[#f7c56d]">{won ? 'YOU KILLED.' : 'BOOED OFF STAGE'}</h2>
              <p className="mt-3 text-lg">FINAL SCORE: <strong>{score}</strong></p>
              <p className="text-white/60">ROUND: {ROUND_LABELS[round]}</p>
              <button onClick={resetGame} className="mt-6 bg-white text-black font-black px-6 py-3 rounded-lg">PLAY AGAIN</button>
              <p className="text-xs text-white/40 mt-3">Score saving + leaderboard comes next.</p>
            </div>
          )}

          <button
            type="button"
            aria-label="Move left"
            onPointerDown={() => (keys.current.left = true)}
            onPointerUp={() => (keys.current.left = false)}
            onPointerLeave={() => (keys.current.left = false)}
            className="absolute z-30 left-0 bottom-0 w-1/2 h-full opacity-0 md:hidden"
          />
          <button
            type="button"
            aria-label="Move right"
            onPointerDown={() => (keys.current.right = true)}
            onPointerUp={() => (keys.current.right = false)}
            onPointerLeave={() => (keys.current.right = false)}
            className="absolute z-30 right-0 bottom-0 w-1/2 h-full opacity-0 md:hidden"
          />
        </div>

        <div className="flex justify-between items-center mt-3 text-xs md:text-sm text-white/50">
          <span>Desktop: ← → or A / D</span>
          <span>Mobile: hold left/right side of stage</span>
        </div>
      </div>
    </main>
  )
}
