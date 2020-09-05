# Fantasy Football Team Builder

Automatically build a team for DraftKings.

## About

The team builder uses weekly game data provided by DraftKings to generate a full team within the salary cap. It places a 'value' on each player according to their salary versus average points per game.

## Installation and Usage

### NPM

```bash
npm init
```
### DraftKings Data

Download the player data in CSV format from their site and convert it to JSON with something like [csvjson](https://csvjson.com/). Name the file `draftkings.json` and save it in the project directory.

`draftkings.json` should look similar to this:

```javascript
[
    {
        "Position": "RB",
        "Name + ID": "Christian McCaffrey (15033483)",
        "Name": "Christian McCaffrey",
        "ID": 15033483,
        "Roster Position": "RB/FLEX",
        "Salary": 10000,
        "Game Info": "LV@CAR 09/13/2020 01:00PM ET",
        "TeamAbbrev": "CAR",
        "AvgPointsPerGame": 30.95
    },
    {
        "Position": "WR",
        "Name + ID": "Michael Thomas (15033799)",
        "Name": "Michael Thomas",
        "ID": 15033799,
        "Roster Position": "WR/FLEX",
        "Salary": 9000,
        "Game Info": "TB@NO 09/13/2020 04:25PM ET",
        "TeamAbbrev": "NO",
        "AvgPointsPerGame": 24.62
    }
]
```

### Build a Team

```bash
node team-builder.js
```

A file named `team.json` will be saved in the project.

### Bench

Remove players from the team builder by adding them to the bench array.

```javascript
const bench = [ "Christian McCaffrey", "Michael Thomas" ]
```

### Rebuilding a Team

The first time the team is built, if it is over the salary cap, the team will be rebuilt by removing a player by position. The order of positions can be modified in the replacements array.

```javascript
const replacements = [ "DST", "DST", "TE", "QB", "WR", "TE", "RB", "DST" ]
```

### Final Team Example

```javascript
+-----------------------------------+
| final team  {
  qb1: {
    name: 'Lamar Jackson',
    salary: 8100,
    position: 'QB',
    team: 'BAL',
    points: 0,
    avgpoints: 29.85,
    value: 271.356783919598
  },
  rb1: {
    name: 'Mark Ingram II',
    salary: 5500,
    position: 'RB',
    team: 'BAL',
    points: 0,
    avgpoints: 16.29,
    value: 337.6304481276857
  },
  rb2: {
    name: 'Austin Ekeler',
    salary: 7000,
    position: 'RB',
    team: 'LAC',
    points: 0,
    avgpoints: 20.19,
    value: 346.70629024269437
  },
  wr1: {
    name: 'Davante Adams',
    salary: 7300,
    position: 'WR',
    team: 'GB',
    points: 0,
    avgpoints: 20.96,
    value: 348.28244274809157
  },
  wr2: {
    name: 'DeAndre Hopkins',
    salary: 6800,
    position: 'WR',
    team: 'ARI',
    points: 0,
    avgpoints: 19.08,
    value: 356.39412997903565
  },
  wr3: {
    name: 'Marvin Jones Jr.',
    salary: 5500,
    position: 'WR',
    team: 'DET',
    points: 0,
    avgpoints: 15.38,
    value: 357.6072821846554
  },
  te1: {
    name: 'Jacob Hollister',
    salary: 3000,
    position: 'TE',
    team: 'SEA',
    points: 0,
    avgpoints: 8.25,
    value: 363.6363636363636
  },
  fx1: {
    name: 'Jason Witten',
    salary: 3200,
    position: 'TE',
    team: 'LV',
    points: 0,
    avgpoints: 8.81,
    value: 363.22360953461975
  },
  dst1: {
    name: '49ers',
    salary: 3500,
    position: 'DST',
    team: 'SF',
    points: 0,
    avgpoints: 10.16,
    value: 344.48818897637796
  },
  totaldkpoints: 148,
  salary: -100
}
+------------------------+----------+
| allowed salary         | 50000
| total salary           | 49900
| over salary            | -100
| total dk avg points    | 148
+------------------------+----------+
```