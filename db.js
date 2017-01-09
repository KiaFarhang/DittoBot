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
    // let message = `Nice to meet you, ${username}! Let's get started building your Pokemon.`;

    // let message = promiseA(username).then(function(username) {
    //     if (username == 'gamezdong') {
    //         return promiseB(username);
    //     }
    //     return results;
    // }).catch(function(reason) {
    //     console.log(reason);
    // });
    // console.log(username);
    // console.log(typeof username);
    // return username;
    let message = promiseA(username).catch((error) =>{
        console.log(error.stack);
    });
    return message;
    // let message = promiseA(username)
    // .then(promiseB);
    // return message;
}

function promiseA(username) {
    return new Promise((resolve, reject) => {
        resolve(username);
    });
}

// function promiseB(username) {
//     return new Promise((resolve, reject) => {
//         if (username == 'gamezdong') {
//             return resolve(`${username} modified`);
//         }
//         else{
//             return reject('rejected');
//         }
//     });
// }

// function isUserInDb(username) {
//     return new Promise((resolve, reject) => {
//         pool.connect(function(error, client, done) {
//             if (error) {
//                 return reject(error);
//             }
//             client.query(`SELECT 1 FROM users WHERE username = '${username}'`, function(error, result) {
//                 done();
//                 if (error) {
//                     return reject(error);
//                 }
//                 return resolve(result.rows.length == 1);
//             });
//         });
//     });
// }


// exports.handleUser = function handleUser(boolean) {
//     return new Promise((resolve, reject) => {
//         if (boolean = true) {
//             //User is in the database
//         } 
//         else {

//         }
//     })
// }

// exports.isUserInDb = function isUserInDb(username) {
//     pool.connect(function(error, client, done) {
//         if (error) {
//             return;
//         }
//         client.query(`SELECT 1 FROM users WHERE username = '${username}'`, function(error, result) {
//             done();
//             if (error) {
//                 return;
//             }
//             console.log(result.rows);
//         });
//     });
// }
