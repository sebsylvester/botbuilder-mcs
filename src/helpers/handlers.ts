import { Session } from 'botbuilder';

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
}

interface IEmotionResponse {
    scores: IScore;
}

interface IScore {
    anger: number,
    contempt: number,
    disgust: number,
    fear: number,
    happiness: number,
    neutral: number,
    sadness: number,
    surprise: number
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

    // Collect the results in the response
    let result = [] as ICelebrity[];
    response.categories.forEach((category: ICategory) => {
        if (category.detail && category.detail.celebrities) {
            category.detail.celebrities.forEach(celebrity => {
                const { name, confidence } = celebrity;
                result.push({ name, confidence });
            });
        }
    });

    // The response if nothing was found
    if (result.length === 0) {
        session.send("Sorry, I couldn't recognize anybody.");
        return session.endDialog("Try a different image or link.");
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
    
    if (response.length > 1 ) {
        session.send('I detected a number of faces, so the result may be a confusing.');
    } else {
        session.send("OK, this is what I've detected on this image:");
    }
    
    // Iterate through the response array
    response.forEach((r: IEmotionResponse) => {
        const { anger, contempt, disgust, fear, happiness, neutral, sadness, surprise } = r.scores;
        session.send(`anger: ${anger}\n\n contempt: ${contempt}\n\n disgust: ${disgust}\n\n fear: ${fear}\n\n happiness: ${happiness}\n\n neutral: ${neutral}\n\n sadness: ${sadness}\n\n surprise: ${surprise}`);
    });
    
    session.endDialog();
}