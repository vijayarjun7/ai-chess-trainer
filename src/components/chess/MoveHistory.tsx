'use client'

interface MoveHistoryProps {
  moves: string[]
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  const pairs: [string, string | undefined][] = []
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1]])
  }

  return (
    <div className="h-48 overflow-y-auto rounded-xl bg-gray-50 border border-gray-100 p-3 text-sm font-mono">
      {pairs.length === 0 && (
        <p className="text-gray-400 text-center mt-4">No moves yet</p>
      )}
      {pairs.map(([white, black], i) => (
        <div key={i} className="flex gap-2 py-0.5">
          <span className="text-gray-400 w-8">{i + 1}.</span>
          <span className="text-gray-800 w-14">{white}</span>
          <span className="text-gray-600">{black ?? ''}</span>
        </div>
      ))}
    </div>
  )
}
