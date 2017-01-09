'use strict';

const express = require('express');
const http = require('http');
const Bot = require('@kikinteractive/kik');

const db = require('./db.js');

require('dotenv').config();


let bot = new Bot({
    username: process.env.KIK_USER,
    apiKey: process.env.KIK_API,
    baseUrl: process.env.KIK_URL
});

bot.updateBotConfiguration();

bot.onTextMessage((message, next) => {
    let username = message._state.from;
    let reply = db.handleUser(username);
    message.reply(reply);

    // next();
});

// var app = express();

// let options = {
//     root: __dirname
// };

// app.use(express.static('dist'));

// app.get('/', function(req, res){
//     res.sendFile('dist/index.html', options);
// });

//app.use(bot.incoming());

//app.get('/', function(request, response) {
//    console.log(request.url);
//    console.log(request.body);
//  bot.incoming();
//});

// app.post('/', function(request, response) {
// //   console.log(request.url);
// //   console.log(request.headers);
// bot.incoming();

//  console.log(request.body);
// });

// app.listen(process.env.PORT || 8000);

let server = http.createServer(bot.incoming()).listen(8080);
