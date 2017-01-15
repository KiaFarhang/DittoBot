'use strict';

let pg = require('pg');
require('dotenv').config();
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
    this['trainer_name'] = null;
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
                let state = 1;
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
        }
    });

}

function returnWelcomeMessage(user) {
    return new Promise((resolve, reject) => {
        return resolve([`Nice to meet you, ${user.username}! Let's start building your Pokemon.`, `I'll need some information from you first. What's the name of your Pokemon trainer?`]);
    });
}

function handleStateOne(user) {
    return new Promise((resolve, reject) => {
        let trainerName = user.message;
        if (isTrainerNameValid(trainerName)) {
            user['trainer_name'] = trainerName;
            addAttributeAndUpdateState(user, 'trainer_name', 2).then(function(result) {
                let messageArray = [];
                messageArray.push(`Thanks. I'll store the trainer name ${trainerName} for you.`);
                messageArray.push(`Now, what game are you playing?`);
                return resolve(messageArray);
            });
        } else {
            return resolve(`Sorry, that's not a valid trainer name. Can you give me your trainer name?`);
        }
    })

    function isTrainerNameValid(name) {
        if (name.length > 12) {
            return false;
        }
        return true;
    }
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
