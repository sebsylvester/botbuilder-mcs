import * as restify from 'restify';
import { ChatConnector, UniversalBot, Middleware } from 'botbuilder';
import * as dialogs from './dialogs';
import { setAccessToken } from './helpers/accessToken';
const config = require('../config.json');

//=========================================================
// Bot Setup
//=========================================================

// Create chat bot
const connector = new ChatConnector({
    appId: process.env.MICROSOFT_APP_ID || config.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD || config.MICROSOFT_APP_PASSWORD
});
const bot = new UniversalBot(connector);
setAccessToken(bot);

//=========================================================
// Bots Middleware
//=========================================================

bot.use(Middleware.firstRun({ version: 1.0, dialogId: '*:/firstRun' }));
bot.use(Middleware.sendTyping());

//=========================================================
// Bots Global Actions
//=========================================================

// Triggered upon tapping the select button of a HeroCard in the suggestions dialog
bot.beginDialogAction('newRequest', '/newRequest');

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', dialogs.root);
bot.dialog('/firstRun', dialogs.help);
bot.dialog('/newRequest', dialogs.newRequest);
bot.dialog('/suggestions', dialogs.suggestions).triggerAction({ matches: /^suggestions/i });

//=========================================================
// Server Setup
//=========================================================

const server = restify.createServer();

// Setup endpoint for incoming messages which will be passed to the bot's ChatConnector.
server.post('/api/messages', connector.listen());

// Start listening on 3978 by default
server.listen(process.env.PORT || 3978, () => {
    console.log('%s listening to %s', server.name, server.url);
});