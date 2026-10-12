import { useCallback, useEffect, useRef, useState } from 'react'

import { musicSamples, crowdSamples, retroSamples } from './soundtrack'

type Cue = 'start' | 'splat' | 'miss' | 'pickup' | 'win' | 'lose' | 'cheer' | 'goodnight'
export function useArcadeAudio() {
  const context = useRef<AudioContext | null>(null)
  const voice = useRef<AudioBuffer | null>(null)
  const voiceLoading = useRef<Promise<void> | null>(null)
  const master = useRef<GainNode | null>(null)
  const [muted, setMuted] = useState(false)
  const silent = useRef(false)
  const [musicMuted, setMusicMuted] = useState(false)
  const [ready, setReady] = useState(0)
  const [background, setBackground] = useState({ active: false, round: 0 })
  const setScene = useCallback((active: boolean, round: number) => setBackground(old => old.active === active && old.round === round ? old : { active, round }), [])
  useEffect(() => {
    try { setMusicMuted(localStorage.getItem('tc-music-muted') === 'true') } catch { /* Optional storage. */ }
  }, [])
  useEffect(() => {
    const ctx = context.current
    if (!ctx || !background.active || ctx.state !== 'running') return
    const nodes: { source: AudioBufferSourceNode; gain: GainNode }[] = []
    const loop = (samples: Float32Array, volume: number) => {
      const buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate)
      buffer.getChannelData(0).set(samples)
      const source = ctx.createBufferSource(), gain = ctx.createGain()
      source.buffer = buffer; source.loop = true
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + .2)
      source.connect(gain); gain.connect(ctx.destination); source.start()
      nodes.push({ source, gain })
    }
    if (!musicMuted) loop(musicSamples(ctx.sampleRate, background.round), .32)
    if (!muted) loop(crowdSamples(ctx.sampleRate), .4)
    return () => {
      for (const { source, gain } of nodes) {
        gain.gain.cancelScheduledValues(ctx.currentTime)
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + .08)
        source.onended = () => { source.disconnect(); gain.disconnect() }
        source.stop(ctx.currentTime + .09)
      }
    }
  }, [background, musicMuted, muted, ready])
  useEffect(() => {
    try { silent.current = localStorage.getItem('tc-muted') === 'true'; setMuted(silent.current) } catch { /* Storage is optional. */ }
    return () => { void context.current?.close().catch(() => {}); context.current = null; master.current = null; voice.current = null; voiceLoading.current = null }
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
      const ctx = context.current
      if (!voiceLoading.current) {
        voiceLoading.current = fetch('/game/thank-you-good-night.m4a')
          .then(response => { if (!response.ok) throw new Error('Voice unavailable'); return response.arrayBuffer() })
          .then(data => ctx.decodeAudioData(data))
          .then(buffer => {
            for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
              const samples = buffer.getChannelData(channel)
              samples.set(retroSamples(samples, buffer.sampleRate))
            }
            if (context.current === ctx) voice.current = buffer
          })
          .catch(() => { voiceLoading.current = null })
      }
      await ctx.resume()
      if (ctx.state === 'running') setReady(value => value + 1)
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
    if (cue === 'goodnight') {
      if (!voice.current) return
      const source = ctx.createBufferSource(), gain = ctx.createGain()
      source.buffer = voice.current
      gain.gain.value = 3
      source.connect(gain); gain.connect(output)
      source.onended = () => { source.disconnect(); gain.disconnect() }
      source.start()
    } else if (cue === 'cheer') {
      // Short arcade crowd: staggered claps underneath overlapping rising whoops.
      const duration = 1.9
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate)
      const samples = buffer.getChannelData(0)
      const claps = Array.from({ length: 28 }, () => .05 + Math.random() * 1.55)
      for (let i = 0; i < samples.length; i++) {
        const t = i / ctx.sampleRate
        let sample = 0
        for (const start of claps) {
          const age = t - start
          if (age >= 0 && age < .055) sample += (Math.random() * 2 - 1) * Math.exp(-age * 75) * .22
        }
        for (let voice = 0; voice < 5; voice++) {
          const age = t - voice * .14
          if (age > 0 && age < 1.05) {
            const pitch = 270 + voice * 47
            const phase = 2 * Math.PI * (pitch * age + 80 * age * age - 55 * age ** 3)
            const envelope = Math.sin(Math.PI * age / 1.05) ** 2
            sample += (Math.sin(phase) + .3 * Math.sin(phase * 2) + .12 * Math.sin(phase * 3)) * envelope * .065
          }
        }
        samples[i] = Math.tanh(sample) * Math.min(1, (duration - t) * 5)
      }
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(output)
      source.onended = () => source.disconnect()
      source.start()
    } else if (cue === 'splat'  || cue === 'miss') {
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
  const toggleMusic = useCallback(() => {
    void unlock()
    setMusicMuted(value => {
      try { localStorage.setItem('tc-music-muted', String(!value)) } catch { /* Optional storage. */ }
      return !value
    })
  }, [unlock])
  return { muted, toggle, musicMuted, toggleMusic, setScene, unlock, play }
}
