# Fantasy Football Team Builder

Automatically build a DraftKings team.

## About

The team builder uses weekly game data provided by DraftKings to generate a full team within the salary cap. It places a 'value' on each player according to their salary versus average points per game. In this case, the lower the value the better.

[Demo](http://suirad.com)

## Installation and Usage

### NPM

```bash
npm install
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

### Build a Team

```bash
node build.js
```

A file named `team.json` will be saved in the project.

### Options

#### Bench

Remove players from the team builder by adding them to the bench array.

```javascript
[ 
    {
        name: 'Christian McCaffrey',
        issue: 'ir'
    } 
]
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

#### Replacements

When a team is built, if it does not meet the total points target or if it is over the salary cap, the team will be rebuilt by removing a player by position. The order of positions can be modified in the replacements array.

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
┌─────────┬──────────────────┬────────┬──────────┬───────┬──────────┬───────────┬───────┬──────────────┐
│ (index) │       name       │ salary │ position │ team  │ opponent │ avgpoints │ value │     time     │
├─────────┼──────────────────┼────────┼──────────┼───────┼──────────┼───────────┼───────┼──────────────┤
│   qb1   │   'Jake Luton'   │  5400  │   'QB'   │ 'JAX' │   'GB'   │   25.46   │  212  │ '01:00PM ET' │
│   rb1   │  'Dalvin Cook'   │  8900  │   'RB'   │ 'MIN' │  'CHI'   │   30.59   │  290  │ '08:15PM ET' │
│   rb2   │  'Alvin Kamara'  │  8200  │   'RB'   │ 'NO'  │   'SF'   │   26.82   │  305  │ '04:25PM ET' │
│   wr1   │  'Allen Lazard'  │  4000  │   'WR'   │ 'GB'  │  'JAX'   │   18.37   │  217  │ '01:00PM ET' │
│   wr2   │ 'Davante Adams'  │  9000  │   'WR'   │ 'GB'  │  'JAX'   │   29.58   │  304  │ '01:00PM ET' │
│   wr3   │  'Keelan Cole'   │  3400  │   'WR'   │ 'JAX' │   'GB'   │   11.02   │  308  │ '01:00PM ET' │
│   te1   │  'C.J. Uzomah'   │  2500  │   'TE'   │ 'CIN' │  'PIT'   │   11.35   │  220  │ '04:25PM ET' │
│   fx1   │ 'Travis Fulgham' │  6400  │   'WR'   │ 'PHI' │  'NYG'   │   19.9    │  321  │ '01:00PM ET' │
│  dst1   │      'Rams'      │  2200  │  'DST'   │ 'LAR' │          │   7.25    │  303  │              │
│  total  │                  │ 50000  │          │       │          │    180    │       │              │
└─────────┴──────────────────┴────────┴──────────┴───────┴──────────┴───────────┴───────┴──────────────┘
```
