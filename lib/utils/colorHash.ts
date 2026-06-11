const PALETTE = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-amber-500',
] as const

export function colorFromId(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + (id.charCodeAt(i))
    hash |= 0
  }
  const idx = Math.abs(hash) % PALETTE.length
  return PALETTE[idx] ?? 'bg-gray-500'
}
