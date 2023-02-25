'use strict';

import * as puppeteer from 'puppeteer';
import { loadScreen, optionSelect, channelSelect, getLaunchOptions, echo } from './helper';
import { Session } from './session';
import { Timer } from './timer';
import { DEBUG, OS_LIST, U_LIST, G_LIST, APP_ID, REQUEST_URL, getReferUrl, SEND_INTERVAL, getMsgUrl, getHeader, LEADER_TIMEOUT, FOLLOWER_TIMEOUT, DELAY, PICK_INTERVAL, PICK_CD, CMD_CD, WL_THRESH, TIMEOUT_MULT } from './declare/constants';
import { injectMutator } from './observer';
import { sendMsg } from './message';
import { splash, login, tfa, dashboard, grandLine } from './sail';
import { msgSelector } from './declare/selectors';


/**
 * travel to the grand line!
 */
(async () => {
    loadScreen();

    // create session object
    let session = new Session();

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
    session.header = getHeader(session.user);
    session.wlThresh = WL_THRESH;

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

    // inject mutator
    await page.evaluate(injectMutator, DEBUG, APP_ID, session, timer, msgSelector.messages)
        .then(() => echo("stealing treasure!"));

    // sending initial message
    if (!DEBUG) {
        await sendMsg(session, "sd");
        let treasure = 0;

        var interval = setInterval(() => {
            sendMsg(session, "sd").then(() => echo(`grabbing treasure #${treasure}`));
            treasure++;
        }, SEND_INTERVAL);
    }

    // await browser.close();
})();
