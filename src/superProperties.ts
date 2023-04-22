import { SUPER_PROPERTIES } from './declare/constants';

export class SuperProperties {
    _os: string = SUPER_PROPERTIES._os;
    _browser: string = SUPER_PROPERTIES._browser;
    _device: string = SUPER_PROPERTIES._device;
    _system_locale: string = SUPER_PROPERTIES._system_locale;
    _browser_user_agent: string = SUPER_PROPERTIES._browser_user_agent; // userAgent will always be refreshed before every request
    _browser_version: string = SUPER_PROPERTIES._broswer_version; // browserVersion will always be refreshed before every request
    _os_version: string = SUPER_PROPERTIES._os_version;
    _referrer: string = SUPER_PROPERTIES._referrer;
    _referring_domain: string = SUPER_PROPERTIES._referring_domain;
    _search_engine: string = SUPER_PROPERTIES._search_engine;
    _referrer_current: string = SUPER_PROPERTIES._referrer_current;
    _referring_domain_current: string = SUPER_PROPERTIES._referring_domain_current;
    _release_channel: string = SUPER_PROPERTIES._release_channel;
    _client_build_number: number = SUPER_PROPERTIES._client_build_number;
    _client_event_source: any = SUPER_PROPERTIES._client_event_source;
    _design_id: number = SUPER_PROPERTIES._design_id;

    get os(): string {
        return this._os;
    }

    set os(os: string) {
        this._os = os;
    }

    get browser(): string {
        return this._browser;
    }

    set browser(browser: string) {
        this._browser = browser;
    }

    get device(): string {
        return this._device;
    }

    set device(device: string) {
        this._device = device;
    }

    get system_locale(): string {
        return this._system_locale;
    }

    set system_locale(system_locale: string) {
        this._system_locale = system_locale;
    }

    get browser_user_agent(): string {
        return this._browser_user_agent;
    }

    set browser_user_agent(browser_user_agent: string) {
        this._browser_user_agent = browser_user_agent;
    }

    get browser_version(): string {
        return this._browser_version;
    }

    set browser_version(browser_version: string) {
        this._browser_version = browser_version;
    }

    get os_version(): string {
        return this._os_version;
    }

    set os_version(os_version: string) {
        this._os_version = os_version;
    }

    get referrer(): string {
        return this._referrer;
    }

    set referrer(referrer: string) {
        this._referrer = referrer;
    }

    get referring_domain(): string {
        return this._referring_domain;
    }

    set referring_domain(referring_domain: string) {
        this._referring_domain = referring_domain;
    }

    get search_engine(): string {
        return this._search_engine;
    }

    set search_engine(search_engine: string) {
        this._search_engine = search_engine;
    }

    get referrer_current(): string {
        return this._referrer_current;
    }

    set referrer_current(referrer_current: string) {
        this._referrer_current = referrer_current;
    }

    get referring_domain_current(): string {
        return this._referring_domain_current;
    }

    set referring_domain_current(referring_domain_current: string) {
        this._referring_domain_current = referring_domain_current;
    }

    get release_channel(): string {
        return this._release_channel;
    }

    set release_channel(release_channel: string) {
        this._release_channel = release_channel;
    }

    get client_build_number(): number {
        return this._client_build_number;
    }

    set client_build_number(client_build_number: number) {
        this._client_build_number = client_build_number;
    }

    get client_event_source(): any {
        return this._client_event_source;
    }

    set client_event_source(client_event_source: any) {
        this._client_event_source = client_event_source;
    }

    get design_id(): number {
        return this._design_id;
    }

    set design_id(design_id: number) {
        this._design_id = design_id;
    }
}