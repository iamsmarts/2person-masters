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
  const timeLabelToMinutes = (label: string): number => {
    const [timePart, meridiem = ''] = label.split(' ')
    const [hourStr, minuteStr = '0'] = timePart.split(':')
    let hour = Number(hourStr) % 12
    if (meridiem.toUpperCase() === 'PM') hour += 12
    return hour * 60 + Number(minuteStr)
  }

  const sortedTeeTimes = [...teeTimes].sort(
    (a, b) => timeLabelToMinutes(a.label) - timeLabelToMinutes(b.label),
  )

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-xl border border-muted">
      <table className="w-full">
        <thead>
          <tr className="hero-gradient">
            <th className="px-4 py-3 text-sm font-bold text-white">Tee Time</th>
            <th className="px-4 py-3 text-sm font-bold text-white">Team 1</th>
            <th className="px-4 py-3 text-sm font-bold text-white">Team 2</th>
          </tr>
        </thead>
        <tbody>
          {sortedTeeTimes.map(teeTime => {
            const assignments = teeAssignments.filter(a => a.tee_time_id === teeTime.id)
            const team1 = assignments.find(a => a.slot_in_foursome === 1)
            const team2 = assignments.find(a => a.slot_in_foursome === 2)

            return (
              <tr key={teeTime.id} className="border-t border-muted bg-card">
                <td className="px-4 py-3 text-sm font-bold text-foreground/70 text-center">
                  {teeTime.label}
                </td>
                <td
                  className={`
                    px-4 py-3 text-base text-center transition-all duration-500
                    ${team1?.id === lastRevealedId ? 'bg-secondary text-white font-bold animate-pulse' : ''}
                    ${team1?.revealed ? 'text-foreground' : 'text-muted-foreground'}
                  `}
                >
                  {team1?.revealed && team1.team
                    ? `${team1.team.left_player?.display_name} & ${team1.team.right_player?.display_name}`
                    : '-'}
                </td>
                <td
                  className={`
                    px-4 py-3 text-base text-center transition-all duration-500
                    ${team2?.id === lastRevealedId ? 'bg-secondary text-white font-bold animate-pulse' : ''}
                    ${team2?.revealed ? 'text-foreground' : 'text-muted-foreground'}
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
