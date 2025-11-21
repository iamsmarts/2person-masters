export type Tier = 'T1' | 'T2A' | 'T2B' | 'T3'

export type DrawStatus =
  | 'NOT_STARTED'
  | 'PAIRING_T1_T3'
  | 'PAIRING_T2_TIERS'
  | 'PAIRINGS_DONE'
  | 'TEE_TIMES_READY'
  | 'TEE_TIMES_DONE'

export type FillingSide = 'left' | 'right'

export interface Player {
  id: string
  display_name: string
  tier: Tier
  active: boolean
  created_at: string
}

export interface Team {
  id: string
  team_number: number
  left_player_id: string | null
  right_player_id: string | null
  created_at: string
  // Joined data
  left_player?: Player
  right_player?: Player
}

export interface TeeTime {
  id: string
  label: string
  slot_index: number
  created_at: string
}

export interface TeeAssignment {
  id: string
  tee_time_id: string
  team_id: string
  slot_in_foursome: 1 | 2
  reveal_order: number
  revealed: boolean
  created_at: string
  // Joined data
  team?: Team
  tee_time?: TeeTime
}

export interface DrawState {
  id: string
  status: DrawStatus
  current_team_number: number | null
  currently_filling_side: FillingSide | null
  current_tee_reveal_index: number | null
  resets_used: number
  reset_amounts: number[]
  created_at: string
  updated_at: string
}
