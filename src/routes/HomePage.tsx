import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchDrawState,
  fetchPlayers,
  fetchTeams,
  fetchTeeTimes,
  fetchTeeAssignments,
} from '../lib/drawService'
import type { DrawState, Player, Team, TeeTime, TeeAssignment } from '../lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Trophy, Calendar, Users, MapPin, Award, Clock } from 'lucide-react'

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

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
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

  const tier1 = players.filter(p => p.tier === 'T1')
  const tier2a = players.filter(p => p.tier === 'T2A')
  const tier2b = players.filter(p => p.tier === 'T2B')
  const tier3 = players.filter(p => p.tier === 'T3')

  const showTeams = drawState && ['PAIRINGS_DONE', 'TEE_TIMES_READY', 'TEE_TIMES_DONE'].includes(drawState.status)
  const showTeeTimes = drawState && ['TEE_TIMES_READY', 'TEE_TIMES_DONE'].includes(drawState.status)

  function getTierPairing(team: Team): string {
    const leftTier = team.left_player?.tier
    const rightTier = team.right_player?.tier
    if (leftTier === 'T1' || rightTier === 'T1') return 'T1 + T3'
    return 'T2A + T2B'
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Trophy className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Inaugural Tournament</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            Quasar GC Masters
          </h1>

          <p className="text-xl md:text-2xl mb-3 text-white/90 font-light">
            2-Person Combined Stroke Play Tournament
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-base md:text-lg mb-2 text-white/80">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>January 2nd, 2026</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>Diamond Bar Golf Course</span>
            </div>
          </div>

          <p className="text-lg mb-8 text-white/70">
            20 players, 10 teams, one Masters champion.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => scrollToSection('event-overview')}
              className="bg-accent text-primary hover:bg-accent/90 font-semibold shadow-lg"
            >
              View Event Details
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm bg-white/10 font-semibold"
              asChild
            >
              <Link to="/pairing-draw">Watch Live Draw</Link>
            </Button>
          </div>

          <p className="text-sm mt-6 text-white/60">Presented by Quasar Golf Club</p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {/* Event Overview */}
        <section id="event-overview" className="animate-fade-in">
          <Card className="p-8 shadow-md border-muted">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Event Overview</h2>
            </div>

            <div className="space-y-4 text-foreground/80 leading-relaxed">
              <p>
                The Quasar GC Masters is a 2-person combined stroke play tournament at Diamond Bar Golf Course on January 2nd, 2026.
              </p>

              <p>
                We've got 20 players split into skill-based tiers. Once the live draw starts, we'll pair everyone into 10 teams and send them out over 5 tee times. Every stroke counts, and the team with the lowest combined score at the end of the round takes the title.
              </p>

              <p>
                Teams are formed using a tiered random draw:<br />
                – Tier 1 players are paired with Tier 3 players<br />
                – Tier 2 Group A players are paired with Tier 2 Group B players
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-muted">
              <h3 className="text-lg font-semibold mb-4">Quick Facts</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Format</p>
                    <p className="text-sm text-muted-foreground">2-Person Combined Stroke Play</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Field</p>
                    <p className="text-sm text-muted-foreground">20 Players (10 Teams)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Course</p>
                    <p className="text-sm text-muted-foreground">Diamond Bar GC</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">January 2nd, 2026</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:col-span-2">
                  <Trophy className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Pairings</p>
                    <p className="text-sm text-muted-foreground">Live random draw using Wheel of Names</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Player Tiers */}
        <section className="animate-fade-in">
          <Card className="p-8 shadow-md border-muted">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Player Tiers</h2>
            </div>

            <p className="text-foreground/80 mb-6 leading-relaxed">
              To keep things competitive and fun, everyone is placed into one of four tiers based on current form and general chaos factor. Teams are created by pairing players across tiers, so every group has a mix of firepower and vibes.
            </p>

            <Accordion type="single" collapsible defaultValue="tier-1" className="space-y-3">
              <AccordionItem value="tier-1" className="border border-muted rounded-lg px-4 bg-card">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-semibold text-lg">Tier 1 – Top Tier</span>
                    <span className="text-sm text-muted-foreground hidden sm:inline">Our current top two players</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2 text-foreground/80">
                  <div className="space-y-3">
                    <p className="font-medium text-golf-green">Players: {tier1.map(p => p.display_name).join(', ') || 'TBD'}</p>
                    <p>
                      These are the heavy hitters. Tier 1 players are paired with Tier 3 players to balance out the field while still rewarding good play.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tier-2a" className="border border-muted rounded-lg px-4 bg-card">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-semibold text-lg">Tier 2 – Group A (Balanced A)</span>
                    <span className="text-sm text-muted-foreground hidden sm:inline">Solid games, trending up</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2 text-foreground/80">
                  <div className="space-y-3">
                    <p className="font-medium text-golf-green">Players: {tier2a.map(p => p.display_name).join(', ') || 'TBD'}</p>
                    <p>
                      Tier 2 Group A players are part of the middle pack with steady games and a mix of experience. During the draw, each Group A player will be paired with someone from Group B.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tier-2b" className="border border-muted rounded-lg px-4 bg-card">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-semibold text-lg">Tier 2 – Group B (Balanced B)</span>
                    <span className="text-sm text-muted-foreground hidden sm:inline">Wildcard energy with scoring potential</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2 text-foreground/80">
                  <div className="space-y-3">
                    <p className="font-medium text-golf-green">Players: {tier2b.map(p => p.display_name).join(', ') || 'TBD'}</p>
                    <p>
                      Group B brings the creativity, volatility, and occasional heaters. These players are paired with Group A to create balanced, unpredictable teams.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tier-3" className="border border-muted rounded-lg px-4 bg-card">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-semibold text-lg">Tier 3 – Bonus Strokes Crew</span>
                    <span className="text-sm text-muted-foreground hidden sm:inline">Getting a little help on the card</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2 text-foreground/80">
                  <div className="space-y-3">
                    <p className="font-medium text-golf-green">Players: {tier3.map(p => p.display_name).join(', ') || 'TBD'}</p>
                    <p>
                      Tier 3 players get a 6-stroke bonus applied at the end of the round. They still play their own ball all day — the bonus just levels things out and keeps every team in the hunt.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </section>

        {/* Rules & Format */}
        <section className="animate-fade-in">
          <Card className="p-8 shadow-md border-muted">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Rules & Format</h2>
            </div>

            <div className="space-y-8">
              {/* How Scoring Works */}
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">How Scoring Works</h3>
                <div className="text-foreground/80 space-y-2 leading-relaxed">
                  <p>This is a 2-person combined stroke play event.</p>
                  <ul className="list-none space-y-1 ml-4">
                    <li>– Each player plays their own ball for the entire round.</li>
                    <li>– Every stroke counts toward your individual score.</li>
                    <li>– Your team score for the round is the sum of both players' total strokes.</li>
                    <li>– Tier 3 players receive a 6-stroke bonus that is applied at the end of the round.</li>
                    <li>– The team with the lowest adjusted combined score wins the Quasar GC Masters.</li>
                  </ul>
                </div>
              </div>

              {/* Grid for smaller sections */}
              <div className="grid md:grid-cols-2 gap-6 pt-4">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-primary">Teeing Off & Order of Play</h3>
                  <div className="text-foreground/80 text-sm space-y-1 leading-relaxed">
                    <p>– Players tee off from their assigned tee times and groupings.</p>
                    <p>– Men play from the white tees. Women may play from the red tees.</p>
                    <p>– On the first tee, the group can decide the order.</p>
                    <p>– After tee shots, the player farthest from the hole plays first.</p>
                    <p>– Use ready golf whenever it's safe to keep things moving.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-primary">On the Green</h3>
                  <div className="text-foreground/80 text-sm space-y-1 leading-relaxed">
                    <p>– Mark and lift your ball as needed to avoid other players' lines.</p>
                    <p>– Repair your ball marks and any you see nearby.</p>
                    <p>– You may putt with the flagstick in or out.</p>
                    <p>– All putts must be holed out — no gimmies for this event.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-primary">Scorekeeping</h3>
                  <div className="text-foreground/80 text-sm space-y-1 leading-relaxed">
                    <p>– Each team is responsible for keeping their own card and acting as a marker for one other team.</p>
                    <p>– At the end of the round, compare cards and confirm hole-by-hole.</p>
                    <p>– Once scores are agreed on, sign the card and turn in one official scorecard per team.</p>
                    <p>– A higher score than shot must stand; a lower score is DQ.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-primary">Pace of Play</h3>
                  <div className="text-foreground/80 text-sm space-y-1 leading-relaxed">
                    <p>– Keep up with the group in front of you, not just the group behind you.</p>
                    <p>– Limit ball searches to 3 minutes.</p>
                    <p>– Play ready golf whenever it's safe to do so.</p>
                    <p>– Maximum score is double par on any hole. Once you've reached double par, pick up and move on.</p>
                  </div>
                </div>
              </div>

              {/* Penalties & Drops (full width) */}
              <div className="pt-2">
                <h3 className="text-xl font-semibold mb-3 text-primary">Penalties & Drops</h3>
                <div className="text-foreground/80 text-sm space-y-3 leading-relaxed">
                  <div>
                    <p className="font-medium mb-1">Lost Ball / Out of Bounds</p>
                    <p>– You have up to 3 minutes to search for your ball.</p>
                    <p>– If the ball is lost or out of bounds, take stroke-and-distance: Add 1 penalty stroke and replay from the spot of your previous stroke.</p>
                  </div>

                  <div>
                    <p className="font-medium mb-1">Penalty Areas (Hazards)</p>
                    <p>– Marked by yellow or red stakes/lines.</p>
                    <p>– Yellow penalty areas: replay from the previous spot, or drop behind the hazard keeping the point of entry between you and the flag.</p>
                    <p>– Red penalty areas: same options as yellow, plus lateral relief within two club lengths from where the ball last crossed the margin (no closer to the hole).</p>
                  </div>

                  <div>
                    <p className="font-medium mb-1">Unplayable Lies</p>
                    <p>– You can declare your ball unplayable anywhere except in a penalty area.</p>
                    <p>– Add 1 penalty stroke, then choose: replay from the previous spot, drop within two club lengths no closer to the hole, or drop back on a line from the flag through where the ball lies.</p>
                  </div>
                </div>
              </div>

              {/* Contest Holes */}
              <div className="pt-2">
                <h3 className="text-xl font-semibold mb-3 text-primary">Contest Holes</h3>
                <div className="text-foreground/80 text-sm space-y-2 leading-relaxed">
                  <p>We'll have fun side games running during the round:</p>

                  <div>
                    <p className="font-medium">Longest Drive (hole TBD)</p>
                    <p>– Drive must finish in the fairway to qualify.</p>
                  </div>

                  <div>
                    <p className="font-medium">Closest to the Pin (hole TBD)</p>
                    <p>– Tee shot must finish on the green to qualify.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Teams */}
        <section className="animate-fade-in">
          <Card className="p-8 shadow-md border-muted">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Teams</h2>
            </div>

            {showTeams ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Team</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Player 1</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Player 2</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Tier Pairing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted">
                    {teams.map(team => (
                      <tr key={team.id}>
                        <td className="px-4 py-3 text-sm font-medium">
                          {team.team_number}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {team.left_player?.display_name || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {team.right_player?.display_name || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {getTierPairing(team)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-foreground/80">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg mb-2">Teams will be drawn live during the Quasar GC Masters Draw Show.</p>
                <p className="text-muted-foreground">Once the draw is complete, this section will update with all 10 teams and their tier pairings.</p>
              </div>
            )}
          </Card>
        </section>

        {/* Tee Times */}
        <section className="animate-fade-in">
          <Card className="p-8 shadow-md border-muted">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Tee Times</h2>
            </div>

            {showTeeTimes ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Time</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Group</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Teams</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted">
                    {teeTimes.map((teeTime, idx) => {
                      const assignments = teeAssignments.filter(a => a.tee_time_id === teeTime.id)
                      const team1 = assignments.find(a => a.slot_in_foursome === 1)
                      const team2 = assignments.find(a => a.slot_in_foursome === 2)

                      return (
                        <tr key={teeTime.id}>
                          <td className="px-4 py-3 text-sm font-medium">
                            {teeTime.label}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {team1?.revealed && team1.team && team2?.revealed && team2.team
                              ? `${team1.team.left_player?.display_name} & ${team1.team.right_player?.display_name}, ${team2.team.left_player?.display_name} & ${team2.team.right_player?.display_name}`
                              : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-foreground/80">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg mb-2">Tee times will be assigned and revealed after the live draw.</p>
                <p className="text-muted-foreground">Check back here after the show for your exact group and start time.</p>
              </div>
            )}
          </Card>
        </section>

        {/* Sponsors */}
        <section className="animate-fade-in">
          <Card className="p-8 shadow-md border-muted bg-gradient-to-br from-card to-muted/20">
            <h2 className="text-3xl font-bold mb-6">Sponsors</h2>

            <div className="text-center py-6 text-foreground/80">
              <p className="text-lg mb-2">Sponsor information for the Quasar GC Masters is coming soon.</p>
              <p className="text-muted-foreground">If you're interested in supporting future QGC events, reach out to the committee and we'll share available packages and opportunities.</p>
            </div>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2026 Quasar Golf Club • All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-accent transition-colors">Quasar Golf Club</a>
              <a href="#" className="hover:text-accent transition-colors">Instagram</a>
              <a href="#" className="hover:text-accent transition-colors">Discord</a>
              <a href="#" className="hover:text-accent transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
