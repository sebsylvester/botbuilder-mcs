import * as needle from 'needle';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { ChatConnector, UniversalBot, IConnector } from 'botbuilder';
const token = require('../lib/helpers/accessToken');

describe('accessToken module', function () {
    describe('getAccessToken', function () {
        it('should return null if the accessToken has not yet been set', function () {
            expect(token.getAccessToken()).to.be.null;
        });

        it('should return the accessToken after it has been set', function () {
            const connector = new ChatConnector({
                appId: 'appId',
                appPassword: 'appPassword'
            });
            (<any>connector).getAccessToken = (callback) => {
                callback(null, 'some_acces_token');
            };
            const bot = new UniversalBot(connector);

            token.setAccessToken(bot);
            expect(token.getAccessToken()).to.equal('some_acces_token');
        });
    });

    describe('setAccessToken', function () {
        it('should throw an exception if bot is not an instance of UniversalBot', function () {
            expect(token.setAccessToken).to.throw('Invalid argument: bot must be instance of UniversalBot');
        });

        it('should throw an exception if the accessToken could not be retrieved', function () {
            const connector = new ChatConnector({
                appId: 'appId',
                appPassword: 'appPassword'
            });
            (<any>connector).getAccessToken = (callback) => {
                callback(new Error('Something failed'));
            };
            const bot = new UniversalBot(connector);
            try {
                token.setAccessToken(bot);
            } catch (e) {
                expect(e.message).to.equal('Something failed');
            }
        });
    });
});