# Fantasy Football Team Builder

Automatically build a team for DraftKings.

## About

The team builder uses weekly game data provided by DraftKings to generate a full team within the salary cap.

## Installation and Usage

### NPM

```bash
npm init
```
### DraftKings Data

Download the player data in CSV format from their site and convert it to JSON with something like [csvjson](https://csvjson.com/). Name the file `draftkings.json` and save it in the project.

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

A file named 'team.json' will be saved in the project.

### Bench

Remove players from the team builder by adding them to the bench array.

```javascript
const bench = [ "Christian McCaffrey", "Michael Thomas" ]
```