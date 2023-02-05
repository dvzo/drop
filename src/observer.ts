import { Session } from './session';
/** 
 * mutation observer
 * need nested functions since injectMutator does not have a scope
 * */
export var injectMutator = function (appId: string, session: Session, msgSelector: string) {

    // cooldownTimer should be > autoTimer; ensures no double picking
    const autoTimer = 10000; // how long to wait before auto-picking
    const cooldownTimer = 30000; // active cooldown after a card was picked

    class Cooldown {
        private _onCooldown: boolean = false;

        get onCooldown(): boolean {
            return this._onCooldown;
        }

        private set onCooldown(cd: boolean) {
            this._onCooldown = cd;
        }

        startCooldown(ms: number) {
            let seconds = ms / 1000;
            console.log("cooldown has started for " + seconds + " seconds!");

            this._onCooldown = true;

            setTimeout(() => {
                console.log("cooldown has refreshed!");
                this._onCooldown = false;

            }, ms);
        }
    }

    /**
     * from helpers 
     * */
    function getIdAtIndex(element: string, index: number): string {
        return element.split("-")[index];
    }

    function getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
    }

    /**
     * generate random nonce
     * use first 7 digits of message_id and append the next 12 digits 
     * */
    function getRandomNonce(messageId: string) {
        let result = "";
        let charPool = "0123456789";
        let charPoolLength = charPool.length;
        let nonceLength = 12;

        for (let i = 0; i < nonceLength; i++) {
            result += charPool.charAt(Math.floor(Math.random() * charPoolLength));
        }

        // first seven characters + 12 nonce characters = 19
        return messageId.substring(0, 7) + result;
    }

    /**
     * generate body for request
     * */
    function getBody(msgAccessoriesId: string, dataCustomId: string): string {
        let cardPick = getRandomInt(3);
        let nonce = getRandomNonce(msgAccessoriesId);
        let customId = `drop_${dataCustomId}_${cardPick}`;

        let body = {
            "type": 3,
            "nonce": nonce,
            "guild_id": session._guild.id,
            "channel_id": session._channel.id,
            "message_flags": 0,
            "message_id": msgAccessoriesId,
            "application_id": appId,
            "session_id": session._id,
            "data": {
                "component_type": 2,
                "custom_id": customId
            }
        }

        return JSON.stringify(body);
    }

    // selector for all messages
    var msgSelector = "ol[class*='scroll']";

    const targetNode = document.querySelector(msgSelector);
 
    // options to observe
    const config = { childList: true };

    // create cooldown object to be used to determine whether to send a request or not
    var cd = new Cooldown();

    // Callback function to execute when mutations are observed
    const callback = (mutationList: any, observer: any) => {

        for (const mutation of mutationList) {

            // skip over blank nodelists
            if (mutation.addedNodes.length > 0) {

                console.log("mutation.addedNodes[0]: " + mutation.addedNodes[0]);
                console.log("mutation.addedNodes[0].id: " + mutation.addedNodes[0].id);

                // every message sent will be an 'LI' tag
                let dataCustomId;
                let chatMsgId = mutation.addedNodes[0].id; // <li id="chat-messages-[channelId]-[msgAccessoriesId]">
                let msgAccessoriesId = getIdAtIndex(chatMsgId, 3);
                let dataCustomIdSelector = `#${chatMsgId} > div > div > div > div`;
                let dataCustomIdElement = document.querySelector(dataCustomIdSelector); // "#message-content-[id]"


                if (dataCustomIdElement) {
                    dataCustomId = getIdAtIndex(dataCustomIdElement.id, 2); // get #message-content-[dataCustomId]
                }

                // message content and author
                let authorName;
                let msgContent;
                let contentSelector = `#${chatMsgId} > div > div[class*='contents']`;
                let authorElement = document.querySelector(`${contentSelector} > h3 > span > span`);
                let msgContentElement = document.querySelector(`${contentSelector} > div`); // should always be available

                // i.e. "SOFI"
                if (authorElement) {
                    authorName = authorElement.textContent;
                }

                // i.e. "@zootrash is dropping the cards"
                // also "@zootrash took the card Seunghyub | mmjhz6 |  Ice"
                // when cards are gone: "@zootrash dropped the cards."
                if (msgContentElement) {
                    msgContent = msgContentElement.textContent;
                }

                console.log("custom_id: " + dataCustomId);
                console.log("authorName: " + authorName);
                console.log("msgContent: " + msgContent);

                if (dataCustomId && authorName && msgContent) {

                    if (authorName === "SOFI" && msgContent.includes(`@${session._user.name} is dropping`)) {
                        let body = getBody(msgAccessoriesId, dataCustomId);

                        setTimeout(() => {

                            if (cd.onCooldown) {
                                console.log("unable to pick up cards, still on cooldown!");

                            } else {
                                fetch(session._requestUrl, {
                                    "headers": session._header,
                                    "referrer": session._referUrl,
                                    "referrerPolicy": "strict-origin-when-cross-origin",
                                    "body": body,
                                    "method": "POST",
                                    "mode": "cors",
                                    "credentials": "include"
                                });
                            }
                        }, autoTimer);
                    }

                } else if (!dataCustomId && !authorName && msgContent) {

                    if (msgContent.includes(`@${session._user.name} took`)) {
                        console.log(msgContent);

                        cd.startCooldown(cooldownTimer);
                    }
                }
            }
        }
    }

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    if (targetNode) {
        observer.observe(targetNode, config);
    }
}