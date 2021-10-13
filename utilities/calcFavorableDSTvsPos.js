const mapTeamNicknameAbbrev = require('../data/nicknameTeamMap.json');
/* Weak Opponent DST - CBS Sports by position */
async function calcFavorableDSTvsPos(defenseArray, numToReturn) {
    let favorableTeamData = defenseArray.slice(0, numToReturn);
    let teams = [];
    for (let i = favorableTeamData.length - 1; i >= 0; i--) {
        const def_full = favorableTeamData[i]['TEAM'].substr(6);
        const def_abbrev = mapTeamNicknameAbbrev[def_full];
        teams.push(def_abbrev);
    }
    return teams;
}

module.exports = { 
  calcFavorableDSTvsPos: calcFavorableDSTvsPos
};
