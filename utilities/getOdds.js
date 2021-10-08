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
    // console.log('+------------------------+');
    // console.log('| team data totals |', teamTotals);
    // console.log('+------------------------+');
    return teamTotals;
  } catch (e) {
    console.error('error with getVegasData', e);
    return e;
  }
}




module.exports = { 
  getVegasOdds: getVegasData
};



