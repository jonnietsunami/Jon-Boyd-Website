import { useEffect, useRef, useState } from 'react'
import { getGameLeaderboard, submitGameScore } from '../../server/functions/leaderboard'

export function ScoreDialog({ score, won, onRestart }: { score: number; won: boolean; onRestart: () => void }) {
  const [initials, setInitials] = useState('')
  const [email, setEmail] = useState('')
  const [subscribe, setSubscribe] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [rows, setRows] = useState<{ initials: string; score: number }[]>([])
  const [boardError, setBoardError] = useState(false)
  const [loading, setLoading] = useState(true)
  const id = useRef(crypto.randomUUID())
  const busy = useRef(false)
  const dialog = useRef<HTMLDivElement>(null)
  useEffect(() => {
    getGameLeaderboard().then(setRows).catch(() => setBoardError(true)).finally(() => setLoading(false))
    dialog.current?.querySelector<HTMLInputElement>('input')?.focus()
  }, [])
  return <div className="tc-score-backdrop">
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="tc-result" className="tc-score-dialog" onKeyDown={e => {
      if (e.key !== 'Tab') return
      const controls = Array.from(dialog.current!.querySelectorAll<HTMLElement>('input:not(:disabled), button:not(:disabled)'))
      const first = controls[0], last = controls[controls.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
    }}>
      <p className="tc-eyebrow">{won ? 'THAT’S A KILLER SET' : 'THE CROWD HAS SPOKEN'}</p>
      <h2 id="tc-result">{saved ? 'YOU’RE ON THE BOARD' : 'LEAVE YOUR MARK'}</h2>
      <p className="tc-final-score">{score.toLocaleString()} <small>POINTS</small></p>
      {!saved ? <form onSubmit={async e => {
        e.preventDefault()
        if (busy.current) return
        busy.current = true; setSaving(true); setError('')
        try {
          await submitGameScore({ data: { id: id.current, initials, email, score, subscribe } })
          setSaved(true)
          try { setRows(await getGameLeaderboard()); setBoardError(false) } catch { setBoardError(true) }
        } catch { setError('Couldn’t save your score. Please try again. Your details are still here.') }
        finally { busy.current = false; setSaving(false) }
      }}>
        <div className="tc-fields">
          <label>3-LETTER INITIALS<input aria-label="3-letter initials" required pattern="[A-Za-z]{3}" maxLength={3} value={initials} onChange={e => setInitials(e.target.value.replace(/[^a-z]/gi, '').toUpperCase())} autoComplete="off" placeholder="JON" /></label>
          <label>EMAIL<input aria-label="Email" required type="email" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" /></label>
        </div>
        <p className="tc-private">Only your initials and score appear publicly. Your email stays private.</p>
        <label className="tc-consent"><input type="checkbox" checked={subscribe} onChange={e => setSubscribe(e.target.checked)} />Send me Jon’s show dates and updates.</label>
        {error && <p role="alert" className="tc-error">{error}</p>}
        <button className="tc-submit" disabled={saving}>{saving ? 'SAVING…' : 'JOIN THE LEADERBOARD'}</button>
      </form> : <p role="status">Score saved. See you at the next set.</p>}
      <div className="tc-leaderboard"><h3>TOP 10 · TOUGH CROWD</h3>
        {loading ? <p>Loading leaderboard…</p> : boardError ? <p>Leaderboard is temporarily unavailable.</p> : rows.length ? <ol>{rows.map((row, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')} · {row.initials}</span><strong>{row.score.toLocaleString()}</strong></li>)}</ol> : <p>No scores yet. Set the bar.</p>}
      </div>
      <button className="tc-restart" onClick={onRestart} disabled={saving}>{saved ? 'PLAY AGAIN' : 'SKIP & PLAY AGAIN'}</button>
    </div>
  </div>
}
