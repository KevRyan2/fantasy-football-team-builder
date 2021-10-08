const adjustedValues = {
	// 1. Adjust by position against bottom 10 opponent to that position
	weakDEFvsQB:  0.95,
	weakDEFvsWR:  0.90,
	weakDEFvsRB:  0.90,
	weakDEFvsTE:  0.95,
	weakOFFvsDST: 0.85,
	// 2. Adjust for implied team total (vegas odds)
	topHalfTeamTotal: 0.95
}; 

module.exports = adjustedValues;