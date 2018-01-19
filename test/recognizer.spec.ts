const recognizer = require("../lib/services/recognizer");
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import * as request from "request";
import * as sinon from "sinon";

describe("recognizer module", () => {
    describe("processImageStream with chunked transfer", () => {
        const { processImageStream } = recognizer;
        const stream = { pipe() {}};
        const session = { userData: { selectedAPI: 0 }};

        it("should catch thrown exceptions", (done) => {
            sinon.stub(request, "post").callsFake((options, callback) => {
                callback(new Error("Something went wrong"));
            });

            processImageStream(stream, session).catch((err) => {
                expect(err.message).to.equal("Something went wrong");
                (request.post as any).restore();
                done();
            });
        });

        it("should handle returned error messages", (done) => {
            const body = { error : "Bad auth, check token/params", code : "no-auth" };
            sinon.stub(request, "post").callsFake((options, callback) => {
                callback(null, { statusCode: 401 }, body);
            });

            processImageStream(stream, session).catch((err) => {
                expect(err).to.deep.equal(body);
                (request.post as any).restore();
                done();
            });
        });

        it("should handle success responses", (done) => {
            sinon.stub(request, "post").callsFake((options, callback) => {
                callback(null, { statusCode: 200 }, JSON.stringify({ result: true }));
            });

            processImageStream(stream, session)
                .then((res) => {
                    expect(res).to.deep.equal({ result: true });
                    (request.post as any).restore();
                    done();
                });
        });
    });

    describe("processImageStream with internal buffering", () => {
        const { processImageStream } = recognizer;
        const session = { userData: { selectedAPI: 1 }};

        it("should catch thrown exceptions", (done) => {
            const stream = fs.createReadStream(path.resolve(__dirname, "../README.md"));
            sinon.stub(request, "post").callsFake((options, callback) => {
                callback(new Error("Something went wrong"));
            });

            processImageStream(stream, session).catch((err) => {
                expect(err.message).to.equal("Something went wrong");
                (request.post as any).restore();
                done();
            });
        });

        it("should handle returned error messages", (done) => {
            const stream = fs.createReadStream(path.resolve(__dirname, "../README.md"));
            const body = { error : "Bad auth, check token/params", code : "no-auth" };
            sinon.stub(request, "post").callsFake((options, callback) => {
                callback(null, { statusCode: 401 }, body);
            });

            processImageStream(stream, session).catch((err) => {
                expect(err).to.deep.equal(body);
                (request.post as any).restore();
                done();
            });
        });

        it("should handle success responses", (done) => {
            const stream = fs.createReadStream(path.resolve(__dirname, "../README.md"));
            sinon.stub(request, "post").callsFake((options, callback) => {
                callback(null, { statusCode: 200 }, JSON.stringify({ result: true }));
            });

            processImageStream(stream, session)
                .then((res) => {
                    expect(res).to.deep.equal({ result: true });
                    (request.post as any).restore();
                    done();
                });
        });
    });

    describe("processImageURL", () => {
        const { processImageURL } = recognizer;
        const session = { userData: { selectedAPI: 0 }};

        it("should catch thrown exceptions", (done) => {
            sinon.stub(request, "post").callsFake((options, callback) => {
                callback(new Error("Something went wrong"));
            });

            processImageURL("http://example.com/foo.jpg", session).catch((err) => {
                expect(err.message).to.equal("Something went wrong");
                (request.post as any).restore();
                done();
            });
        });

        it("should handle returned error messages", (done) => {
            const body = { error : "Bad auth, check token/params", code : "no-auth" };
            sinon.stub(request, "post").callsFake((options, callback) => {
                callback(null, { statusCode: 401 }, body);
            });

            processImageURL("http://example.com/foo.jpg", session).catch((err) => {
                expect(err).to.deep.equal(body);
                (request.post as any).restore();
                done();
            });
        });

        it("should handle success responses", (done) => {
            sinon.stub(request, "post").callsFake((options, callback) => {
                callback(null, { statusCode: 200 }, { result: true });
            });

            processImageURL("http://example.com/foo.jpg", session)
                .then((res) => {
                    expect(res).to.deep.equal({ result: true });
                    (request.post as any).restore();
                    done();
                });
        });
    });
});
