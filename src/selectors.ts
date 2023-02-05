/**
 * selectors for sailing the login page
 * wildcards for robustness :)
 * */
export var loginSelector: S_Login = {
    "userNameInput": "#app-mount > div[class*='app'] > div > div > div > div > div > div > form > div[class*='center'] > div > div[class*='mainLogin'] > div[class*='block'] > div > div > div[class*='inputWrapper'] > input",
    "pwInput": "#app-mount > div[class*='app'] > div > div > div > div > div > div > form > div[class*='center'] > div > div[class*='mainLogin'] > div[class*='block'] > div:nth-child(2) > div > input",
    "splashLoginButton": "a[href*='login']",
    "formLoginButton": "button[type*='submit']",
    "tfaInput": "#app-mount > div[class*='app'] > div > div > div > div > div > form > div[class*='center'] > div[class*='block'] > div > div > input",
    "tfaLoginButton": "#app-mount > div[class*='app'] > div > div > div > div > div > form > div[class*='center'] > div[class*='block'] > button[type*='submit']",
    "homeLogo": "svg[class*='home']"
};

/**
 * selectors for messaging
 * */
export var msgSelector: S_Message = {
    "slate": "#app-mount > div.appAsidePanelWrapper-ev4hlp > div > div.app-3xd6d0 > div > div.layers-OrUESM.layers-1YQhyW > div > div.container-1eFtFS > div > div > div.chat-2ZfjoI > div.content-1jQy2l > main > form > div > div > div > div.textArea-2CLwUE.textAreaSlate-9-y-k2.slateContainer-3x9zil > div > div.markup-eYLPri.editor-H2NA06.slateTextArea-27tjG0.fontSize16Padding-XoMpjI",
    "messages": "#app-mount > div.appDevToolsWrapper-1QxdQf > div > div.app-3xd6d0 > div > div.layers-OrUESM.layers-1YQhyW > div > div.container-1eFtFS > div > div.content-1SgpWY > div.chat-2ZfjoI > div.content-1jQy2l > main > div.messagesWrapper-RpOMA3.group-spacing-16 > div > div > ol"
}
