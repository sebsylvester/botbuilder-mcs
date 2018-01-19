import { Session } from "botbuilder";
import * as request from "request";
import { APIs } from "../helpers/consts";

interface IRequestOptions {
    url: string;
    encoding: string;
    headers: {[key: string]: string};
    body?: any;
}

/**
 * Called when the user sends an image attachment.
 * The image is streamed from the host and to the API endpoint.
 * @param {Request} stream The GET request to fetch the image
 * @param {Session} session Holds the state of the user's session
 * @returns {Promise} The asynchronous operation is unpacked by the caller
 */
export const processImageStream = (stream: any, session: Session): Promise<any> => {
    return new Promise((resolve, reject) => {
        // Get the currently selected API
        const { selectedAPI } = session.userData;
        const chunked = APIs[selectedAPI].chunked;

        // Define request options
        const options: IRequestOptions = {
            url: APIs[selectedAPI].url,
            encoding: "binary",
            headers: {
                "Ocp-Apim-Subscription-Key": APIs[selectedAPI].key,
                "Content-Type": "application/octet-stream",
            },
        };

        // Stream data directly to endpoint if it supports chunked encoding
        if (chunked) {
            // Make API call and handle error/response
            stream.pipe(request.post(options, (error: Error, response: any, body: any) => {
                if (error) {
                    return reject(error);
                }
                // If status == 200, body needs to be parsed as JSON
                body = (typeof body === "string") ? JSON.parse(body) : body;
                if (response.statusCode !== 200) { reject(body); } else { resolve(body); }
            }));
        } else {
            // Buffer all of the stream in memory before sending to endpoint
            const buffer: Buffer[] = [];
            stream.on("data", (chunk: Buffer) => {
                buffer.push(chunk);
            }).on("end", () => {
                options.body = Buffer.concat(buffer);
                request.post(options, (error: Error, response: any, body: any) => {
                    if (error) {
                        return reject(error);
                    }
                    // If status == 200, body needs to be parsed as JSON
                    body = (typeof body === "string") ? JSON.parse(body) : body;
                    if (response.statusCode !== 200) { reject(body); } else { resolve(body); }
                });
            });
        }
    });
};

/**
 * Called when the user sends an image link.
 * In this case the link is simply posted to the API endpoint.
 * @param {string} url The URL sent by the user
 * @param {Session} session Holds the state of the user's session
 * @returns {Promise} The asynchronous operation is unpacked by the caller
 */
export const processImageURL = (url: string, session: Session): Promise<any> => {
    return new Promise((resolve, reject) => {
        // Get the currently selected API
        const { selectedAPI } = session.userData;
        // Define request options
        const options = {
            url: APIs[selectedAPI].url,
            json: { url },
            headers: { "Ocp-Apim-Subscription-Key": APIs[selectedAPI].key },
        };

        // Make API call and handle error/response
        request.post(options, (error: Error, response: any, body: any) => {
            if (error) {
                reject(error);
            } else if (response.statusCode !== 200) {
                reject(body);
            } else {
                resolve(body);
            }
        });
    });
};
