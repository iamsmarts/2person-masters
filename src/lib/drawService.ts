import { supabase } from './supabaseClient'
import { shuffle, pickRandom } from './random'
import type { DrawState, DrawStatus, Player, Team, TeeTime, TeeAssignment, Tier } from './types'

// =============================================================================
// Data Fetching
// =============================================================================

export async function fetchDrawState(): Promise<DrawState> {
  const { data, error } = await supabase
    .from('draw_state')
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function fetchPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('active', true)
    .order('display_name')

  if (error) throw error
  return data
}

export async function fetchTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      left_player:players!teams_left_player_id_fkey(*),
      right_player:players!teams_right_player_id_fkey(*)
    `)
    .order('team_number')

  if (error) throw error
  return data
}

export async function fetchTeeTimes(): Promise<TeeTime[]> {
  const { data, error } = await supabase
    .from('tee_times')
    .select('*')
    .order('slot_index')

  if (error) throw error
  return data
}

export async function fetchTeeAssignments(): Promise<TeeAssignment[]> {
  const { data, error } = await supabase
    .from('tee_assignments')
    .select(`
      *,
      team:teams(
        *,
        left_player:players!teams_left_player_id_fkey(*),
        right_player:players!teams_right_player_id_fkey(*)
      ),
      tee_time:tee_times(*)
    `)
    .order('reveal_order')

  if (error) throw error
  return data
}

// =============================================================================
// Helper Functions
// =============================================================================

function getUsedPlayerIds(teams: Team[]): Set<string> {
  const usedIds = new Set<string>()
  for (const team of teams) {
    if (team.left_player_id) usedIds.add(team.left_player_id)
    if (team.right_player_id) usedIds.add(team.right_player_id)
  }
  return usedIds
}

function getRemainingPlayers(players: Player[], teams: Team[], tier: Tier): Player[] {
  const usedIds = getUsedPlayerIds(teams)
  return players.filter(p => p.tier === tier && !usedIds.has(p.id))
}

// =============================================================================
// Draw Actions
// =============================================================================

export async function startDraw(): Promise<void> {
  const drawState = await fetchDrawState()

  if (drawState.status !== 'NOT_STARTED') {
    throw new Error('Draw has already been started')
  }

  // Create 10 empty team rows
  const teamInserts = Array.from({ length: 10 }, (_, i) => ({
    team_number: i + 1,
    left_player_id: null,
    right_player_id: null,
  }))

  const { error: teamsError } = await supabase
    .from('teams')
    .insert(teamInserts)

  if (teamsError) throw teamsError

  // Update draw state
  const { error: stateError } = await supabase
    .from('draw_state')
    .update({
      status: 'PAIRING_T1_T3',
      current_team_number: 1,
      currently_filling_side: 'left',
      current_tee_reveal_index: null,
    })
    .eq('id', drawState.id)

  if (stateError) throw stateError
}

export async function revealLeftPlayer(): Promise<Player> {
  const drawState = await fetchDrawState()

  if (drawState.currently_filling_side !== 'left') {
    throw new Error('Not currently filling left side')
  }

  if (!drawState.current_team_number) {
    throw new Error('No current team number')
  }

  // Determine which tier to draw from
  let tier: Tier
  if (drawState.status === 'PAIRING_T1_T3') {
    tier = 'T1'
  } else if (drawState.status === 'PAIRING_T2_TIERS') {
    tier = 'T2A'
  } else {
    throw new Error(`Invalid status for revealing left player: ${drawState.status}`)
  }

  // Get remaining players
  const players = await fetchPlayers()
  const teams = await fetchTeams()
  const remaining = getRemainingPlayers(players, teams, tier)

  if (remaining.length === 0) {
    throw new Error(`No remaining players in tier ${tier}`)
  }

  // Pick random player
  const chosen = pickRandom(remaining)

  // Update team
  const { error: teamError } = await supabase
    .from('teams')
    .update({ left_player_id: chosen.id })
    .eq('team_number', drawState.current_team_number)

  if (teamError) throw teamError

  // Update draw state to right side
  const { error: stateError } = await supabase
    .from('draw_state')
    .update({ currently_filling_side: 'right' })
    .eq('id', drawState.id)

  if (stateError) throw stateError

  return chosen
}

export async function revealRightPlayer(): Promise<Player> {
  const drawState = await fetchDrawState()

  if (drawState.currently_filling_side !== 'right') {
    throw new Error('Not currently filling right side')
  }

  if (!drawState.current_team_number) {
    throw new Error('No current team number')
  }

  // Determine which tier to draw from
  let tier: Tier
  if (drawState.status === 'PAIRING_T1_T3') {
    tier = 'T3'
  } else if (drawState.status === 'PAIRING_T2_TIERS') {
    tier = 'T2B'
  } else {
    throw new Error(`Invalid status for revealing right player: ${drawState.status}`)
  }

  // Get remaining players
  const players = await fetchPlayers()
  const teams = await fetchTeams()
  const remaining = getRemainingPlayers(players, teams, tier)

  if (remaining.length === 0) {
    throw new Error(`No remaining players in tier ${tier}`)
  }

  // Pick random player
  const chosen = pickRandom(remaining)

  // Update team
  const { error: teamError } = await supabase
    .from('teams')
    .update({ right_player_id: chosen.id })
    .eq('team_number', drawState.current_team_number)

  if (teamError) throw teamError

  // Determine next state
  const currentTeamNum = drawState.current_team_number
  let nextStatus: DrawStatus = drawState.status
  let nextTeamNum: number | null = currentTeamNum + 1
  let nextSide: 'left' | 'right' | null = 'left'

  // Check if we need to switch stages or finish
  if (drawState.status === 'PAIRING_T1_T3' && currentTeamNum === 2) {
    // Finished T1/T3 pairings, switch to T2
    nextStatus = 'PAIRING_T2_TIERS'
    nextTeamNum = 3
  } else if (drawState.status === 'PAIRING_T2_TIERS' && currentTeamNum === 10) {
    // All pairings done
    nextStatus = 'PAIRINGS_DONE'
    nextTeamNum = null
    nextSide = null
  }

  // Update draw state
  const { error: stateError } = await supabase
    .from('draw_state')
    .update({
      status: nextStatus,
      current_team_number: nextTeamNum,
      currently_filling_side: nextSide,
    })
    .eq('id', drawState.id)

  if (stateError) throw stateError

  return chosen
}

export async function generateTeeTimes(): Promise<void> {
  const drawState = await fetchDrawState()

  if (drawState.status !== 'PAIRINGS_DONE') {
    throw new Error('Pairings must be completed before generating tee times')
  }

  // Fetch teams and tee times
  const teams = await fetchTeams()
  const teeTimes = await fetchTeeTimes()

  if (teams.length !== 10) {
    throw new Error(`Expected 10 teams, got ${teams.length}`)
  }

  if (teeTimes.length !== 5) {
    throw new Error(`Expected 5 tee times, got ${teeTimes.length}`)
  }

  // Shuffle teams
  const shuffledTeams = shuffle(teams)

  // Create assignments: 2 teams per tee time
  const assignments: Array<{
    tee_time_id: string
    team_id: string
    slot_in_foursome: number
    reveal_order: number
    revealed: boolean
  }> = []

  // Generate random reveal order
  const revealOrders = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

  for (let i = 0; i < 10; i++) {
    const teeTimeIndex = Math.floor(i / 2)
    const slotInFoursome = (i % 2) + 1

    assignments.push({
      tee_time_id: teeTimes[teeTimeIndex].id,
      team_id: shuffledTeams[i].id,
      slot_in_foursome: slotInFoursome,
      reveal_order: revealOrders[i],
      revealed: false,
    })
  }

  // Insert assignments
  const { error: assignError } = await supabase
    .from('tee_assignments')
    .insert(assignments)

  if (assignError) throw assignError

  // Update draw state
  const { error: stateError } = await supabase
    .from('draw_state')
    .update({
      status: 'TEE_TIMES_READY',
      current_tee_reveal_index: 1,
    })
    .eq('id', drawState.id)

  if (stateError) throw stateError
}

export async function revealNextTeeSlot(): Promise<TeeAssignment | null> {
  const drawState = await fetchDrawState()

  if (drawState.status !== 'TEE_TIMES_READY') {
    throw new Error('Tee times must be ready before revealing')
  }

  if (!drawState.current_tee_reveal_index) {
    throw new Error('No current reveal index')
  }

  const currentIndex = drawState.current_tee_reveal_index

  // Find assignment with this reveal order
  const { data: assignment, error: fetchError } = await supabase
    .from('tee_assignments')
    .select(`
      *,
      team:teams(
        *,
        left_player:players!teams_left_player_id_fkey(*),
        right_player:players!teams_right_player_id_fkey(*)
      ),
      tee_time:tee_times(*)
    `)
    .eq('reveal_order', currentIndex)
    .single()

  if (fetchError) throw fetchError

  // Mark as revealed
  const { error: updateError } = await supabase
    .from('tee_assignments')
    .update({ revealed: true })
    .eq('id', assignment.id)

  if (updateError) throw updateError

  // Update draw state
  let nextIndex: number | null = currentIndex + 1
  let nextStatus: DrawStatus = drawState.status

  if (currentIndex >= 10) {
    nextStatus = 'TEE_TIMES_DONE'
    nextIndex = null
  }

  const { error: stateError } = await supabase
    .from('draw_state')
    .update({
      status: nextStatus,
      current_tee_reveal_index: nextIndex,
    })
    .eq('id', drawState.id)

  if (stateError) throw stateError

  return { ...assignment, revealed: true }
}

export async function resetDraw(): Promise<void> {
  const drawState = await fetchDrawState()

  // Delete tee assignments
  const { error: assignError } = await supabase
    .from('tee_assignments')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

  if (assignError) throw assignError

  // Delete teams
  const { error: teamsError } = await supabase
    .from('teams')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

  if (teamsError) throw teamsError

  // Reset draw state (full reset - clears reset counters too)
  const { error: stateError } = await supabase
    .from('draw_state')
    .update({
      status: 'NOT_STARTED',
      current_team_number: null,
      currently_filling_side: null,
      current_tee_reveal_index: null,
      resets_used: 0,
      reset_amounts: [],
    })
    .eq('id', drawState.id)

  if (stateError) throw stateError
}

export async function paidReset(amount: number): Promise<void> {
  const drawState = await fetchDrawState()

  // Check if resets are still available
  if (drawState.resets_used >= 3) {
    throw new Error('Maximum resets (3) already used!')
  }

  // Check if we're in a valid state to reset (during pairing)
  if (!['PAIRING_T1_T3', 'PAIRING_T2_TIERS'].includes(drawState.status)) {
    throw new Error('Paid resets only available during pairing phase')
  }

  // Delete tee assignments (shouldn't exist yet, but just in case)
  const { error: assignError } = await supabase
    .from('tee_assignments')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (assignError) throw assignError

  // Delete teams
  const { error: teamsError } = await supabase
    .from('teams')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (teamsError) throw teamsError

  // Update draw state with new reset info
  const newAmounts = [...drawState.reset_amounts, amount]

  const { error: stateError } = await supabase
    .from('draw_state')
    .update({
      status: 'NOT_STARTED',
      current_team_number: null,
      currently_filling_side: null,
      current_tee_reveal_index: null,
      resets_used: drawState.resets_used + 1,
      reset_amounts: newAmounts,
    })
    .eq('id', drawState.id)

  if (stateError) throw stateError
}

// =============================================================================
// Computed Helpers
// =============================================================================

export function getLeftTier(status: string): Tier | null {
  if (status === 'PAIRING_T1_T3') return 'T1'
  if (status === 'PAIRING_T2_TIERS') return 'T2A'
  return null
}

export function getRightTier(status: string): Tier | null {
  if (status === 'PAIRING_T1_T3') return 'T3'
  if (status === 'PAIRING_T2_TIERS') return 'T2B'
  return null
}

export function getLeftBucketLabel(status: string): string {
  if (status === 'PAIRING_T1_T3') return 'Tier 1'
  if (status === 'PAIRING_T2_TIERS') return 'Tier 2 Group A'
  return ''
}

export function getRightBucketLabel(status: string): string {
  if (status === 'PAIRING_T1_T3') return 'Tier 3'
  if (status === 'PAIRING_T2_TIERS') return 'Tier 2 Group B'
  return ''
}

export function computeRemainingPlayers(
  players: Player[],
  teams: Team[],
  tier: Tier
): Player[] {
  return getRemainingPlayers(players, teams, tier)
}
