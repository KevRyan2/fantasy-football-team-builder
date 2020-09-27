# Fantasy Football Team Builder

Automatically build a team for DraftKings.

## About

The team builder uses weekly game data provided by DraftKings to generate a full team within the salary cap. It places a 'value' on each player according to their salary versus average points per game. In this case, the lower the value the better.

[Demo](http://suirad.com/#/team-builder)

## Installation and Usage

### NPM

```bash
npm init
```
### DraftKings Data (Required)

Download the player data in CSV format from their site and convert it to JSON with something like [csvjson](http://csvjson.com/). Name the file `draftkings.json` and save it in the project directory.

`draftkings.json` should look similar to this:

```javascript
[
    {
        "Position": "RB",
        "Name": "Christian McCaffrey",
        "Salary": 10000,
        "TeamAbbrev": "CAR",
        "AvgPointsPerGame": 30.95
    }
]
```

### FanDuel Data (Required)

Download the player data in CSV format from their site and convert it to JSON with something like [csvjson](https://csvjson.com/). Name the file `fanduel.json` and save it in the project directory.

`fanduel.json` should look similar to this:

```javascript
[
    {
        "Position": "RB",
        "Nickname": "Christian McCaffrey",
        "FPPG": 25.82500076,
        "Salary": 10000,
        "Team": "CAR",
        "Opponent": "LV"
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

The salary buffer is how much you are willing NOT to spend on salary. For instance, if the salary cap is 50000, and the salaryBuffer is set to -100, the team will continue to be rebuilt until the total salary spent is 49000.

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
