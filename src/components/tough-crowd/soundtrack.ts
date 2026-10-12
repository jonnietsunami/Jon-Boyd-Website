// Original procedural loops: no external music or crowd recordings.
export function musicSamples(rate: number, round: number) {
  const beat = 60 / (96 + round * 8), duration = beat * 16
  const samples = new Float32Array(Math.round(rate * duration))
  const melody = [72, 0, 76, 79, 74, 0, 71, 0, 69, 72, 76, 0, 67, 71, 74, 0]
  const roots = [48, 43, 45, 43]
  for (let i = 0; i < samples.length; i++) {
    const t = i / rate, step = Math.floor(t / beat), age = t % beat
    const note = melody[step % 16], bass = 440 * 2 ** ((roots[Math.floor(step / 4) % 4] - 69) / 12)
    const envelope = Math.min(1, age / .012) * Math.max(0, 1 - age / (beat * .75))
    const pitch = 440 * 2 ** ((note - 69) / 12)
    samples[i] = envelope * (.14 * Math.sin(2 * Math.PI * bass * age) + (note ? .065 * (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * pitch * age)) : 0))
  }
  return samples
}
export function crowdSamples(rate: number) {
  const samples = new Float32Array(rate * 8)
  for (let i = 0; i < samples.length; i++) {
    const t = i / rate
    let value = 0
    // Soft, indistinct overlapping voice-like murmur; periodic envelopes join cleanly.
    for (let n = 0; n < 7; n++) {
      const envelope = (.5 + .5 * Math.sin(2 * Math.PI * t * (n + 1) / 8 + n)) ** 3
      value += .018 * envelope * Math.sin(2 * Math.PI * (110 + n * 27) * t + .6 * Math.sin(2 * Math.PI * t * 2))
    }
    samples[i] = value
  }
  return samples
}
export function retroSamples(input: Float32Array, rate: number) {
  const output = new Float32Array(input.length)
  const step = Math.max(1, Math.round(rate / 12000))
  for (let i = 0; i < input.length; i++) {
    const crushed = Math.round(input[i - i % step] * 127) / 127
    output[i] = input[i] * .65 + crushed * .35
  }
  return output
}
