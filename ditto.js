'use strict';

const express = require('express');
const http = require('http');
const Bot = require('@kikinteractive/kik');

require('dotenv').config();


let bot = new Bot({
    username: process.env.KIK_USER,
    apiKey: process.env.KIK_API,
    baseUrl: process.env.KIK_URL
});

bot.updateBotConfiguration();

bot.onTextMessage((message, next) => {
    //Get the sender's username
    let username = message._state.from;
    //Check if the database has anyone by that username
    //If not, greet the user
    message.reply(`Nice to meet you! Let's build your Pokémon.`);
    next();

    bot.onTextMessage((message, next) => {
        //
        message.reply(`First, I'll need to gather some information from you. I'll save it to speed up the process in the future.`);
        next();
    });

    bot.onTextMessage((message, next) => {
        message.reply(`What's your trainer ID?`);
    });
});

// bot.onTextMessage((message, next) => {
// 	//
//     message.reply(`First, I'll need to gather some information from you. I'll save it to speed up the process in the future.`);
//     next();
// });

// bot.onTextMessage((message, next) => {
//     message.reply(`What's your trainer ID?`);
// });




function User(name) {
    this.name = name;
    this.tid = null;
    this.game = null;
    this.fc = null;
}



let server = http.createServer(bot.incoming()).listen(process.env.PORT || 8080);

// let exampleMessage = {
//     _state: {
//         type: 'text',
//         body: 'Hello',
//         from: 'gamezdong',
//         timestamp: 1483659888870,
//         mention: null,
//         participants: ['gamezdong'],
//         readReceiptRequested: true,
//         id: '59f92b3c-0c64-412f-a59f-3edf314fbec6',
//         chatId: 'd881f87d99907ca6f0cff63dc088c21c40912470a7cc7a8a5fa7cc11b6fa3cde'
//     },
//     bot: Bot {
//         apiDomain: 'https://api.kik.com',
//         scanCodePath: '/kik-code.png',
//         incomingPath: '/incoming',
//         maxMessagePerBatch: 25,
//         maxMessagePerBroadcast: 100,
//         manuallySendReadReceipts: false,
//         receiveReadReceipts: false,
//         receiveDeliveryReceipts: false,
//         receiveIsTyping: false,
//         username: 'dittobot',
//         apiKey: '89816335-c645-4424-8329-073e7acb81e7',
//         baseUrl: 'https://dittobot.herokuapp.com/',
//         stack: [
//             [Function]
//         ],
//         outgoingStack: [],
//         pendingMessages: [],
//         pendingFlush: null
//     },
//     finish: [Function: finish]
// }
