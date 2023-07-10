'use strict';

import * as puppeteer from 'puppeteer';
import { loadScreen, debugMessage, optionSelect, channelSelect, getLaunchOptions, echo } from './helper';
import { Session } from './session';
import { Timer } from './timer';
import { DEBUG, OS_LIST, U_LIST, G_LIST, APP_ID, REQUEST_URL, getReferUrl, SEND_INTERVAL, getMsgUrl, getHeader, LEADER_TIMEOUT, FOLLOWER_TIMEOUT, DELAY, PICK_INTERVAL, PICK_CD, CMD_CD, WL_THRESH, WL_MIN, TIMEOUT_MULT, LOW_GEN } from './declare/constants';
import { getStop, getUserAgent, getChromeVersion, injectMutator } from './observer';
import { sendMsg } from './message';
import { splash, login, tfa, dashboard, grandLine } from './sail';
import { msgSelector } from './declare/selectors';
import { SuperProperties } from './superProperties';


/**
 * travel to the grand line!
 */
(async () => {
    loadScreen();

    if (DEBUG) {
        debugMessage();
    }

    // create session object
    let session = new Session();
    let superProperties = new SuperProperties();

    // create timer object
    let timer = new Timer();
    timer.leader = LEADER_TIMEOUT;
    timer.follower = FOLLOWER_TIMEOUT;
    timer.delay = DELAY;
    timer._m_pickInterval = PICK_INTERVAL;
    timer._m_pickCd = PICK_CD;
    timer._m_cmdCd = CMD_CD;

    // select os, user, guild, and channel
    let os = await optionSelect(OS_LIST, "os");
    let user = await optionSelect(U_LIST, "user");
    let guild = await optionSelect(G_LIST, "guild");
    let channel = await channelSelect(guild);

    session.os = os;
    session.user = user;
    session.guild = guild;
    session.channel = channel;
    session.requestUrl = REQUEST_URL;
    session.referUrl = getReferUrl(session.guild, session.channel);
    session.msgUrl = getMsgUrl(channel);
    session.wlThresh = WL_THRESH;
    session.wlMin = WL_MIN;
    session.lowGen = LOW_GEN;

    // adjust timers for OS
    if (session._os.id === 0) {
        timer.leader *= TIMEOUT_MULT;
        timer.follower *= TIMEOUT_MULT;
    }

    let launchOptions = getLaunchOptions(session._os.id);

    // launch the browser
    const browser = await puppeteer.launch(launchOptions); 
    echo("browser launched...");

    // create a new page/tab
    const page = await browser.newPage();
    await page.goto(session._baseUrl);

    await splash(page, timer);

    await login(page, timer, session._user);

    await tfa(page, session, timer);

    await dashboard(page, session, timer);

    await grandLine(page, timer);

    // after final page has been reached, get new browser info before every request
    // update super properties
    superProperties.browser_user_agent = await page.evaluate(getUserAgent);
    superProperties.browser_version = await page.evaluate(getChromeVersion);

    // set headers with updated superProperties
    session.header = getHeader(session.user, superProperties);

    // inject mutator
    await page.evaluate(injectMutator, DEBUG, APP_ID, session, superProperties, timer, msgSelector.messages)
        .then(() => echo("stealing treasure!"));

    // sending initial message
    if (!DEBUG) {
        await sendMsg(session, "sdn");
    }

    // check every 3 minutes whether or not "dns" was called from the embedded browser
    var interval = setInterval(async() => {
        let stopLoop = await page.evaluate(getStop);

        if (stopLoop) {
            await browser.close();
            clearInterval(interval);
            echo("the sail has ended! the end :)");

        } else {
            echo(`sailing the seas...`);
        }
    }, 180000);
})();
