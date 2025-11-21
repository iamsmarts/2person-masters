import type { Team } from '../lib/types'

interface ScorecardTableProps {
  teams: Team[]
  currentTeamNumber: number | null
  currentlyFillingSide: 'left' | 'right' | null
  animatingTeam: number | null
  animatingSide: 'left' | 'right' | null
}

export default function ScorecardTable({
  teams,
  currentTeamNumber,
  currentlyFillingSide,
  animatingTeam,
  animatingSide,
}: ScorecardTableProps) {
  // Create 10 rows even if teams array is smaller
  const rows = Array.from({ length: 10 }, (_, i) => {
    const teamNum = i + 1
    const team = teams.find(t => t.team_number === teamNum)
    return { teamNum, team }
  })

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-xl border border-muted">
      <table className="w-full">
        <thead>
          <tr className="hero-gradient">
            <th className="px-4 py-3 text-sm font-bold text-white w-20">Team</th>
            <th className="px-4 py-3 text-sm font-bold text-white">Player 1</th>
            <th className="px-4 py-3 text-sm font-bold text-white">Player 2</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ teamNum, team }) => {
            const isCurrentTeam = teamNum === currentTeamNumber
            const isAnimatingLeft = teamNum === animatingTeam && animatingSide === 'left'
            const isAnimatingRight = teamNum === animatingTeam && animatingSide === 'right'
            const isFillingLeft = isCurrentTeam && currentlyFillingSide === 'left'
            const isFillingRight = isCurrentTeam && currentlyFillingSide === 'right'

            return (
              <tr
                key={teamNum}
                className={`
                  border-t border-muted transition-colors duration-300
                  ${isCurrentTeam ? 'bg-muted/50' : 'bg-card'}
                `}
              >
                <td className="px-4 py-3 text-sm font-bold text-foreground/70 text-center">
                  {teamNum}
                </td>
                <td
                  className={`
                    px-4 py-3 text-base text-center transition-all duration-500
                    ${isAnimatingLeft ? 'bg-secondary text-white font-bold animate-pulse' : ''}
                    ${isFillingLeft && !team?.left_player ? 'bg-muted/30' : ''}
                    ${team?.left_player ? 'text-foreground font-medium' : 'text-muted-foreground'}
                  `}
                >
                  {team?.left_player?.display_name || (isFillingLeft ? '...' : '-')}
                </td>
                <td
                  className={`
                    px-4 py-3 text-base text-center transition-all duration-500
                    ${isAnimatingRight ? 'bg-secondary text-white font-bold animate-pulse' : ''}
                    ${isFillingRight && !team?.right_player ? 'bg-muted/30' : ''}
                    ${team?.right_player ? 'text-foreground font-medium' : 'text-muted-foreground'}
                  `}
                >
                  {team?.right_player?.display_name || (isFillingRight ? '...' : '-')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
