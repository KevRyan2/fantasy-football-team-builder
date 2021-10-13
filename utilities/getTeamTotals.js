const fs = require('fs');
var axios = require("axios").default;
var api_key = require('../env.json')['rapid_api_key'];
const teamNameMap = require('../data/teamFullNameMap.json');
// Testing or after it's already been run
const weekNum = 'week-6';
const testVegasData = require(`../data/${weekNum}/testVegasOdds.json`);

// Get the game totals
var totalsOptions = {
  method: 'GET',
  url: 'https://odds.p.rapidapi.com/v1/odds',
  params: {
    sport: 'americanfootball_nfl',
    region: 'us',
    mkt: 'totals',
    dateFormat: 'iso',
    oddsFormat: 'decimal'
  },
  headers: {
    'x-rapidapi-host': 'odds.p.rapidapi.com',
    'x-rapidapi-key': api_key
  }
};

// Get the spread
var spreadOptions = {
  method: 'GET',
  url: 'https://odds.p.rapidapi.com/v1/odds',
  params: {
    sport: 'americanfootball_nfl',
    region: 'us',
    mkt: 'spreads',
    dateFormat: 'iso',
    oddsFormat: 'decimal'
  },
  headers: {
    'x-rapidapi-host': 'odds.p.rapidapi.com',
    'x-rapidapi-key': api_key
  }
};
async function setTeamTotalFromData (teamTotals, numTopTeamTotals) {
  try {
    let sortedArray = [];
    for (var team in teamTotals) {
        sortedArray.push([team, teamTotals[team]]);
    }
    sortedArray.sort(function(a, b) {
        return a[1] - b[1];
    });
    let slicedArray = sortedArray.slice(Math.max(sortedArray.length - numTopTeamTotals, 0));
    var sortedObj = {}
    slicedArray.forEach(function(item){
        sortedObj[item[0]]=item[1]
    });
    topTenTeamTotals = Object.keys(sortedObj);
    return topTenTeamTotals;
  } catch (e) {
    console.error('error in setTeamTotalFromData', e);
  }
}

async function getTeamTotals(numTopTeamTotals) {
  try {
    // TESTING
      let vegasData = {
        totals: testVegasData.totals.data,
        spreads: testVegasData.spreads.data
      };
    // PROD 
    // ONCE PER WEEK
    // let totals = await axios.request(totalsOptions);
    // let spreads = await axios.request(spreadOptions);
    //  let vegasData = {
    //    totals: totals.data,
    //    spreads: spreads.data
    //  };
    let teamOdds = {};
    for (let i = vegasData.totals.length - 1; i >= 0; i--) {
      let teamObj = vegasData.totals[i];
      let teamObjSpreads = vegasData.spreads[i];
      let odds = teamObj.sites.filter((obj) => {
        const { site_key } = obj;
        return site_key === 'barstool';
      });
      let spreads = teamObjSpreads.sites.filter((obj) => {
        const { site_key } = obj;
        return site_key === 'barstool';
      });
      teamOdds[teamNameMap[teamObj.teams[0]]] = Object.assign({}, { 
        totals: odds[0].odds.totals,
        spreads: spreads[0].odds.spreads
      });
      teamOdds[teamNameMap[teamObj.teams[1]]] = Object.assign({}, { 
        totals: odds[0].odds.totals,
        spreads: spreads[0].odds.spreads
      });
    }

    let teamTotals = {};
    Object.keys(teamOdds).forEach(function(teamKey) {
      teamTotals[teamKey] = (teamOdds[teamKey].totals.points[0]/2) - (teamOdds[teamKey].spreads.points[0]/2);
    });
    // ONCE PER WEEK
    // let jsondata = JSON.stringify(vegasData);
    // fs.writeFile(`./data/${weekNum}/testVegasOdds.json`, jsondata, function (err) {
    //  if (err) throw err;
    // });
    let finalTeamTotals = await setTeamTotalFromData(teamTotals, numTopTeamTotals);
    return finalTeamTotals;
  } catch (e) {
    console.error('error with getVegasData', e);
    return e;
  }
}

// Uncomment and run from the terminal if you just want test results
// getVegasData();
module.exports = { 
  getTeamTotals: getTeamTotals
};



