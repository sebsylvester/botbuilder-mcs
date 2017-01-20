import { Session } from 'botbuilder';
import * as handlers from './handlers';
const config = require('../../config.json');

interface API {
    name: string;
    url: string;
    key: string;
    handler: (session: Session, response: any) => void;
}

export enum CognitiveServices {
    ComputerVision,
    Emotion
}

export const APIs: API[] = [
    { 
        name: 'Computer Vision',
        url: 'https://westus.api.cognitive.microsoft.com/vision/v1.0/analyze?details=Celebrities',
        key: process.env.VISION_API_KEY || config.VISION_API_KEY,
        handler: handlers.handleComputerVisionResponse
    },
    { 
        name: 'Emotion',
        url: 'https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize',
        key: process.env.EMOTION_API_KEY || config.EMOTION_API_KEY,
        handler: handlers.handleEmotionResponse
    }
];