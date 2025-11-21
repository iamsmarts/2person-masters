/**
 * Fisher-Yates shuffle algorithm
 * Returns a new shuffled array without modifying the original
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Pick a random element from an array
 */
export function pickRandom<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot pick from empty array')
  }
  return array[Math.floor(Math.random() * array.length)]
}
