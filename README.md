# Fantasy Football Team Builder
Automatically build a team for DraftKings.

## About
The team builder uses weekly game data provided by DraftKings to generate a full team within the salary cap.

## Installation

#### NPM

```bash
npm init
```
#### DraftKings Data

Download the player data in CSV format from their site and convert it to JSON with something like [csvjson](https://csvjson.com/).

#### Build a Team

```bash
node team-builder.js
```

A file named 'team.json' will be saved in the project.