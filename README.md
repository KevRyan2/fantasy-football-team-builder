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

### (Optional) FanDuel Data

Download the player data in CSV format from their site and convert it to JSON with something like [csvjson](https://csvjson.com/). Name the file `fanduel.json` and save it in the project directory.

`fanduel.json` should look similar to this:

```javascript
[
    {
        "Player ID + Player Name": "47691-55050:Christian McCaffrey",
        "Id": "47691-55050",
        "Position": "RB",
        "First Name": "Christian",
        "Nickname": "Christian McCaffrey",
        "Last Name": "McCaffrey",
        "FPPG": 25.82500076,
        "Played": 16,
        "Salary": 10000,
        "Game": "LV@CAR",
        "Team": "CAR",
        "Opponent": "LV",
        "Injury Indicator": "",
        "Injury Details": "",
        "Tier": "",
        "": "",
        "__1": "",
        "__2": ""
    },
    {
        "Player ID + Player Name": "47691-63115:Lamar Jackson",
        "Id": "47691-63115",
        "Position": "QB",
        "First Name": "Lamar",
        "Nickname": "Lamar Jackson",
        "Last Name": "Jackson",
        "FPPG": 28.11199951,
        "Played": 15,
        "Salary": 9400,
        "Game": "CLE@BAL",
        "Team": "BAL",
        "Opponent": "CLE",
        "Injury Indicator": "",
        "Injury Details": "",
        "Tier": "",
        "": "",
        "__1": "",
        "__2": ""
    }
]
```

### Options

#### Build a Team

```bash
node team-builder.js
```

A file named `team.json` will be saved in the project.

#### Bench

Remove players from the team builder by adding them to the bench array.

```javascript
const bench = [ 'Christian McCaffrey', 'Michael Thomas' ]
```

#### Total Points Target

Once a team is built with this value, it will stop. Otherwise, it will keep trying.

```javascript
const pointsTarget = 150
```

#### Salary

Set the maximum salary allowed to build a team.

```javascript
const allowedSalary = 50000
```

#### Salary Buffer

The salary buffer stops the team building process when the total salary used reaches this number.

```javascript
const salaryBuffer = -100
```

#### Incorporate FanDuel data

Set this to true if you want to merge FanDuel data with Draftkings data to calculate player values.

```javascript
const useFanduel = false
```

#### Rebuilding a Team

The first time the team is built, if it is over the salary cap, the team will be rebuilt by removing a player by position. The order of positions can be modified in the replacements array.

```javascript
const replacements = [ 'DST', 'DST', 'TE', 'QB', 'WR', 'TE', 'RB', 'DST' ]
```

### Final Team Output

`team.json`

```javascript
┌─────────┬──────────────────┬────────┬──────────┬───────┬───────────┬────────────────────┐
│ (index) │       name       │ salary │ position │ team  │ avgpoints │       value        │
├─────────┼──────────────────┼────────┼──────────┼───────┼───────────┼────────────────────┤
│   qb1   │ 'Jameis Winston' │  5500  │   'QB'   │ 'NO'  │   23.34   │ 260.9532562807786  │
│   rb1   │   'Wes Hills'    │  4000  │   'RB'   │ 'DET' │   16.2    │ 271.48310776325945 │
│   rb2   │  'Aaron Jones'   │  6900  │   'RB'   │ 'GB'  │   21.09   │ 378.5346979432975  │
│   wr1   │ 'DeSean Jackson' │  4900  │   'WR'   │ 'PHI' │   13.3    │ 360.13644398840074 │
│   wr2   │  'Chris Godwin'  │  7100  │   'WR'   │ 'TB'  │   21.01   │ 400.1983836165706  │
│   wr3   │ 'Michael Thomas' │  9000  │   'WR'   │ 'NO'  │   24.62   │ 417.36669483913516 │
│   te1   │ 'Austin Hooper'  │  5100  │   'TE'   │ 'CLE' │   15.21   │  407.92523819155   │
│   fx1   │  'Will Dissly'   │  3400  │   'TE'   │ 'SEA' │   12.32   │ 373.5639304010294  │
│  dst1   │    'Patriots'    │  3200  │  'DST'   │ 'NE'  │   13.71   │ 275.32382605196307 │
└─────────┴──────────────────┴────────┴──────────┴───────┴───────────┴────────────────────┘
```