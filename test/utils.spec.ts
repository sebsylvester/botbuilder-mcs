import * as needle from 'needle';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { IAttachment } from 'botbuilder';
const token = require('../lib/helpers/accessToken');
const utils = require('../lib/helpers/utils');

describe('utils module', function () {
    describe('hasImageURL', function () {
        const { hasImageURL } = utils;

        it('should throw if invoked with an invalid argument', function () {
            expect(hasImageURL).to.throw('Invalid argument: input should be a string');
        });

        it('should return false if invoked with an invalid URL', function () {
            expect(hasImageURL('example.com')).to.be.false;
        });
    });

    describe('hasImageAttachment', function () {
        const { hasImageAttachment } = utils;

        it('should return true if the session has an image attachment', function () {
            const attachments = [{ contentType: 'image/jpeg', contentUrl: 'http://example.com/images/foo.jpg' }];
            const result = hasImageAttachment(attachments);
            expect(result).to.be.true;
        });

        it('should return false if the session does not have an image attachment', function () {
            const result = hasImageAttachment([]);
            expect(result).to.be.false;
        });
    });

    describe('isNewRequestAction', function () {
        const { isNewRequestAction } = utils;

        it('should return true if the args has an action and data property', function () {
            const args = { action: 'newRequest', data: 'https://example.com/foo' };
            const result = isNewRequestAction(args);
            expect(result).to.be.true;
        });

        it('should return false if the args is missing either an action or data property', function () {
            let result = isNewRequestAction();
            expect(result).to.be.false;

            result = isNewRequestAction({ action: 'newRequest' });
            expect(result).to.be.false;

            result = isNewRequestAction({ data: 'https://example.com/foo' });
            expect(result).to.be.false;
        });
    });

    describe('isSkypeAttachment', function () {
        const { isSkypeAttachment } = utils;

        it('should return true if the attachment comes from the Skype channel', function () {
            const attachment = { contentUrl: 'https://apis.skype.com/v2/attachments/original' };
            const result = isSkypeAttachment(<IAttachment>attachment);
            expect(result).to.be.true;
        });

        it('should return false if the attachment does not from the Skype channel', function () {
            const attachment = { contentUrl: 'https://apis.facebook.com/v2/attachments/original' };
            const result = isSkypeAttachment(<IAttachment>attachment);
            expect(result).to.be.false;
        });
    });

    describe('getImageURL', function () {
        const { getImageURL } = utils;

        it('should throw if invoked with an invalid argument', function () {
            const message = 'Invalid argument: input should be a string';            
            expect(getImageURL).to.throw(message);
            expect(getImageURL.bind(null, {})).to.throw(message);
        });

        it('should return the URL when the argument is an absolute URL', function () {
            const result = getImageURL('http://example.com/images/foo.jpg');
            expect(result).to.equal('http://example.com/images/foo.jpg');
        });

        it('should return null when the argument is not an absolute URL', function () {
            const result = getImageURL('example.com/images/foo.jpg');
            expect(result).to.be.null;
        });
    });

    describe('getImageStream', function () {
        const { getImageStream } = utils;

        it('should throw if invoked with an invalid argument', function () {
            expect(getImageStream).to.throw('Invalid argument: expected an attachment');
        });

        it('should send a regular GET request to fetch the image', function (done) {
            const attachment = {
                contentUrl: 'https://api.foo.com/bar',
                contentType: 'image/jpeg'
            }

            sinon.stub(needle, 'get', (contentUrl, options) => {
                expect(contentUrl).to.equal(attachment.contentUrl);
                expect(options.headers['Content-Type']).to.equal(attachment.contentType);
                (<any>needle.get).restore();
                done();
            });
            getImageStream(attachment);
        });

        it('should send an authorized GET request to fetch the image from Skype', function (done) {
            const attachment = {
                contentUrl: 'https://apis.skype.com/v2/attachments/foo',
                contentType: 'image/jpeg'
            }
            sinon.stub(token, 'getAccessToken', () => 'some_access_token');
            sinon.stub(needle, 'get', (contentUrl, options) => {
                expect(contentUrl).to.equal(attachment.contentUrl);
                expect(options.headers['Authorization']).to.equal('Bearer some_access_token');
                expect(options.headers['Content-Type']).to.equal('application/octet-stream');
                (<any>needle.get).restore();
                (<any>token).getAccessToken.restore();
                done();
            });
            getImageStream(attachment);
        });
    });

    describe('parseAnchorTag', function () {
        const { parseAnchorTag } = utils;

        it('should throw if invoked with an invalid argument', function () {
            expect(parseAnchorTag).to.throw('Invalid argument: input should be a string');
            expect(parseAnchorTag.bind(null, {})).to.throw('Invalid argument: input should be a string');
        });

        it('should return the href value of an anchor tag', function () {
            const result = parseAnchorTag('<a href="http://example.com/images/foo.jpg"></a>');
            expect(result).to.equal('http://example.com/images/foo.jpg');
        });

        it('should null if the argument is not an anchor tag', function () {
            const result = parseAnchorTag('http://example.com/images/foo.jpg');
            expect(result).to.be.null;
        });
    });    
});