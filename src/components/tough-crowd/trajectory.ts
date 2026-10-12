export function throwPosition(startX: number, targetX: number, progress: number) {
  const p = Math.max(0, Math.min(progress, 1))
  return { x: startX + (targetX - startX) * p, y: 82 - 36 * p - 12 * Math.sin(Math.PI * p) }
}
export function throwHits(x: number, playerX: number, age: number, duration: number) {
  return age >= duration && Math.abs(x - playerX) < 4.2
}
