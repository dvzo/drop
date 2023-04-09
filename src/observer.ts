import { Page } from 'puppeteer';
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
        private _idx!: number; // 0 - 2
        private _gen!: number;
        private _wl!: number;
        private _name!: string;
        private _series!: string;
        private _grab: boolean = false; // false by default
        private _element!: string;

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

        public get element(): string {
            return this._element;
        }

        public set element(element: string) {
            this._element = element;
        }
    }

    /**
     * card element object to hold all element emoji strings
     * alt=":woodw:" arialabel=":woodw:"
        - wood: ":woodw:"
        - wind: ":windw:"
        - void: ":voidw:"
        - ice: ":iceew:"
        - metal: ":metalw:"
        - light: ":lightw:"
        - fire: ":firew:"
        - earth: ":earthw:" 
     */
    enum CardElement {
        Earth = "earth",
        Fire = "fire",
        Ice = "ice",
        Light = "light",
        Metal = "metal",
        Void = "void",
        Wind = "wind",
        Wood = "wood"
    }

    /** globals */
    var cardIndex: number = 0; // global card index to keep track of card array
    var subRequest: boolean = false; // modifier for subsequent grab requests
    var eventCardExists: boolean = false; // check if event card exists
    var priorityElement_1: string = CardElement.Light.toString(); // prioritize elements if cards do not meet wl minimum
    var priorityElement_2: string = CardElement.Fire.toString();
    var priorityElement_3: string = CardElement.Wind.toString();

    /**
     * sleep function
     * */
    function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * from helpers 
     * */
    function getIdAtIndex(element: string, index: number): string {
        return element.split("-")[index];
    }

    /**
     * from helpers
     */
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
     * generate body for random request
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
     * generate body for single request
     */
    function getSingleBody(msgAccessoriesId: string, dataCustomId: string, nonce: string, cardPick: number): string {
        let customId = `drop_${dataCustomId}_${cardPick}`;

        if (subRequest) {
            nonce = getRandomNonce(msgAccessoriesId);
        }

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
    function createCard(cardDescription: string, cardElement: string | null, idx: number): Card {
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
        if (gen[0].toLowerCase().includes("event") || gen[0].toLowerCase().includes("rose")) {

            if (gen[0].toLowerCase().includes("event")) {
                eventCardExists = true;
            } else {
                eventCardExists = false;
            }

            console.log("event card! ");
            card.gen = 0;
            card.grab = true;
        } else {
            card.gen = parseInt(gen[1]);

            console.log("non event card! "); 
            card.grab = false;
        }

        // [gen], [name], [series]
        card.name = description[1];
        card.series = description[2];

        card.element = cardElement ? cardElement : "";

        // clip appended '-' for name and series if they were shortened
        if (card.name[card.name.length - 1] == '-') {
            card.name = card.name.slice(0, -1);
        }

        if (card.series[card.series.length - 1] == '-') {
            card.series = card.series.slice(0, -1);
        }

        console.log(`--- CARD ${card.idx} INFO ---`);
        console.log("element:" + card.element);
        console.log("gen: " + card.gen);
        console.log("name: " + card.name);
        console.log("series: " + card.series);
        console.log(`------`);

        return card;
    }

    /**
     * get element of a card given its index and collection
     */
    function getCardElement(gridCards: HTMLElement): string | null {
        let fieldName: ChildNode | null = gridCards.firstChild;
        let emojiContainer: ChildNode | null;
        let img: ChildNode | null;
        let cardElement: string | null;

        if (fieldName != null) {
            emojiContainer = fieldName.firstChild;

            if (emojiContainer != null) {
                img = emojiContainer.firstChild;

                if (img != null) {
                    cardElement = (img as Element).getAttribute("alt"); // i.e. ":iceew:"

                    if (cardElement != null) {

                        if (cardElement.includes(CardElement.Earth)) {
                            return CardElement.Earth.toString();

                        } else if (cardElement.includes(CardElement.Fire)) {
                            return CardElement.Fire.toString();

                        } else if (cardElement.includes(CardElement.Ice)) {
                            return CardElement.Ice.toString();

                        } else if (cardElement.includes(CardElement.Light)) {
                            return CardElement.Light.toString();

                        } else if (cardElement.includes(CardElement.Metal)) {
                            return CardElement.Metal.toString();

                        } else if (cardElement.includes(CardElement.Void)) {
                            return CardElement.Void.toString();

                        } else if (cardElement.includes(CardElement.Wind)) {
                            return CardElement.Wind.toString();

                        } else if (cardElement.includes(CardElement.Wood)) {
                            return CardElement.Wood.toString();
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * return true if current drop has a card past the session wl threshold
     * first criteria to check if an event is happening
     */
    function dropHasWLThresholdCard(): boolean {
        let hasWLThresholdCard = false;

        for (let i = 0; i < cards.length; i++) {

            if (cards[i].wl >= session._wlThresh) {
                hasWLThresholdCard = true;
            }
        }

        return hasWLThresholdCard;
    }

    /**
     * return true if current drop has a card past the wl minimum 
     * first criteria to check when observing a drop
     */
    function dropHasWLMinimum(): boolean {
        let hasWLMinimum = false;

        for (let i = 0; i < cards.length; i++) {

            if (cards[i].wl >= session._wlMin) {
                hasWLMinimum = true;
            }
        }

        return hasWLMinimum;
    }

    /**
     * return true if current drop has a card with a given priority element
     */
    function dropHasPriorityElement(priorityElement: string): boolean {
        let hasPriorityElement = false;

        for (let i = 0; i < cards.length; i++) {

            if (cards[i].element.includes(priorityElement)) {
                hasPriorityElement = true;
            }
        }

        return hasPriorityElement;
    }

    /**
     * return true if current drop has a low gen card
     */
    function dropHasLowGenCard(): boolean {
        let hasLowGenCard = false;

        for (let i = 0; i < cards.length; i++) {

            if (cards[i].gen <= session._lowGen) {
                hasLowGenCard = true;
            }
        }

        return hasLowGenCard;
    }

    /**
     * set card stats in sequential order
     * cant use for loops here as it breaks the async calls
     */
    async function setCardStats(gridCards: HTMLCollection, msgAccessoriesId: string, dataCustomId: string) {
        let cardDescription: string;
        let cardElement: string | null;
        let card;
        let msgBody: string; // body changes for each request
        let nonce = getRandomNonce(msgAccessoriesId); // setting one nonce to be used across multiple requests

        // sleep once the cards have been dropped/appeared
        await sleep(timer._m_cmdCd);

        // first card, get description and element
        cardDescription = (gridCards[cardIndex] as HTMLElement).innerText;
        cardElement = getCardElement(gridCards[cardIndex] as HTMLElement);
        card = createCard(cardDescription, cardElement, cardIndex);
        cards.push(card);

        // only send scl command to check non-event cards
        if (cards[cardIndex].grab == false) {
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
        }

        // cooldown before the next scl command
        await sleep(timer._m_cmdCd);

        // always update global index
        cardIndex++;

        // second card, get description and element
        cardDescription = (gridCards[cardIndex] as HTMLElement).innerText;
        cardElement = getCardElement(gridCards[cardIndex] as HTMLElement);
        card = createCard(cardDescription, cardElement, cardIndex);
        cards.push(card);

        // only send scl command to check non-event cards
        if (cards[cardIndex].grab == false) {
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
        }

        // cooldown before next scl command
        await sleep(timer._m_cmdCd);

        // always update global index
        cardIndex++;

        // third card, get description and element
        cardDescription = (gridCards[cardIndex] as HTMLElement).innerText;
        cardElement = getCardElement(gridCards[cardIndex] as HTMLElement);
        card = createCard(cardDescription, cardElement, cardIndex);
        cards.push(card);

        // only send scl command to check non-event cards
        if (cards[cardIndex].grab == false) {
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
        }

        // final cooldown before sending the request to grab a card
        await sleep(timer._m_cmdCd);

        // logging criteria
        console.log("--- CRITERIA DROPS ---")

        // prioritize event cards
        if (eventCardExists) {
            console.log("- event card exists...");

            // only grab an extra card during an event if a card has a wl >= the wl threshold
            if (dropHasWLThresholdCard()) {
                console.log("- grabbing extra card!");
                setGrabsByWL();
            }

            // check if drops are above the wl minumum
        } else if (dropHasWLMinimum()) {
            console.log("- drop has wl minimum...");
            setGrabsByWL();

            // next, check if drops have low gens
        } else if (dropHasLowGenCard()) {
            console.log("- drop has low gen card...");
            setGrabsByGen();

            // check if drops have the first priority element
        } else if (dropHasPriorityElement(priorityElement_1)) {
            console.log(`- drop has priority element 1: ${priorityElement_1}`);
            setGrabsByElement(priorityElement_1);

            // next, check if drops have the second priority element
        } else if (dropHasPriorityElement(priorityElement_2)) {
            console.log(`- drop has priority element 2: ${priorityElement_2}`);
            setGrabsByElement(priorityElement_2);

            // next, check if drops have the third priority element
        } else if (dropHasPriorityElement(priorityElement_3)) {
            console.log(`- drop has priority element 3: ${priorityElement_3}`);
            setGrabsByElement(priorityElement_3);

            // finally, get the lowest gen available
        } else {
            console.log("- drop has no other criteria, grabbing lowest gen card...");
            setGrabsByGen();

        }

        // make sure nonce is the same for all picks **
        if (cards[0].grab == true) {
            let body = getSingleBody(msgAccessoriesId, dataCustomId, nonce, 0);

            await fetch(session._requestUrl, {
                "headers": session._header,
                "referrer": session._referUrl,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": body,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            });

            // set subsequent request for multiple grabs
            subRequest = true;

            // TODO:
            // first timer doesnt have *2 like the following awaits?
            await sleep(timer._m_cmdCd);
        }

        if (cards[1].grab == true) {
            let body = getSingleBody(msgAccessoriesId, dataCustomId, nonce, 1);

            await fetch(session._requestUrl, {
                "headers": session._header,
                "referrer": session._referUrl,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": body,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            });

            // set subsequent request for multiple grabs
            subRequest = true;

            await sleep(timer._m_cmdCd * 2);
        }

        if (cards[2].grab == true) {
            let body = getSingleBody(msgAccessoriesId, dataCustomId, nonce, 2);

            await fetch(session._requestUrl, {
                "headers": session._header,
                "referrer": session._referUrl,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": body,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            });

            // set subsequent request for multiple grabs
            subRequest = true;

            await sleep(timer._m_cmdCd * 2);
        }

        // if all cards are false, grab a random one
        if (cards[0].grab == false && cards[1].grab == false && cards[2].grab == false) {
            let body = getBody(msgAccessoriesId, dataCustomId);

            console.log("-- all cases were false! grabbing random card! --")

            await fetch(session._requestUrl, {
                "headers": session._header,
                "referrer": session._referUrl,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": body,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            });
        }

        // finally, reset the card index, empty the current card array, and reset subsequent requests
        cardIndex = 0;
        cards.length = 0;
        eventCardExists = false;
        subRequest = false;
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
        let allDescriptionsElement = gridDescription.children; // contains every element innertext in grid
        let allDescriptions = [];

        for (let i = 0; i < allDescriptionsElement.length; i++) {
            allDescriptions.push(allDescriptionsElement[i].innerText.trim());
        }

        // need to loop through all elements, convert it to a string, and store it in descriptions array
        console.log(allDescriptions);

        let character = []; // single array to hold a character's info
        let allCharacters = []; // 2d array to hold all characters, split by 4
        let wl: string = "";

        // keep chopping the description array until empty
        while (allDescriptions.length) {
            character = allDescriptions.splice(0, 4);

            console.log("character: " + character);

            allCharacters.push(character);
        }

        for (let i = 0; i < allCharacters.length; i++) {

            console.log(`current lookup character: ${cards[cardIndex].name}`);

            // TODO: sometimes name or series shouldnt be a full exact match?
            // i.e. names can be cut off from text drop and character lookup
            // if last character of card image text name or series ends in -, remove it, and do a contains?
            // allCharacters will have the longer version of the name, only need to check for cards[cardIndex]

            // match current character by name and series, then get wl
            if (allCharacters[i][2].includes(cards[cardIndex].name)
                && allCharacters[i][3].includes(cards[cardIndex].series)) {

                // get '<3 0' string; grab number
                wl = allCharacters[i][1].split(' ')[1];

                console.log(`regular search lookup WL: ${wl}`);
            }
        }

        return parseInt(wl);
    }

    /**
     * get the index of the lowest gen card
     * also used in else cases for finding highest wl card or priority elements
     */
    function getLowestGenIdx(card_1: Card, card_2: Card): number {
        let lowestGenIdx: number;

        if (card_1.gen < card_2.gen) {
            lowestGenIdx = card_1.idx;

        } else if (card_1.gen > card_2.gen) {
            lowestGenIdx = card_2.idx;

        } else {

            // if both are completely equal, default to 2
            lowestGenIdx = card_2.idx;
        }

        return lowestGenIdx;
    }

    /**
     * get highest card index from two cards that have false grabs
     */
    function getHighestCardIdx(card_1: Card, card_2: Card): number {
        let highestCardIdx: number;

        if (card_1.wl > card_2.wl) {
            highestCardIdx = card_1.idx;
        } else if (card_1.wl < card_2.wl) {
            highestCardIdx = card_2.idx;

        // if tied wishlist, get lowest gen
        } else {
            highestCardIdx = getLowestGenIdx(card_1, card_2);
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

            console.log("card_1: " + card_1.wl + "vs card_2: " + card_2.wl);
            highestCardIdx = getHighestCardIdx(card_1, card_2);

            if (card_3.grab == false) {
                console.log("highestWL: " + cards[highestCardIdx].wl + "vs card_3: " + card_3.wl);
                highestCardIdx = getHighestCardIdx(cards[highestCardIdx], card_3);
            }

        // compare card 1 and 3, then compare to 2
        } else if (card_1.grab == false && card_3.grab == false) {

            console.log("card_1: " + card_1.wl + "vs card_3: " + card_3.wl);
            highestCardIdx = getHighestCardIdx(card_1, card_3);

            if (card_2.grab == false) {
                console.log("highestWL: " + cards[highestCardIdx].wl + "vs card_2: " + card_2.wl);
                highestCardIdx = getHighestCardIdx(cards[highestCardIdx], card_2);
            }

        // compare card 2 and 3, then compare to 1
        } else if (card_2.grab == false && card_3.grab == false) {

            console.log("card_2: " + card_2.wl + "vs card_3: " + card_3.wl);
            highestCardIdx = getHighestCardIdx(card_2, card_3);

            if (card_1.grab == false) {
                console.log("highestWL: " + cards[highestCardIdx].wl + "vs card_1: " + card_1.wl);
                highestCardIdx = getHighestCardIdx(cards[highestCardIdx], card_1);
            }
        }

        console.log("highest wl card: " + cards[highestCardIdx].name);

        cards[highestCardIdx].grab = true;

        // reset favorable card if an event card was chosen and threshold not met
        if (eventCardExists && cards[highestCardIdx].wl < session._wlThresh) {
            cards[highestCardIdx].grab = false;
        }

        //final WL threshold check for grabbables
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].grab == false && cards[i].wl > session._wlThresh) {
                cards[i].grab = true;
            }
        }
    }

    /**
     * get the index of the prioritized element
     * can be used for priority elements given in parameter
     */
    function getPriorityElementIdx(card_1: Card, card_2: Card, priorityElement: string): number {
        let priorityElementIndex: number;

        if (card_1.element.includes(priorityElement) && !card_2.element.includes(priorityElement)) {
            priorityElementIndex = card_1.idx;
        } else if (card_2.element.includes(priorityElement) && !card_1.element.includes(priorityElement)) {
            priorityElementIndex = card_2.idx;

        // if both cards are of priority, grab the lowest gen
        } else {
            priorityElementIndex = getLowestGenIdx(card_1, card_2);
        }

        return priorityElementIndex;
    }

    /**
     * check cards if they have the priority element, and set their grabs
     */
    function setGrabsByElement(priorityElement: string): void {
        let priorityElementIndex: number = 0; // default priority element index
        let card_1 = cards[0];
        let card_2 = cards[1];
        let card_3 = cards[2];

        // compare cards 1 and 2, and then 3
        if (card_1.grab == false && card_2.grab == false) {
            console.log(`card 1 element: ${card_1.element}`);
            console.log(`card 2 element: ${card_2.element}`);

            priorityElementIndex = getPriorityElementIdx(card_1, card_2, priorityElement);

            if (card_3.grab == false) {
                console.log(`card ${priorityElementIndex + 1} element: ${cards[priorityElementIndex].element}`);
                console.log(`card 3 element: ${card_3.element}`);

                priorityElementIndex = getPriorityElementIdx(cards[priorityElementIndex], card_3, priorityElement);
            }

        // compare cards 1 and 3, and then 2
        } else if (card_1.grab == false && card_3.grab == false) {
            console.log(`card 1 element: ${card_1.element}`);
            console.log(`card 3 element: ${card_3.element}`);

            priorityElementIndex = getPriorityElementIdx(card_1, card_3, priorityElement);

            if (card_2.grab == false) {
                console.log(`card ${priorityElementIndex + 1} element: ${cards[priorityElementIndex].element}`);
                console.log(`card 2 element: ${card_2.element}`);

                priorityElementIndex = getPriorityElementIdx(cards[priorityElementIndex], card_2, priorityElement);
            }

        // compare cards 2 and 3, and then 1
        } else if (card_2.grab == false && card_3.grab == false) {
            console.log(`card 2 element: ${card_2.element}`);
            console.log(`card 3 element: ${card_3.element}`);

            priorityElementIndex = getPriorityElementIdx(card_2, card_3, priorityElement);

            if (card_1.grab == false) {
                console.log(`card ${priorityElementIndex + 1} element: ${cards[priorityElementIndex].element}`);
                console.log(`card 1 element: ${card_1.element}`);

                priorityElementIndex = getPriorityElementIdx(cards[priorityElementIndex], card_1, priorityElement);
            }
        }

        console.log("priority card name: " + cards[priorityElementIndex].name);
        console.log("priority card element: " + cards[priorityElementIndex].element);

        cards[priorityElementIndex].grab = true;

        // reset favorable card if an event card was chosen and threshold not met
        if (eventCardExists && cards[highestCardIdx].wl < session._wlThresh) {
            cards[highestCardIdx].grab = false;
        }
    }

    /**
     * set grabs by lowest gen number
     */
    function setGrabsByGen(): void {
        let lowestGenIndex: number = 0; // default lowest gen index
        let card_1 = cards[0];
        let card_2 = cards[1];
        let card_3 = cards[2];

        // compare card 1 and 2, and then 3
        if (card_1.grab == false && card_2.grab == false) {
            console.log(`card 1 gen: ${card_1.gen}`);
            console.log(`card 2 gen: ${card_2.gen}`);

            lowestGenIndex = getLowestGenIdx(card_1, card_2);

            if (card_3.grab == false) {
                console.log(`card ${lowestGenIndex + 1} gen: ${cards[lowestGenIndex].gen}`);
                console.log(`card 3 gen: ${card_3.gen}`);

                lowestGenIndex = getLowestGenIdx(cards[lowestGenIndex], card_3);
            }

        // compare card 1 and 3, and then 2
        } else if (card_1.grab == false && card_3.grab == false) {
            console.log(`card 1 gen: ${card_1.gen}`);
            console.log(`card 3 gen: ${card_3.gen}`);

            lowestGenIndex = getLowestGenIdx(card_1, card_3);

            if (card_2.grab == false) {
                console.log(`card ${lowestGenIndex + 1} gen: ${cards[lowestGenIndex].gen}`);
                console.log(`card 2 gen: ${card_2.gen}`);

                lowestGenIndex = getLowestGenIdx(cards[lowestGenIndex], card_2);
            }

        // compare card 2 and 3, and then 1
        } else if (card_2.grab == false && card_3.grab == false) {
            console.log(`card 2 gen: ${card_2.gen}`);
            console.log(`card 3 gen: ${card_3.gen}`);

            lowestGenIndex = getLowestGenIdx(card_2, card_3);

            if (card_1.grab == false) {
                console.log(`card ${lowestGenIndex + 1} gen: ${cards[lowestGenIndex].gen}`);
                console.log(`card 1 gen: ${card_1.gen}`);

                lowestGenIndex = getLowestGenIdx(cards[lowestGenIndex], card_1);
            }
        }

        console.log("low gen card name: " + cards[lowestGenIndex].name);
        console.log("low gen card number: " + cards[lowestGenIndex].gen);

        cards[lowestGenIndex].grab = true;
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

                                    // empty card array here in case lookups are performed before drops
                                    cards.length = 0;

                                    // populate the card stats
                                    setCardStats(gridCards, msgAccessoriesId, dataCustomId);
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

                    // removing check for 'user picked' since multiple picks are allowed for val event
                    if (msgContent.includes(`@${session._user.name} took`)) {
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
                        } else if (embedGridTitle.toLowerCase().includes("characters")) {

                            // testing
                            console.log("multiple character lookup detected");

                            let wl = getCharactersLookupWL(embedGridDescriptionElement);

                            // if card is not found, set wl to -1; else wl exists, populate
                            if (isNaN(wl)) {
                                cards[cardIndex].wl = 0;
                            } else {
                                cards[cardIndex].wl = wl;
                            }

                            console.log(`character lookup card: ${cards[cardIndex].name}, ${cards[cardIndex].wl}`)
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