import { useState } from 'react'
import type { DrawState, Player } from '../lib/types'

interface AdminPanelProps {
  drawState: DrawState
  players: Player[]
  onStartDraw: () => Promise<void>
  onRevealLeft: () => Promise<void>
  onRevealRight: () => Promise<void>
  onGenerateTeeTimes: () => Promise<void>
  onRevealNextTee: () => Promise<void>
  onPaidReset: (playerName: string, amount: number) => Promise<void>
  onReset: () => Promise<void>
}

export default function AdminPanel({
  drawState,
  players,
  onStartDraw,
  onRevealLeft,
  onRevealRight,
  onGenerateTeeTimes,
  onRevealNextTee,
  onPaidReset,
  onReset,
}: AdminPanelProps) {
  const [loading, setLoading] = useState(false)
  const [resetConfirm, setResetConfirm] = useState('')
  const [paidResetAmount, setPaidResetAmount] = useState('')
  const [paidResetPlayer, setPaidResetPlayer] = useState('')

  async function handleAction(action: () => Promise<void>) {
    setLoading(true)
    try {
      await action()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  async function handlePaidReset() {
    if (!paidResetPlayer) {
      alert('Select a player')
      return
    }

    const amount = parseFloat(paidResetAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Enter a valid amount')
      return
    }

    // Check if amount is higher than previous
    if (drawState.reset_amounts.length > 0) {
      const lastAmount = drawState.reset_amounts[drawState.reset_amounts.length - 1].amount
      if (amount <= lastAmount) {
        alert(`Amount must be higher than $${lastAmount}`)
        return
      }
    }

    setLoading(true)
    try {
      await onPaidReset(paidResetPlayer, amount)
      setPaidResetAmount('')
      setPaidResetPlayer('')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Paid reset failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    if (resetConfirm !== 'RESET') {
      alert('Type RESET to confirm')
      return
    }
    await handleAction(onReset)
    setResetConfirm('')
  }

  const { status, current_team_number, currently_filling_side, current_tee_reveal_index, resets_used, reset_amounts } = drawState

  const canStart = status === 'NOT_STARTED'
  const canRevealLeft = ['PAIRING_T1_T3', 'PAIRING_T2_TIERS'].includes(status) && currently_filling_side === 'left'
  const canRevealRight = ['PAIRING_T1_T3', 'PAIRING_T2_TIERS'].includes(status) && currently_filling_side === 'right'
  const canGenerateTee = status === 'PAIRINGS_DONE'
  const canRevealTee = status === 'TEE_TIMES_READY'
  const canPaidReset = ['PAIRING_T1_T3', 'PAIRING_T2_TIERS'].includes(status) && resets_used < 3

  // Sort players alphabetically for the dropdown
  const sortedPlayers = [...players].sort((a, b) => a.display_name.localeCompare(b.display_name))

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-muted p-4 shadow-lg">
      <div className="max-w-6xl mx-auto">
        {/* State Display */}
        <div className="mb-4 text-sm text-muted-foreground flex flex-wrap gap-4">
          <span>Status: <strong className="text-foreground">{status}</strong></span>
          {current_team_number && (
            <span>Team: <strong className="text-foreground">{current_team_number}</strong></span>
          )}
          {currently_filling_side && (
            <span>Side: <strong className="text-foreground">{currently_filling_side}</strong></span>
          )}
          {current_tee_reveal_index && (
            <span>Reveal: <strong className="text-foreground">{current_tee_reveal_index}/10</strong></span>
          )}
          <span>
            Resets: <strong className={resets_used >= 3 ? 'text-destructive' : 'text-secondary'}>{resets_used}/3</strong>
            {reset_amounts.length > 0 && (
              <span className="text-muted-foreground ml-1">
                ({reset_amounts.map(r => `${r.player}: $${r.amount}`).join(', ')})
              </span>
            )}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => handleAction(onStartDraw)}
            disabled={!canStart || loading}
            className="px-4 py-2 bg-golf-green text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            Start Draw
          </button>

          <button
            onClick={() => handleAction(onRevealLeft)}
            disabled={!canRevealLeft || loading}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            Reveal Left Player
          </button>

          <button
            onClick={() => handleAction(onRevealRight)}
            disabled={!canRevealRight || loading}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            Reveal Right Player
          </button>

          <button
            onClick={() => handleAction(onGenerateTeeTimes)}
            disabled={!canGenerateTee || loading}
            className="px-4 py-2 bg-accent text-primary rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            Generate Tee Times
          </button>

          <button
            onClick={() => handleAction(onRevealNextTee)}
            disabled={!canRevealTee || loading}
            className="px-4 py-2 bg-accent text-primary rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            Reveal Next Tee Slot
          </button>

          {/* Paid Reset */}
          <div className="flex items-center gap-2 border-l border-muted pl-3">
            <select
              value={paidResetPlayer}
              onChange={e => setPaidResetPlayer(e.target.value)}
              className="px-2 py-2 bg-card text-foreground rounded border border-muted text-sm"
            >
              <option value="">Player...</option>
              {sortedPlayers.map(player => (
                <option key={player.id} value={player.display_name}>
                  {player.display_name}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">$</span>
            <input
              type="number"
              value={paidResetAmount}
              onChange={e => setPaidResetAmount(e.target.value)}
              placeholder="Amt"
              min="1"
              className="px-2 py-2 bg-card text-foreground rounded border border-muted text-sm w-16"
            />
            <button
              onClick={handlePaidReset}
              disabled={!canPaidReset || loading}
              className="px-4 py-2 bg-accent text-primary rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Paid Reset
            </button>
          </div>

          {/* Full Reset (testing) */}
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="text"
              value={resetConfirm}
              onChange={e => setResetConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
              placeholder='Type "RESET"'
              className="px-3 py-2 bg-card text-foreground rounded border border-muted text-sm w-32"
            />
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              Full Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
