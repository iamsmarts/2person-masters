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
        bg-card rounded-lg p-4 transition-all duration-300 border
        ${isActive ? 'ring-2 ring-accent border-accent' : 'border-muted'}
      `}
    >
      <h3 className="text-lg font-bold text-foreground mb-4 text-center">{title}</h3>
      <ul className="space-y-2">
        {players.length === 0 ? (
          <li className="text-sm text-muted-foreground text-center italic">All drawn</li>
        ) : (
          players.map(player => (
            <li
              key={player.id}
              className={`
                text-base text-center py-1 px-2 rounded transition-all duration-300
                ${
                  player.id === highlightedPlayerId
                    ? 'bg-secondary text-white font-bold animate-pulse'
                    : 'text-foreground/80'
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
