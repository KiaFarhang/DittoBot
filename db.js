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

function User(username) {
    this.username = username;
    this.state = null;
}

exports.handleUser = function handleUser(username) {
    return new Promise((resolve, reject) => {
        let user = new User(username);

        let message = getUserState(user).
        then(handleState);

        return resolve(message);
    });
}

function getUserState(user) {
    return new Promise((resolve, reject) => {
        if (isUserInDb(user) === true) {
            // pull state from DB
            //return state
        } else {
            addUserToDb(user).then(function(result) {
                if (result === true) {
                    user.state = 1;
                    return resolve(user);
                }
            });
        }
    });


    //     let state = isUserInDb(trainer).then(function(result) {
    //         if (result === true) {
    //             console.log(`user in DB`);
    //         } else {
    //             console.log(`user not in DB`);
    //         }
    //     }).catch(function(error) {
    //         console.log(error);
    //     });
    // });
}


function isUserInDb(user) {
    return new Promise((resolve, reject) => {
        pool.connect(function(error, client, done) {
            if (error) {
                return reject(error);
            }
            client.query(`SELECT 1 FROM users WHERE username = '${user.username}'`, function(error, result) {
                done();
                if (error) {
                    return reject(`Error checking for user in DB: ${error}`);
                }
                if (result.rows[0] === undefined) {
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
            client.query(`INSERT INTO users (username) VALUES ('${user.username}')`, function(error, result) {
                done();
                if (error) {
                    return reject(`Error adding user to DB: ${error}`);
                }
                return resolve(true);
            });
        });
    });
}

function handleState(user) {
    switch (user.state) {
        case 1:
            return handleStateOne(user);
    }
}

function handleStateOne(user) {
    return `Nice to meet you, ${user.username}! Let's start building your Pokemon. \nI'll need some information from you first. What's the name of your Pokemon trainer?`;
}
