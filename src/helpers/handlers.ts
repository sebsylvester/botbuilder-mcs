import { Session } from 'botbuilder';
const sortBy = require('lodash.sortby');

// Some types to deal with the response of the Computer Vision API
interface IComputerVisionResponse {
    categories: ICategory[];
}

interface ICategory {
    name: string; 
    score: number;
    detail?: { 
        celebrities: ICelebrity[]
    }
}

interface ICelebrity {
    name: string;
    confidence: number;
    faceRectangle: IRectangle;
}

// Some types to deal with the response of the Emotion API
interface IEmotionResponse {
    scores: IScore;
    faceRectangle: IRectangle;
}

interface IScore {
    anger: number,
    contempt: number,
    disgust: number,
    fear: number,
    happiness: number,
    neutral: number,
    sadness: number,
    surprise: number,
    [propName: string]: number;
}

interface IRectangle {
    left: number;
    top: number;
    width: number;
    height: number;
}

/**
 * Handle the response from the Computer Vision API
 * @param {Session} session
 * @param {IComputerVisionResponse} response
 */
export const handleComputerVisionResponse = (session: Session, response: IComputerVisionResponse) => {
    if (!response || !response.categories) {
        throw new Error('Invalid response body, missing categories property');
    }

    // Collect all the results in the response object
    let result = [] as ICelebrity[];
    response.categories.forEach((category: ICategory) => {
        if (category.detail && category.detail.celebrities) {
            category.detail.celebrities.forEach(celebrity => {
                result.push(celebrity);
            });
        }
    });

    // The response if nothing was found
    if (result.length === 0) {
        session.send("Sorry, I couldn't recognize anybody.");
        return session.endDialog("Try a different image or link.");
    }

    // If there multiple results, sort them by bounding box, from left to right
    if (result.length > 1 ) {
        result = sortBy(result, [function(item: ICelebrity) { return item.faceRectangle.left; }]);
        session.send('I detected a number of celebrities, the results are from left to right.');        
    }    

    // Send a message for each result
    result.forEach((celebrity: ICelebrity) => {
        const confidence = Math.floor(celebrity.confidence * 100);
        session.send(`I've recognized ${celebrity.name} with ${confidence}% certainty`);    
    });
    session.endDialog();
}

/**
 * Handle the response from the Emotion API
 * @param {Session} session
 * @param {IEmotionResponse} response
 */
export const handleEmotionResponse = (session: Session, response: IEmotionResponse[]) => {
    if (!response) {
        throw new Error('Response body cannot be undefined');
    }

    // The response if nothing was found
    if (!response.length) {
        session.send("Sorry, I couldn't detect any faces.");
        return session.endDialog('Try a different image or link.');
    }
    
    // If there multiple results, sort them by bounding box, from left to right
    if (response.length > 1 ) {
        response = sortBy(response, [function(item: IEmotionResponse) { return item.faceRectangle.left; }]);
        session.send('I detected a number of faces, the results are from left to right.');     
    }
    
    // Iterate through the response array
    response.forEach((response: IEmotionResponse) => {
        const { scores } = response;

        // Find the highest scoring emotion in scores
        let max = 0, emotion;
        for (let key in scores) {
            if (scores[key] > max) {
                max = scores[key];
                emotion = key;
            }
        }
        const confidence = Math.floor(max * 100)
        session.send(`I've recognized ${emotion} with ${confidence}% certainty`);
    });
    session.endDialog();
}