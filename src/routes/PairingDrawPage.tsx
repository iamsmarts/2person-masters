import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
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
  paidReset,
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
import { Trophy } from 'lucide-react'

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

  async function handlePaidReset(playerName: string, amount: number) {
    await paidReset(playerName, amount)
    await loadData()
  }

  async function handleReset() {
    await resetDraw()
    await loadData()
  }

  if (loading && !drawState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    )
  }

  if (!drawState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No draw state found</p>
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
    <div className={`min-h-screen bg-background ${isAdmin ? 'pb-32' : ''}`}>
      {/* Header */}
      <header className="hero-gradient py-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative z-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity">
            <Trophy className="w-6 h-6 text-accent" />
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Quasar GC Masters Draw
            </h1>
            <Trophy className="w-6 h-6 text-accent" />
          </Link>
          <p className="text-sm text-white/70">Live Pairing Draw</p>
        </div>
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
                  <p className="text-muted-foreground text-lg">
                    Waiting for draw to begin...
                  </p>
                </div>
              )}

              {drawState.status === 'PAIRINGS_DONE' && (
                <div className="mt-6 text-center">
                  <p className="text-golf-green text-lg font-bold">
                    All teams have been drawn!
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Ready to generate tee times.
                  </p>
                </div>
              )}

              {/* Reset History */}
              {drawState.resets_used > 0 && (
                <div
                  key={drawState.resets_used}
                  className="mt-6 bg-primary/10 px-4 py-3 rounded-lg text-center animate-slam border border-secondary/30"
                >
                  {[...drawState.reset_amounts].reverse().map((reset, index) => {
                    const emoji = index === 0 ? '☠️' : index === 1 ? '😵' : '😭'
                    return (
                      <div key={index} className="text-sm text-secondary font-bold">{emoji} {reset.player} triggered a ${reset.amount} reset</div>
                    )
                  })}
                  <div className="text-xs text-muted-foreground mt-2 border-t border-muted pt-2">
                    {3 - drawState.resets_used} reset{3 - drawState.resets_used !== 1 ? 's' : ''} remaining
                  </div>
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
                <p className="text-golf-green text-lg font-bold">
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
          players={players}
          onStartDraw={handleStartDraw}
          onRevealLeft={handleRevealLeft}
          onRevealRight={handleRevealRight}
          onGenerateTeeTimes={handleGenerateTeeTimes}
          onRevealNextTee={handleRevealNextTee}
          onPaidReset={handlePaidReset}
          onReset={handleReset}
        />
      )}
    </div>
  )
}
