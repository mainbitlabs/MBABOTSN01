// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const dotenv = require('dotenv');
const path = require('path');
const restify = require('restify');

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } = require('botbuilder');

// This bot's main dialog.
const { DialogBot } = require('./bots/dialogBot');
const { FirstDialog } = require('./dialogs/firstDialog');

// Import required bot configuration.
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about how bots work.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    channelService: process.env.ChannelService,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Catch-all for errors.
// adapter.onTurnError = async (context, error) => {
//     // This check writes out errors to console log .vs. app insights.
//     // NOTE: In production environment, you should consider logging this to Azure
//     //       application insights.
//     console.error(`\n [onTurnError] unhandled error: ${ error }`);

//     // Send a trace activity, which will be displayed in Bot Framework Emulator
//     await context.sendTraceActivity(
//         'OnTurnError Trace',
//         `${ error }`,
//         'https://www.botframework.com/schemas/error',
//         'TurnError'
//     );

//     // Send a message to the user
//     await context.sendActivity('The bot encounted an error or bug.');
//     await context.sendActivity('To continue to run this bot, please fix the bot source code.');
// };
// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError]: ${ error }`);
    // Send a message to the user
    await context.sendActivity(`**Hubo un error, verifica la información que introduciste y vuelve a intentarlo.**`);
    // Clear out state
    await conversationState.delete(context);
};

// Create HTTP server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

let conversationState, userState;

// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.
const memoryStorage = new MemoryStorage();
conversationState = new ConversationState(memoryStorage);
userState = new UserState(memoryStorage);

// Pass in a logger to the bot. For this sample, the logger is the console, but alternatives such as Application Insights and Event Hub exist for storing the logs of the bot.
const logger = console;

// Create the main dialog.
const dialog = new FirstDialog(logger);
const bot = new DialogBot(conversationState, userState, dialog, logger);


// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req, res) => {
    // Route received a request to adapter for processing
    adapter.processActivity(req, res, async (turnContext) => {
        // route to bot activity handler.
        await bot.run(turnContext);
    });
});