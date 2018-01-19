import { ChatConnector, IConnector, UniversalBot } from "botbuilder";
import { expect } from "chai";
import * as needle from "needle";
import * as sinon from "sinon";
const token = require("../lib/helpers/accessToken");

describe("accessToken module", () => {
    describe("getAccessToken", () => {
        it("should return null if the accessToken has not yet been set", () => {
            expect(token.getAccessToken()).to.be.null;
        });

        it("should return the accessToken after it has been set", () => {
            const connector = new ChatConnector({
                appId: "appId",
                appPassword: "appPassword",
            });
            (connector as any).getAccessToken = (callback) => {
                callback(null, "some_acces_token");
            };
            const bot = new UniversalBot(connector);

            token.setAccessToken(bot);
            expect(token.getAccessToken()).to.equal("some_acces_token");
        });
    });

    describe("setAccessToken", () => {
        it("should throw an exception if bot is not an instance of UniversalBot", () => {
            expect(token.setAccessToken).to.throw("Invalid argument: bot must be instance of UniversalBot");
        });

        it("should throw an exception if the accessToken could not be retrieved", () => {
            const connector = new ChatConnector({
                appId: "appId",
                appPassword: "appPassword",
            });
            (connector as any).getAccessToken = (callback) => {
                callback(new Error("Something failed"));
            };
            const bot = new UniversalBot(connector);
            try {
                token.setAccessToken(bot);
            } catch (e) {
                expect(e.message).to.equal("Something failed");
            }
        });
    });
});
