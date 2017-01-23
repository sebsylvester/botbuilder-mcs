import { ConsoleConnector, UniversalBot } from 'botbuilder';
import * as sinon from 'sinon';
import { expect } from 'chai';
const handlers = require('../lib/helpers/handlers');

// Actual server response when sending the infamous Oscar's selfie => https://goo.gl/MJl4eV
const ComputerVision = {
  successResponseMultiple: {
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
  },
  successResponseSingle: {
    "categories": [
      {
        "name": "people_portrait",
        "score": 0.8046875,
        "detail": {
          "celebrities": [
            {
              "name": "Jennifer Lawrence",
              "faceRectangle": {
                "left": 116,
                "top": 78,
                "width": 185,
                "height": 185
              },
              "confidence": 0.9473655
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
  },
  emptyResponse: {
    "categories": [
      {
        "name": "people_group",
        "score": 0.98046875,
        "detail": {
          "celebrities": []
        }
      },
      {
        "name": "people_unknown",
        "score": 0.99,
      }
    ],
    "requestId": "c4189a0d-6875-4adf-b206-91520b7c2c0f",
    "metadata": {
      "width": 1200,
      "height": 630,
      "format": "Jpeg"
    }
  }
}
const Emotion = {
  successResponseMultiple: [
    {
      "faceRectangle": {
        "left": 488,
        "top": 263,
        "width": 148,
        "height": 148
      },
      "scores": {
        "anger": 9.075572e-13,
        "contempt": 7.048959e-9,
        "disgust": 1.02152783e-11,
        "fear": 1.778957e-14,
        "happiness": 0.9999999,
        "neutral": 1.31694478e-7,
        "sadness": 6.04054263e-12,
        "surprise": 3.92249462e-11
      }
    },
    {
      "faceRectangle": {
        "left": 153,
        "top": 251,
        "width": 133,
        "height": 133
      },
      "scores": {
        "anger": 6.2065344e-9,
        "contempt": 1.08080636e-11,
        "disgust": 3.30821842e-10,
        "fear": 1.02974018e-11,
        "happiness": 1,
        "neutral": 1.2882297e-8,
        "sadness": 2.63420341e-10,
        "surprise": 4.30664e-10
      }
    }
  ],
  successResponseSingle: [
    {
      "faceRectangle": {
        "left": 488,
        "top": 263,
        "width": 148,
        "height": 148
      },
      "scores": {
        "anger": 9.075572e-13,
        "contempt": 7.048959e-9,
        "disgust": 1.02152783e-11,
        "fear": 1.778957e-14,
        "happiness": 0.9999999,
        "neutral": 1.31694478e-7,
        "sadness": 6.04054263e-12,
        "surprise": 3.92249462e-11
      }
    }
  ],
  emptyResponse: []
}

describe('handlers module', function () {
    describe('handleComputerVisionResponse', function () {
        const { handleComputerVisionResponse } = handlers;

        it('should throw if invoked with an invalid argument', function () {
            expect(handleComputerVisionResponse).to.throw('Invalid response body, missing categories property');
        });

        it('should handle an empty response', function (done) {
            const connector = new ConsoleConnector();
            const bot = new UniversalBot(connector);
            let step = 0;

            bot.dialog('/', (session) => {
                session.beginDialog('/handleComputerVisionResponse', ComputerVision.emptyResponse);
            });
            // This is not a real dialog, but it's convenient to test it this way
            bot.dialog('/handleComputerVisionResponse', handleComputerVisionResponse);       
            bot.on('send', message => {
                switch (++step) {
                    case 1:
                        expect(message.text).to.equal("Sorry, I couldn't recognize anybody.");
                        break;
                    case 2:
                        expect(message.text).to.equal("Try a different image or link.");
                        done();
                        break;
                }
            });

            connector.processMessage('start');
        });

        it('should handle a response with a single result', function (done) {
            const connector = new ConsoleConnector();
            const bot = new UniversalBot(connector);
            let step = 0;

            bot.dialog('/', (session) => {
                session.beginDialog('/handleComputerVisionResponse', ComputerVision.successResponseSingle);
            });
            // This is not a real dialog, but it's convenient to test it this way
            bot.dialog('/handleComputerVisionResponse', handleComputerVisionResponse);       
            bot.on('send', message => {
                expect(message.text).to.equal("I've recognized Jennifer Lawrence with 94% certainty");
                done();
            });

            connector.processMessage('start');
        });

        it('should handle a response with multiple results', function (done) {
            const connector = new ConsoleConnector();
            const bot = new UniversalBot(connector);
            let step = 0;

            bot.dialog('/', (session) => {
                session.beginDialog('/handleComputerVisionResponse', ComputerVision.successResponseMultiple);
            });
            // This is not a real dialog, but it's convenient to test it this way
            bot.dialog('/handleComputerVisionResponse', handleComputerVisionResponse);       
            bot.on('send', message => {
                switch (++step) {
                    case 1:
                        expect(message.text).to.equal("I detected a number of celebrities, the results are from left to right.");
                        break;
                    case 2:
                        expect(message.text).to.equal("I've recognized Jennifer Lawrence with 94% certainty");                        
                        break;
                    case 3:
                        expect(message.text).to.equal("I've recognized Ellen Degeneres with 99% certainty");
                        break;
                    case 4:
                        expect(message.text).to.equal("I've recognized Julia Fiona Roberts with 98% certainty");
                        break;
                    case 5:                        
                        expect(message.text).to.equal("I've recognized Bradley Cooper with 99% certainty");
                        done();
                        break;
                }
            });

            connector.processMessage('start');
        });
    });

    describe('handleEmotionResponse', function () {
        const { handleEmotionResponse } = handlers;

        it('should throw if invoked with an invalid argument', function () {
            expect(handleEmotionResponse).to.throw('Response body cannot be undefined');
        });

        it('should handle an empty response', function (done) {
            const connector = new ConsoleConnector();
            const bot = new UniversalBot(connector);
            let step = 0;

            bot.dialog('/', (session) => {
                session.beginDialog('/handleEmotionResponse', Emotion.emptyResponse);
            });
            // This is not a real dialog, but it's convenient to test it this way
            bot.dialog('/handleEmotionResponse', handleEmotionResponse);
            bot.on('send', message => {
                switch (++step) {
                    case 1:
                        expect(message.text).to.equal("Sorry, I couldn't detect any faces.");
                        break;
                    case 2:
                        expect(message.text).to.equal("Try a different image or link.");
                        done();
                        break;
                }
            });

            connector.processMessage('start');
        });

        it('should handle a response with a single result', function (done) {
            const connector = new ConsoleConnector();
            const bot = new UniversalBot(connector);
            let step = 0;

            bot.dialog('/', (session) => {
                session.beginDialog('/handleEmotionResponse', Emotion.successResponseSingle);
            });
            // This is not a real dialog, but it's convenient to test it this way
            bot.dialog('/handleEmotionResponse', handleEmotionResponse);       
            bot.on('send', message => {
                expect(message.text).to.equal("I've recognized happiness with 99% certainty");
                done();
            });

            connector.processMessage('start');
        });

        it('should handle a response with multiple results', function (done) {
            const connector = new ConsoleConnector();
            const bot = new UniversalBot(connector);
            let step = 0;

            bot.dialog('/', (session) => {
                session.beginDialog('/handleEmotionResponse', Emotion.successResponseMultiple);
            });
            // This is not a real dialog, but it's convenient to test it this way
            bot.dialog('/handleEmotionResponse', handleEmotionResponse);       
            bot.on('send', message => {
                switch (++step) {
                    case 1:
                        expect(message.text).to.equal("I detected a number of faces, the results are from left to right.");
                        break;
                    case 2:
                        expect(message.text).to.equal("I've recognized happiness with 100% certainty");
                        break;                    
                    case 3:                        
                        expect(message.text).to.equal("I've recognized happiness with 99% certainty");
                        done();
                        break;
                }
            });

            connector.processMessage('start');
        });
    });
});