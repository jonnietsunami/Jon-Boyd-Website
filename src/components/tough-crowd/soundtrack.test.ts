import { expect, test } from 'vitest'
import { musicSamples, crowdSamples, retroSamples } from './soundtrack'
test('loops have bounded audible samples and rounds increase tempo', () => {
  const first=musicSamples(8000,0), last=musicSamples(8000,2), crowd=crowdSamples(8000)
  expect(last.length).toBeLessThan(first.length)
  for(const samples of [first,last,crowd]) {
    expect(samples.some(v=>Math.abs(v)>.01)).toBe(true)
    expect(samples.every(v=>Number.isFinite(v)&&Math.abs(v)<1)).toBe(true)
  }
})
test('retro blend preserves timing and most of the original voice', () => {
  const input=Float32Array.from({length:100},(_,i)=>Math.sin(i)*.5)
  const output=retroSamples(input,48000)
  expect(output.length).toBe(input.length)
  expect(output).not.toEqual(input)
  expect(input[1]).toBeCloseTo(Math.sin(1)*.5)
  expect(retroSamples(new Float32Array(20),48000)).toEqual(new Float32Array(20))
})
