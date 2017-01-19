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
        let messages = result.response;

        if (doesUserNeedKeyboard(result)) {
            let msg = Bot.Message.text(messages[0]);
            message.reply(msg.addResponseKeyboard(result.keyboard));
        } else {
            message.reply(messages);
        }
    });
});

exports.queueReminder = function queueReminder(user) {
    setTimeout(function() {
        bot.send(`It's been 24 hours and you're free to request another Pokemon. Message me to get started!`, user);
    }, 25000);
}

function doesUserNeedKeyboard(user) {
    return user.keyboard != null;
}


let server = http.createServer(bot.incoming()).listen(8080);
