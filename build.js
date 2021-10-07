const fs = require('fs');
const adjustedValues = require('./adjustments');
const defenseVsQB = require('./rankings/defenseVsQB.json');
const defenseVsRB = require('./rankings/defenseVsRB.json');
const defenseVsWR = require('./rankings/defenseVsWR.json');
const defenseVsTE = require('./rankings/defenseVsTE.json');
const mapTeamNicknameAbbrev = require('./data/nicknameTeamMap.json');
const benchedPlayers = require('./rankings/bench');
const getVegasData   = require('./utilities/getOdds.js').getVegasOdds;
// const testVegasData = require('./data/testVegasOdds.json');

/*
    Notes:
    - Value is salary / avg points
    - Typical values range:
        - QB  ~ 230
        - RB  ~ 325-350
        - WR  ~ 200-300
        - TE  ~ 250-300
        - DST ~ 450-500
*/

// ---------------------------------------------------------------------------------
// update this data weekly, set week-x to the week you want to build
// ---------------------------------------------------------------------------------
const dataDK = require('./data/week-5/draftkings.json'); // update this file weekly with csv data from draftkings website
const draftkings = [...dataDK];

// ---------------------------------------------------------------------------------
// order of player replacements when rebuilding
// ---------------------------------------------------------------------------------
const replacements = ['WR', 'WR', 'DST', 'DST', 'RB', 'RB', 'WR', 'WR', 'DST', 'DST', 'TE', 'TE', 'TE', 'TE', 'TE', 'DST', 'DST', 'QB', 'QB', 'QB', 'WR', 'WR', 'WR', 'WR', 'WR', 'QB', 'QB', 'DST', 'DST', 'DST', 'DST', 'WR', 'QB', 'QB', 'WR', 'WR', 'DST', 'WR', 'TE', 'TE', 'WR', 'QB', 'DST', 'DST', 'DST', 'DST', 'QB', 'TE', 'TE', 'WR',
    'DST'];


// ---------------------------------------------------------------------------------
// Arrays for Adjustments & Settings
// ---------------------------------------------------------------------------------

/* Weak Opponent DST - CBS Sports by position */
function calcWorst10Data(defenseArray) {
    let bottom10Data = defenseArray.slice(0, 10);
    let teams = [];
    for (let i = bottom10Data.length - 1; i >= 0; i--) {
        const def_full = bottom10Data[i]['TEAM'].substr(6);
        const def_abbrev = mapTeamNicknameAbbrev[def_full];
        teams.push(def_abbrev);
    }
    return teams;
}
const weakDSTvsQB = calcWorst10Data(defenseVsQB);
const weakDSTvsRB = calcWorst10Data(defenseVsRB);
const weakDSTvsWR = calcWorst10Data(defenseVsWR);
const weakDSTvsTE = calcWorst10Data(defenseVsTE);

// ---------------------------------------------------------------------------------
// Adjustment Variables
// ---------------------------------------------------------------------------------
// 1. Adjust for weak opponent against position
const adjustWeakDST = adjustedValues.weakDefense; 
const adjustWeakDEFvsQB = adjustedValues.weakDEFvsQB; 
const adjustWeakDEFvsRB = adjustedValues.weakDEFvsRB;
const adjustWeakDEFvsWR = adjustedValues.weakDEFvsWR;
const adjustWeakDEFvsTE = adjustedValues.weakDEFvsTE; 
const adjustWeakOFFvsDST = adjustedValues.weakOFFvsDST;


// General Vars
const players = []; // array of players sorted by value to build a team from
const waivers = []; // array of players removed from the team
const allowedSalary = 50000; // manually change if draftkings salary is different
const salaryBuffer = -2000; // amount under allowedSalary willing not to spend
const pointsTarget = 150; // minimumum total player points of entire team aiming for
let replacement = 0; // increments on each replacement

// ---------------------------------------------------------------------------------
// manually add players on IR or are out here
// ---------------------------------------------------------------------------------
let bench = benchedPlayers;

// ---------------------------------------------------------------------------------
// 1. remove bench players
// ---------------------------------------------------------------------------------
if (bench.length) {
    console.log('+------------------------+');
    console.log('| removing bench players |');
    console.log('+------------------------+');
    for (let i = draftkings.length - 1; i >= 0; i--) {
        for (let j = 0; j < bench.length; j++) {
            if (draftkings[i] && (draftkings[i].Name === bench[j].name)) {
                draftkings.splice(i, 1);
            }
        }
    }

    findValue();

} else {

    findValue();

}

// ---------------------------------------------------------------------------------
// 2. Find and Adjust Value Functions
// ---------------------------------------------------------------------------------
function adjustDefense(player) {
    let weakVsDST = [];
    let adjustByValue;
    if (player.position.indexOf('QB') > -1) {
        weakVsDST = weakDSTvsQB;
        adjustByValue = adjustWeakDEFvsQB;
    } else if (player.position.indexOf('RB') > -1) {
        weakVsDST = weakDSTvsRB;
        adjustByValue = adjustWeakDEFvsRB;
    } else if (player.position.indexOf('WR') > -1) {
        weakVsDST = weakDSTvsWR;
        adjustByValue = adjustWeakDEFvsWR;
    } else if (player.position.indexOf('TE') > -1) {
        weakVsDST = weakDSTvsTE;
        adjustByValue = adjustWeakDEFvsTE;
    }
    for (let k = 0; k < weakVsDST.length; k++) {
        if (player.opponent === weakVsDST[k]) {
            player.value = player.value * adjustByValue;
            player.opponent = player.opponent + ' (weak)';
        }
    }

    player.value = parseInt(player.value.toFixed(2));
    players.push(player);
}


async function findValue() {

    // ---------------------------------------------------------------------------------
    // loop over player data and sort by value
    // ---------------------------------------------------------------------------------
    console.log('+------------------------+');
    console.log('| finding player value   |');
    console.log('+------------------------+');
    for (i = 0; i < draftkings.length; i++) {

        if ((draftkings[i].Position === 'QB') || (draftkings[i].Position === 'RB') || (draftkings[i].Position === 'WR') || (draftkings[i].Position === 'TE')) {
            let player = {
                name: null,
                salary: null,
                position: null,
                team: null,
                opponent: null,
                avgpoints: null,
                value: null
            };

            if (draftkings[i].AvgPointsPerGame > 0) {
                player.name = draftkings[i].Name;
                player.salary = draftkings[i].Salary;
                player.position = draftkings[i].Position;
                player.team = draftkings[i].TeamAbbrev;
                player.avgpoints = draftkings[i].AvgPointsPerGame;
                player.value = draftkings[i].Salary / draftkings[i].AvgPointsPerGame;

                // get opponent data
                let d = new Date(
                    draftkings[i]['Game Info'].substring(
                        draftkings[i]['Game Info'].indexOf(' ') + 1,
                        draftkings[i]['Game Info'].lastIndexOf(' ET') - 8
                    )
                );
                const away = draftkings[i]['Game Info'].substr(0, draftkings[i]['Game Info'].indexOf('@'));
                const home = draftkings[i]['Game Info'].substring(
                    draftkings[i]['Game Info'].lastIndexOf('@') + 1,
                    draftkings[i]['Game Info'].indexOf(' ')
                );
                if (player.team === away) {
                    player.opponent = home;
                } else {
                    player.opponent = away;
                }
                const time = draftkings[i]['Game Info'].substring(
                    draftkings[i]['Game Info'].lastIndexOf(' ') - 7,
                    draftkings[i]['Game Info'].lastIndexOf(' ET') + 3
                );
                player.time = time;

                // Adjust value if playing weaker dst
                await adjustDefense(player);
                
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // loop over defense data and sort by value
    // ---------------------------------------------------------------------------------
    console.log('+------------------------+');
    console.log('| finding defense value  |');
    console.log('+------------------------+');
    for (i = 0; i < draftkings.length; i++) {
        if (draftkings[i].Position === 'DST') {
            if (draftkings[i].AvgPointsPerGame > 0) {
                this.player = {
                    name: draftkings[i].Name,
                    salary: draftkings[i].Salary,
                    position: draftkings[i].Position,
                    team: draftkings[i].TeamAbbrev,
                    avgpoints: draftkings[i].AvgPointsPerGame,
                    value: draftkings[i].Salary / draftkings[i].AvgPointsPerGame
                };

                player.value = parseInt(player.value.toFixed(2));
                players.push(this.player);
            }
        }
    }

    console.log('+------------------------+');
    console.log('| building team          |');
    console.log('+------------------------+');
    buildTeam(players);
}

// ---------------------------------------------------------------------------------
// 3. Build team
// ---------------------------------------------------------------------------------

async function getVegasOdds() {
    try {
        let finalVegasData = await getVegasData();
        console.log('+------------------------+');
        console.log('| got vegas data |', finalVegasData);
        console.log('+------------------------+');
        return finalVegasData;
    } catch (e) {
        console.error('error getVegasOdds', e);
    }
}

async function buildTeam(array) {
    console.log('+------------------------+');
    console.log('| adjustedValues   |', adjustedValues);
    console.log('+------------------------+');

    // adjust for implied team total
    await getVegasOdds();

    // sort players array by value (salary / avgpoints)
    array.sort((a, b) => (a.value > b.value) ? 1 : -1);

    // ---------------------------------------------------------------------------------
    // blank team template
    // ---------------------------------------------------------------------------------
    const team = {
        qb1: {
            name: '',
            salary: 10000,
            position: '',
            team: '',
            opponent: '',
            time: '',
            avgpoints: 0,
            value: 1000
        },
        rb1: {
            name: '',
            salary: 10000,
            position: '',
            team: '',
            opponent: '',
            time: '',
            avgpoints: 0,
            value: 1000
        },
        rb2: {
            name: '',
            salary: 10000,
            position: '',
            team: '',
            opponent: '',
            time: '',
            avgpoints: 0,
            value: 1000
        },
        wr1: {
            name: '',
            salary: 10000,
            position: '',
            team: '',
            opponent: '',
            time: '',
            avgpoints: 0,
            value: 1000
        },
        wr2: {
            name: '',
            salary: 10000,
            position: '',
            team: '',
            opponent: '',
            time: '',
            avgpoints: 0,
            value: 1000
        },
        wr3: {
            name: '',
            salary: 10000,
            position: '',
            team: '',
            opponent: '',
            time: '',
            avgpoints: 0,
            value: 1000
        },
        te1: {
            name: '',
            salary: 10000,
            position: '',
            team: '',
            opponent: '',
            time: '',
            avgpoints: 0,
            value: 1000
        },
        fx1: {
            name: '',
            salary: 10000,
            position: '',
            team: '',
            opponent: '',
            time: '',
            avgpoints: 0,
            value: 1000
        },
        dst1: {
            name: '',
            salary: 10000,
            position: '',
            team: '',
            avgpoints: 0,
            value: 1000
        },
        total: {
            salary: 0,
            avgpoints: 0
        }
    };

    // ---------------------------------------------------------------------------------
    // assign qb1 by best value
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < array.length; i++) {
        if (array[i].position === 'QB') {
            if (array[i].value <= team.qb1.value) {
                if (array[i].salary < team.qb1.salary) {
                    team.qb1 = array[i];
                }
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // assign wr1 by best value
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < array.length; i++) {
        if (array[i].position === 'WR') {
            if (array[i].value <= team.wr1.value) {
                team.wr1 = array[i];
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // assign wr2 by best value
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < array.length; i++) {
        if (array[i].position === 'WR') {
            if (array[i].value < team.wr2.value) {
                if (array[i].salary < team.wr2.salary) {
                    if (array[i].name != team.wr1.name) {
                        team.wr2 = array[i];
                    }
                }
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // assign best wr3 by best value
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < array.length; i++) {
        if (array[i].position === 'WR') {
            if (array[i].value < team.wr3.value) {
                if (array[i].name != team.wr1.name) {
                    if (array[i].name != team.wr2.name) {
                        team.wr3 = array[i];
                    }
                }
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // assign best dst1 by best value
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < array.length; i++) {
        if (array[i].position === 'DST') {
            if (array[i].salary <= 2300) {
                if (array[i].value < team.dst1.value) {
                    team.dst1 = array[i];
                }
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // assign best value te1 under 6k salary
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < array.length; i++) {
        if (array[i].position === 'TE') {
            if (array[i].salary <= 6000) {
                if (array[i].value < team.te1.value) {
                    if (array[i].name != team.fx1.name) {
                        team.te1 = array[i];
                    }
                }
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // assign best rb1 by best value
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < array.length; i++) {
        if (array[i].position === 'RB') {
            if (array[i].value < team.rb1.value) {
                team.rb1 = array[i];
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // assign cheapest rb2 by best value
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < array.length; i++) {
        if (array[i].position === 'RB') {
            if (array[i].value < team.rb2.value) {
                if (array[i].salary < team.rb2.salary) {
                    if (array[i].name != team.rb1.name) {
                        team.rb2 = array[i];
                    }
                }
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // replace wr1 if over salary
    // ---------------------------------------------------------------------------------
    if (team.qb1.name && team.rb1.name && team.rb2.name && team.wr1.name && team.wr2.name && team.wr3.name && team.te1.name && team.dst1.name) {
        const tempsalary = team.qb1.salary + team.rb1.salary + team.rb2.salary + team.wr1.salary + team.wr2.salary + team.wr3.salary + team.te1.salary + team.dst1.salary;
        const leftsalary = 50000 - tempsalary;
        if (leftsalary <= 5500) {
            const oldwr1 = team.wr1.name;
            for (let i = 0; i < array.length; i++) {
                if (array[i].position === 'WR') {
                    if (array[i].salary <= 6000) {
                        if (array[i].value < 100) {
                            if (array[i].name != oldwr1) {
                                team.wr1 = array[i];
                            }
                        }
                    }
                }
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // assign fx1 position based on remaining salary
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < array.length; i++) {
        if (team.qb1.name && team.rb1.name && team.rb2.name && team.wr1.name && team.wr2.name && team.wr3.name && team.te1.name && team.dst1.name) {
            const tempsalary = team.qb1.salary + team.rb1.salary + team.rb2.salary + team.wr1.salary + team.wr2.salary + team.wr3.salary + team.te1.salary + team.dst1.salary;
            const leftsalary = 50000 - tempsalary;
            if ((array[i].position === 'RB') || (array[i].position === 'WR') || (array[i].position === 'TE')) {
                if (array[i].value < team.fx1.value) {
                    if (array[i].name != team.rb1.name) {
                        if (array[i].name != team.rb2.name) {
                            if (array[i].name != team.wr1.name) {
                                if (array[i].name != team.wr2.name) {
                                    if (array[i].name != team.wr3.name) {
                                        if (array[i].name != team.te1.name) {
                                            if (array[i].salary === leftsalary) {
                                                team.fx1 = array[i];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // double check for open fx1
    // ---------------------------------------------------------------------------------
    if (team.fx1.name === '') {
        for (let i = 0; i < array.length; i++) {
            if (team.qb1.name && team.rb1.name && team.rb2.name && team.wr1.name && team.wr2.name && team.wr3.name && team.te1.name && team.dst1.name) {
                const tempsalary = team.qb1.salary + team.rb1.salary + team.rb2.salary + team.wr1.salary + team.wr2.salary + team.wr3.salary + team.te1.salary + team.dst1.salary;
                const leftsalary = 50000 - tempsalary;
                if ((array[i].position === 'RB') || (array[i].position === 'WR') || (array[i].position === 'TE')) {
                    if (array[i].name != team.rb1.name) {
                        if (array[i].name != team.rb2.name) {
                            if (array[i].name != team.wr1.name) {
                                if (array[i].name != team.wr2.name) {
                                    if (array[i].name != team.wr3.name) {
                                        if (array[i].name != team.te1.name) {
                                            if (array[i].salary <= leftsalary) {
                                                team.fx1 = array[i];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // if leftover salary, upgrade dst1
    // ---------------------------------------------------------------------------------
    if (team.qb1.name && team.rb1.name && team.rb2.name && team.wr1.name && team.wr2.name && team.wr3.name && team.te1.name && team.fx1.name && team.dst1.name) {
        const tempsalary = team.qb1.salary + team.rb1.salary + team.rb2.salary + team.wr1.salary + team.wr2.salary + team.wr3.salary + team.te1.salary + team.fx1.salary + team.dst1.salary;
        const leftsalary = 50000 - tempsalary;
        if (leftsalary > 0) {
            const olddst1 = team.dst1.salary;
            for (let i = 0; i < array.length; i++) {
                if (array[i].position === 'DST') {
                    if (array[i].salary === (leftsalary + olddst1)) {
                        team.dst1 = array[i];
                    }
                }
            }
        }
    }

    const totalSalary = team.qb1.salary + team.rb1.salary + team.rb2.salary + team.wr1.salary + team.wr2.salary + team.wr3.salary + team.te1.salary + team.fx1.salary + team.dst1.salary;
    const overSalary = totalSalary - allowedSalary;
    const totalPoints = team.qb1.avgpoints + team.rb1.avgpoints + team.rb2.avgpoints + team.wr1.avgpoints + team.wr2.avgpoints + team.wr3.avgpoints + team.te1.avgpoints + team.fx1.avgpoints + team.dst1.avgpoints;
    const underPoints = pointsTarget - totalPoints;

    if (underPoints > 0) {

        console.log('+------------------------+');
        console.log('| rebuilding team        |');
        console.log('+------------------------+');
        rebuildTeam();

    } else if (overSalary > 0) {

        console.log('+------------------------+');
        console.log('| rebuilding team        |');
        console.log('+------------------------+');
        rebuildTeam();

    } else if (overSalary < salaryBuffer) {

        console.log('+------------------------+');
        console.log('| rebuilding team        |');
        console.log('+------------------------+');
        rebuildTeam();

    } else {

        console.log('+------------------------+');
        console.log('| checking waivers       |');
        console.log('+------------------------+');
        let freeagent = false;
        waivers.sort((a, b) => (a.value > b.value) ? 1 : -1);
        for (const i in team) {
            for (let j = waivers.length - 1; j >= 0; j--) {
                if (waivers[j].position === team[i].position) {
                    if (waivers[j].value < team[i].value) {
                        if (waivers[j].salary > team[i].salary) {
                            if (waivers[j].avgpoints > team[i].avgpoints) {
                                if (waivers[j].salary < (team[i].salary + (overSalary * -1))) {
                                    // pull off waivers
                                    players.push(waivers[j]);
                                    waivers.splice(j, 1);
                                    freeagent = true;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (freeagent) {

            console.log('+------------------------+');
            console.log('| rebuilding team        |');
            console.log('+------------------------+');
            rebuildTeam();

        } else {

            if (overSalary < salaryBuffer) {

                console.log('+------------------------+');
                console.log('| still under salary cap |');
                console.log('+------------------------+');
                console.table(team);
                console.log('+------------------------+');
                console.log('| rebuilding team        |');
                console.log('+------------------------+');
                rebuildTeam();

            } else {

                // if offense against defense, rebuild https://github.com/BenBrostoff/draftfast
                // 

                let finalteam = team;
                let totalsalary = 0;
                let totalavg = 0;
                for (const property in finalteam) {
                    let salary = finalteam[property].salary;
                    totalsalary += salary;
                    let avgpointsvalue = finalteam[property].avgpoints;
                    totalavg += avgpointsvalue;
                }
                finalteam.total.salary = totalsalary;
                finalteam.total.avgpoints = parseInt(totalavg.toFixed(2));
                let jsondata = JSON.stringify(finalteam);

                fs.writeFile('./team.json', jsondata, function (err) {
                    if (err) throw err;
                });

                console.log('| bench');
                console.table(bench);
                console.log('| adjusted DST');
                console.log('| waivers');
                console.table(waivers);
                console.log('| final team');
                console.table(finalteam);

            }

        }
    }
}

// ---------------------------------------------------------------------------------
// if over salary, begin replacing players
// ---------------------------------------------------------------------------------
function rebuildTeam() {

    if (replacements[replacement] === 'DST') {

        let r = 0;
        for (i = 0; i < players.length; i++) {
            if (r === 0) {
                if (players[i].position === 'DST') {
                    waivers.push(players[i]);
                    players.splice(i, 1);
                    r++;
                    replacement++;
                    const updatedplayers = [...players];
                    buildTeam(updatedplayers);
                }
            }
        }

    } else if (replacements[replacement] === 'TE') {

        let r = 0;
        for (i = 0; i < players.length; i++) {
            if (r === 0) {
                if (players[i].position === 'TE') {
                    waivers.push(players[i]);
                    players.splice(i, 1);
                    r++;
                    replacement++;
                    const updatedplayers = [...players];
                    buildTeam(updatedplayers);
                }
            }
        }

    } else if (replacements[replacement] === 'QB') {

        let r = 0;
        for (i = 0; i < players.length; i++) {
            if (r === 0) {
                if (players[i].position === 'QB') {
                    waivers.push(players[i]);
                    players.splice(i, 1);
                    r++;
                    replacement++;
                    const updatedplayers = [...players];
                    buildTeam(updatedplayers);
                }
            }
        }

    } else if (replacements[replacement] === 'WR') {

        let r = 0;
        for (i = 0; i < players.length; i++) {
            if (r === 0) {
                if (players[i].position === 'WR') {
                    waivers.push(players[i]);
                    players.splice(i, 1);
                    r++;
                    replacement++;
                    const updatedplayers = [...players];
                    buildTeam(updatedplayers);
                }
            }
        }

    } else if (replacements[replacement] === 'RB') {

        let r = 0;
        for (i = 0; i < players.length; i++) {
            if (r === 0) {
                if (players[i].position === 'RB') {
                    waivers.push(players[i]);
                    players.splice(i, 1);
                    r++;
                    replacement++;
                    const updatedplayers = [...players];
                    buildTeam(updatedplayers);
                }
            }
        }

    } else {

        console.log('| bench');
        console.table(bench);
        console.log('| waivers');
        console.table(waivers);


        console.log('+------------------------+');
        console.log('| ran out of waivers!    |');
        console.log('+------------------------+');

        console.table(this.team);

    }
}
