const { menu } = require("../lib/dialogs/menu");
import { ConsoleConnector, UniversalBot } from "botbuilder";
import { expect } from "chai";
import * as needle from "needle";
import * as sinon from "sinon";

describe("dialog /menu", () => {
    it("should allow the user to switch APIs", (done) => {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);
        let step = 0;

        // Use middleware to add userData
        bot.use({
            botbuilder(session, next) {
                // Select Computer Vision API
                session.userData.selectedAPI = 0;
                next();
            },
        });
        bot.dialog("/menu", menu).triggerAction({ matches: /^API/i });
        bot.on("send", (message) => {
            switch (++step) {
                case 1:
                    expect(message.text).to.equal("I currently know 2 different APIs.");
                    break;
                case 2:
                    expect(message.text).to.equal("With Computer Vision, I can recognize celebrities.");
                    break;
                case 3:
                    expect(message.text).to.equal("With Emotion, I can recognize facial expressions.");
                    break;
                case 4:
                    expect(message.text).to.equal("I'm currently using the Computer Vision API.");
                    // Switch to Emotion API
                    connector.processMessage("Emotion");
                    break;
                case 5:
                    expect(message.text).to.equal("OK, from now on I'll be using the Emotion API.");
                    done();
            }
        });

        connector.processMessage("api");
    });
});
