import { useCallback, useEffect, useRef, useState } from 'react'

type Cue = 'start' | 'splat' | 'miss' | 'pickup' | 'win' | 'lose'
export function useArcadeAudio() {
  const context = useRef<AudioContext | null>(null)
  const master = useRef<GainNode | null>(null)
  const [muted, setMuted] = useState(false)
  const silent = useRef(false)
  useEffect(() => {
    try { silent.current = localStorage.getItem('tc-muted') === 'true'; setMuted(silent.current) } catch { /* Storage is optional. */ }
    return () => { void context.current?.close().catch(() => {}); context.current = null; master.current = null }
  }, [])
  // Called only from a user gesture; browser autoplay restrictions remain respected.
  const unlock = useCallback(async () => {
    try {
      if (!context.current) {
        context.current = new AudioContext()
        master.current = context.current.createGain()
        master.current.gain.value = silent.current ? 0 : .22
        master.current.connect(context.current.destination)
      }
      await context.current.resume().catch(() => {})
    } catch { /* Gameplay still works when audio is unavailable. */ }
  }, [])
  const toggle = useCallback(() => {
    silent.current = !silent.current
    setMuted(silent.current)
    unlock()
    if (master.current && context.current) master.current.gain.setValueAtTime(silent.current ? 0 : .22, context.current.currentTime)
    try { localStorage.setItem('tc-muted', String(silent.current)) } catch { /* Storage is optional. */ }
  }, [unlock])
  const play = useCallback((cue: Cue) => {
    const ctx = context.current, output = master.current
    if (!ctx || !output || silent.current || ctx.state !== 'running') return
    const now = ctx.currentTime
    const tone = (frequency: number, delay: number, duration: number, end = frequency) => {
      const oscillator = ctx.createOscillator(), gain = ctx.createGain()
      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(frequency, now + delay)
      oscillator.frequency.exponentialRampToValueAtTime(end, now + delay + duration)
      gain.gain.setValueAtTime(.001, now + delay)
      gain.gain.exponentialRampToValueAtTime(.5, now + delay + .008)
      gain.gain.exponentialRampToValueAtTime(.001, now + delay + duration)
      oscillator.connect(gain); gain.connect(output)
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
      oscillator.start(now + delay); oscillator.stop(now + delay + duration + .02)
    }
    if (cue === 'splat' || cue === 'miss') {
      const duration = cue === 'splat' ? .22 : .11
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate)
      const samples = buffer.getChannelData(0)
      for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length) ** 2
      const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain()
      source.buffer = buffer; filter.type = 'lowpass'
      filter.frequency.setValueAtTime(1800, now); filter.frequency.exponentialRampToValueAtTime(180, now + duration)
      gain.gain.value = cue === 'splat' ? .8 : .25
      source.connect(filter); filter.connect(gain); gain.connect(output)
      source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect() }
      source.start(); tone(160, 0, duration, 45)
    } else {
      const notes = cue === 'pickup' ? [660, 880, 1320] : cue === 'lose' ? [330, 220, 110] : cue === 'win' ? [523, 659, 784, 1047] : [440, 660]
      notes.forEach((note, index) => tone(note, index * .1, .16))
    }
  }, [])
  return { muted, toggle, unlock, play }
}
