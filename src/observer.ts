import { Session } from './session';
import { Timer } from './timer';

/** 
 * mutation observer
 * need nested functions since injectMutator does not have a scope
 * */
export var injectMutator = function (debug: boolean, appId: string, session: Session, timer: Timer, msgSelector: string) {

    /**
     * cooldown class to control cooldowns between each request
     * */
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
     * card class used to hold values of cards to request
     * */
    class Card {
        private _id!: number;
        private _gen!: number;
        private _wl!: number;
        private _name!: string;
        private _series!: string;

        public get id(): number {
            return this._id;
        }

        public set id(id: number) {
            this._id = id;
        }

        public get gen(): number {
            return this._gen;
        }

        public set gen(gen: number) {
            this._gen = gen;
        }

        public get wl(): number {
            return this._wl;
        }

        public set wl(wl: number) {
            this._wl = wl;
        }

        public get name(): string {
            return this._name;
        }

        public set name(name: string) {
            this._name = name;
        }

        public get series(): string {
            return this._series;
        }

        public set series(series: string) {
            this._series = series;
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

    /**
     * get the title of the embed grid element, given its grid selector
     * */
    function getEmbedGridTitle(embedGridSelector: string): string {
        let gridTitle: string = "";
        let gridTitleElement: HTMLElement | null = document.querySelector(`${embedGridSelector} > div[class*='embedTitle']`);

        if (gridTitleElement) {
            gridTitle = gridTitleElement.innerText;
        }

        return gridTitle;
    }

    /**
     * returns the grid field element for the main content
     * */
    function getEmbedGridFieldsElement(embedGridSelector: string): HTMLElement | null {
        let gridFieldsElement: HTMLElement | null = document.querySelector(`${embedGridSelector} > div[class*='embedFields']`);

        return gridFieldsElement;
    }

    /**
     * return a card with gen, name, and series populated
     * */
    function createCard(cardDescription: string) {
        let card = new Card();
        let descriptionRaw = cardDescription.split('\n');
        let description = descriptionRaw.filter(desc => desc != "");

        for (let i = 0; i < description.length; i++) {
            description.splice(i, 1, description[i].trim());
        }

        // [gen], [name], [series]
        card.gen = parseInt(description[0]);
        card.name = description[1];
        card.series = description[2];

        console.log("gen: " + card.gen);
        console.log("name" + card.name);
        console.log("series" + card.series);

        return card;
    }

    // selector for all messages
    var msgSelector = "ol[class*='scroll']";

    const targetNode = document.querySelector(msgSelector);
 
    // options to observe
    const config = { childList: true };

    // create cooldown object to be used to determine whether to send a request or not
    var cd = new Cooldown();

    // create list of current cards
    var cards: Card[];

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

                // embedded grid which will contain the title and text we want
                // article route is specific for sdn / card drop text only
                // message-accessories should always be available
                let embedGridSelector = `${contentSelector} > div > div[id*='message-accesories'] > article > div > div`;
                let embedGridElement = document.querySelector(embedGridSelector);
                let embedGridTitle;
                let embedGridFieldsElement;

                // grid cards
                let gridCards;
                let cardDescription;
                let card;

                // i.e. "SOFI"
                if (authorElement) {
                    authorName = authorElement.textContent;
                }

                // i.e. "@zootrash is dropping the cards"
                // also "@zootrash took the card Seunghyub | mmjhz6 |  Ice"
                // when cards are gone: "@zootrash dropped the cards."
                // this is pure text entered from users
                if (msgContentElement) {
                    msgContent = msgContentElement.textContent;
                }

                console.log("custom_id: " + dataCustomId);
                console.log("authorName: " + authorName);
                console.log("msgContent: " + msgContent);

                if (dataCustomId && authorName && msgContent) {

                    // if any drop command is executed
                    if (authorName === "SOFI" && msgContent.includes(`@${session._user.name} is dropping`)) {

                        // check for embedded / sdn text only grid
                        // check if dropped response contains the block grid
                        if (embedGridElement) {

                            // TODO:
                            // process will need to be sequential and linear ; not using switch statements
                            // this way, actions can happen in succession of each other
                            // i.e. for each drop, do scl on each card...

                            embedGridTitle = getEmbedGridTitle(embedGridSelector);
                            embedGridFieldsElement = getEmbedGridFieldsElement(embedGridSelector);

                            // drop grid
                            if (embedGridTitle.includes("DROP")) {

                                // testing
                                console.log("drop detected");

                                if (embedGridFieldsElement) {
                                    gridCards = embedGridFieldsElement.children; // 3 given cards

                                    // store cards in the global card array
                                    for (let i = 0; i < gridCards.length; i++) {
                                        cardDescription = (gridCards[i] as HTMLElement).innerText;
                                        card = createCard(cardDescription); // populate card with descriptions
                                        cards.push(card);
                                    }
                                }

                            // check for single character lookup
                            } else if (embedGridTitle.toLowerCase().trim() === "lookup") {

                                // testing
                                console.log("single lookup detected");

                                // for each card -> get the WL and store it
                                for (let i = 0; i < cards.length; i++) {

                                    // send "scl name"

                                    // if 

                                }

                                // TODO: need to clear this array with length = 0 at the end
                                // select cards later based off of wl or events

                            }

                        }

                        // TODO: below needs to be an else statement so they both dont get ran


                        let body = getBody(msgAccessoriesId, dataCustomId);

                        // TEST: print out body
                        console.log("body: " + body);

                        if (!debug) {
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
                            }, timer._m_pickInterval);
                        }
                    }

                // for subsequent messages of the same user
                } else if (!dataCustomId && !authorName && msgContent) {

                    if (msgContent.includes(`@${session._user.name} took`)
                        || msgContent.includes(`@${session._user.name} picked`)) {
                        console.log(msgContent);

                        cd.startCooldown(timer._m_pickCd);
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