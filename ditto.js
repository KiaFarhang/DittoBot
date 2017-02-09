'use strict';

const express = require('express');
const http = require('http');
const Bot = require('@kikinteractive/kik');
const fs = require('fs');

const db = require('./db.js');

var cronJob = require('cron').CronJob;

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

bot.onPictureMessage((message, next) => {
    message.reply('Nice! Shoot me a text message when you want to keep building your Pokemon.');
});

bot.onVideoMessage((message, next) => {
    message.reply('Cool video! Let me know when you want to keep building your Pokemon.');
});

bot.onLinkMessage((message, next) => {
    message.reply(`Thanks! I'll keep that in mind. Ready to keep building your Pokemon?`);
});

bot.onStickerMessage((message, next) => {
    message.reply('Neat! Want to keep building your Pokemon now?');
});

bot.onScanDataMessage((message, next) => {
    message.reply(`Hi :) I'm PokéBuilder, and I can help you build custom Pokemon once per day. Message me to get started!`);
});

bot.onStartChattingMessage((message, next) => {
    message.reply(`Hi :) I'm PokéBuilder, and I can help you build custom Pokemon once per day. Message me to get started!`);
});

exports.queueReminder = function queueReminder(user, time) {
    setTimeout(function() {
        bot.send(`It's been 24 hours and you're free to request another Pokemon. Message me to get started!`, user);
    }, time);
}

function doesUserNeedKeyboard(user) {
    return user.keyboard != null;
}

var job = new cronJob('00 05 0-23/6 * * *', function() {
    db.getAllRequests().then(function(result) {
        let requests = result;
        let string = '';
        for (let i = 0; i < requests.length; i++) {
            let req = requests[i];
            for (var prop in req) {
                string += `${prop}: ` + `${req[prop]}\n`;
            }
            string += '\n';
        }
        fs.writeFile('./request_log.txt', string, 'utf8', function(error) {});
    });
}, function() {}, true, 'America/Los_Angeles');




let server = http.createServer(bot.incoming()).listen(8080);
