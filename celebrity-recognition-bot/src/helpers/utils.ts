import * as url from 'url';
import * as validUrl from 'valid-url';
import * as request from 'request';
import { Session, IAttachment } from 'botbuilder';
import { connector } from '../app';

/**
 * Checks if the message contains a hyperlink
 * @param {string} message
 * @returns {boolean}
 */
export const hasImageURL = (message: string): boolean => {
    return !!parseAnchorTag(message) || !!validUrl.isUri(message);
}

/**
 * Checks if the message has any image attachments.
 * @param {IAttachment[]} attachments
 * @returns {boolean}
 */
export const hasImageAttachment = (attachments: IAttachment[]): boolean => {
    return (attachments.length > 0) && (attachments[0].contentType.indexOf("image") !== -1);
}

/**
 * Checks if the user tapped a button action
 * @param {Object} args
 * @returns {boolean}
 */
export const isNewRequestAction = (args: { action: string, data: string }): boolean => {
    const { action = null, data = null } = typeof args === 'object' ? args : {};
    if (action === 'newRequest' && validUrl.isUri(data)) {
        return true;
    }

    return false;
}

/**
 * Checks if the source of the attachment is Skype.
 * If true, the fetching request will need an authorization header.
 * @param {Object} args
 * @returns {boolean}
 */
export const isSkypeAttachment = (attachment: IAttachment): boolean => {
    if (url.parse(attachment.contentUrl).hostname.substr(-"skype.com".length) === "skype.com") {
        return true;
    }

    return false;
}

/**
 * Extracts the image URL in case the message contains one.
 * @param {string} message
 * @returns {string|null}
 */
export const getImageURL = (message: string): (string | null) => {
    return (parseAnchorTag(message) || (validUrl.isUri(message) ? message : null));
}

export const getImageStream = (attachment: IAttachment) => {
    if (!attachment || typeof attachment !== 'object') {
        throw new Error('Invalid argument: expected an attachment');
    }

    const { contentUrl, contentType } = attachment;
    const headers: any = {};
    
    if (isSkypeAttachment(attachment)) {
        // The Skype attachment URLs are secured by JwtToken.
        // https://github.com/Microsoft/BotBuilder/issues/662
        (<any>connector).getAccessToken((error: Error, token: string) => {
            if (error) {
                throw new Error(error.message);
            }
            headers['Authorization'] = `Bearer ${token}`;
            headers['Content-Type'] = 'application/octet-stream';

            return request.get(contentUrl, { headers });
        });
    } else {
        headers['Content-Type'] = contentType;
        return request.get(contentUrl, { headers });
    }
}

/**
 * Gets the href value in an anchor element.
 * Skype transforms raw urls to html. Here we extract the href value from the url
 * @param {string} input
 * @returns {string|null}
 */
export const parseAnchorTag = (input: string): (string | null) => {
    if (!input || typeof input !== 'string') {
        throw new Error('Invalid argument: input should be a string');
    }

    let match = input.match("^<a href=\"([^\"]*)\">[^<]*</a>$");
    if(match && match[1]) {
        return match[1];
    }

    return null;
}