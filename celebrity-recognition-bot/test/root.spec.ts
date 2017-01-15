///<reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
const { root, defaultHandler } = require('../lib/dialogs/root');
import { ConsoleConnector, UniversalBot } from 'botbuilder';
import { expect } from 'chai';
import * as request from 'request';
import * as sinon from 'sinon';

describe('dialog /', function () {
    it('should respond to a greeting', function (done) {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);

        bot.dialog('/', root);
        bot.on('send', function (message) {
            expect(message.text).to.equal('Hey, have you tried sending me an image or image URL of a celebrity yet?');
            done();
        });

        connector.processMessage('Hello');
    });

    it('should respond to a request for help', function (done) {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);
        let step = 0;

        bot.dialog('/', root);
        bot.on('send', message => {
            switch (++step) {
                case 1:
                    expect(message.text).to.equal("Hi there! I can recognize celebrities in images. Just send me an image or a link.");
                    break;
                case 2:
                    expect(message.text).to.equal("If you send me a link, make sure it starts with http:// or https://");
                    break;
                case 3:
                    expect(message.text).to.equal("If you need some suggestions, just say #techrockstars.");
                    done();
                    break;
            }
        });

        connector.processMessage('help');
    });

    it('should trigger /newRequest with a stream if the user sent an attachment', function(done) {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);
        const attachment = { contentType: 'image/jpeg', contentUrl: 'http://example.com/image' };
        let step = 0;
        
        // Mock Request
        function Request () {}
        sinon.stub(request, 'get', (url, options) => {
            expect(url).to.equal(attachment.contentUrl);
            expect(options.headers).to.deep.equal({
                "Content-Type": attachment.contentType
            });
            return new Request();
        });

        // Use middleware to add attachments
        bot.use({
            botbuilder: function (session, next) {
                session.message.attachments = [attachment];
                next();
            }
        });
        bot.dialog('/', root);
        bot.dialog('/newRequest', (session, args) => {
            expect(args.stream).to.be.instanceof(Request);
            (<any>request.get).restore();
            done();
        });

        connector.processMessage('start');
    });

    it('should trigger /newRequest with a URL if the user sent a link', function(done) {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);
        const url = 'http://example.com/image';

        // Use middleware to add attachments
        bot.use({
            botbuilder: function (session, next) {
                session.message.attachments = [];
                next();
            }
        });
        bot.dialog('/', root);
        bot.dialog('/newRequest', (session, args) => {
            expect(args.url).to.equal(url);
            done();
        });

        connector.processMessage(url);
    });

    it('should send the default response in all other cases', function(done) {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);

        // Use middleware to add attachments
        bot.use({
            botbuilder: function (session, next) {
                session.message.attachments = [];
                next();
            }
        });
        bot.dialog('/', root);
        bot.on('send', function (message) {
            expect(message.text).to.equal("I'm more of a visual person. Try sending me an image or image URL.");
            done();
        });

        connector.processMessage('start');
    });
});