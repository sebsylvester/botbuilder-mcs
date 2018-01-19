import { IDialogResult, ListStyle, Prompts, Session } from "botbuilder";
import { APIs, CognitiveServices } from "../helpers/consts";

// The /menu dialog handler
export const menu = [
    (session: Session, args: any) => {
        session.send("I currently know 2 different APIs.");
        session.send("With Computer Vision, I can recognize celebrities.");
        session.send("With Emotion, I can recognize facial expressions.");

        const { selectedAPI } = session.userData;
        const message = `I'm currently using the ${APIs[selectedAPI].name} API.`;
        const choices = APIs.map((item) => item.name);
        const options = { listStyle: ListStyle.button };

        Prompts.choice(session, message, choices, options);
    },
    (session: Session, results: IDialogResult<any>) => {
        const { index } = results.response;
        session.userData.selectedAPI = index;

        session.endDialog("OK, from now on I'll be using the %s API.", APIs[index].name);
    },
];
