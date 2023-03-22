import { Page } from 'puppeteer';
import { Session } from './session';
import { Timer } from './timer';
import { echo, clickButton, getInput, sleep } from './helper';
import { loginSelector, msgSelector } from './declare/selectors';

/**
 * sail the splash page and click the login button
 */
export async function splash(page: Page, timer: Timer): Promise<void> {
    await page.waitForSelector(loginSelector.splashLoginButton, { timeout: timer._leader })
        .then(() => clickButton(page, loginSelector.splashLoginButton),
            () => { throw new Error("unable to sail the splash page :("); })
        .then(() => echo("sailed pass the splash page!"));
}

/**
 * sail the login page, type the user and pw, and click the login button
 * */
export async function login(page: Page, timer: Timer, user: User): Promise<void> {
    await page.waitForSelector(loginSelector.userNameInput, { timeout: 0 })
        .then(() => getInput(`${user.name} email`, false),
            () => { throw new Error("unable to sail the login page :("); })
        .then((email) => {

            // check if email matches the selected user
            if (!email.includes(user.email)) {
                throw new Error("invalid email for user!");
            }

            page.type(loginSelector.userNameInput, email, { delay: timer._delay });

            return email;
        })
        .then((email) => sleep(email.length * (timer._delay * 2)));

    await getInput(`${user.name} pw`, true)
        .then((pw) => page.type(loginSelector.pwInput, pw , { delay: timer._delay }));

    await clickButton(page, loginSelector.formLoginButton);
}

/**
 * sail the 2fa page; input 2fa and click the 2fa login button
 * */
export async function tfa(page: Page, session: Session, timer: Timer): Promise<void> {

    if (!session._user.tfa) {
        return;
    }

    await page.waitForSelector(loginSelector.tfaInput, { timeout: timer._leader })
        .then(() => getInput("2FA", false),
            () => { throw new Error("unable to sail the tfa page :("); })
        .then((tfa) => page.type(loginSelector.tfaInput, tfa, { delay: timer._delay }))

    await clickButton(page, loginSelector.tfaLoginButton);
}

/**
 * sail the dashboard page (whirlpool), and go to the selected channel (the final stretch)
 * */
export async function dashboard(page: Page, session: Session, timer: Timer): Promise<void> {
    await page.waitForSelector(loginSelector.homeLogo, { timeout: 0 })
        .then(() => echo("sailed pass the whirlpool!"),
            () => { throw new Error("unable to sail pass the whirlpool :("); });

    await page.goto(session._referUrl, { timeout: 0 })
        .then(() => echo("sailed to the final stretch!"),
            () => { throw new Error("unable to sail the final stretch :("); })
}

/**
 * sail to the final destination, the channel, the grand line!
 * */
export async function grandLine(page: Page, timer: Timer) {
    // await page.waitForSelector(msgSelector.slate, { timeout: timer._leader })
    // TESTING: removing timeout for grandline
    await page.waitForSelector(msgSelector.slate, { timeout: 0 })
        .then(() => echo("reached the grand line!"),
            () => { throw new Error("unable to reach the grand line! :("); });

}
