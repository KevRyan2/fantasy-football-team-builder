const fs = require('fs');
const dataDK = require('./draftkings.json'); // update this file weekly with csv data from draftkings website
const dataFD = require('./fanduel.json'); // update this file weekly with csv data from fanduel website
const draftkings = [...dataDK];
const fanduel = [...dataFD];
const useFanDuel = false; // use fanduel data to average the value of draftkings data of each player
const bench = ['Christian McCaffrey', 'Wes Hills', 'Duke Williams']; // remove these players from team building
const players = []; // array of players sorted by value to build a team from
const waivers = []; // array of players removed from the team
const allowedSalary = 50000; // manually change if draftkings salary is different
const salaryBuffer = -2000; // amount under allowedSalary willing not to spend
const pointsTarget = 140; // total player points of entire team aiming for
const replacements = [ // order of player replacements when rebuilding
    'RB',
    'DST',
    'DST',
    'DST',
    'DST',
    'TE',
    'TE',
    'WR',
    'RB',
    'QB',
    'QB',
    'WR',
    'WR',
    'WR',
    'QB',
    'RB',
    'TE',
    'RB',
    'WR',
    'DST',
    'DST',
    'WR',
    'DST',
    'RB',
    'DST',
    'WR',
    'TE',
    'QB',
    'WR',
    'WR',
    'RB',
    'DST',
    'WR',
    'TE',
    'TE',
    'WR',
    'QB',
    'DST',
    'DST',
    'DST',
    'DST',
    'DST',
    'DST',
    'DST',
    'DST',
    'DST',
    'DST',
    'DST',
    'QB',
    'RB',
    'TE',
    'WR',
    'DST'
];

let replacement = 0; // increments on each replacement

function predict() {

    // ---------------------------------------------------------------------------------
    // loop over draftkings data for qb data
    // ---------------------------------------------------------------------------------
    console.log('+------------------------+');
    console.log('| training quarterbacks  |');
    console.log('+------------------------+');
    for (i = 0; i < draftkings.length; i++) {
        if (draftkings[i].Position === 'QB') {
            if (draftkings[i].AvgPointsPerGame > 0) {
                this.player = {
                    name: draftkings[i].Name,
                    points: 0,
                    salary: draftkings[i].Salary,
                    position: draftkings[i].Position,
                    team: draftkings[i].TeamAbbrev,
                    avgpoints: draftkings[i].AvgPointsPerGame,
                    value: draftkings[i].Salary / draftkings[i].AvgPointsPerGame
                };
                if (useFanDuel) {
                    for (let j = 0; j < fanduel.length; j++) {
                        if (fanduel[j].Nickname === this.player.name) {
                            if (fanduel[j].FPPG > 0) {
                                const fppg = fanduel[j].FPPG;
                                const fsalary = fanduel[j].Salary;
                                const fdvalue = fsalary / fppg;
                                this.player.value = (this.player.value + fdvalue) / 2;
                            }
                        }
                    }
                }
                players.push(this.player);
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // loop over draftkings data for rb data
    // ---------------------------------------------------------------------------------
    console.log('+------------------------+');
    console.log('| training runningbacks  |');
    console.log('+------------------------+');
    for (i = 0; i < draftkings.length; i++) {
        if (draftkings[i].Position === 'RB') {
            if (draftkings[i].AvgPointsPerGame > 0) {
                this.player = {
                    name: draftkings[i].Name,
                    points: 0,
                    salary: draftkings[i].Salary,
                    position: draftkings[i].Position,
                    team: draftkings[i].TeamAbbrev,
                    avgpoints: draftkings[i].AvgPointsPerGame,
                    value: draftkings[i].Salary / draftkings[i].AvgPointsPerGame
                };
                if (useFanDuel) {
                    for (let j = 0; j < fanduel.length; j++) {
                        if (fanduel[j].Nickname === this.player.name) {
                            if (fanduel[j].FPPG > 0) {
                                const fppg = fanduel[j].FPPG;
                                const fsalary = fanduel[j].Salary;
                                const fdvalue = fsalary / fppg;
                                this.player.value = (this.player.value + fdvalue) / 2;
                            }
                        }
                    }
                }
                players.push(this.player);
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // loop over draftkings data for wr data
    // ---------------------------------------------------------------------------------
    console.log('+------------------------+');
    console.log('| training widereceivers |');
    console.log('+------------------------+');
    for (i = 0; i < draftkings.length; i++) {
        if (draftkings[i].Position === 'WR') {
            if (draftkings[i].AvgPointsPerGame > 0) {
                this.player = {
                    name: draftkings[i].Name,
                    points: 0,
                    salary: draftkings[i].Salary,
                    position: draftkings[i].Position,
                    team: draftkings[i].TeamAbbrev,
                    avgpoints: draftkings[i].AvgPointsPerGame,
                    value: draftkings[i].Salary / draftkings[i].AvgPointsPerGame
                };
                if (useFanDuel) {
                    for (let j = 0; j < fanduel.length; j++) {
                        if (fanduel[j].Nickname === this.player.name) {
                            if (fanduel[j].FPPG > 0) {
                                const fppg = fanduel[j].FPPG;
                                const fsalary = fanduel[j].Salary;
                                const fdvalue = fsalary / fppg;
                                this.player.value = (this.player.value + fdvalue) / 2;
                            }
                        }
                    }
                }
                players.push(this.player);
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // loop over draftkings data for te data
    // ---------------------------------------------------------------------------------
    console.log('+------------------------+');
    console.log('| training tightends     |');
    console.log('+------------------------+');
    for (i = 0; i < draftkings.length; i++) {
        if (draftkings[i].Position === 'TE') {
            if (draftkings[i].AvgPointsPerGame > 0) {
                this.player = {
                    name: draftkings[i].Name,
                    points: 0,
                    salary: draftkings[i].Salary,
                    position: draftkings[i].Position,
                    team: draftkings[i].TeamAbbrev,
                    avgpoints: draftkings[i].AvgPointsPerGame,
                    value: draftkings[i].Salary / draftkings[i].AvgPointsPerGame
                };
                if (useFanDuel) {
                    for (let j = 0; j < fanduel.length; j++) {
                        if (fanduel[j].Nickname === this.player.name) {
                            if (fanduel[j].FPPG > 0) {
                                const fppg = fanduel[j].FPPG;
                                const fsalary = fanduel[j].Salary;
                                const fdvalue = fsalary / fppg;
                                this.player.value = (this.player.value + fdvalue) / 2;
                            }
                        }
                    }
                }
                players.push(this.player);
            }
        }
    }

    // ---------------------------------------------------------------------------------
    // loop over draftkings data for dst data
    // ---------------------------------------------------------------------------------
    console.log('+------------------------+');
    console.log('| training defenses      |');
    console.log('+------------------------+');
    for (i = 0; i < draftkings.length; i++) {
        if (draftkings[i].Position === 'DST') {
            if (draftkings[i].AvgPointsPerGame > 0) {
                this.player = {
                    name: draftkings[i].Name,
                    points: 0,
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
                                }
                            }
                        }
                    }
                }
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
// remove bench players before analyzing full player lists
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

    predict();

} else {

    predict();

}

// ---------------------------------------------------------------------------------
// build a team
// ---------------------------------------------------------------------------------
function createTeam(array) {

    // check for players in the waiver array who match

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
            avgpoints: 0,
            value: 1000
        },
        rb1: {
            name: '',
            salary: 0,
            position: '',
            team: '',
            avgpoints: 0,
            value: 1000
        },
        rb2: {
            name: '',
            salary: 0,
            position: '',
            team: '',
            avgpoints: 0,
            value: 1000
        },
        wr1: {
            name: '',
            salary: 0,
            position: '',
            team: '',
            avgpoints: 0,
            value: 1000
        },
        wr2: {
            name: '',
            salary: 0,
            position: '',
            team: '',
            avgpoints: 0,
            value: 1000
        },
        wr3: {
            name: '',
            salary: 0,
            position: '',
            team: '',
            avgpoints: 0,
            value: 1000
        },
        te1: {
            name: '',
            salary: 0,
            position: '',
            team: '',
            avgpoints: 0,
            value: 1000
        },
        fx1: {
            name: '',
            salary: 0,
            position: '',
            team: '',
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
                team.rb1.avgpoints = array[i].avgpoints;
                team.rb1.value = array[i].value;
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
                    team.rb2.avgpoints = array[i].avgpoints;
                    team.rb2.value = array[i].value;
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
                team.wr1.avgpoints = array[i].avgpoints;
                team.wr1.value = array[i].value;
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
                    team.wr2.avgpoints = array[i].avgpoints;
                    team.wr2.value = array[i].value;
                }
            }
        }

        // assign best value qb1 ////////////////////////////
        if (array[i].position === 'QB') {
            if (array[i].value < team.qb1.value) {
                team.qb1.name = array[i].name;
                team.qb1.salary = array[i].salary;
                team.qb1.position = array[i].position;
                team.qb1.team = array[i].team;
                team.qb1.avgpoints = array[i].avgpoints;
                team.qb1.value = array[i].value;
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
                        team.wr3.avgpoints = array[i].avgpoints;
                        team.wr3.value = array[i].value;
                    }
                }
            }
        }

        // assign best value fx1 //////////////////////////
        if ((array[i].position === 'RB') || (array[i].position === 'WR') || (array[i].position === 'TE')) {
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
                                    team.fx1.avgpoints = array[i].avgpoints;
                                    team.fx1.value = array[i].value;
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
                    team.te1.avgpoints = array[i].avgpoints;
                    team.te1.value = array[i].value;
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
        for (const i in team) {
            for (let j = waivers.length - 1; j >= 0; j--) {
                if (waivers[j].position === team[i].position) {
                    if (waivers[j].value < team[i].value) {
                        if (waivers[j].salary > team[i].salary) {
                            if (waivers[j].avgpoints > team[i].avgpoints) {
                                if (waivers[j].salary < (team[i].salary + (overSalary * -1))) {
                                    // console.log('pull off waivers: ', waivers[j].name);
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

            if (overSalary < -500) {

                console.log('+-------------------------');
                console.log('| still under salary cap |');
                console.log('+-------------------------');
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
                console.log('| waivers')
                console.table(waivers);
                console.log('| final team')
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
                    // console.log('removing ', players[i].name);
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
                    // console.log('removing ', players[i].name);
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
                    // console.log('removing ', players[i].name);
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
                    // console.log('removing ', players[i].name);
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
                    // console.log('removing ', players[i].name);
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

        console.log('+-------------------------');
        console.log('| unable to build team   |');
        console.log('+-------------------------');

    }
}
