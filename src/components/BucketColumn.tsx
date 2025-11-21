import type { Player } from '../lib/types'

interface BucketColumnProps {
  title: string
  players: Player[]
  highlightedPlayerId: string | null
  isActive: boolean
}

export default function BucketColumn({
  title,
  players,
  highlightedPlayerId,
  isActive,
}: BucketColumnProps) {
  return (
    <div
      className={`
        bg-gray-800 rounded-lg p-4 transition-all duration-300
        ${isActive ? 'ring-2 ring-masters-yellow' : ''}
      `}
    >
      <h3 className="text-lg font-bold text-white mb-4 text-center">{title}</h3>
      <ul className="space-y-2">
        {players.length === 0 ? (
          <li className="text-sm text-gray-500 text-center italic">All drawn</li>
        ) : (
          players.map(player => (
            <li
              key={player.id}
              className={`
                text-sm text-center py-1 px-2 rounded transition-all duration-300
                ${
                  player.id === highlightedPlayerId
                    ? 'bg-masters-yellow text-gray-900 font-bold animate-pulse'
                    : 'text-gray-300'
                }
              `}
            >
              {player.display_name}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
