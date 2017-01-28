const recognizer = require('../lib/services/recognizer');
import * as request from 'request';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs';
import * as path from 'path';

describe('recognizer module', function () {
    describe('processImageStream with chunked transfer', function () {
        const { processImageStream } = recognizer;
        const stream = { pipe() {}};
        const session = { userData: { selectedAPI: 0 }};

        it('should catch thrown exceptions', function (done) {
            sinon.stub(request, 'post', (options, callback) => {                
                callback(new Error('Something went wrong'));
            });

            processImageStream(stream, session).catch(err => {
                expect(err.message).to.equal('Something went wrong');
                (<any>request.post).restore();
                done();
            });
        });

        it('should handle returned error messages', function (done) {
            const body = { error : "Bad auth, check token/params", code : "no-auth" };
            sinon.stub(request, 'post', (options, callback) => {
                callback(null, { statusCode: 401 }, body);                
            });

            processImageStream(stream, session).catch(err => {
                expect(err).to.deep.equal(body);
                (<any>request.post).restore();
                done();
            });
        });            

        it('should handle success responses', function (done) {
            sinon.stub(request, 'post', (options, callback) => {
                callback(null, { statusCode: 200 }, JSON.stringify({ result: true }));                
            });

            processImageStream(stream, session)
                .then(res => {
                    expect(res).to.deep.equal({ result: true });
                    (<any>request.post).restore();
                    done();
                });
        });
    });

    describe('processImageStream with internal buffering', function () {
        const { processImageStream } = recognizer;        
        const session = { userData: { selectedAPI: 1 }};

        it('should catch thrown exceptions', function (done) {
            const stream = fs.createReadStream(path.resolve(__dirname, '../README.md'));
            sinon.stub(request, 'post', (options, callback) => {                
                callback(new Error('Something went wrong'));
            });

            processImageStream(stream, session).catch(err => {
                expect(err.message).to.equal('Something went wrong');
                (<any>request.post).restore();
                done();
            });
        });

        it('should handle returned error messages', function (done) {
            const stream = fs.createReadStream(path.resolve(__dirname, '../README.md'));
            const body = { error : "Bad auth, check token/params", code : "no-auth" };
            sinon.stub(request, 'post', (options, callback) => {
                callback(null, { statusCode: 401 }, body);
            });

            processImageStream(stream, session).catch(err => {
                expect(err).to.deep.equal(body);
                (<any>request.post).restore();
                done();
            });
        });        

        it('should handle success responses', function (done) {
            const stream = fs.createReadStream(path.resolve(__dirname, '../README.md'));
            sinon.stub(request, 'post', (options, callback) => {
                callback(null, { statusCode: 200 }, JSON.stringify({ result: true }));                
            });

            processImageStream(stream, session)
                .then(res => {
                    expect(res).to.deep.equal({ result: true });
                    (<any>request.post).restore();
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
            });

            processImageURL('http://example.com/foo.jpg', session).catch(err => {
                expect(err.message).to.equal('Something went wrong');
                (<any>request.post).restore();
                done();
            });
        });

        it('should handle returned error messages', function (done) {
            const body = { error : "Bad auth, check token/params", code : "no-auth" };
            sinon.stub(request, 'post', (options, callback) => {
                callback(null, { statusCode: 401 }, body);                
            });

            processImageURL('http://example.com/foo.jpg', session).catch(err => {
                expect(err).to.deep.equal(body);
                (<any>request.post).restore();
                done();
            });
        });

        it('should handle success responses', function (done) {
            sinon.stub(request, 'post', (options, callback) => {
                callback(null, { statusCode: 200 }, { result: true });                
            });

            processImageURL('http://example.com/foo.jpg', session)
                .then(res => {
                    expect(res).to.deep.equal({ result: true });
                    (<any>request.post).restore();
                    done();
                });
        });
    });    
});