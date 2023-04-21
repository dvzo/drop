export class SuperProperties {
    _os: string = "Windows";
    _browser: string = "Chrome";
    _device: string = "";
    _system_locale: string = "en-US";
    _browser_user_agent: string = ""; // TODO: needs to be populated
    _broswer_version: string = ""; // TODO: needs to be populated
    _os_version: string = "10"; // will change with new windows versions?
    _referrer: string = "https://www.google.com/"; // optional
    _referring_domain: string = "www.google.com";  // optional
    _search_engine: string = "google"; // optional 
    _referrer_current: string = ""; // optional
    _referring_domain_current: string = ""; // optional
    _release_channel: string = "stable";
    _client_build_number: number = 191026; // TODO: does this change?
    _client_event_source: any = null;
    _design_id: number = 0;
}