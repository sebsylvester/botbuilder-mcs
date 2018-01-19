const { newRequest } = require("../lib/dialogs/newRequest");
const recognizer = require("../lib/services/recognizer");
const { APIs } = require("../lib/helpers/consts");
import { ConsoleConnector, UniversalBot } from "botbuilder";
import { expect } from "chai";
import * as sinon from "sinon";

describe("dialog /newRequest", () => {
    before(() => {
        sinon.stub(console, "error").callsFake((error) => { });
    });

    after(() => {
        (console as any).error.restore();
    });

    it("should throw an exception when triggered with invalid arguments", (done) => {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);
        let step = 0;

        bot.dialog("/", (session) => {
            switch (++step) {
                case 1:
                    session.beginDialog("/newRequest", undefined);
                    break;
                case 2:
                    session.beginDialog("/newRequest", {});
                    break;
            }
        });
        bot.dialog("/newRequest", newRequest);

        bot.on("error", (error) => {
            const { message } = error;
            switch (step) {
                case 1:
                    expect(message).to.equal("Invalid arguments. Expected a url string or an stream object.");
                    connector.processMessage("next");
                    break;
                case 2:
                    expect(message).to.equal("Invalid arguments. Expected a url string or an stream object.");
                    done();
                    break;
            }
        });

        connector.processMessage("start");
    });

    it("should send an error message when processImageStream rejects with an error", (done) => {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);
        // Mock a stream object
        const args = {
            stream: {
                pipe() { },
            },
        };

        sinon.stub(recognizer, "processImageStream").callsFake(() => {
            return Promise.reject(new Error("Something failed"));
        });

        bot.dialog("/", (session) => session.beginDialog("/newRequest", args));
        bot.dialog("/newRequest", newRequest);
        bot.on("send", (message) => {
            expect(message.text).to.equal("Oops! Something went wrong. Try again later.");
            setImmediate(() => {
                recognizer.processImageStream.restore();
                done();
            });
        });

        connector.processMessage("start");
    });

    it("should send an error message when processImageURL rejects with an error", (done) => {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);
        const step = 0;

        sinon.stub(recognizer, "processImageURL").callsFake(() => {
            return Promise.reject(new Error("Something failed"));
        });

        bot.dialog("/", (session) => {
            session.beginDialog("/newRequest", { url: "http://example.com/foo" });
        });
        bot.dialog("/newRequest", newRequest);
        bot.on("send", (message) => {
            expect(message.text).to.equal("Oops! Something went wrong. Try again later.");
            recognizer.processImageURL.restore();
            done();
        });

        connector.processMessage("start");
    });

    it("should invoke handleComputerVisionResponse when Computer Vision is the active API", (done) => {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);
        const ComputerVisionAPI = APIs[0];

        sinon.stub(recognizer, "processImageURL").callsFake((args) => {
            return Promise.resolve({ result: true });
        });

        sinon.stub(ComputerVisionAPI, "handler").callsFake((session, response) => {
            expect(response).to.deep.equal({ result: true });
            ComputerVisionAPI.handler.restore();
            recognizer.processImageURL.restore();
            done();
        });

        // Use middleware to add userData
        bot.use({
            botbuilder(session, next) {
                // Select Computer Vision API
                session.userData.selectedAPI = 0;
                next();
            },
        });
        bot.dialog("/", (session) => {
            session.beginDialog("/newRequest", { url: "http://example.com/foo" });
        });
        bot.dialog("/newRequest", newRequest);

        connector.processMessage("start");
    });

    it("should invoke handleEmotionResponse when Emotion is the active API", (done) => {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);
        const EmotionAPI = APIs[1];

        sinon.stub(recognizer, "processImageURL").callsFake((args) => {
            return Promise.resolve({ result: true });
        });

        sinon.stub(EmotionAPI, "handler").callsFake((session, response) => {
            expect(response).to.deep.equal({ result: true });
            EmotionAPI.handler.restore();
            recognizer.processImageURL.restore();
            done();
        });

        // Use middleware to add userData
        bot.use({
            botbuilder(session, next) {
                // Select Emotion API
                session.userData.selectedAPI = 1;
                next();
            },
        });
        bot.dialog("/", (session) => {
            session.beginDialog("/newRequest", { url: "http://example.com/foo" });
        });
        bot.dialog("/newRequest", newRequest);

        connector.processMessage("start");
    });
});
