import type { TeeTime, TeeAssignment } from '../lib/types'

interface TeeSheetProps {
  teeTimes: TeeTime[]
  teeAssignments: TeeAssignment[]
  lastRevealedId: string | null
}

export default function TeeSheet({
  teeTimes,
  teeAssignments,
  lastRevealedId,
}: TeeSheetProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
      <table className="w-full">
        <thead>
          <tr className="bg-masters-green">
            <th className="px-4 py-3 text-sm font-bold text-white">Tee Time</th>
            <th className="px-4 py-3 text-sm font-bold text-white">Team 1</th>
            <th className="px-4 py-3 text-sm font-bold text-white">Team 2</th>
          </tr>
        </thead>
        <tbody>
          {teeTimes.map(teeTime => {
            const assignments = teeAssignments.filter(a => a.tee_time_id === teeTime.id)
            const team1 = assignments.find(a => a.slot_in_foursome === 1)
            const team2 = assignments.find(a => a.slot_in_foursome === 2)

            return (
              <tr key={teeTime.id} className="border-t border-gray-700 bg-gray-800">
                <td className="px-4 py-3 text-sm font-bold text-gray-300 text-center">
                  {teeTime.label}
                </td>
                <td
                  className={`
                    px-4 py-3 text-sm text-center transition-all duration-500
                    ${team1?.id === lastRevealedId ? 'bg-masters-yellow text-gray-900 font-bold animate-pulse' : ''}
                    ${team1?.revealed ? 'text-white' : 'text-gray-500'}
                  `}
                >
                  {team1?.revealed && team1.team
                    ? `${team1.team.left_player?.display_name} & ${team1.team.right_player?.display_name}`
                    : '-'}
                </td>
                <td
                  className={`
                    px-4 py-3 text-sm text-center transition-all duration-500
                    ${team2?.id === lastRevealedId ? 'bg-masters-yellow text-gray-900 font-bold animate-pulse' : ''}
                    ${team2?.revealed ? 'text-white' : 'text-gray-500'}
                  `}
                >
                  {team2?.revealed && team2.team
                    ? `${team2.team.left_player?.display_name} & ${team2.team.right_player?.display_name}`
                    : '-'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
