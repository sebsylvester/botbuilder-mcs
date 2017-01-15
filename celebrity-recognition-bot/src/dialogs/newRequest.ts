import {
    AttachmentLayout,
    CardAction,
    HeroCard, 
    Message,
    Session 
} from 'botbuilder';
import * as request from 'request';
import { 
    processImageURL,
    processImageStream,
    ICelebrity
} from '../services/recognizer';

interface IArguments { 
    url?: string,    
    stream?: request.Request,
    data?: string
}

const handleSuccessResponse = (session: Session, response: ICelebrity[]) => {
    if (response.length === 0) {
        session.send("Sorry, I couldn't recognize anybody.");
        return session.endDialog("Try a different image or link.");
    }

    response.forEach((celebrity: ICelebrity) => {
        const confidence = Math.floor(celebrity.confidence * 100);
        session.send(`I've recognized ${celebrity.name} with ${confidence}% certainty`);
    })
    
    return session.endDialog();
}

const handleErrorResponse = (session: Session, error: Error) => {
    session.endDialog("Oops! Something went wrong. Try again later.");
    console.error(error);
}

// The /newRequest dialog handler
export const newRequest = (session: Session, args: IArguments) => {
    const { 
        url = null, 
        stream = null, 
        data = null 
    } = (typeof args === 'object') ? args : {};

    if (!url && !stream && !data) {
        throw new Error('Invalid arguments. Expected a url string or an stream object.');
    }

    // Determine which function to use as recognizer
    const recognizer = stream 
        ? processImageStream.bind(null, stream) 
        : processImageURL.bind(null, url || data);

    // Make API call and handle error/response
    recognizer()
        .then((response: ICelebrity[]) => {
            handleSuccessResponse(session, response)
        })
        .catch((error: Error) => {
            handleErrorResponse(session, error)
        });
};