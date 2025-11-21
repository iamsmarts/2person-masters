import { useEffect, useState } from 'react'
import {
  fetchDrawState,
  fetchPlayers,
  fetchTeams,
  fetchTeeTimes,
  fetchTeeAssignments,
} from '../lib/drawService'
import type { DrawState, Player, Team, TeeTime, TeeAssignment } from '../lib/types'

export default function HomePage() {
  const [drawState, setDrawState] = useState<DrawState | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([])
  const [teeAssignments, setTeeAssignments] = useState<TeeAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [state, playerData, teamData, teeTimeData, assignmentData] = await Promise.all([
        fetchDrawState(),
        fetchPlayers(),
        fetchTeams(),
        fetchTeeTimes(),
        fetchTeeAssignments(),
      ])
      setDrawState(state)
      setPlayers(playerData)
      setTeams(teamData)
      setTeeTimes(teeTimeData)
      setTeeAssignments(assignmentData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  const tier1 = players.filter(p => p.tier === 'T1')
  const tier2a = players.filter(p => p.tier === 'T2A')
  const tier2b = players.filter(p => p.tier === 'T2B')
  const tier3 = players.filter(p => p.tier === 'T3')

  const showTeams = drawState && ['PAIRINGS_DONE', 'TEE_TIMES_READY', 'TEE_TIMES_DONE'].includes(drawState.status)
  const showTeeTimes = drawState && ['TEE_TIMES_READY', 'TEE_TIMES_DONE'].includes(drawState.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-masters-green text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Quasar GC Masters
          </h1>
          <p className="text-xl md:text-2xl mb-2">
            2-Person Combined Stroke Play
          </p>
          <div className="mt-6 space-y-1 text-lg">
            <p>January 2nd, 2026</p>
            <p>Diamond Bar Golf Course</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* Player Tiers */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Player Tiers
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <TierColumn title="Tier 1" players={tier1} color="bg-yellow-100" />
            <TierColumn title="Tier 2 Group A" players={tier2a} color="bg-blue-100" />
            <TierColumn title="Tier 2 Group B" players={tier2b} color="bg-green-100" />
            <TierColumn title="Tier 3" players={tier3} color="bg-purple-100" />
          </div>
        </section>

        {/* Teams Table */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Teams
          </h2>
          {showTeams ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Team</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Player 1</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Player 2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teams.map(team => (
                    <tr key={team.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {team.team_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {team.left_player?.display_name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {team.right_player?.display_name || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600 bg-white rounded-lg shadow p-8">
              Teams will be drawn live during the Quasar GC Masters Draw Show.
            </p>
          )}
        </section>

        {/* Tee Times */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Tee Times
          </h2>
          {showTeeTimes ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tee Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Team 1</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Team 2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teeTimes.map(teeTime => {
                    const assignments = teeAssignments.filter(a => a.tee_time_id === teeTime.id)
                    const team1 = assignments.find(a => a.slot_in_foursome === 1)
                    const team2 = assignments.find(a => a.slot_in_foursome === 2)

                    return (
                      <tr key={teeTime.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {teeTime.label}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {team1?.revealed && team1.team
                            ? `${team1.team.left_player?.display_name} & ${team1.team.right_player?.display_name}`
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
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
          ) : (
            <p className="text-center text-gray-600 bg-white rounded-lg shadow p-8">
              Tee times will be revealed after the draw.
            </p>
          )}
        </section>

        {/* Sponsors */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Sponsors
          </h2>
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>Sponsor information coming soon</p>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-gray-400 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>&copy; 2026 Quasar Golf Club</p>
        </div>
      </footer>
    </div>
  )
}

function TierColumn({
  title,
  players,
  color,
}: {
  title: string
  players: Player[]
  color: string
}) {
  return (
    <div className={`${color} rounded-lg p-4`}>
      <h3 className="font-semibold text-gray-800 mb-3 text-center">{title}</h3>
      <ul className="space-y-1">
        {players.map(player => (
          <li key={player.id} className="text-sm text-gray-700 text-center">
            {player.display_name}
          </li>
        ))}
      </ul>
    </div>
  )
}
