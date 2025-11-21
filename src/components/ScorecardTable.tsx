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
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
      <table className="w-full">
        <thead>
          <tr className="bg-masters-green">
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
                  border-t border-gray-700 transition-colors duration-300
                  ${isCurrentTeam ? 'bg-gray-700' : 'bg-gray-800'}
                `}
              >
                <td className="px-4 py-3 text-sm font-bold text-gray-300 text-center">
                  {teamNum}
                </td>
                <td
                  className={`
                    px-4 py-3 text-sm text-center transition-all duration-500
                    ${isAnimatingLeft ? 'bg-masters-yellow text-gray-900 font-bold animate-pulse' : ''}
                    ${isFillingLeft && !team?.left_player ? 'bg-gray-600' : ''}
                    ${team?.left_player ? 'text-white font-medium' : 'text-gray-500'}
                  `}
                >
                  {team?.left_player?.display_name || (isFillingLeft ? '...' : '-')}
                </td>
                <td
                  className={`
                    px-4 py-3 text-sm text-center transition-all duration-500
                    ${isAnimatingRight ? 'bg-masters-yellow text-gray-900 font-bold animate-pulse' : ''}
                    ${isFillingRight && !team?.right_player ? 'bg-gray-600' : ''}
                    ${team?.right_player ? 'text-white font-medium' : 'text-gray-500'}
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
