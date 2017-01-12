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
    this.state = null;
    this.message = message;
}

exports.handleUser = function handleUser(user) {
    return new Promise((resolve, reject) => {
        isUserInDb(user).then(function(result) {
            if (result === false) {
                addUserToDb(user).then(returnWelcomeMessage).then(function(result) {
                    return resolve(result);
                });
            }
        });

        getUserState(user)
            .then(handleState)
            .then(function(result) {
                return resolve(result);
            })
            .catch(function(reason) {
                console.log(`Promise failed: ${reason}`);
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

    // return new Promise((resolve, reject) => {
    //     if (isUserInDb(user) === true) {
    //         // pull state from DB
    //         //return state
    //     } else {
    //         addUserToDb(user).then(function(result) {
    //             if (result === true) {
    //                 user.state = 1;
    //                 return resolve(user);
    //             }
    //         });
    //     }
    // });

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
        }
    });

}

function returnWelcomeMessage(user) {
    return new Promise((resolve, reject) => {
        return resolve(`Nice to meet you, ${user.username}! Let's start building your Pokemon. \nI'll need some information from you first. What's the name of your Pokemon trainer?`);
    });
}

function handleStateOne(user) {
    return `You told me: ${user.message}`;
}
