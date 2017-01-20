import { UniversalBot } from 'botbuilder';
let accessToken: string = null;

/**
 * Checks if the message contains a hyperlink
 * @param {UniversalBot} bot
 */
export const setAccessToken = (bot: UniversalBot) => {
    if (!(bot instanceof UniversalBot)) {
        throw new Error('Invalid argument: bot must be instance of UniversalBot');
    }
    const connector = (<any>bot).connectors['*'];
    (<any>connector).getAccessToken((error: Error, token: string) => {
        if (error) {
            throw new Error(error.message);
        }
        accessToken = token;
    });
}

/**
 * Returns the bot's access token. 
 * Only used to add authorization headers on requests to Skype.
 * @returns {string}
 */
export const getAccessToken = (): (string|null) => {
    return accessToken;
}

