///<reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
const { newRequest } = require('../lib/dialogs/newRequest');
const recognizer = require('../lib/services/recognizer');
import { ConsoleConnector, UniversalBot } from 'botbuilder';
import { expect } from 'chai';
import * as sinon from 'sinon';

describe('dialog /newRequest', function () {
    it('should throw an exception when triggered with invalid arguments', function (done) {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);
        let step = 0;
        
        bot.dialog('/', (session) => {
            switch (++step) {
                case 1:
                    session.beginDialog('/newRequest', undefined)
                    break;
                case 2:
                    session.beginDialog('/newRequest', {})
                    break;
            }
        });
        bot.dialog('/newRequest', newRequest);

        bot.on('error', error => {
            const { message } = error;
            switch (step) {
                case 1:
                    expect(message).to.equal('Invalid arguments. Expected a url string or an stream object.');
                    connector.processMessage('next');
                    break;
                case 2:
                    expect(message).to.equal('Invalid arguments. Expected a url string or an stream object.');
                    done();
                    break;
            }
        });

        connector.processMessage('start');
    });
    
    it('should send an error message when processImageStream rejects with an error', function (done) {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);
        // Mock a stream object
        const args = {
            stream: { 
                pipe() { } 
            } 
        }

        sinon.stub(recognizer, 'processImageStream', (args) => {
            return Promise.reject(new Error('Something failed'));
        });

        bot.dialog('/', (session) => session.beginDialog('/newRequest', args));
        bot.dialog('/newRequest', newRequest);
        bot.on('send', message => {
            expect(message.text).to.equal('Oops! Something went wrong. Try again later.');
            recognizer.processImageStream.restore();
            done();
        });

        connector.processMessage('start');
    });

    it('should send an error message when processImageURL rejects with an error', function (done) {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);
        let step = 0;
        
        sinon.stub(recognizer, 'processImageURL', (args) => {
            return Promise.reject(new Error('Something failed'));
        });
        
        bot.dialog('/', (session) => {
            switch (++step) {
                case 1:
                    session.beginDialog('/newRequest', { url: 'http://example.com/foo' })
                    break;
                case 2:
                    session.beginDialog('/newRequest', { data: 'http://example.com/foo' })
                    break;
            }
        });
        bot.dialog('/newRequest', newRequest);
        bot.on('send', message => {            
            switch (step) {
                case 1:
                    expect(message.text).to.equal('Oops! Something went wrong. Try again later.');
                    connector.processMessage('next');
                    break;
                case 2:
                    expect(message.text).to.equal('Oops! Something went wrong. Try again later.');
                    recognizer.processImageURL.restore();
                    done();
                    break;
            }
        });

        connector.processMessage('start');
    });

    it('should send a try again message when it fails to recognize anybody', function (done) {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);
        const result = [];
        let step = 0;

        sinon.stub(recognizer, 'processImageURL', (args) => {
            return Promise.resolve(result);
        });

        bot.dialog('/', (session) => session.beginDialog('/newRequest', { url: 'http://example.com/foo' }));
        bot.dialog('/newRequest', newRequest);
        bot.on('send', message => {
            switch (++step) {
                case 1:
                    expect(message.text).to.equal("Sorry, I couldn't recognize anybody.");
                    break;
                case 2:
                    expect(message.text).to.equal("Try a different image or link.");
                    recognizer.processImageURL.restore();
                    done();
                    break;
            }
        });

        connector.processMessage('start');
    });

    it('should send an success message when processImageURL resolves with a response', function (done) {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);
        const result = [{ "name": "Elon Musk", "confidence": 0.98 }];
        let step = 0;

        sinon.stub(recognizer, 'processImageURL', (args) => {
            return Promise.resolve(result);
        });

        bot.dialog('/', (session) => {
            switch (++step) {
                case 1:
                    session.beginDialog('/newRequest', { url: 'http://example.com/foo' })
                    break;
                case 2:
                    session.beginDialog('/newRequest', { data: 'http://example.com/foo' })
                    break;
            }
        });
        bot.dialog('/newRequest', newRequest);
        bot.on('send', message => {
            switch (step) {
                case 1:
                    expect(message.text).to.equal("I've recognized Elon Musk with 98% certainty");
                    connector.processMessage('next');
                    break;
                case 2:
                    expect(message.text).to.equal("I've recognized Elon Musk with 98% certainty");
                    recognizer.processImageURL.restore();
                    done();
                    break;
            }
        });

        connector.processMessage('start');
    });
});