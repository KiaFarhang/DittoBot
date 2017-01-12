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

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

bot.updateBotConfiguration();

bot.onTextMessage((message, next) => {
    let user = new db.User(message._state.from, message.body);
    db.handleUser(user).then(function(result) {
        message.reply(result);
    });
    // console.log(answer);
    // console.log(typeof answer);
    // message.reply(answer);

    // function logVarAndType(v) {
    //     console.log(v);
    //     console.log(typeof v);
    // }


    // function sendStringAsMessage(array) {
    //     message.reply(array);
    // }


});






let server = http.createServer(bot.incoming()).listen(8080);
