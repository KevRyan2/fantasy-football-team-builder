var axios = require("axios").default;
var api_key = require('../env.json')['rapid_api_key'];
const teamNameMap = require('../data/teamFullNameMap.json');
// Testing
const testVegasData = require('../data/testVegasOdds.json');

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

async function getVegasData() {
  try {
    //TESTING
    let vegasData = {
     totals: testVegasData.totals.data,
     spreads: testVegasData.spreads.data
   };
    //PROD
    // let totals = await axios.request(totalsOptions);
    // let spreads = await axios.request(spreadOptions);
    // let vegasData = {
    //   totals: totals.data,
    //   spreads: spreads.data
    // };
    // let jsondata = JSON.stringify(vegasData);
    // console.log('+------------------------+');
    // console.log('| stringify vegas data |', jsondata);
    // console.log('+------------------------+');
    // fs.writeFile('./data/testVegasOdds.json', jsondata, function (err) {
    //  if (err) throw err;
    // });
    // return jsondata;
    let teamOdds = {};
    for (let i = vegasData.totals.length - 1; i >= 0; i--) {
      let teamObj = vegasData.totals[i];
      let odds = teamObj.sites.filter((obj) => {
        const { site_key } = obj;
        return site_key === 'barstool';
      });
      teamOdds[teamNameMap[teamObj.teams[0]]] = odds;
      teamOdds[teamNameMap[teamObj.teams[1]]] = odds;
    }
    let filteredTeamOdds = {};
    Object.keys(teamOdds).forEach(function(teamKey) {
      filteredTeamOdds[teamKey] = teamOdds[teamKey][0].odds.totals.points[0];
    });
    // let finalOdds = {};
    // Object.keys(filteredTeamOdds).forEach(function(teamKey) {
    //   finalOdds[teamKey] = filteredTeamOdds[teamKey].totals.points[0];
    // });
    console.log('+------------------------+');
    console.log('| team data totals |', filteredTeamOdds);
    console.log('+------------------------+');
    return filteredTeamOdds;
  } catch (e) {
    console.error('error with getVegasData', e);
    return e;
  }
}




module.exports = { 
  getVegasOdds: getVegasData
};



