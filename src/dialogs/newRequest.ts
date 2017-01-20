import {
    AttachmentLayout,
    CardAction,
    HeroCard, 
    Message,
    Session 
} from 'botbuilder';
import { 
    processImageURL,
    processImageStream
} from '../services/recognizer';
import { APIs } from '../helpers/consts';

const handleSuccessResponse = (session: Session, response: Object) => {
    // Get the currently selected API
    const { selectedAPI } = session.userData;
    // Run the selected API's response handler
    APIs[selectedAPI].handler(session, response);
}

const handleErrorResponse = (session: Session, error: Error) => {
    session.endDialog("Oops! Something went wrong. Try again later.");
    console.error(error);
}

// The /newRequest dialog handler
export const newRequest = (session: Session, args: { url?: string, stream?: Object }) => {
    const { 
        url = null, 
        stream = null
    } = (typeof args === 'object') ? args : {};

    if (!url && !stream) {
        throw new Error('Invalid arguments. Expected a url string or an stream object.');
    }

    // Determine which function to use as recognizer
    const recognizer = stream 
        ? processImageStream.bind(null, stream) 
        : processImageURL.bind(null, url);

    // Make API call and handle error/response
    recognizer(session)
        .then((response: Object) => {
            handleSuccessResponse(session, response)
        })
        .catch((error: Error) => {
            handleErrorResponse(session, error)
        });
};