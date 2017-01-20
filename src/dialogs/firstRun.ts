import { Session } from 'botbuilder';
import { CognitiveServices } from '../helpers/consts';

// The /firstRun dialog handler
export const firstRun = (session: Session) => {
    // Default to Computer Vision API
    session.userData.selectedAPI = CognitiveServices.ComputerVision;
    session.send('Hi, I am a demo bot and I can show you some cool APIs from Microsoft’s Cognitive Services.');
    session.endDialog('Say “API" to switch APIs and “help” to get more information.');
};