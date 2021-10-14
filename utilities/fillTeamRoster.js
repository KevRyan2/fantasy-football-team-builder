async function fillTeamRoster(playerArray, team) {
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

    return team;
}


module.exports = { 
  fillTeamRoster: fillTeamRoster
};



