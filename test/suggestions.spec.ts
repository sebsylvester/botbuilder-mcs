const { suggestions } = require('../lib/dialogs/suggestions');
import { ConsoleConnector, UniversalBot } from 'botbuilder';
import { expect } from 'chai';
import * as sinon from 'sinon';

describe('dialog /suggestions', function () {
    it('should present a carousel of 5 cards', function (done) {
        const connector = new ConsoleConnector();
        const bot = new UniversalBot(connector);

        bot.dialog('/suggestions', suggestions).triggerAction({ matches: /#techrockstars/i });
        bot.on('send', function (message) {
            const { attachments , attachmentLayout } = message;
            expect(attachmentLayout).to.equal('carousel');
            expect(attachments.length).to.equal(5);
            done();
        });

        connector.processMessage('#techrockstars');
    });
});