import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ADMIN_SECRET } from '../lib/supabaseClient'
import {
  fetchDrawState,
  fetchPlayers,
  fetchTeams,
  fetchTeeTimes,
  fetchTeeAssignments,
  startDraw,
  revealLeftPlayer,
  revealRightPlayer,
  generateTeeTimes,
  revealNextTeeSlot,
  resetDraw,
  getLeftTier,
  getRightTier,
  getLeftBucketLabel,
  getRightBucketLabel,
  computeRemainingPlayers,
} from '../lib/drawService'
import type { DrawState, Player, Team, TeeTime, TeeAssignment } from '../lib/types'
import ScorecardTable from '../components/ScorecardTable'
import BucketColumn from '../components/BucketColumn'
import TeeSheet from '../components/TeeSheet'
import AdminPanel from '../components/AdminPanel'

export default function PairingDrawPage() {
  const [searchParams] = useSearchParams()
  const isAdmin = searchParams.get('admin') === ADMIN_SECRET

  const [drawState, setDrawState] = useState<DrawState | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([])
  const [teeAssignments, setTeeAssignments] = useState<TeeAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Animation state
  const [highlightedPlayerId, setHighlightedPlayerId] = useState<string | null>(null)
  const [animatingTeam, setAnimatingTeam] = useState<number | null>(null)
  const [animatingSide, setAnimatingSide] = useState<'left' | 'right' | null>(null)
  const [lastRevealedTeeId, setLastRevealedTeeId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    loadData()
    // Poll for updates every 2 seconds
    const interval = setInterval(loadData, 2000)
    return () => clearInterval(interval)
  }, [loadData])

  async function handleStartDraw() {
    await startDraw()
    await loadData()
  }

  async function handleRevealLeft() {
    const chosen = await revealLeftPlayer()

    // Animation: highlight chosen player in bucket
    setHighlightedPlayerId(chosen.id)

    // After short delay, show in table
    setTimeout(async () => {
      await loadData()
      setAnimatingTeam(drawState?.current_team_number || null)
      setAnimatingSide('left')

      // Clear animations after a bit
      setTimeout(() => {
        setHighlightedPlayerId(null)
        setAnimatingTeam(null)
        setAnimatingSide(null)
      }, 1500)
    }, 500)
  }

  async function handleRevealRight() {
    const chosen = await revealRightPlayer()

    // Animation: highlight chosen player in bucket
    setHighlightedPlayerId(chosen.id)

    // After short delay, show in table
    setTimeout(async () => {
      await loadData()
      setAnimatingTeam(drawState?.current_team_number || null)
      setAnimatingSide('right')

      // Clear animations after a bit
      setTimeout(() => {
        setHighlightedPlayerId(null)
        setAnimatingTeam(null)
        setAnimatingSide(null)
      }, 1500)
    }, 500)
  }

  async function handleGenerateTeeTimes() {
    await generateTeeTimes()
    await loadData()
  }

  async function handleRevealNextTee() {
    const assignment = await revealNextTeeSlot()
    if (assignment) {
      setLastRevealedTeeId(assignment.id)
      await loadData()

      setTimeout(() => {
        setLastRevealedTeeId(null)
      }, 2000)
    }
  }

  async function handleReset() {
    await resetDraw()
    await loadData()
  }

  if (loading && !drawState) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (!drawState) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">No draw state found</p>
      </div>
    )
  }

  // Compute remaining players for buckets
  const leftTier = getLeftTier(drawState.status)
  const rightTier = getRightTier(drawState.status)
  const leftPlayers = leftTier ? computeRemainingPlayers(players, teams, leftTier) : []
  const rightPlayers = rightTier ? computeRemainingPlayers(players, teams, rightTier) : []
  const leftLabel = getLeftBucketLabel(drawState.status)
  const rightLabel = getRightBucketLabel(drawState.status)

  const showPairingView = ['NOT_STARTED', 'PAIRING_T1_T3', 'PAIRING_T2_TIERS', 'PAIRINGS_DONE'].includes(drawState.status)
  const showTeeTimeView = ['TEE_TIMES_READY', 'TEE_TIMES_DONE'].includes(drawState.status)

  return (
    <div className={`min-h-screen bg-gray-900 ${isAdmin ? 'pb-32' : ''}`}>
      {/* Header */}
      <header className="bg-masters-green py-4">
        <h1 className="text-2xl font-bold text-white text-center">
          QGC Masters Draw
        </h1>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {showPairingView && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Bucket */}
            <div className="lg:col-span-1">
              <BucketColumn
                title={leftLabel || 'Left Bucket'}
                players={leftPlayers}
                highlightedPlayerId={highlightedPlayerId}
                isActive={drawState.currently_filling_side === 'left'}
              />
            </div>

            {/* Center Scorecard */}
            <div className="lg:col-span-2">
              <ScorecardTable
                teams={teams}
                currentTeamNumber={drawState.current_team_number}
                currentlyFillingSide={drawState.currently_filling_side}
                animatingTeam={animatingTeam}
                animatingSide={animatingSide}
              />

              {drawState.status === 'NOT_STARTED' && (
                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-lg">
                    Waiting for draw to begin...
                  </p>
                </div>
              )}

              {drawState.status === 'PAIRINGS_DONE' && (
                <div className="mt-6 text-center">
                  <p className="text-masters-yellow text-lg font-bold">
                    All teams have been drawn!
                  </p>
                  <p className="text-gray-400 mt-2">
                    Ready to generate tee times.
                  </p>
                </div>
              )}
            </div>

            {/* Right Bucket */}
            <div className="lg:col-span-1">
              <BucketColumn
                title={rightLabel || 'Right Bucket'}
                players={rightPlayers}
                highlightedPlayerId={highlightedPlayerId}
                isActive={drawState.currently_filling_side === 'right'}
              />
            </div>
          </div>
        )}

        {showTeeTimeView && (
          <div className="max-w-3xl mx-auto">
            <TeeSheet
              teeTimes={teeTimes}
              teeAssignments={teeAssignments}
              lastRevealedId={lastRevealedTeeId}
            />

            {drawState.status === 'TEE_TIMES_DONE' && (
              <div className="mt-6 text-center">
                <p className="text-masters-yellow text-lg font-bold">
                  All tee times have been revealed!
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Admin Panel */}
      {isAdmin && (
        <AdminPanel
          drawState={drawState}
          onStartDraw={handleStartDraw}
          onRevealLeft={handleRevealLeft}
          onRevealRight={handleRevealRight}
          onGenerateTeeTimes={handleGenerateTeeTimes}
          onRevealNextTee={handleRevealNextTee}
          onReset={handleReset}
        />
      )}
    </div>
  )
}
