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
const bench = [ 'Christian McCaffrey', 'Michael Thomas' ]
```

### Salary Buffer

The salary buffer stops the team building process when the total salary used reaches this number.

```javascript
const salaryBuffer = -100
```

### Rebuilding a Team

The first time the team is built, if it is over the salary cap, the team will be rebuilt by removing a player by position. The order of positions can be modified in the replacements array.

```javascript
const replacements = [ 'DST', 'DST', 'TE', 'QB', 'WR', 'TE', 'RB', 'DST' ]
```

### Final Team Example

`team.json`

```javascript
+-----------------------------------+
| final team
+-----------------------------------+
| qb  Lamar Jackson 8100
| rb  Mark Ingram II 5500
| rb  Austin Ekeler 7000
| wr  Davante Adams 7300
| wr  Davante Adams 7300
| wr  Davante Adams 7300
| te  Jacob Hollister 3000
| flx  Jason Witten 3200
| dst  49ers 3500
+------------------------+----------+
| draftkings salary      | 50000
| total salary used      | 49900
| under salary           | -100
| total points predicted | 148
+------------------------+----------+
```