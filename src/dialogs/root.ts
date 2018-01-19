import {
    CardAction,
    DialogAction,
    IntentDialog,
    Message,
    Session,
    ThumbnailCard,
} from "botbuilder";

import {
    getImageStream,
    getImageURL,
    hasImageAttachment,
    hasImageURL,
    isNewRequestAction,
} from "../helpers/utils";

import { APIs } from "../helpers/consts";

// Used to respond to a number of greetings
const greet = (session: Session) => {
    session.endDialog("Hey, have you tried sending me an image or link yet?");
};

// Used when the user says "help"
export const help = (session: Session) => {
    session.send("I am just a simple bot, I can only understand images and links to images.");
    session.send("If you send me a link, make sure it starts with http:// or https://");
    session.endDialog("Say “API” to see what APIs I can use.");
};

// The "/" or default dialog handler
export const root = new IntentDialog()
    .matches(/^(hello|hi|hey|howdy|sup|what's up|yo)/i, greet)
    .matches(/^help/i, help)
    .onDefault((session: Session, args: any) => {
        const { text, attachments } = session.message;

        if (hasImageAttachment(attachments)) {
            // Stream the image if the user sent an attachment...
            session.beginDialog("/newRequest", { stream: getImageStream(attachments[0]) });
        } else if (hasImageURL(text)) {
            // ...or just send the URL.
            session.beginDialog("/newRequest", { url: getImageURL(text) });
        } else {
            // Send the default response
            session.endDialog("I'm more of a visual person. Try sending me an image or image URL.");
        }
    });
