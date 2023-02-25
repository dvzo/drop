import { Session } from './session';
import { Timer } from './timer';

/** 
 * mutation observer
 * need nested functions since injectMutator does not have a scope
 * */
export var injectMutator = function (debug: boolean, appId: string, session: Session, timer: Timer, msgSelector: string) {

    /** globals */
    var cardIndex: number = 0;

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
        private _idx!: number; // 0 - 2
        private _gen!: number;
        private _wl!: number;
        private _name!: string;
        private _series!: string;
        private _grab: boolean = false; // false by default

        public get idx(): number {
            return this._idx;
        }

        public set idx(idx: number) {
            this._idx = idx;
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

        public get grab(): boolean {
            return this._grab;
        }

        public set grab(grab: boolean) {
            this._grab = grab;
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
     * returns an object literal message body property as a string for the sending a message
     * removing nonce field
     * */
    function getMsgBody(content: string): string {
        let bodyObj: object = {
            "content": content,
            "tts": false,
            "flags": 0
        }

        return JSON.stringify(bodyObj);
    }

    /**
     * get the title of the embed grid element
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
     * returns the grid field element
     * for drops without images
     * */
    function getEmbedGridFieldsElement(embedGridSelector: string): HTMLElement | null {
        let gridFieldsElement: HTMLElement | null = document.querySelector(`${embedGridSelector} > div[class*='embedFields']`);

        return gridFieldsElement;
    }

    /**
     * returns the grid description element
     * for lookup descriptions
     * */
    function getEmbedGridDescriptionElement(embedGridSelector: string): HTMLElement | null {
        let gridDescriptionElement: HTMLElement | null = document.querySelector(`${embedGridSelector} > div[class*='embedDescription']`);

        return gridDescriptionElement;
    }

    /**
     * return a card with gen, name, and series populated
     * */
    function createCard(cardDescription: string, idx: number): Card {
        let card = new Card();
        let descriptionRaw = cardDescription.split('\n');
        let description = descriptionRaw.filter(desc => desc != "");
        let gen: string[];

        // set card index
        card.idx = idx;

        for (let i = 0; i < description.length; i++) {
            description.splice(i, 1, description[i].trim());
        }

        // split gen, as it will be "[Gen XXXX]"
        // can also be "Event Card"
        gen = description[0].split(' ');

        // automatically grab event cards; give special gen 0
        if (gen[0].toLowerCase().includes("event")) {
            card.gen = 0;
            card.grab = true;
        } else {
            card.gen = parseInt(gen[1]);
        }

        // [gen], [name], [series]
        card.name = description[1];
        card.series = description[2];

        console.log("idx: " + card.idx);
        console.log("gen: " + card.gen);
        console.log("name: " + card.name);
        console.log("series: " + card.series);

        return card;
    }

    /**
     * sleep function
     * */
    function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * set card stats in sequential order
     * cant use for loops here as it breaks the async calls
     */
    async function setCardStats(gridCards: HTMLCollection) {
        let cardDescription: string;
        let card;
        let msgBody: string; // body changes for each request

        // sleep once the cards have been dropped/appeared
        await sleep(timer._m_cmdCd);

        /** first card */
        console.log("first card!");

        cardDescription = (gridCards[cardIndex] as HTMLElement).innerText;
        card = createCard(cardDescription, cardIndex);

        // need to push the card before the lookup logic happens below
        cards.push(card);

        // TODO: use debug variable here too in the future
        msgBody = getMsgBody(`scl ${card.name}`); // send scl

        await fetch(session._msgUrl, {
            "headers": session._header,
            "referrer": session._referUrl,
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": msgBody,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });

        console.log(cards[cardIndex]);

        console.log(`card created!, sleeping loop ${cardIndex}...`);
        await sleep(timer._m_cmdCd);
        console.log(`loop ${cardIndex}: pass`);

        // always update global index
        cardIndex++;

        /** second card */
        cardDescription = (gridCards[cardIndex] as HTMLElement).innerText;
        card = createCard(cardDescription, cardIndex);

        // need to push the card before the lookup logic happens below
        cards.push(card);

        // TODO: use debug variable here too in the future
        msgBody = getMsgBody(`scl ${card.name}`); // send scl

        await fetch(session._msgUrl, {
            "headers": session._header,
            "referrer": session._referUrl,
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": msgBody,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });

        console.log(cards[cardIndex]);

        console.log(`message sent, sleeping loop ${cardIndex}...`);
        await sleep(timer._m_cmdCd);
        console.log(`loop ${cardIndex}: pass`);

        // always update global index
        cardIndex++;

        /** third card */
        cardDescription = (gridCards[cardIndex] as HTMLElement).innerText;
        card = createCard(cardDescription, cardIndex);

        // need to push the card before the lookup logic happens below
        cards.push(card);

        // TODO: use debug variable here too in the future
        msgBody = getMsgBody(`scl ${card.name}`); // send scl

        await fetch(session._msgUrl, {
            "headers": session._header,
            "referrer": session._referUrl,
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": msgBody,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });

        console.log(cards[cardIndex]);

        console.log(`message sent, sleeping loop ${cardIndex}...`);
        await sleep(timer._m_cmdCd);
        console.log(`loop ${cardIndex}: pass`);

        // TODO: sleep here again, compare which cards to grab
        // compare wishlist cards array

        // finally, reset the card index
        console.log("only happens once! reset index");
        cardIndex = 0;
    }

    /**
     * returns wl number from single lookup
     */
    function getLookupWL(gridDescription: any): number {
        let cardWl: string = gridDescription.children[3].innerText.trim();

        return parseInt(cardWl);
    }

    /**
     * function to get wl number from list of characters;
     * may return NaN
     */
    function getCharactersLookupWL(gridDescription: any): number {
        let allDescriptions = gridDescription.children.innerText.trim(); // contains every element innertext in grid
        let character = []; // single array to hold a character's info
        let allCharacters = []; // 2d array to hold all characters, split by 4
        let wl: string = "";

        // keep chopping the description array until empty
        while (allDescriptions.length) {
            character = allDescriptions.splice(0, 4);
            allCharacters.push(character);
        }

        for (let i = 0; i < allCharacters.length; i++) {

            // match current character by name and series, then get wl
            if (allCharacters[i][2] === cards[cardIndex].name
                && allCharacters[i][3] === cards[cardIndex].series) {

                    // get '<3 0' string; grab number
                    wl = allCharacters[i][1].split(' ')[1];
                }
        }

        return parseInt(wl);
    }

    /**
     * get highest card index from two cards that have false grabs
     */
    function getHighestCardIdx(card_1: Card, card_2: Card): number{
        let highestCardIdx: number;

        if (card_1.wl > card_2.wl) {
            highestCardIdx = card_1.idx;
        } else if (card_2.wl > card_1.wl) {
            highestCardIdx = card_2.idx;

        // if tied wishlist, get highest gen
        } else {

            if (card_1.gen > card_2.gen) {
                highestCardIdx = card_1.idx;
            } else if (card_2.gen > card_1.gen) {
                highestCardIdx = card_2.idx;
            } else {

                // if both are completely equal, default to 2
                highestCardIdx = card_2.idx;
            }
        }

        return highestCardIdx;
    }


    /**
     * compare wishlists in card array
     * auto pick event cards
     */
    function setGrabsByWL() {
        let highestCardIdx: number = 0; // default highest idx
        let card_1 = cards[0];
        let card_2 = cards[1];
        let card_3 = cards[2];

        // compare cards 1 and 2, then compare to 3
        if (card_1.grab == false && card_2.grab == false) {
            highestCardIdx = getHighestCardIdx(card_1, card_2);

            if (card_3.grab == false) {
                highestCardIdx = getHighestCardIdx(cards[highestCardIdx], card_3);
            }

        // compare card 1 and 3, then compare to 2
        } else if (card_1.grab == false && card_3.grab == false) {
            highestCardIdx = getHighestCardIdx(card_1, card_3);

            if (card_2.grab == false) {
                highestCardIdx = getHighestCardIdx(cards[highestCardIdx], card_2);
            }

        // compare card 2 and 3, then compare to 1
        } else if (card_2.grab == false && card_3.grab == false) {
            highestCardIdx = getHighestCardIdx(card_2, card_3);

            if (card_1.grab == false) {
                highestCardIdx = getHighestCardIdx(cards[highestCardIdx], card_1);
            }
        }

        console.log("highest wl card: " + cards[highestCardIdx]);

        cards[highestCardIdx].grab = true;

        //final WL threshold check for grabbables
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].grab == false && cards[i].wl > session._wlThresh) {
                cards[i].grab = true;
            }
        }


        // TODO: case no event cards: when all WL are the same, go for highest gen

        // TODO: case when there is an event card but also a high WL card by threshold

    }

    // selector for all messages
    var msgSelector = "ol[class*='scroll']";

    const targetNode = document.querySelector(msgSelector);
 
    // options to observe
    const config = { childList: true };

    // create cooldown object to be used to determine whether to send a request or not
    var cd = new Cooldown();

    // create list of current cards
    var cards: Card[] = [];

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
                let embedGridSelector = `#${chatMsgId} > div > div[id*='message-accessories'] > article > div > div`;
                let embedGridElement = document.querySelector(embedGridSelector);
                let embedGridTitle; // title of grid
                let embedGridFieldsElement; // grid for drops
                let embedGridDescriptionElement; // grid for lookups

                console.log("grid element: " + embedGridElement);

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

                            console.log("embed grid element: " + embedGridElement);

                            embedGridTitle = getEmbedGridTitle(embedGridSelector);
                            embedGridFieldsElement = getEmbedGridFieldsElement(embedGridSelector);

                            // drop grid with no images
                            if (embedGridTitle.includes("DROP")) {

                                // testing
                                console.log("drop with no images detected");

                                if (embedGridFieldsElement) {
                                    gridCards = embedGridFieldsElement.children; // 3 given cards

                                    // populate the card stats
                                    setCardStats(gridCards);

                                }


                            }
                        }

                        // needs else case so both drop cases dont get executed
                        // for regular image card drops
                        else {
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

                    } 

                // for subsequent messages of the same user
                } else if (!dataCustomId && !authorName && msgContent) {

                    if (msgContent.includes(`@${session._user.name} took`)
                        || msgContent.includes(`@${session._user.name} picked`)) {
                        console.log(msgContent);

                        cd.startCooldown(timer._m_pickCd);
                    }

                // for embed grids with no message content; character lookups
                } else if (authorName === "SOFI" && !msgContent) {

                    if (embedGridElement) {
                        embedGridTitle = getEmbedGridTitle(embedGridSelector);
                        embedGridDescriptionElement = getEmbedGridDescriptionElement(embedGridSelector);

                        // check for single character lookup
                        if (embedGridTitle.toLowerCase().trim() === "lookup") {

                            // testing
                            console.log("single lookup detected");

                            let wl = getLookupWL(embedGridDescriptionElement);

                            cards[cardIndex].wl = wl;

                        // check for multiple character lookup
                        } else if (embedGridTitle.includes("characters")) {

                            // testing
                            console.log("multiple character lookup detected");

                            let wl = getCharactersLookupWL(embedGridDescriptionElement);

                            // if card and wl exists, populate
                            if (isNaN(wl)) {
                                cards[cardIndex].wl = wl;
                            } else {
                                cards[cardIndex].wl = -1;
                            }

                        }

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