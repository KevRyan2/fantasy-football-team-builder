# Fantasy Football Team Builder

Automatically build a team for DraftKings.

## About

The team builder uses weekly game data provided by DraftKings to generate a full team within the salary cap. It places a 'value' on each player according to their salary versus average points per game. In this case, the lower the value the better.

## Installation and Usage

### NPM

```bash
npm init
```
### DraftKings Data (Required)

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

### FanDuel Data (Required)

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

### Build a Team

```bash
node team-builder.js
```

A file named `team.json` will be saved in the project.

### Options

#### Bench

Remove players from the team builder by adding them to the bench array.

```javascript
const bench = [ 'Christian McCaffrey', 'Michael Thomas' ]
```

#### Total Points Target

Team build will continue to rebuild the team until this value is met or it fails.

```javascript
const pointsTarget = 150
```

#### Salary

Set the maximum salary allowed to build a team.

```javascript
const allowedSalary = 50000
```

#### Salary Buffer

The salary buffer is how much you are willing NOT to spend on salary.

```javascript
const salaryBuffer = -100
```

#### Incorporate FanDuel data

Set this to true if you want to merge FanDuel data with Draftkings data to calculate player values.

```javascript
const useFanduel = false
```

#### Replacements

When a team is built, if it does not meet the total points target or if it is over the salary cap, the team will be rebuilt by removing a player by position. The order of positions can be modified in the replacements array.

```javascript
const replacements = [ 'DST', 'DST', 'TE', 'QB', 'WR', 'TE', 'RB', 'DST', 'QB', 'TE' ]
```

#### Waivers

Once a player is removed they are placed in the waivers array. When the team is finally assembled, the waivers array will be checked to optimize the team. If a value player is found, they will be taken off waivers and the team will be rebuilt. If no value players are found, the final waivers list will display along with the final team.

```javascript
┌─────────┬───────────────────────┬────────┬────────┬──────────┬───────┬───────────┬────────────────────┐
│ (index) │         name          │ points │ salary │ position │ team  │ avgpoints │       value        │
├─────────┼───────────────────────┼────────┼────────┼──────────┼───────┼───────────┼────────────────────┤
│    0    │ 'Christian McCaffrey' │   0    │ 10000  │   'RB'   │ 'CAR' │   30.95   │ 355.1617250393066  │
│    1    │      'Patriots'       │   0    │  3200  │  'DST'   │ 'NE'  │   13.71   │ 275.32382605196307 │
└─────────┴───────────────────────┴────────┴────────┴──────────┴───────┴───────────┴────────────────────┘
```

### Final Team Output

`team.json`

```javascript
┌─────────┬──────────────────┬────────┬──────────┬───────┬───────────┬────────────────────┐
│ (index) │       name       │ salary │ position │ team  │ avgpoints │       value        │
├─────────┼──────────────────┼────────┼──────────┼───────┼───────────┼────────────────────┤
│   qb1   │ 'Jameis Winston' │  5500  │   'QB'   │ 'NO'  │   23.34   │ 260.9532562807786  │
│   rb1   │  'Aaron Jones'   │  6900  │   'RB'   │ 'GB'  │   21.09   │ 378.5346979432975  │
│   rb2   │ 'Mark Ingram II' │  5500  │   'RB'   │ 'BAL' │   16.29   │ 397.57339399848337 │
│   wr1   │ 'DeSean Jackson' │  4900  │   'WR'   │ 'PHI' │   13.3    │ 360.13644398840074 │
│   wr2   │  'Chris Godwin'  │  7100  │   'WR'   │ 'TB'  │   21.01   │ 400.1983836165706  │
│   wr3   │ 'Michael Thomas' │  9000  │   'WR'   │ 'NO'  │   24.62   │ 417.36669483913516 │
│   te1   │ 'Austin Hooper'  │  5100  │   'TE'   │ 'CLE' │   15.21   │  407.92523819155   │
│   fx1   │  'Will Dissly'   │  3400  │   'TE'   │ 'SEA' │   12.32   │ 373.5639304010294  │
│  dst1   │   'Buccaneers'   │  2200  │  'DST'   │ 'TB'  │   8.56    │ 350.4024831161744  │
│  total  │                  │ 49600  │          │       │    155    │                    │
└─────────┴──────────────────┴────────┴──────────┴───────┴───────────┴────────────────────┘
```