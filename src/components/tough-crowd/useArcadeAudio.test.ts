import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { useArcadeAudio } from './useArcadeAudio'
afterEach(() => { vi.unstubAllGlobals(); localStorage.clear() })
test('audio is gesture-gated, mute persists and unmount releases audio', async () => {
  const param = () => ({ value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() })
  const oscillator = vi.fn(() => ({ frequency:param(), connect:vi.fn(), disconnect:vi.fn(), start:vi.fn(), stop:vi.fn() }))
  const close = vi.fn(async () => {})
  const ctor = vi.fn(function () { return { state:'running', currentTime:0, destination:{}, resume:async()=>{}, close, createGain:()=>({gain:param(),connect:vi.fn()}), createOscillator:oscillator } })
  vi.stubGlobal('AudioContext', ctor)
  const hook = renderHook(() => useArcadeAudio())
  act(() => hook.result.current.play('pickup'))
  expect(ctor).not.toHaveBeenCalled()
  await act(() => hook.result.current.unlock())
  act(() => hook.result.current.play('pickup'))
  expect(oscillator).toHaveBeenCalledTimes(3)
  act(() => hook.result.current.toggle())
  act(() => hook.result.current.play('pickup'))
  expect(oscillator).toHaveBeenCalledTimes(3)
  expect(localStorage.getItem('tc-muted')).toBe('true')
  hook.unmount(); expect(close).toHaveBeenCalledOnce()
})
test('unsupported audio does not prevent starting the game', async () => {
  vi.stubGlobal('AudioContext', undefined)
  const hook=renderHook(() => useArcadeAudio())
  await expect(hook.result.current.unlock()).resolves.toBeUndefined()
  expect(() => hook.result.current.play('splat')).not.toThrow()
  hook.unmount()
})
test('preloads the real voice clip and routes finale playback through the mute-controlled output', async () => {
  const param = () => ({value:0,setValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn()})
  const clip = {duration:5.652}
  const source = {buffer:null,connect:vi.fn(),disconnect:vi.fn(),start:vi.fn()}
  const decode = vi.fn(async()=>clip)
  const fetchClip = vi.fn(async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(4)}))
  vi.stubGlobal('fetch',fetchClip)
  vi.stubGlobal('AudioContext',vi.fn(function(){return {state:'running',currentTime:0,destination:{},resume:async()=>{},close:async()=>{},createGain:()=>({gain:param(),connect:vi.fn(),disconnect:vi.fn()}),decodeAudioData:decode,createBufferSource:()=>source}}))
  const hook=renderHook(()=>useArcadeAudio())
  await act(async()=>{await hook.result.current.unlock()})
  expect(fetchClip).toHaveBeenCalledWith('/game/thank-you-good-night.m4a')
  act(()=>hook.result.current.play('goodnight'))
  expect(source.buffer).toBe(clip)
  expect(source.start).toHaveBeenCalledOnce()
  act(()=>hook.result.current.toggle())
  act(()=>hook.result.current.play('goodnight'))
  expect(source.start).toHaveBeenCalledOnce()
  hook.unmount()
})
test('background is gesture gated, independently muted, and stops on pause', async () => {
  const sources: any[] = []
  const param = () => ({value:0,setValueAtTime:vi.fn(),linearRampToValueAtTime:vi.fn(),cancelScheduledValues:vi.fn()})
  vi.stubGlobal('fetch', vi.fn(async()=>({ok:false})))
  vi.stubGlobal('AudioContext', vi.fn(function(){return {
    state:'running',sampleRate:8000,currentTime:0,destination:{},resume:async()=>{},close:async()=>{},
    createGain:()=>({gain:param(),connect:vi.fn(),disconnect:vi.fn()}),
    createBuffer:(_:number,length:number)=>({getChannelData:()=>new Float32Array(length)}),
    createBufferSource:()=>{const source={connect:vi.fn(),disconnect:vi.fn(),start:vi.fn(),stop:vi.fn()};sources.push(source);return source}
  }}))
  const hook=renderHook(()=>useArcadeAudio())
  act(()=>hook.result.current.setScene(true,0))
  expect(sources).toHaveLength(0)
  await act(()=>hook.result.current.unlock())
  expect(sources).toHaveLength(2)
  act(()=>hook.result.current.setScene(false,0))
  expect(sources.every(s=>s.stop.mock.calls.length===1)).toBe(true)
  await act(async()=>hook.result.current.toggleMusic())
  expect(localStorage.getItem('tc-music-muted')).toBe('true')
  act(()=>hook.result.current.setScene(true,1))
  expect(sources).toHaveLength(3)
  hook.unmount()
  expect(sources[2].stop).toHaveBeenCalledOnce()
})
