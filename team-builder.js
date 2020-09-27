const fs = require('fs');
const dataDK = require('./data/draftkings.json'); // update this file weekly with csv data from draftkings website
const dataFD = require('./data/fanduel.json'); // update this file weekly with csv data from fanduel website
const bench = require('./bench'); // array of players to keep off of the team
const replacements = require('./replacements'); // order of player replacements when rebuilding

const draftkings = [...dataDK];
const fanduel = [...dataFD];
const players = []; // array of players sorted by value to build a team from
const defenses = []; // array of defenses to sort by easiest to play against
const waivers = []; // array of players removed from the team

const allowedSalary = 50000; // manually change if draftkings salary is different
const salaryBuffer = -5000; // amount under allowedSalary willing not to spend
const pointsTarget = 50; // total player points of entire team aiming for
const adjustDSTValue = 225; // amount of value to adjust if playing weaker defenses
const useFanDuel = true; // use fanduel data to average the value of draftkings data of each player

let replacement = 0; // increments on each replacement

// ---------------------------------------------------------------------------------
// remove bench players
// ---------------------------------------------------------------------------------
if (bench.length) {
    console.log('+------------------------+');
    console.log('| removing bench players |');
    console.log('+------------------------+');
    for (let i = draftkings.length - 1; i >= 0; i--) {
        for (let j = 0; j < bench.length; j++) {
            if (draftkings[i] && (draftkings[i].Name === bench[j])) {
                draftkings.splice(i, 1);
            }
        }
    }

    filterDefenses();

} else {

    filterDefenses();

}

// ---------------------------------------------------------------------------------
// create array of weak defenses and remove them from draftkings data
// ---------------------------------------------------------------------------------
function filterDefenses() {

    console.log('+------------------------+');
    console.log('| filtering defenses     |');
    console.log('+------------------------+');
    for (let i = 0; i < draftkings.length; i++) {
        if (draftkings[i].Position === 'DST') {
            for (let j = 0; j < fanduel.length; j++) {
                if (draftkings[i].TeamAbbrev === fanduel[j].Team) {
                    if (fanduel[j].Position === 'D') {
                        this.defense = {
                            name: draftkings[i].Name,
                            salary: draftkings[i].Salary,
                            position: draftkings[i].Position,
                            team: draftkings[i].TeamAbbrev,
                            avgpoints: draftkings[i].AvgPointsPerGame,
                            opponent: fanduel[j].Opponent
                        };
                        defenses.push(this.defense);
                    }
                }
            }
        }
    }

    defenses.splice(0, 15); // keep the worst defenses

    // findValue();
    removeWeakDefenses();

}

function removeWeakDefenses() {

    console.log('+------------------------+');
    console.log('| removing weak defenses |');
    console.log('+------------------------+');
    for (let i = draftkings.length - 1; i >= 0; i--) {
        for (let j = 0; j < defenses.length; j++) {
            if (draftkings[i] && (draftkings[i].Name === defenses[j].name)) {
                draftkings.splice(i, 1);
            }
        }
    }

    findValue();

}

function findValue() {

    // ---------------------------------------------------------------------------------
    // loop over player data and organize by value
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
                value: null,
                // fd: null
            };
            if (draftkings[i].AvgPointsPerGame > 0) {
                player.name = draftkings[i].Name;
                player.salary = draftkings[i].Salary;
                player.position = draftkings[i].Position;
                player.team = draftkings[i].TeamAbbrev;
                player.avgpoints = draftkings[i].AvgPointsPerGame;
                player.value = draftkings[i].Salary / draftkings[i].AvgPointsPerGame;

                // get opponent from fanduel data
                for (let j = 0; j < fanduel.length; j++) {
                    if (player.name === fanduel[j].Nickname) {
                        player.opponent = fanduel[j].Opponent;
                    }
                }

                // adjust value if playing weaker dst
                for (let k = 0; k < defenses.length; k++) {
                    if (player.opponent === defenses[k].team) {
                        player.value = player.value - adjustDSTValue;
                        player.opponent = player.opponent + ' (weak)';
                    }
                }

                if (useFanDuel) {
                    for (let m = 0; m < fanduel.length; m++) {
                        if (fanduel[m].Nickname === player.name) {
                            if (fanduel[m].FPPG > 0) {
                                const fppg = fanduel[m].FPPG;
                                const fsalary = fanduel[m].Salary;
                                const fdvalue = fsalary / fppg;
                                player.value = (player.value + fdvalue) / 2;
                                // player.fd = 'x';
                            }
                        }
                    }
                }
                player.value = parseInt(player.value.toFixed(2));
                players.push(player);
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // loop over defense data and organize by value
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
                if (useFanDuel) {
                    for (let j = 0; j < fanduel.length; j++) {
                        if (fanduel[j].Position === 'D') {
                            if (fanduel[j].Team === draftkings[i].TeamAbbrev) {
                                if (fanduel[j].FPPG > 0) {
                                    const fppg = fanduel[j].FPPG;
                                    const fsalary = fanduel[j].Salary;
                                    const fdvalue = fsalary / fppg;
                                    this.player.value = (this.player.value + fdvalue) / 2;
                                    // this.player.fd = 'x';
                                }
                            }
                        }
                    }
                }
                player.value = parseInt(player.value.toFixed(2));
                players.push(this.player);
            }
        }
    }

    console.log('+------------------------+');
    console.log('| building team          |');
    console.log('+------------------------+');
    createTeam(players);
}

// ---------------------------------------------------------------------------------
// build a team
// ---------------------------------------------------------------------------------
function createTeam(array) {

    // sort players array by value (salary / avgpoints)
    array.sort((a, b) => (a.value > b.value) ? 1 : -1);

    // ---------------------------------------------------------------------------------
    // blank team template
    // ---------------------------------------------------------------------------------
    const team = {
        qb1: {
            name: '',
            salary: 0,
            position: '',
            team: '',
            opponent: '',
            avgpoints: 0,
            value: 1000
        },
        rb1: {
            name: '',
            salary: 0,
            position: '',
            team: '',
            opponent: '',
            avgpoints: 0,
            value: 1000
        },
        rb2: {
            name: '',
            salary: 0,
            position: '',
            team: '',
            opponent: '',
            avgpoints: 0,
            value: 1000
        },
        wr1: {
            name: '',
            salary: 0,
            position: '',
            team: '',
            opponent: '',
            avgpoints: 0,
            value: 1000
        },
        wr2: {
            name: '',
            salary: 0,
            position: '',
            team: '',
            opponent: '',
            avgpoints: 0,
            value: 1000
        },
        wr3: {
            name: '',
            salary: 0,
            position: '',
            team: '',
            opponent: '',
            avgpoints: 0,
            value: 1000
        },
        te1: {
            name: '',
            salary: 0,
            position: '',
            team: '',
            opponent: '',
            avgpoints: 0,
            value: 1000
        },
        fx1: {
            name: '',
            salary: 0,
            position: '',
            team: '',
            opponent: '',
            avgpoints: 0,
            value: 1000
        },
        dst1: {
            name: '',
            salary: 0,
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
    // assign players to team
    // ---------------------------------------------------------------------------------
    for (i = 0; i < array.length; i++) {

        // assign best value rb1 ////////////////////////////
        if (array[i].position === 'RB') {
            if (array[i].value < team.rb1.value) {
                team.rb1.name = array[i].name;
                team.rb1.salary = array[i].salary;
                team.rb1.position = array[i].position;
                team.rb1.team = array[i].team;
                team.rb1.opponent = array[i].opponent;
                team.rb1.avgpoints = array[i].avgpoints;
                team.rb1.value = array[i].value;
                // team.rb1.fd = array[i].fd;
            }
        }

        // assign best value rb2 ///////////////////////////
        if (array[i].position === 'RB') {
            if (array[i].value < team.rb2.value) {
                if (array[i].name != team.rb1.name) {
                    team.rb2.name = array[i].name;
                    team.rb2.salary = array[i].salary;
                    team.rb2.position = array[i].position;
                    team.rb2.team = array[i].team;
                    team.rb2.opponent = array[i].opponent;
                    team.rb2.avgpoints = array[i].avgpoints;
                    team.rb2.value = array[i].value;
                    // team.rb2.fd = array[i].fd;
                }
            }
        }

        // assign best value wr1 ///////////////////////////
        if (array[i].position === 'WR') {
            if (array[i].value < team.wr1.value) {
                team.wr1.name = array[i].name;
                team.wr1.salary = array[i].salary;
                team.wr1.position = array[i].position;
                team.wr1.team = array[i].team;
                team.wr1.opponent = array[i].opponent;
                team.wr1.avgpoints = array[i].avgpoints;
                team.wr1.value = array[i].value;
                // team.wr1.fd = array[i].fd;
            }
        }

        // assign best value qb1 ////////////////////////////
        if (array[i].position === 'QB') {
            if (array[i].value < team.qb1.value) {
                team.qb1.name = array[i].name;
                team.qb1.salary = array[i].salary;
                team.qb1.position = array[i].position;
                team.qb1.team = array[i].team;
                team.qb1.opponent = array[i].opponent;
                team.qb1.avgpoints = array[i].avgpoints;
                team.qb1.value = array[i].value;
                // team.qb1.fd = array[i].fd;
            }
        }

        // assign best value wr2 //////////////////////////
        if (array[i].position === 'WR') {
            if (array[i].value < team.wr2.value) {
                if (array[i].name != team.wr1.name) {
                    team.wr2.name = array[i].name;
                    team.wr2.salary = array[i].salary;
                    team.wr2.position = array[i].position;
                    team.wr2.team = array[i].team;
                    team.wr2.opponent = array[i].opponent;
                    team.wr2.avgpoints = array[i].avgpoints;
                    team.wr2.value = array[i].value;
                    // team.wr2.fd = array[i].fd;
                }
            }
        }

        // assign best value wr3 //////////////////////////
        if (array[i].position === 'WR') {
            if (array[i].value < team.wr3.value) {
                if (array[i].name != team.wr1.name) {
                    if (array[i].name != team.wr2.name) {
                        team.wr3.name = array[i].name;
                        team.wr3.salary = array[i].salary;
                        team.wr3.position = array[i].position;
                        team.wr3.team = array[i].team;
                        team.wr3.opponent = array[i].opponent;
                        team.wr3.avgpoints = array[i].avgpoints;
                        team.wr3.value = array[i].value;
                        // team.wr3.fd = array[i].fd;
                    }
                }
            }
        }

        // assign best value fx1 //////////////////////////
        if ((array[i].position === 'RB') || (array[i].position === 'WR')) {
            if (array[i].value < team.fx1.value) {
                if (array[i].name != team.rb1.name) {
                    if (array[i].name != team.rb2.name) {
                        if (array[i].name != team.wr1.name) {
                            if (array[i].name != team.wr2.name) {
                                if (array[i].name != team.wr3.name) {
                                    team.fx1.name = array[i].name;
                                    team.fx1.salary = array[i].salary;
                                    team.fx1.position = array[i].position;
                                    team.fx1.team = array[i].team;
                                    team.fx1.opponent = array[i].opponent;
                                    team.fx1.avgpoints = array[i].avgpoints;
                                    team.fx1.value = array[i].value;
                                    // team.fx1.fd = array[i].fd;
                                }
                            }
                        }
                    }
                }
            }
        }

        // assign best value te1 //////////////////////////
        if (array[i].position === 'TE') {
            if (array[i].value < team.te1.value) {
                if (array[i].name != team.fx1.name) {
                    team.te1.name = array[i].name;
                    team.te1.salary = array[i].salary;
                    team.te1.position = array[i].position;
                    team.te1.team = array[i].team;
                    team.te1.opponent = array[i].opponent;
                    team.te1.avgpoints = array[i].avgpoints;
                    team.te1.value = array[i].value;
                    // team.te1.fd = array[i].fd;
                }
            }
        }

        // assign best value dst1
        if (array[i].position === 'DST') {
            if (array[i].value < team.dst1.value) {
                team.dst1.name = array[i].name;
                team.dst1.salary = array[i].salary;
                team.dst1.position = array[i].position;
                team.dst1.team = array[i].team;
                team.dst1.avgpoints = array[i].avgpoints;
                team.dst1.value = array[i].value;
                // team.dst1.fd = array[i].fd;
            }
        }

    }

    const totalSalary = team.qb1.salary + team.rb1.salary + team.rb2.salary + team.wr1.salary + team.wr2.salary + team.wr3.salary + team.te1.salary + team.fx1.salary + team.dst1.salary;
    const overSalary = totalSalary - allowedSalary;

    const totalPoints = team.qb1.avgpoints + team.rb1.avgpoints + team.rb2.avgpoints + team.wr1.avgpoints + team.wr2.avgpoints + team.wr3.avgpoints + team.te1.avgpoints + team.fx1.avgpoints + team.dst1.avgpoints;
    const underPoints = pointsTarget - totalPoints;

    if (underPoints > 0) {

        console.log('+-------------------------');
        console.log('| rebuilding team        |');
        console.log('+-------------------------');
        rebuildTeam();

    } else if (overSalary > 0) {

        console.log('+-------------------------');
        console.log('| rebuilding team        |');
        console.log('+-------------------------');
        rebuildTeam();

    } else if (overSalary < salaryBuffer) {

        console.log('+-------------------------');
        console.log('| rebuilding team        |');
        console.log('+-------------------------');
        rebuildTeam();

    } else {

        console.log('+-------------------------');
        console.log('| checking waivers       |');
        console.log('+-------------------------');
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

            console.log('+-------------------------');
            console.log('| rebuilding team        |');
            console.log('+-------------------------');
            rebuildTeam();

        } else {

            if (overSalary < salaryBuffer) {

                console.log('+-------------------------');
                console.log('| still under salary cap |');
                console.log('+-------------------------');
                console.table(team);
                console.log('+-------------------------');
                console.log('| rebuilding team        |');
                console.log('+-------------------------');
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

                fs.writeFile('./team.json', jsondata, function (err) {
                    if (err) throw err;
                });

                console.log('| bench');
                console.table(bench);
                console.log('| defenses');
                console.table(defenses);
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
                    createTeam(updatedplayers);
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
                    createTeam(updatedplayers);
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
                    createTeam(updatedplayers);
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
                    createTeam(updatedplayers);
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
                    createTeam(updatedplayers);
                }
            }
        }

    } else {

        console.log('| bench');
        console.table(bench);
        console.log('| waivers');
        console.table(waivers);
        console.log('| defenses');
        console.table(defenses);

        console.log('+-------------------------');
        console.log('| unable to build team   |');
        console.log('+-------------------------');

        console.table(this.team);

    }
}
