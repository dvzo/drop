import { SESSION_ID, APP_ID, BASE_URL } from './declare/constants';

export class Session {
    _id = SESSION_ID;
    _appId = APP_ID;
    _baseUrl = BASE_URL;
    _requestUrl!: string;
    _referUrl!: string;
    _msgUrl!: string;
    // _header!: HeadersInit; // TODO: trying object
    _header!: any;
    _os!: OS;
    _user!: User;
    _guild!: Guild;
    _channel!: Channel;
    _wlThresh!: number;
    _wlMin!: number;
    _lowGen!: number;

    get os(): OS {
        return this._os;
    }

    set os(newOs: OS) {
        this._os = newOs;
    }

    get user(): User {
        return this._user;
    }

    set user(newUser: User) {
        this._user = newUser;
    }

    get guild(): Guild {
        return this._guild;
    }

    set guild(newGuild: Guild) {
        this._guild = newGuild;
    }

    get channel(): Channel {
        return this._channel;
    }

    set channel(newChannel: Channel) {
        this._channel = newChannel;
    }

    get requestUrl(): string {
        return this._requestUrl;
    }

    set requestUrl(newRequestUrl: string) {
        this._requestUrl = newRequestUrl;
    }

    get referUrl(): string {
        return this._referUrl;
    }

    set referUrl(newReferUrl: string) {
        this._referUrl = newReferUrl;
    }

    get msgUrl(): string {
        return this._msgUrl;
    }

    set msgUrl(newMsgUrl: string) {
        this._msgUrl = newMsgUrl;
    }

    // get header(): HeadersInit {
    //     return this._header;
    // }

    // set header(newHeader: HeadersInit) {
    //     this._header = newHeader;
    // }

    // TODO: trying object
    get header(): any {
        return this._header;
    }

    set header(newHeader: any) {
        this._header = newHeader;
    }

    get wlThresh(): number {
        return this._wlThresh;
    }

    set wlThresh(wlThresh: number) {
        this._wlThresh = wlThresh;
    }

    get wlMin(): number {
        return this._wlMin;
    }

    set wlMin(wlMin: number) {
        this._wlMin = wlMin;
    }

    get lowGen(): number {
        return this._lowGen;
    }

    set lowGen(lowGen: number) {
        this._lowGen = lowGen;
    }
}
