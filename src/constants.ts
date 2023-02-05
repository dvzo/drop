import * as rdmstr from 'randomstring';


/** generate single session id */
export const SESSION_ID: string = rdmstr.generate({ charset: "hex" });

/** application id */
export const APP_ID: string = "853629533855809596";

/** base url */
export const BASE_URL: string = "https://discord.com";

/** api version used in request url */
export const API_VERSION: string = "api/v9";

/** abstracting action call for requestUrl in app.ts */
export const I_ACTION: string = "interactions";

/** request url */
export const REQUEST_URL: string = `${BASE_URL}/${API_VERSION}/${I_ACTION}`;

/** universal browser */
export const BROWSER = "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"";

/** returns refer url for request */
export function getReferUrl(guild: Guild, channel: Channel) {
    return `${BASE_URL}/channels/${guild.id}/${channel.id}`;
}

/** message url to send get and post requests */
export function getMsgUrl(channel: Channel) {
    return `${BASE_URL}/${API_VERSION}/channels/${channel.id}/messages`;
}

/**
 * returns the header object to be used in the request
 * needs to be abstracted; super seeems like a discord only thing
 * */
export function getHeader(user: User): HeadersInit {
    return {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "authorization": user.T_AUTH_ID,
        "content-type": "application/json",
        "sec-ch-ua": BROWSER,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-debug-options": "bugReporterEnabled",
        "x-discord-locale": "en-US",
        "x-super-properties": user.T_SUPER
    }
}

/** linux os */
const OS_LIN: OS = {
    "id": 0,
    "name": "linux"
}

/** windows os*/
const OS_WIN: OS = {
    "id": 1,
    "name": "windows"
}

/** os list */
export const OS_LIST: OS[] = [
    OS_LIN,
    OS_WIN
]

/** 
 * user namixpower
 * id needs to match index in helper.optionSelect and U_LIST
 * */
const U_NAMI: User = {
    "id": 0,
    "name": "namixpower",
    "email": "nam",
    "tfa": false,
    "T_AUTH_ID": "MTA3MTE1MTMwMTY2NjI5MTg3Mg.GzXJMJ.kGmXcYmq157GXtfWJrrxe4ydsuOxRzTQNaO4kQ",
    "T_SUPER": "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwOS4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTA5LjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjE3MTg0MiwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0"
}

/**
 * user zootrash
 * id needs to match index in helper.optionSelect and U_LIST
 * */
const U_ZOO: User = {
    "id": 1,
    "name": "zootrash",
    "email": "dil",
    "tfa": true,
    "T_AUTH_ID": "MjY2MTEwMDIwMTA0NDg2OTEy.GtgRzj.-DM6rBx-mjScTJPb1Qk0tWRtN9-RRjByamfXVE",
    //"T_SUPER": "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwOS4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTA5LjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiJodHRwczovL3d3dy5nb29nbGUuY29tLyIsInJlZmVycmluZ19kb21haW4iOiJ3d3cuZ29vZ2xlLmNvbSIsInNlYXJjaF9lbmdpbmUiOiJnb29nbGUiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTcxMzk2LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ=="
    "T_SUPER": "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwOS4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTA5LjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiJodHRwczovL3d3dy5nb29nbGUuY29tLyIsInJlZmVycmluZ19kb21haW4iOiJ3d3cuZ29vZ2xlLmNvbSIsInNlYXJjaF9lbmdpbmUiOiJnb29nbGUiLCJyZWZlcnJlcl9jdXJyZW50IjoiaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS8iLCJyZWZlcnJpbmdfZG9tYWluX2N1cnJlbnQiOiJ3d3cuZ29vZ2xlLmNvbSIsInNlYXJjaF9lbmdpbmVfY3VycmVudCI6Imdvb2dsZSIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjE3MTg0MiwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0="
}


/** user list */
export const U_LIST: User[] = [
    U_NAMI,
    U_ZOO,
]

/** the zoo guild */
const G_ZOO: Guild = {
    "id": "492951561140699149",
    "name": "zoo",
    "channelList": [
        {
            "id": "1061459141304012912",
            "name": "construction"
        },
        {
            "id": "1067782496139345990",
            "name": "farm"
        }
    ]
}

/** test zoo guild */
const G_TEST: Guild = {
    "id": "484147042860400666",
    "name": "test",
    "channelList": [
        {
            "id": "484147042860400672",
            "name": "general"
        },
        {
            "id": "1071215541454393345",
            "name": "cards"
        }
    ]
}

/** guild list */
export const G_LIST: Guild[] = [
    G_ZOO,
    G_TEST
]

/** timeout multiplier for linux OS only */
export const TIMEOUT_MULT: number = 3;

/** leader of await statements */
export const LEADER_TIMEOUT: number = 5000;

/** follows leader of await statements */
export const FOLLOWER_TIMEOUT: number = 3000;

/** typing delay time */
export const DELAY: number = 100;

/**
 * interval timer to send message to server
 * default: 480000 = 8 minutes
 * */
export const SEND_INTERVAL: number = 485000;
