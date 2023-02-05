'use strict';

import * as puppeteer from 'puppeteer';
import { loadScreen, optionSelect, channelSelect, getLaunchOptions, echo } from './helper';
import { Session } from './session';
import { Timer } from './timer';
import { OS_LIST, U_LIST, G_LIST, APP_ID, REQUEST_URL, getReferUrl, SEND_INTERVAL, getMsgUrl, getHeader, LEADER_TIMEOUT, FOLLOWER_TIMEOUT, DELAY, TIMEOUT_MULT } from './constants';
import { injectMutator } from './observer';
import { sendMsg } from './message';
import { splash, login, tfa, dashboard, grandLine } from './sail';
import { msgSelector } from './selectors';


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
    //echo("splashed! logging in...");

    // login with credentials
    //await nav.login(page).then(() => help.log(`login success! navigating to ${channelName}...`));

    // original
    //await nav.login(page, timer, session._user);
    //echo(`logging in ${session._user.name}...`);

    // testing
    await login(page, timer, session._user);

    // testing

    await tfa(page, session, timer);

    await dashboard(page, session, timer);

    // original
    //await nav.tfa(page, timer);
    //echo("2FA success! logging in...");

    //await nav.success(page, timer);
    //echo("login success!");


    //echo(`login success! navigating to ${session._guild.name}/${session._channel.name}...`);

    // navigate to channel
    //await page.goto(`${session.NAV_URL}/${session.CHANNEL_ID}`, { timeout: cs.TIMEOUT.main })
    //    .then(() => {
    //        let seconds: number = cs.TIMEOUT.total / 1000;
    //        help.log(`max time to wait for page to load: ${seconds} seconds `)
    //    })
    //    .catch(() => { throw new Error(help.errorLog("unable to continue")); });

    // testing
    //await page.goto(`${session.NAV_URL}/${session.CHANNEL_ID}`, { timeout: cs.TIMEOUT.main })
    //await page.goto(session._referUrl, { timeout: timer._leader })
    //    .then(
    //        (success) => {
    //            let seconds: number = timer._total / 1000;
    //            echo(`max time to wait for page to load: ${seconds} seconds `)
    //        },
    //        (fail) => {
    //            throw new Error("could not find url");

    //        }
    //    )
    //    .catch(() => { throw new Error(help.errorLog("unable to continue")); });

    // await grandLine(page, timer);

    // working!
    // pi: trying con.TIMEOUT.total here
    //await page.waitForSelector(select.msg.slate, { timeout: 5000 });

    // testing
    // grand line is when you reached the final destination and see the slate container
    // await grandLine(page, timer)
    //await page.waitForSelector(msgSelector.slate, { timeout: timer._leader });

    await grandLine(page, timer);

    // inject mutator
    //echo("injecting mutator");

    // testing
    //await page.evaluate(injectMutator, session._guild.id, APP_ID, msgSelector.messages, session._id,
    //    session._channel.id, session._requestUrl, session._header, session._referUrl)
    //    .then(() => echo("stealing treasure!"));

    await page.evaluate(injectMutator, APP_ID, session, msgSelector.messages)
        .then(() => echo("stealing treasure!"));

    // sending initial message
    await sendMsg(session, "sd");
    let treasure = 0;

    var interval = setInterval(() => {
        sendMsg(session, "sd").then(() => echo(`grabbing treasure #${treasure}`));
        treasure++;
    }, SEND_INTERVAL);


    // await browser.close();
})();
