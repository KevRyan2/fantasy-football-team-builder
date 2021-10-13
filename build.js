const fs = require('fs');
const adjustedValues = require('./adjustments');
const mapTeamNicknameAbbrev = require('./data/nicknameTeamMap.json');
const getTeamTotals   = require('./utilities/getTeamTotals.js').getTeamTotals;
const calcFavorableDSTvsPos = require ('./utilities/calcFavorableDSTvsPos.js').calcFavorableDSTvsPos;
let benchedPlayers = require('./rankings/bench');
let standardTeamObject = require('./utilities/teamObject.json');
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
// Weekly Vars - set week-x to the week you want to build
// ---------------------------------------------------------------------------------
const weekNum = 'week-6';
const defenseVsQB = require(`./data/${weekNum}/defenseVsQB.json`);
const defenseVsRB = require(`./data/${weekNum}/defenseVsRB.json`);
const defenseVsWR = require(`./data/${weekNum}/defenseVsWR.json`);
const defenseVsTE = require(`./data/${weekNum}/defenseVsTE.json`);
const dataDK = require(`./data/${weekNum}/draftkings.json`); // update this file weekly with csv data from draftkings website

// ---------------------------------------------------------------------------------
// Order of player replacements when rebuilding
// ---------------------------------------------------------------------------------
const replacements = ['WR', 'WR', 'RB', 'RB', 'TE', 'DST', 'WR', 'WR', 'DST', 'DST', 'TE', 'TE', 'TE', 'TE', 'TE', 'DST', 'DST', 'QB', 'QB', 'QB', 'WR', 'WR', 'WR', 'WR', 'WR', 'QB', 'QB', 'DST', 'DST', 'DST', 'DST', 'WR', 'QB', 'QB', 'WR', 'WR', 'DST', 'WR', 'TE', 'TE', 'WR', 'QB', 'DST', 'DST', 'DST', 'DST', 'QB', 'TE', 'TE', 'WR',
    'DST'];

// ---------------------------------------------------------------------------------
// Variables
// ---------------------------------------------------------------------------------
const draftkings = [...dataDK];
const maxPlayersPerTeam = 2;
let players = [];
const waivers = []; // List of removed players
const allowedSalary = 50000;
const salaryBuffer = -2000; // amount under allowedSalary willing not to spend
const pointsTarget = 150; // minimumum total player points of entire team aiming for
let replacement = 0; // increments on each replacement
let topTeamTotals = [];
const numTopTeamTotals = 10;
const positionToUpgrade = 'RB'; // Choose WR if PPR

// Adjust for weak opponent against position
const adjustWeakDST = adjustedValues.weakDefense; 
const adjustWeakDEFvsQB = adjustedValues.weakDEFvsQB; 
const adjustWeakDEFvsRB = adjustedValues.weakDEFvsRB;
const adjustWeakDEFvsWR = adjustedValues.weakDEFvsWR;
const adjustWeakDEFvsTE = adjustedValues.weakDEFvsTE; 
const adjustWeakOFFvsDST = adjustedValues.weakOFFvsDST;
const adjustForHighTeamTotal = adjustedValues.topHalfTeamTotal

// Worst team DST against specific positions
const numFavorableTeams = 10;
const weakDSTvsQB = calcFavorableDSTvsPos(defenseVsQB, numFavorableTeams);
const weakDSTvsRB = calcFavorableDSTvsPos(defenseVsRB, numFavorableTeams);
const weakDSTvsWR = calcFavorableDSTvsPos(defenseVsWR, numFavorableTeams);
const weakDSTvsTE = calcFavorableDSTvsPos(defenseVsTE, numFavorableTeams);


// ---------------------------------------------------------------------------------
// Utility function results/definitions
// ---------------------------------------------------------------------------------
async function setTeamTotals() {
    try {
        let teamTotals = await getTeamTotals(numTopTeamTotals);
        topTeamTotals = teamTotals;
        return topTeamTotals;
    } catch (e) {
        console.error('error getVegasOdds', e);
    }
}

function adjustPlayerForDST(player) {
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

function adjustForTeamTotal(player) {
    for (let k = 0; k < topTeamTotals.length; k++) {
        if (player.team === topTeamTotals[k]) {
            player.value = player.value * adjustForHighTeamTotal;
            player.team = player.team + ' (high_total)';
        }
    }

    player.value = parseInt(player.value.toFixed(2));
    players.push(player);
}

// Prevent duplicate entries
async function getUniqueListBy(arr, key) {
    try {
      return [...new Map(arr.map(item => [item[key], item])).values()]
    } catch (e) {
        console.error('getUniqueListBy error', e);
    }
}

// Prevent > x number of players per team
async function tooManyPlayersOnSameTeam(teamObj) {
    try {
        let sameTeamArr = []; 
        let reducedTeamArr = Object.keys(teamObj).map(key => {
            return teamObj[key];
        });
        await reducedTeamArr.every((player, index) => { 
             for (let k = 0; k < reducedTeamArr.length; k++) {
                if (player.team === reducedTeamArr[k].team) {
                    sameTeamArr.push(reducedTeamArr[k]);
                }
            }
        });
        let uniqueSameTeam = [...new Map(sameTeamArr.map(item => [item['name'], item])).values()];
        let groupedSameTeams = uniqueSameTeam.reduce((r, o) => {
            var last = r[r.length - 1];
            if (last && last[0].team === o.team) {
                last.push(o);
            } else {
                r.push([o]);
            }
            return r;
        }, []);
        let tooManyFromTeam = [];
        for (let i = 0; i < groupedSameTeams.length; i++) {
            if (groupedSameTeams[i].length > maxPlayersPerTeam){
                tooManyFromTeam.push(groupedSameTeams[i]);
            }
        }
        console.log('tooManyFromTeam', tooManyFromTeam);
        return tooManyFromTeam;
    } catch (e) {
        console.error('getUniqueListBy error', e);
    }
}

async function getTeamPlayersFromSameTeam(arr, numPerTeam) {
    // try {
    //   return [...new Map(arr.map(item => [item[key], item])).values()]
    // } catch (e) {
    //     console.error('getUniqueListBy error', e);
    // }
}



// ---------------------------------------------------------------------------------
// manually add players on IR or are out here
// ---------------------------------------------------------------------------------
let bench = benchedPlayers;

// ---------------------------------------------------------------------------------
// 1. Remove bench players and get vars from APIs
// ---------------------------------------------------------------------------------
async function getPlayersValue() {
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
        // Setup data to adjust for implied team total
        await setTeamTotals();
        findValue();

    } else {

        // Setup data to adjust for implied team total
        await setTeamTotals();
        findValue();

    }
}

/* START RUNNING THE SCRIPT */
getPlayersValue();

// ---------------------------------------------------------------------------------
// 2. Find Value
// ---------------------------------------------------------------------------------

async function findValue() {

    // -------------------------
    // A. Sort players by value
    // -------------------------
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
                await adjustPlayerForDST(player);
                await adjustForTeamTotal(player);
                
            }
        }
    }

    // ---------------------
    // B. Sort DST by value
    // ---------------------
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
    console.log('| building team, find unique |');
    console.log('+------------------------+');
    let filteredPlayers = await getUniqueListBy(players, 'name');
    buildTeam(filteredPlayers);
    // Write values to file
    let jsondata = JSON.stringify(filteredPlayers);

    fs.writeFile(`./data/${weekNum}/teamValue.json`, jsondata, function (err) {
        if (err) throw err;
    });
}

// ---------------------------------------------------------------------------------
// 3. Build team
// ---------------------------------------------------------------------------------

async function buildTeam(playerArray) {

    // sort players array by value (salary / avgpoints)
    playerArray.sort((a, b) => (a.value > b.value) ? 1 : -1);

    // -------------------
    // Blank team template
    // -------------------
    const team = standardTeamObject;

    // ---------------------------------------------------------------------------------
    // assign qb1 by best value
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < playerArray.length; i++) {
        if (playerArray[i].position === 'QB') {
            if (playerArray[i].value <= team.qb1.value) {
                if (playerArray[i].salary < team.qb1.salary) {
                    team.qb1 = playerArray[i];
                }
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // assign wr1 by best value
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < playerArray.length; i++) {
        if (playerArray[i].position === 'WR') {
            if (playerArray[i].value <= team.wr1.value) {
                team.wr1 = playerArray[i];
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // assign wr2 by best value
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < playerArray.length; i++) {
        if (playerArray[i].position === 'WR') {
            if (playerArray[i].value < team.wr2.value) {
                if (playerArray[i].salary < team.wr2.salary) {
                    if (playerArray[i].name != team.wr1.name) {
                        team.wr2 = playerArray[i];
                    }
                }
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // assign best wr3 by best value
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < playerArray.length; i++) {
        if (playerArray[i].position === 'WR') {
            if (playerArray[i].value < team.wr3.value) {
                if (playerArray[i].name != team.wr1.name) {
                    if (playerArray[i].name != team.wr2.name) {
                        team.wr3 = playerArray[i];
                    }
                }
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // assign best dst1 by best value
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < playerArray.length; i++) {
        if (playerArray[i].position === 'DST') {
            if (playerArray[i].salary <= 2300) {
                if (playerArray[i].value < team.dst1.value) {
                    team.dst1 = playerArray[i];
                }
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // assign best value te1 under 6k salary
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < playerArray.length; i++) {
        if (playerArray[i].position === 'TE') {
            if (playerArray[i].salary <= 6000) {
                if (playerArray[i].value < team.te1.value) {
                    if (playerArray[i].name != team.fx1.name) {
                        team.te1 = playerArray[i];
                    }
                }
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // assign best rb1 by best value
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < playerArray.length; i++) {
        if (playerArray[i].position === 'RB') {
            if (playerArray[i].value < team.rb1.value) {
                team.rb1 = playerArray[i];
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // assign cheapest rb2 by best value
    // ---------------------------------------------------------------------------------
    for (let i = 0; i < playerArray.length; i++) {
        if (playerArray[i].position === 'RB') {
            if (playerArray[i].value < team.rb2.value) {
                if (playerArray[i].salary < team.rb2.salary) {
                    if (playerArray[i].name != team.rb1.name) {
                        team.rb2 = playerArray[i];
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
            for (let i = 0; i < playerArray.length; i++) {
                if (playerArray[i].position === 'WR') {
                    if (playerArray[i].salary <= 6000) {
                        if (playerArray[i].value < 100) {
                            if (playerArray[i].name != oldwr1) {
                                team.wr1 = playerArray[i];
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
    for (let i = 0; i < playerArray.length; i++) {
        if (team.qb1.name && team.rb1.name && team.rb2.name && team.wr1.name && team.wr2.name && team.wr3.name && team.te1.name && team.dst1.name) {
            const tempsalary = team.qb1.salary + team.rb1.salary + team.rb2.salary + team.wr1.salary + team.wr2.salary + team.wr3.salary + team.te1.salary + team.dst1.salary;
            const leftsalary = 50000 - tempsalary;
            if ((playerArray[i].position === 'RB') || (playerArray[i].position === 'WR') || (playerArray[i].position === 'TE')) {
                if (playerArray[i].value < team.fx1.value) {
                    if (playerArray[i].name != team.rb1.name) {
                        if (playerArray[i].name != team.rb2.name) {
                            if (playerArray[i].name != team.wr1.name) {
                                if (playerArray[i].name != team.wr2.name) {
                                    if (playerArray[i].name != team.wr3.name) {
                                        if (playerArray[i].name != team.te1.name) {
                                            if (playerArray[i].salary === leftsalary) {
                                                team.fx1 = playerArray[i];
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
        for (let i = 0; i < playerArray.length; i++) {
            if (team.qb1.name && team.rb1.name && team.rb2.name && team.wr1.name && team.wr2.name && team.wr3.name && team.te1.name && team.dst1.name) {
                const tempsalary = team.qb1.salary + team.rb1.salary + team.rb2.salary + team.wr1.salary + team.wr2.salary + team.wr3.salary + team.te1.salary + team.dst1.salary;
                const leftsalary = 50000 - tempsalary;
                if ((playerArray[i].position === 'RB') || (playerArray[i].position === 'WR') || (playerArray[i].position === 'TE')) {
                    if (playerArray[i].name != team.rb1.name) {
                        if (playerArray[i].name != team.rb2.name) {
                            if (playerArray[i].name != team.wr1.name) {
                                if (playerArray[i].name != team.wr2.name) {
                                    if (playerArray[i].name != team.wr3.name) {
                                        if (playerArray[i].name != team.te1.name) {
                                            if (playerArray[i].salary <= leftsalary) {
                                                team.fx1 = playerArray[i];
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
            for (let i = 0; i < playerArray.length; i++) {
                if (playerArray[i].position === 'DST') {
                    if (playerArray[i].salary === (leftsalary + olddst1)) {
                        team.dst1 = playerArray[i];
                    }
                }
            }
        }
    }

    const totalSalary = team.qb1.salary + team.rb1.salary + team.rb2.salary + team.wr1.salary + team.wr2.salary + team.wr3.salary + team.te1.salary + team.fx1.salary + team.dst1.salary;
    const overSalary = totalSalary - allowedSalary;
    const totalPoints = team.qb1.avgpoints + team.rb1.avgpoints + team.rb2.avgpoints + team.wr1.avgpoints + team.wr2.avgpoints + team.wr3.avgpoints + team.te1.avgpoints + team.fx1.avgpoints + team.dst1.avgpoints;
    const underPoints = pointsTarget - totalPoints;
    const tooManyPlayersOnSameTeamArr = await tooManyPlayersOnSameTeam(team);
    let playersUpdated = [];
    // Array of teams's players chunked
     for (let q = 0; q < tooManyPlayersOnSameTeamArr.length; q++) {
        // Array of players per team
        for (let j = 0; j < tooManyPlayersOnSameTeamArr[q].length; j++) {
            playerArray.map((player) => {
                if (tooManyPlayersOnSameTeamArr[q][j].name !== player.name) {
                    playersUpdated.push(player);
                }
            });
        }
     };
    let updatedUniquePlayers = await getUniqueListBy(playersUpdated, 'name');

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

    //} else if (tooManyPlayersOnSameTeamArr.length > 0) {

        /* Remove lowest value player in lineup from team w/ duplicate entries to bench */
        // players = await players.filter((player) =>  {
        //     if (player.name !== return player
        //      console.log('playersFromSameTeam', playersFromSameTeam);
        //      //await removeLowestValuePlayer(playersFromSameTeam);
        //  });
        // console.log('+------------------------+');
        // console.log('| rebuilding team, too many players on single team |');
        // console.log('+------------------------+');
        // rebuildTeam();

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
                                    playerArray.push(waivers[j]);
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

                fs.writeFile(`./data/${weekNum}/team.json`, jsondata, function (err) {
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
