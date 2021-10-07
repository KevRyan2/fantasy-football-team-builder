var axios = require("axios").default;
var api_key = require('../env.json')['rapid_api_key'];

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
    let totals = await axios.request(totalsOptions);
    let spreads = await axios.request(spreadOptions);
    let vegasData = {
      totals: totals.data,
      spreads: spreads.data
    };
    return vegasData;
  } catch (e) {
    console.error('error with getVegasData', e);
    return e;
  }
}




module.exports = { 
  getVegasOdds: getVegasData
};



