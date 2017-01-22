'use strict';

let pg = require('pg');
let fs = require('fs');
const natural = require('./natural.js');
require('dotenv').config();

let ditto = require('./ditto.js');

let pgConfig = {
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    max: 10,
    idleTimoutMillis: 30000
};

let pool = new pg.Pool(pgConfig);

exports.User = function User(username, message) {
    this.username = username;
    this.message = message;
    this.state = null;
    this.keyboard = null;
    this.response = null;
    this['trainer_name'] = null;
    this['game'] = null;
    this['pokemon'] = null;
    this['shiny'] = null;
}

exports.handleUser = function handleUser(user) {
    return new Promise((resolve, reject) => {
        isUserInDb(user).then(function(result) {
            if (result === false) {
                addUserToDb(user).then(returnWelcomeMessage).then(function(result) {
                    return resolve(result);
                });
            } else {
                getUserState(user)
                    .then(handleState)
                    .then(function(result) {
                        return resolve(result);
                    })
                    .catch(function(reason) {
                        console.log(`Promise failed: ${reason}`);
                    });
            }
        });
    });
}

function getUserState(user) {
    return new Promise((resolve, reject) => {
        pool.connect(function(error, client, done) {
            if (error) {
                console.log(`Error connecting to DB: ${error}`);
                return reject(error);
            }
            client.query(`SELECT state FROM users WHERE username = '${user.username}'`, function(error, result) {
                done();
                if (error) {
                    console.log(`Error getting user state in DB: ${error}`);
                    return reject(error);
                }
                let state = result.rows[0].state;
                user.state = state;
                return resolve(user);
            });
        });
    });



}


function isUserInDb(user) {
    return new Promise((resolve, reject) => {
        pool.connect(function(error, client, done) {
            if (error) {
                console.log(`Error connecting to DB: ${error}`);
                return reject(error);
            }
            client.query(`SELECT 1 FROM users WHERE username = '${user.username}'`, function(error, result) {
                done();
                if (error) {
                    console.log(`Error checking for user in DB: ${error}`);
                    return reject(error);
                }
                if (result.rowCount === 0) {
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    });
}

function addUserToDb(user) {
    return new Promise((resolve, reject) => {
        pool.connect(function(error, client, done) {
            if (error) {
                return reject(`Error connecting to database: ${error}`);
            }
            client.query(`INSERT INTO users (username, state) VALUES ('${user.username}', 1)`, function(error, result) {
                done();
                if (error) {
                    return reject(`Error adding user to DB: ${error}`);
                }
                return resolve(user);
            });
        });
    });
}

function handleState(user) {
    return new Promise((resolve, reject) => {
        switch (user.state) {
            case 1:
                return resolve(handleStateOne(user));
            case 2:
                return resolve(handleStateTwo(user));
            case 3:
                return resolve(handleStateThree(user));
            case 4:
                return resolve(handleStateFour(user));
            case 5:
                return resolve(handleStateFive(user));
            case 6:
                return resolve(handleStateSix(user));
            case 7:
                return resolve(handleStateSeven(user));
            case 8:
                return resolve(handleStateEight(user));
            case 9:
                return resolve(handleStateNine(user));
            case 10:
                return resolve(handleStateTen(user));
            case 11:
                return resolve(handleStateEleven(user));
            case 12:
                return resolve(handleStateTwelve(user));
            case 13:
                return resolve(handleStateThirteen(user));
            case 14:
                return resolve(handleStateFourteen(user));
            case 15:
                return resolve(handleStateFifteen(user));
            case 17:
                return resolve(handleStateSeventeen(user));
        }
    });

}

function returnWelcomeMessage(user) {
    return new Promise((resolve, reject) => {
        user.response = [`Nice to meet you, ${user.username}! Let's start building your Pokemon. Which game are you playing?`];
        user.keyboard = ['X', 'Y', 'Ruby', 'Sapphire', 'Sun', 'Moon'];
        return resolve(user);
    });
}

function handleStateOne(user) {
    return new Promise((resolve, reject) => {
        let trainerGame = user.message;
        if (isGameValid(trainerGame)) {
            user['game'] = trainerGame;
            addAttributeAndUpdateState(user, 'game', 2).then(function(result) {
                let messageArray = [];
                messageArray.push(`Okay, I'll store the game ${trainerGame} for you.`);
                messageArray.push(`What's your trainer's in-game name?`);
                user.response = messageArray;
                return resolve(user);
            });
        } else {
            user.response = [`Sorry, that's not a valid game. What game are you playing?`];
            user.keyboard = ['X', 'Y', 'Ruby', 'Sapphire', 'Sun', 'Moon'];
            return resolve(user);
        }
    });


    function isGameValid(game) {
        if (game != 'X' && game != 'Y' && game != 'Ruby' && game != 'Sapphire' && game != 'Sun' && game != 'Moon') {
            return false;
        }
        return true;
    }
}

function handleStateTwo(user) {
    return new Promise((resolve, reject) => {
        let trainerName = user.message;
        if (isTrainerNameValid(trainerName)) {
            user['trainer_name'] = trainerName;
            addAttributeAndUpdateState(user, 'trainer_name', 3).then(function(result) {
                let messageArray = [];
                messageArray.push(`Thanks. I'll store the trainer name ${trainerName} for you.`);
                messageArray.push(`So, which Pokemon would you like?`);
                user.response = messageArray;
                return resolve(user);
            });
        } else {
            user.response = `Sorry, that's not a valid trainer name. Can you give me your trainer name?`;
            return resolve(user);
        }
    });

    function isTrainerNameValid(name) {
        if (name.length > 12) {
            return false;
        }
        return true;
    }
}

function handleStateThree(user) {
    return new Promise((resolve, reject) => {
        let userPokemon = user.message;
        checkPokemonMatch(userPokemon).then(function(result) {
            if (result.bool === true) {
                if (result.match) {
                    updateRequest(user, 'pokemon', userPokemon, 5)
                        .then(updateUserState).then(function(result) {
                            user.response = [`Got it, you want ${userPokemon}. Would you like it to be shiny?`];
                            user.keyboard = ['Yes', 'No'];
                            return resolve(user);
                        });
                } else if (result.sugg) {
                    user.sugg = result.sugg;
                    updateRequest(user, 'pokemon', user.sugg, 4)
                        .then(updateUserState).then(function(result) {
                            user.response = [`Did you mean you want ${user.sugg}?`];
                            user.keyboard = ['Yes', 'No'];
                            return resolve(user);
                        });
                }
            } else {
                user.response = `Sorry, I don't recognize that Pokemon. Which Pokemon would you like?`;
                return resolve(user);
            }
        });
    });
}

function handleStateFour(user) {
    return new Promise((resolve, reject) => {
        if (user.message === 'Yes') {
            user.state = 5;
            updateUserState(user)
                .then(function(result) {
                    let user = result;
                    user.response = [`Excellent. Would you like it to be shiny?`];
                    user.keyboard = ['Yes', 'No'];
                    return resolve(user);
                });
        } else if (user.message === 'No') {
            user.state = 3;
            updateUserState(user)
                .then(function(result) {
                    let user = result;
                    user.response = `Then let's try again. Which Pokemon would you like?`;
                    return resolve(user);
                });
        } else {
            user.response = [`Sorry, I need a yes or a no.`];
            user.keyboard = ['Yes', 'No'];
            return resolve(user);
        }
    });
}

function handleStateFive(user) {
    return new Promise((resolve, reject) => {
        if (user.message === 'Yes') {
            user['shiny'] = true;
            updateRequest(user, 'shiny', user['shiny'], 6)
                .then(updateUserState).then(function(result) {
                    user.response = ['Shiny it will be! Male or female?'];
                    user.keyboard = ['Male', 'Female'];
                    return resolve(user);
                });
        } else if (user.message === 'No') {
            user['shiny'] = false;
            updateRequest(user, 'shiny', user['shiny'], 6)
                .then(updateUserState).then(function(result) {
                    user.response = ['Alright, no shiny. Male or female?'];
                    user.keyboard = ['Male', 'Female'];
                    return resolve(user);
                });
        } else {
            user.response = ['Sorry, I need a yes or no. Shiny?'];
            user.keyboard = ['Yes', 'No'];
            return resolve(user);
        }
    });
}

function handleStateSix(user) {
    return new Promise((resolve, reject) => {
        if (user.message === 'Male') {
            user['gender'] = 'M';
            updateRequest(user, 'gender', user['gender'], 7)
                .then(updateUserState).then(function(result) {
                    user.response = [`Okay, I'll make it male. What level should it be?`, `Note: if you enter an impossibly low level, the Pokemon will come at its lowest possible level.`];
                    return resolve(user);
                });
        } else if (user.message === 'Female') {
            user['gender'] = 'F';
            updateRequest(user, 'gender', user['gender'], 7)
                .then(updateUserState).then(function(result) {
                    user.response = [`Okay, I'll make it female. What level should it be?`, `Note: if you enter an impossibly low level, the Pokemon will come at its lowest possible level.`];
                    return resolve(user);
                });
        } else {
            user.response = [`Sorry, I need a gender. Male or female?`];
            user.keyboard = ['Male', 'Female'];
            return resolve(user);
        }
    });
}

function handleStateSeven(user) {
    return new Promise((resolve, reject) => {
        let level = parseInt(user.message);
        if (level > 0 && level < 101) {
            user['level'] = level;
            updateRequest(user, 'level', user['level'], 8)
                .then(updateUserState).then(function(result) {
                    user.response = [`Level ${level} it is. One last thing: want to nickname your Pokemon?`];
                    user.keyboard = ['Yes', 'No'];
                    return resolve(user);
                });
        } else {
            user.response = [`Sorry, I need a level between 1 and 100.`];
            return resolve(user);
        }
    });
}

function handleStateEight(user) {
    return new Promise((resolve, reject) => {
        if (user.message === 'Yes') {
            user.state = 9;
            updateUserState(user).then(function(result) {
                user.response = [`Cool. What should I nickname your Pokemon?`, `Remember, the max is 12 characters.`];
                return resolve(user);
            });
        } else if (user.message === 'No') {
            user.state = 10;
            updateUserState(user).then(function(result) {
                user.response = [`Fair enough. Alright, I'll use the GTS to send you your Pokemon.`, `You'll need to deposit a Pokemon and ask for this one. What Pokemon should I look for on the GTS?`];
                return resolve(user);
            });
        } else {
            user.response = [`Sorry, I need a yes or a no. Want to nickname your Pokemon?`];
            user.keyboard = ['Yes', 'No'];
            return resolve(user);
        }
    });
}

function handleStateNine(user) {
    return new Promise((resolve, reject) => {
        if (user.message.length > 12 || user.message.length < 1) {
            user.response = [`Sorry, you need a nickname between 1 and 12 characters. What should I nickname your Pokemon?`];
            return resolve(user);
        } else {
            user['nickname'] = user.message;
            updateRequest(user, 'nickname', user['nickname'], 10)
                .then(updateUserState).then(function(result) {
                    user.response = [`Got it, your Pokemon will be nicknamed ${user['nickname']}.`, `I'll use the GTS to send you your Pokemon.`, `You'll need to deposit a Pokemon and ask for this one. What Pokemon should I look for on the GTS?`];
                    return resolve(user);
                });
        }
    });
}

function handleStateTen(user) {
    return new Promise((resolve, reject) => {
        let tradePokemon = user.message;
        checkPokemonMatch(tradePokemon).then(function(result) {
            if (result.bool === true) {
                if (result.match) {
                    updateRequest(user, 'trade', tradePokemon, 12)
                        .then(updateUserState).then(function(result) {
                            user.response = [`Great, I'll look for ${tradePokemon}.`, `This is it. The final step. What level ${tradePokemon} will it be?`];
                            return resolve(user);
                        });
                } else if (result.sugg) {
                    user.sugg = result.sugg;
                    updateRequest(user, 'trade', user.sugg, 11)
                        .then(updateUserState).then(function(result) {
                            user.response = [`Did you mean you'll trade ${user.sugg}?`];
                            user.keyboard = ['Yes', 'No'];
                            return resolve(user);
                        });
                }
            } else {
                user.response = [`Sorry, I don't recognize that Pokemon. Which Pokemon will you deposit in the GTS?`];
                return resolve(user);
            }
        });
    });
}

function handleStateEleven(user) {
    return new Promise((resolve, reject) => {
        if (user.message === 'Yes') {
            user.state = 12;
            updateUserState(user)
                .then(function(result) {
                    let user = result;
                    user.response = [`Perfect. Alright, last step. What level Pokemon are you depositing in the GTS?`];
                    return resolve(user);
                });
        } else if (user.message === 'No') {
            user.state = 10;
            updateUserState(user)
                .then(function(result) {
                    let user = result;
                    user.response = [`Alright, let's try again. Which Pokemon will you deposit in the GTS?`];
                    return resolve(user);
                });
        } else {
            user.response = [`I need a yes or a no.`];
            user.keyboard = ['Yes', 'No'];
            return resolve(user);
        }
    });
}

function handleStateTwelve(user) {
    return new Promise((resolve, reject) => {
        let level = parseInt(user.message);
        if (level > 0 && level < 101) {
            user['trade_level'] = level;
            updateRequest(user, 'trade_level', user['trade_level'], 13)
                .then(updateUserState)
                .then(timestampUser)
                .then(function(result) {
                    user.response = [`I hope you enjoyed using DittoBot! You'll get your Pokemon within 48 hours. Want a reminder when you can request another Pokemon?`];
                    user.keyboard = ['Yes', 'No'];
                    return resolve(user);
                });
        } else {
            user.response = ['Sorry, I need a level between 1 and 100.'];
            return resolve(user);
        }
    });
}

function handleStateThirteen(user) {
    return new Promise((resolve, reject) => {
        getNextUserRequest(user).then(function(result) {
            let user = result;
            if (isItTimeYet(user.next_request)) {
                user.state = 3;
                updateUserState(user)
                    .then(function(result) {
                        let user = result;
                        user.response = [`Actually, you can request another Pokemon right now. Which one would you like?`];
                        return resolve(user);
                    });
            } else {
                let user = result;
                if (user.message === "Yes") {
                    let timeRemaining = howMuchTimeLeft(user.next_request);
                    ditto.queueReminder(user.username, timeRemaining);
                    user.state = 14;
                    updateUserState(user)
                        .then(function(result) {
                            let user = result;
                            user.response = [`Okay - I'll remind you 24 hours from now so you can get another Pokemon :) Have a great day!`];
                            return resolve(user);
                        });
                } else if (user.message === 'No') {
                    user.state = 14;
                    updateUserState(user)
                        .then(function(result) {
                            let user = result;
                            user.response = [`Okay - just remember you have to wait 24 hours to request your next Pokemon :) Have a great day!`];
                            return resolve(user);
                        });
                } else {
                    user.response = [`I need a yes or a no.`];
                    user.keyboard = ['Yes', 'No'];
                    return resolve(user);
                }
            }
        });
    });
}

function handleStateFourteen(user) {
    return new Promise((resolve, reject) => {
        getNextUserRequest(user).then(function(result) {
            console.log(isItTimeYet(result));
        });
        user.state = 15;
        updateUserState(user)
            .then(function(result) {
                user.response = [`Hi there, ${user.username}! It hasn't been quite 24 hours yet, so you can't request another Pokemon. Want a reminder when you can?`];
                user.keyboard = ['Yes', 'No'];
                return resolve(user);
            });
    });
}

function handleStateFifteen(user) {
    return new Promise((resolve, reject) => {
        if (user.message === "Yes") {
            ditto.queueReminder(user.username);
            user.state = 16;
            updateUserState(user)
                .then(function(result) {
                    let user = result;
                    user.response = [`Okay - I'll remind you when you can get another Pokemon :) Have a great day!`];
                    return resolve(user);
                });
        } else if (user.message === 'No') {
            user.state = 16;
            updateUserState(user)
                .then(function(result) {
                    let user = result;
                    user.response = [`Okay - just remember you have to wait 24 hours after requesting a Pokemon to request another one :) Have a great day!`];
                    return resolve(user);
                });
        } else {
            user.response = [`I need a yes or a no.`];
            user.keyboard = ['Yes', 'No'];
            return resolve(user);
        }
    })
}

function handleStateSeventeen(user) {
    return new Promise((resolve, reject) => {
        user.state = 3;
        updateUserState(user)
            .then(function(result) {
                let user = result;
                user.response = [`Great to see you again, ${user.username}! Which Pokemon would you like today?`];
                return resolve(user);
            });
    });
}

function checkPokemonMatch(mon) {
    return new Promise((resolve, reject) => {
        checkPokemonAgainstList(mon).then(function(result) {
            if (result.bool === true) {
                return resolve(result);
            }
            return resolve(false);
        });
    });
}

function checkPokemonAgainstList(mon) {
    return new Promise((resolve, reject) => {
        fs.readFile('./pokemon.json', 'utf8', function(error, data) {
            if (error) {
                return reject(`Error reading from pokemon.json: ${error}`);
            }
            let pokemonList = JSON.parse(data);
            for (let i = 0; i < pokemonList.length; i++) {
                if (mon === pokemonList[i]) {
                    let object = {
                        bool: true,
                        match: pokemonList[i]
                    }
                    return resolve(object);
                }
            }
            for (let i = 0; i < pokemonList.length; i++) {
                if (natural.JaroWinklerCheck(mon, pokemonList[i]) >= .9) {
                    let object = {
                        bool: true,
                        sugg: pokemonList[i]

                    }
                    return resolve(object);
                }
            }
            return resolve(false);
        });
    });
}

function addAttributeAndUpdateState(user, attribute, state) {
    return new Promise((resolve, reject) => {
        pool.connect(function(error, client, done) {
            if (error) {
                return reject(`Error connecting to database: $error`);
            }
            client.query(`UPDATE users SET (${attribute}, state) = ('${user[attribute]}', ${state}) WHERE username = '${user.username}'`, function(error, result) {
                done();
                if (error) {
                    return reject(`Error inserting attribute ${attribute} into DB: ${error}`);
                }
                return resolve(user);
            });
        });
    });
}

function updateRequest(user, column, value, state) {
    return new Promise((resolve, reject) => {
        pool.connect(function(error, client, done) {
            if (error) {
                return reject(`Error connecting to database: $error`);
            }
            client.query(`INSERT INTO requests (username, ${column}) VALUES ('${user.username}', '${value}') ON CONFLICT (username) DO UPDATE SET ${column} = '${value}'`, function(error, result) {
                done();
                if (error) {
                    return reject(`Error updating request in DB: ${error}`);
                }
                user.state = state;
                return resolve(user);
            });
        });
    });
}

function updateUserState(user) {
    return new Promise((resolve, reject) => {
        pool.connect(function(error, client, done) {
            if (error) {
                return reject(`Error connecting to database: $error`);
            }
            client.query(`UPDATE users SET (state) = (${user.state}) WHERE username = '${user.username}'`, function(error, result) {
                done();
                if (error) {
                    return reject(`Error updating state in DB: ${error}`);
                }
                return resolve(user);
            });
        });
    });
}

function timestampUser(user) {
    return new Promise((resolve, reject) => {
        pool.connect(function(error, client, done) {
            if (error) {
                return reject(`Error connecting to database: ${error}`);
            }
            client.query(`UPDATE users SET next_request = current_timestamp + interval '1 minute' WHERE username = ('${user.username}')`, function(error, result) {
                done();
                if (error) {
                    return reject(`Error adding timestamp in DB: ${error}`);
                }
                return resolve(user);
            });
        });
    });
}

function setStateTimeout(user) {
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            pool.connect(function(error, client, done) {
                if (error) {
                    return reject(`Error connecting to database: $error`);
                }
                client.query(`UPDATE users SET (state) = (${user.state}) WHERE username = '${user.username}'`, function(error, result) {
                    done();
                    if (error) {
                        return reject(`Error updating state in DB: ${error}`);
                    }
                    return resolve(user);
                });
            });
        }, 25000);
    });
}

function getNextUserRequest(user) {
    return new Promise((resolve, reject) => {
        pool.connect(function(error, client, done) {
            if (error) {
                return reject(`Error connecting to database: $error`);
            }
            client.query(`SELECT next_request FROM users WHERE username = '${user.username}'`, function(error, result) {
                done();
                if (error) {
                    return reject(`Error fetching timestamp in DB: ${error}`);
                }
                user.next_request = result.rows[0].next_request;
                return resolve(user);
            });
        });
    });
}

function isItTimeYet(date) {
    let now = new Date();
    return now > date;
}

function howMuchTimeLeft(date){
    let now = new Date();
    return (date - now);
}