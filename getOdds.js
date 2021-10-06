var axios = require("axios").default;
var api_key = require('./env.json')[api_key];

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

let vegasData = {};

async function getVegasData() {
  axios.request(totalsOptions).then(function (resTotals) {
    console.log('got totals', resTotals.data);
    vegasData.totals = resTotals.data;
    axios.request(spreadOptions).then(function (resSpreads) {
      console.log('got spreads', resSpreads.data);
      return vegasData.spreads = resSpreads.data;
    }).catch(function (error) {
      console.error(error);
    });
  }).catch(function (error) {
    console.error(error);
  });
}




module.exports = getVegasData;



