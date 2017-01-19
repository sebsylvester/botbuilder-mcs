import {
    Session,
    IntentDialog,
    DialogAction
} from 'botbuilder';

import {
    hasImageAttachment,
    hasImageURL,
    isNewRequestAction,
    getImageURL,
    getImageStream
} from '../helpers/utils';

// The handler used to respond to a number of greetings
const greet = (session: Session) => {
    session.endDialog('Hey, have you tried sending me an image or image URL of a celebrity yet?');
};

// The handler used when the user types "help"
export const help = (session: Session) => {
    session.send('Hi there! I can recognize celebrities in images. Just send me an image or a link.')
    session.send('If you send me a link, make sure it starts with http:// or https://')
    session.endDialog('If you need some suggestions, just say "suggestions".');
};

// The "/" or default dialog handler
export const root = new IntentDialog()
    // Respond to greetings
    .matches(/^(hello|hi|hey|howdy|sup|what's up|yo)/i, greet)
    // Respond to requests for help
    .matches(/^help/i, help)
    .onDefault((session: Session, args: any) => {
        const { text, attachments } = session.message;

        if (hasImageAttachment(attachments)) {
            // Stream the image if the user sent an attachment...
            session.beginDialog('/newRequest', { stream: getImageStream(attachments[0]) });
        } else if (hasImageURL(text)) {
            // ...or just send the URL.
            session.beginDialog('/newRequest', { url: getImageURL(text) });
        } else {
            // Send the default response
            session.endDialog("I'm more of a visual person. Try sending me an image or image URL.");
        }
    });