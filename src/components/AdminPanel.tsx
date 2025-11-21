import { useState } from 'react'
import type { DrawState } from '../lib/types'

interface AdminPanelProps {
  drawState: DrawState
  onStartDraw: () => Promise<void>
  onRevealLeft: () => Promise<void>
  onRevealRight: () => Promise<void>
  onGenerateTeeTimes: () => Promise<void>
  onRevealNextTee: () => Promise<void>
  onPaidReset: (amount: number) => Promise<void>
  onReset: () => Promise<void>
}

export default function AdminPanel({
  drawState,
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
    const amount = parseFloat(paidResetAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Enter a valid amount')
      return
    }

    // Check if amount is higher than previous
    if (drawState.reset_amounts.length > 0) {
      const lastAmount = drawState.reset_amounts[drawState.reset_amounts.length - 1]
      if (amount <= lastAmount) {
        alert(`Amount must be higher than $${lastAmount}`)
        return
      }
    }

    setLoading(true)
    try {
      await onPaidReset(amount)
      setPaidResetAmount('')
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4 shadow-lg">
      <div className="max-w-6xl mx-auto">
        {/* State Display */}
        <div className="mb-4 text-sm text-gray-400 flex flex-wrap gap-4">
          <span>Status: <strong className="text-white">{status}</strong></span>
          {current_team_number && (
            <span>Team: <strong className="text-white">{current_team_number}</strong></span>
          )}
          {currently_filling_side && (
            <span>Side: <strong className="text-white">{currently_filling_side}</strong></span>
          )}
          {current_tee_reveal_index && (
            <span>Reveal: <strong className="text-white">{current_tee_reveal_index}/10</strong></span>
          )}
          <span>
            Resets: <strong className={resets_used >= 3 ? 'text-red-400' : 'text-masters-yellow'}>{resets_used}/3</strong>
            {reset_amounts.length > 0 && (
              <span className="text-gray-500 ml-1">
                (${reset_amounts.join(', $')})
              </span>
            )}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => handleAction(onStartDraw)}
            disabled={!canStart || loading}
            className="px-4 py-2 bg-green-600 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
          >
            Start Draw
          </button>

          <button
            onClick={() => handleAction(onRevealLeft)}
            disabled={!canRevealLeft || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Reveal Left Player
          </button>

          <button
            onClick={() => handleAction(onRevealRight)}
            disabled={!canRevealRight || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Reveal Right Player
          </button>

          <button
            onClick={() => handleAction(onGenerateTeeTimes)}
            disabled={!canGenerateTee || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
          >
            Generate Tee Times
          </button>

          <button
            onClick={() => handleAction(onRevealNextTee)}
            disabled={!canRevealTee || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
          >
            Reveal Next Tee Slot
          </button>

          {/* Paid Reset */}
          <div className="flex items-center gap-2 border-l border-gray-700 pl-3">
            <span className="text-xs text-gray-500">$</span>
            <input
              type="number"
              value={paidResetAmount}
              onChange={e => setPaidResetAmount(e.target.value)}
              placeholder="Amount"
              min="1"
              className="px-2 py-2 bg-gray-800 text-white rounded border border-gray-600 text-sm w-20"
            />
            <button
              onClick={handlePaidReset}
              disabled={!canPaidReset || loading}
              className="px-4 py-2 bg-yellow-600 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-700 transition-colors"
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
              placeholder='Type "RESET"'
              className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 text-sm w-32"
            />
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded font-medium disabled:opacity-50 hover:bg-red-700 transition-colors"
            >
              Full Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
