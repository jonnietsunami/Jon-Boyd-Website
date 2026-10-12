import { expect, test } from 'vitest'
import { throwPosition, throwHits } from './trajectory'
test('throws start in the crowd and land on stage without falling from above', () => {
  expect(throwPosition(15, 50, 0)).toEqual({x: 15, y: 82})
  expect(throwPosition(15, 50, 1)).toEqual({x: 50, y: 46})
  expect(throwPosition(15, 50, .5).y).toBeLessThan(64)
  for (let p = 0; p <= 1; p += .02) expect(throwPosition(15, 50, p).y).toBeGreaterThan(40)
})
test('crossing Jon on the way from the crowd is not a premature hit', () => {
  expect(throwHits(50, 50, .5, 1.35)).toBe(false)
  expect(throwHits(50, 50, 1.35, 1.35)).toBe(true)
  expect(throwHits(50, 60, 1.35, 1.35)).toBe(false)
})
