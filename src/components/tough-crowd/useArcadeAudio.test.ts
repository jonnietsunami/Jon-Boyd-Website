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
