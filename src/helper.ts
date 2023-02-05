import { Page, PuppeteerLaunchOptions } from 'puppeteer';
var read = require("read")

/**
 * format welcome message
 * */
export function loadScreen(): void {
    console.log();
    console.log("-==-==-==-==-==-==-==-==-==-");
    console.log();
    console.log("-==-  loading autodrop  -==-");
    console.log();
    console.log("-==-==-==-==-==-==-==-==-==-");
    console.log();
    console.log();
}

/**
 * format for terminal messages
 * */
export function echo(message: string): void {
    console.log(`### ${message}`);
}

/** 
 *  remove escape characters from string 
 * */
export function removeEscapeChars(str: string): string {
    return str.replace(/\\"/g, '"');
}

/**
 * sleep for a given time
 * */
export function sleep(ms: number): Promise<unknown> {
    return new Promise((res) => {
        setTimeout(res, ms);
    });
}

/**
 * get user input using the read library
 * */
export async function getInput(subject: string, hide: boolean): Promise<string> {
    try {
        const result = await read({
            prompt: `> ${subject}: `,
            silent: hide,
            replace: "*"
        });

        return result;

    } catch (er) {
        throw new Error("invalid input!");
    }
}

/**
 * checks if the given number value is within range of 0 to the limit
 * */
export function isInRange(value: number, limit: number): boolean {

    if (value >= 0 && value <= limit) {
        return true;
    }

    return false;
}

/**
 * clicks a button, given the page and selector name
 * */
export async function clickButton(page: Page, selector: string): Promise<void> {
    await page.evaluate((selector: string) => {
        let element = window.document.querySelector(selector);

        if (!(element instanceof HTMLElement)) {
            throw new Error("-- unable to click the button! -- ");
        }

        element.click();

    }, selector);
}

/**
 * get random number from 0 to max to choose index of card
 * from mdm webdocs
 * */
export function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

/**
 * generate random nonce
 * use first 7 digits of message_id and append the next 12 digits
 * */
export function getRandomNonce(messageId: string) {
    let result = "";
    let charPool = "0123456789";
    let charPoolLength = charPool.length;
    let nonceLength = 12;

    for (let i = 0; i < nonceLength; i++) {
        result += charPool.charAt(Math.floor(Math.random() * charPoolLength));
    }

    return messageId.substring(0, 6) + result;
}

export function getIdAtIndex(element: string, index: number): string {
    return element.split("-")[index];
}

/**
 * prompts user to set the options, given a list
 * will work as long as objects in objList have a "name" property
 * */
export async function optionSelect(objList: any[], name: string): Promise<any> {
    let input: Promise<string>;
    let inputOption: number;
    let option: number = 0;

    console.log();
    echo(`select ${name}: `);

    objList.forEach(obj => {
        console.log(`[${option}]: ${obj.name}`);
        option++;
    });

    input = getInput(name, false);
    inputOption = parseInt(await input);

    if (isInRange(inputOption, objList.length - 1)) {
        return objList[inputOption];
    }

    throw new Error(`-- invalid ${name}! exiting... --`);
}

/** 
 *  prompts user to select the channel, given a guild
 * */
export async function channelSelect(guild: Guild): Promise<any> {
    let input: Promise<string>;
    let inputOption: number;
    let option: number = 0;
    let channelList: Channel[] = guild.channelList;

    console.log();
    echo("select channel: ");

    // iterate through guild.channelList
    channelList.forEach(channel => {
        console.log(`[${option}]: ${guild.name}/${channel.name}`);
        option++;
    });

    input = getInput("channel", false);
    inputOption = parseInt(await input);

    if (isInRange(inputOption, channelList.length - 1)) {
        return channelList[inputOption];
    }

    throw new Error("-- invalid channel! exiting... --");
}

/**
 * defaults to linux launch options; remove properties and set headless if os is windows
 * check constants.ts for OS ids
 * */
export function getLaunchOptions(osId: number): PuppeteerLaunchOptions {
    let options : PuppeteerLaunchOptions = {
        headless: true, // default = true, doesnt show browser
        defaultViewport: null, // automatic window dimentions
        executablePath: "/usr/bin/chromium-browser", // linux
        args: ["--no-sandbox", "--disable-setuid-sandbox"] // linux
        // userDataDir: "../tmp" // cache folder
    };

    if (osId === 1) {
        options.headless = false;
        delete options.executablePath;
        delete options.args; 
    }

    return options;
}
