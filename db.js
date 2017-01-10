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

exports.handleUser = function handleUser(username) {
    let message = isUserInDb(username).then(function(result) {
        if (result === true) {
            return `Hello, ${username}!`;
        }
        return `Who are you?`;
    });

    return message;
}

function isUserInDb(username) {
    return new Promise((resolve, reject) => {
        pool.connect(function(error, client, done) {
            if (error) {
                return reject(error);
            }
            client.query(`SELECT 1 FROM users WHERE username = '${username}'`, function(error, result) {
                done();
                if (error) {
                    return reject(false);
                }
                return resolve(true);
            });
        });
    });
}
