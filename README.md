# Dittobot - Build Custom Pokemon on your Phone #

In case you've been living on another planet for the past 20 years, the basic idea behind Pokemon is to get as many of the hundreds of unique monsters that you can. People trade these things online, and - because this always happens with video games - there's a small industry of people who hack custom Pokemon to give to others.

Being a cool older cousin, I occasionally generate Pokemon like this for a few of my younger relatives who are big fans of the series. I developed this Kik chatbot to automate the request process and let them ask for exactly the Pokemon they want any time.

Users of [the bot - accessible only via the Kik smartphone app](https://bots.kik.com/#/dittobot) - tell it what Pokemon they want, what level it should be, its desired gender and a few other traits. The server hosting the bot stores that information so I can build them the custom Pokemon and send it to their game.

### Step 1: Frustrations of State ###

Kik is a young platform, and there's currently no way for bot developers to track state - where a user is in a conversation - via their Node.JS tools. I know because I asked their support team and almost cried when I heard the answer.

This meant that, without a lot of work, my bot had no way of knowing whether the "Pikachu" message it just got is a Pokemon the user wants or the nickname it wants to give that Pokemon. Every message a user sent essentially created a new conversation - no good when I wanted to ask them many questions before ending the interaction.

I decided not to let this stop me. I built a PostgreSQL database to track which stage every user it has ever talked to is in the conversation flow. Which leads to...

### Step 2: Program Flow ###

When someone messages my Kik bot, they're routed to ditto.js. That script sends their username and message to db.js, which does most of the work.

db.js checks the username against my PostgreSQL database. If it doesn't find a match, that means the user is new, so the script passes the welcome message back to ditto.js and adds the user to the database.

If the username is in the database, db.js checks their message against their state in the conversation flow to see if it makes sense. For example, if the bot is expecting a number (the desired level of the Pokemon) but gets a name instead, it will tell ditto.js to message the user and politely ask for the proper information.

Because database calls are asynchronous, I used promises for just about everything in this program. That was a "fun" learning experience. (Really, though, promises are awesome, and once I started using them I couldn't go back)

### Step 3: Reality Sucks ###

All this sounds great, right? I essentially automated a request form with a chat bot, so I'd only have to check in once a day to create the Pokemon that users wanted. Time is saved, bots move closer to running the world, wonderful.

Unfortunately, Kik is designed as a platform for teens. They are very strict about what kind of information you can collect from bot users. Apparently, my asking for users' game system "friend codes" - which people freely exchange online all the time - was too prying, so Kik refused to list my bot on the public marketplace. Bummer!

If you scan the bot code in the link above on your phone, you should still be able to use it - it's just stuck in beta forever. Part of me wishes this had blown up and made a bunch of people happy...but another part of me is glad I don't have to hunch over a screen generating little pocket monsters for people I've never met. :)