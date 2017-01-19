import { UniversalBot } from 'botbuilder';
let accessToken: string = null;

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

export const getAccessToken = (): (string|null) => {
    return accessToken;
}

