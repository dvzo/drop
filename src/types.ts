/** selectors; prefixed S_ */
interface S_Login {
    "userNameInput": string,
    "pwInput": string,
    "splashLoginButton": string,
    "formLoginButton": string,
    "tfaInput": string,
    "tfaLoginButton": string,
    "homeLogo": string
}

interface S_Message {
    "slate": string,
    "messages": string
}

/** os interface */
interface OS {
    "id": number,
    "name": string
}

/** user interface; T for temporary properties */
interface User {
    "id": number,
    "name": string,
    "email": string,
    "tfa": boolean,
    "T_AUTH_ID": string,
    "T_SUPER": string
}

/** guild interface; contains channels list */
interface Guild {
    "id": string,
    "name": string,
    "channelList": Channel[]
}

/** channel interface; will be inccluded in Guild.channelList */
interface Channel {
    "id": string,
    "name": string
}

/** interval interface for loop timings in ms of sending messages */
interface Interval {
    "cooldown": number,
    "buffer": number
}
