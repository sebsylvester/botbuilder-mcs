const recognizer = require('../lib/services/recognizer');
import * as request from 'request';
import { expect } from 'chai';
import * as sinon from 'sinon';

describe('recognizer module', function () {
    describe('processImageStream', function () {
        const { processImageStream } = recognizer;
        const stream = { pipe() {}};
        const session = { userData: { selectedAPI: 0 }};

        it('should catch thrown exceptions', function (done) {
            sinon.stub(request, 'post', (options, callback) => {                
                callback(new Error('Something went wrong'));
                (<any>request.post).restore();
            });

            processImageStream(stream, session).catch(err => {
                expect(err.message).to.equal('Something went wrong');
                done();
            });
        });

        it('should handle returned error messages', function (done) {
            const body = { error : "Bad auth, check token/params", code : "no-auth" };
            sinon.stub(request, 'post', (options, callback) => {
                callback(null, { statusCode: 401 }, body);
                (<any>request.post).restore();
            });

            processImageStream(stream, session).catch(err => {
                expect(err).to.deep.equal(body);
                done();
            });
        });            

        it('should handle success responses', function (done) {
            sinon.stub(request, 'post', (options, callback) => {
                callback(null, { statusCode: 200 }, JSON.stringify({ result: true }));
                (<any>request.post).restore();
            });

            processImageStream(stream, session)
                .then(res => {
                    expect(res).to.deep.equal({ result: true });
                    done();
                })
                .catch(err => {
                    console.error(err);
                    done();
                });
        });
    });
    
    describe('processImageURL', function () {
        const { processImageURL } = recognizer;
        const session = { userData: { selectedAPI: 0 }};

        it('should catch thrown exceptions', function (done) {
            sinon.stub(request, 'post', (options, callback) => {                
                callback(new Error('Something went wrong'));
                (<any>request.post).restore();
            });

            processImageURL('http://example.com/foo.jpg', session).catch(err => {
                expect(err.message).to.equal('Something went wrong');
                done();
            });
        });

        it('should handle returned error messages', function (done) {
            const body = { error : "Bad auth, check token/params", code : "no-auth" };
            sinon.stub(request, 'post', (options, callback) => {
                callback(null, { statusCode: 401 }, body);
                (<any>request.post).restore();
            });

            processImageURL('http://example.com/foo.jpg', session).catch(err => {
                expect(err).to.deep.equal(body);
                done();
            });
        });

        it('should handle success responses', function (done) {
            sinon.stub(request, 'post', (options, callback) => {
                callback(null, { statusCode: 200 }, { result: true });
                (<any>request.post).restore();
            });

            processImageURL('http://example.com/foo.jpg', session)
                .then(res => {
                    expect(res).to.deep.equal({ result: true });
                    done();
                })
                .catch(err => {
                    console.error(err);
                    done();
                });
        });
    });    
});