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

Remove players from the team builder by adding them to the bench array in `bench.js`.

```javascript
[ 'Christian McCaffrey', 'Michael Thomas' ]
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

#### Weak Defenses

Players playing weak defenses can be given a better value. The number will be subtracted from their initial value and will lead them to be drafted higher.

```javascript
const adjustDSTValue = 50;
```

#### Incorporate FanDuel data

Set this to true if you want to merge FanDuel data with Draftkings data to calculate player values.

```javascript
const useFanduel = false
```

#### Replacements

When a team is built, if it does not meet the total points target or if it is over the salary cap, the team will be rebuilt by removing a player by position. The order of positions can be modified in the replacements array in `replacements.js`.

```javascript
[ 'DST', 'DST', 'TE', 'QB', 'WR', 'TE', 'RB', 'DST', 'QB', 'TE' ]
```

#### Waivers

Once a player is removed they are placed in the waivers array. When the team is finally assembled, the waivers array will be checked to optimize the team. If a value player is found, they will be taken off waivers and the team will be rebuilt. If no value players are found, the final waivers list will display along with the final team.

```javascript
┌─────────┬──────────────┬────────┬──────────┬──────┬──────────────┬───────────┬───────┐
│ (index) │     name     │ salary │ position │ team │   opponent   │ avgpoints │ value │
├─────────┼──────────────┼────────┼──────────┼──────┼──────────────┼───────────┼───────┤
│    0    │ 'Mike Evans' │  6400  │   'WR'   │ 'TB' │ 'CAR (weak)' │   18.59   │  294  │
└─────────┴──────────────┴────────┴──────────┴──────┴──────────────┴───────────┴───────┘
```

### Final Team Output

`team.json`

```javascript
┌─────────┬───────────────────────┬────────┬──────────┬───────┬──────────────┬───────────┬───────┐
│ (index) │         name          │ salary │ position │ team  │   opponent   │ avgpoints │ value │
├─────────┼───────────────────────┼────────┼──────────┼───────┼──────────────┼───────────┼───────┤
│   qb1   │    'Lamar Jackson'    │  8200  │   'QB'   │ 'BAL' │ 'HOU (weak)' │   29.85   │  224  │
│   rb1   │   'Mark Ingram II'    │  5400  │   'RB'   │ 'BAL' │ 'HOU (weak)' │   16.29   │  281  │
│   rb2   │     'Aaron Jones'     │  7100  │   'RB'   │ 'GB'  │ 'DET (weak)' │   21.09   │  286  │
│   wr1   │    'Chris Godwin'     │  7000  │   'WR'   │ 'TB'  │ 'CAR (weak)' │   21.01   │  283  │
│   wr2   │   'Michael Gallup'    │  5600  │   'WR'   │ 'DAL' │ 'ATL (weak)' │   16.05   │  298  │
│   wr3   │   'Christian Kirk'    │  4300  │   'WR'   │ 'ARI' │    'WAS'     │   13.4    │  320  │
│   te1   │ "James O'Shaughnessy" │  2700  │   'TE'   │ 'JAX' │    'TEN'     │   8.26    │  326  │
│   fx1   │     'Dalvin Cook'     │  7600  │   'RB'   │ 'MIN' │ 'IND (weak)' │   21.62   │  301  │
│  dst1   │        'Jets'         │  2000  │  'DST'   │ 'NYJ' │              │   8.38    │  238  │
│  total  │                       │ 49900  │          │       │              │    155    │       │
└─────────┴───────────────────────┴────────┴──────────┴───────┴──────────────┴───────────┴───────┘
```