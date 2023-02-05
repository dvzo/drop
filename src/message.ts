import { Session } from './session';
import { BASE_URL, API_VERSION, } from './declare/constants';

/**
 * returns an object literal message body property as a string for the sending a message
 * removing nonce field
 * */
function getMsgBody(content: string): string {
    let bodyObj: object = {
        "content": content,
        "tts": false
    }

    return JSON.stringify(bodyObj);
}

/** 
 * sends a message
 * cant use constant as msgURl as the channel id isnt set on program execution
 */
export async function sendMsg(session: Session, message: string) {
    let msgUrl: string = `${BASE_URL}/${API_VERSION}/channels/${session._channel.id}/messages`;
    let body: string = getMsgBody(message);

    await fetch(msgUrl, {
        "headers": session._header,
        "referrer": session._referUrl,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": body,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });
}