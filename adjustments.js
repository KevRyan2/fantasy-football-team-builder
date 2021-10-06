const adjustedValues = {
	// 1. Adjust by position against bottom 10 opponent to that position
	weakDEFvsQB:  0.95,
	weakDEFvsWR:  0.90,
	weakDEFvsRB:  0.90,
	weakDEFvsTE:  0.95,
	weakOFFvsDST: 0.85,
	// 2. Adjust for implied team total (vegas odds)
	topHalfTeamTotal: 0.90
}; 

module.exports = adjustedValues;


// SIM TESTING WILL BE NEEDED
// 1. Add a locked players array
// 2. Add a stack option w/ bool toggle, need position locks for stack (QB + WR/TE)
// 3. Need to factor in variance - week by week points not just average
//    - Get last years weekly totals per player, combine with this years, find the variance
//    - adjustValueForUpside
// 4. Need to factor in historical fantasy points
//    - ex. 10% adjustment vs current points (+10% if higher, -10% if lower)
// 5. Add in upside variace 
//    - based off #3
//    - boom/bust ratio (https://www.fanduel.com/research/nfl/content:626448/daily-fantasy-football-floor-and-ceiling-projections--week-4)
//    - adjustValueForUpside
// 6. Improve adjustValueForDST 
//    - base off of opponent DST
//    - factor in injuries
// 7. Use projected team totals based off vegas odds
//    - ex. large spread/low game total = worse for RB on underdog
//    - adjustValueForVegas
// 8. Home vs Away
//    - position by position basis
//    - adjustForHomeTeam
// 9. Adjust for weather
//    - rain/snow/wind can affect game script
//    - adjustForWeather
// Bonus. List of teams with positional oddities
//    - Teams with 1 good CB = adjustSecondBestReceiver (WR or TE) to have more value
//    - Teams with 2 good CB = adjustThirdBestReceiver (WR or TE) to have more value
//    - Teams that play zone = adjustLowVarianceReceiver (increase value to WR or TE with lower variance - slot/short passes)
// Bonus. Adjust for opponent boost
//    - add in top 3 opponents for each player
// Bonus. Adjust for ownership and value
//    - Multi-entry tournament toggle
//    - Add a list of chalk players to blocked players
//    - Increase value of other players on their team
// Bonus. Adjust for injuries
//    - Add list of DST's to devalue a
//    - Add list of backups that correlate to the injured player
// Advanced. GPP Leverage Score
//    - Likelihood of player hitting the total they need to win
//    - Implied ownership vs actual ownership
//    - https://www.4for4.com/gpp-leverage-scores-balancing-value-ownership-dfs
// https://github.com/BenBrostoff/draftfast