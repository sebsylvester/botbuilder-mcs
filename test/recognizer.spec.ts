const recognizer = require('../lib/services/recognizer');
import * as request from 'request';
import { expect } from 'chai';
import * as sinon from 'sinon';

// Actual server response when sending the infamous Oscar's selfie => https://goo.gl/MJl4eV
const successResponse = {
  "categories": [
    {
      "name": "people_group",
      "score": 0.8046875,
      "detail": {
        "celebrities": [
          {
            "name": "Bradley Cooper",
            "faceRectangle": {
              "left": 649,
              "top": 312,
              "width": 266,
              "height": 266
            },
            "confidence": 0.9993013
          },
          {
            "name": "Ellen Degeneres",
            "faceRectangle": {
              "left": 410,
              "top": 285,
              "width": 195,
              "height": 195
            },
            "confidence": 0.999961853
          },
          {
            "name": "Jennifer Lawrence",
            "faceRectangle": {
              "left": 116,
              "top": 78,
              "width": 185,
              "height": 185
            },
            "confidence": 0.9473655
          },
          {
            "name": "Julia Fiona Roberts",
            "faceRectangle": {
              "left": 430,
              "top": 25,
              "width": 140,
              "height": 140
            },
            "confidence": 0.987559736
          }
        ]
      }
    }
  ],
  "requestId": "c4189a0d-6875-4adf-b206-91520b7c2c0f",
  "metadata": {
    "width": 1200,
    "height": 630,
    "format": "Jpeg"
  }
}
const emptyResponse = { categories: [{ detail: { celebrities: [] } }] };
const celebrities = [
                { "name": "Bradley Cooper", "confidence": 0.9993013 },
                { "name": "Ellen Degeneres", "confidence": 0.999961853 },
                { "name": "Jennifer Lawrence", "confidence": 0.9473655 },
                { "name": "Julia Fiona Roberts", "confidence": 0.987559736 }
            ];

describe('recognizer module', function () {
    describe('processImageStream', function () {
        const { processImageStream } = recognizer;
        const stream = { pipe() {}};

        it('should catch thrown exceptions', function (done) {
            sinon.stub(request, 'post', (options, callback) => {                
                callback(new Error('Something went wrong'));
                (<any>request.post).restore();
            });

            processImageStream(stream).catch(err => {
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

            processImageStream(stream).catch(err => {
                expect(err).to.deep.equal(body);
                done();
            });
        });            

        it('should handle success responses', function (done) {
            sinon.stub(request, 'post', (options, callback) => {
                callback(null, { statusCode: 200 }, JSON.stringify(successResponse));
                (<any>request.post).restore();
            });

            processImageStream(stream)
                .then(res => {
                    expect(res).to.deep.equal(celebrities);
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

        it('should catch thrown exceptions', function (done) {
            sinon.stub(request, 'post', (options, callback) => {                
                callback(new Error('Something went wrong'));
                (<any>request.post).restore();
            });

            processImageURL('http://example.com/foo.jpg').catch(err => {
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

            processImageURL('http://example.com/foo.jpg').catch(err => {
                expect(err).to.deep.equal(body);
                done();
            });
        });

        it('should handle success responses', function (done) {
            sinon.stub(request, 'post', (options, callback) => {
                callback(null, { statusCode: 200 }, successResponse);
                (<any>request.post).restore();
            });

            processImageURL('http://example.com/foo.jpg')
                .then(res => {
                    expect(res).to.deep.equal(celebrities);
                    done();
                })
                .catch(err => {
                    console.error(err);
                    done();
                });
        });
    });

    describe('extractCelebrities', function () {
        const { extractCelebrities } = recognizer;

        it('should throw an exception if the response does not contain any categories', function () {
            expect(extractCelebrities).to.throw('Invalid response body, missing categories property');
            expect(extractCelebrities.bind(null, {})).to.throw('Invalid response body, missing categories property');
        });

        it('should return an empty array if the response does not contain any details', function () {
            expect(extractCelebrities({ categories: [{ "name": "others_", "score": 0.02734375 }] })).to.deep.equal([]);
        });
        
        it('should return an empty array if the response does not contain any celebrities', function () {
            expect(extractCelebrities(emptyResponse)).to.deep.equal([]);
        });

        it('should extract the celebrities from the response if it does contain any celebrities', function () {
            expect(extractCelebrities(successResponse)).to.deep.equal(celebrities);
        });
    });
});