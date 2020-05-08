// ==UserScript==
// @name         WhatsAppOffline
// @namespace    https://github.com/ansiwen
// @version      0.1.2
// @description  Disable WhatsApp online and message-read status
// @author       Sven Anderson
// @homepage     https://github.com/ansiwen/userscripts/
// @supportURL   https://github.com/ansiwen/userscripts/issues
// @downloadURL  https://raw.githubusercontent.com/ansiwen/userscripts/master/whatsappoffline.user.js
// @license      AGPL-3.0-or-later; https://www.gnu.org/licenses/agpl-3.0.txt
// @icon         https://web.whatsapp.com/favicon.ico
// @match        https://web.whatsapp.com/
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// ==/UserScript==

(function() {
    'use strict';
    var objDefPropOrig = Object.defineProperty;
    var presencePatched = false;
    var seenPatched = false;
    var menuIDs = [];
    var offlineConf = "WhatsAppOffline_offlineMode";
    var unreadConf = "WhatsAppOffline_unreadMode";
    var getConf = function(key) {
        var val = window.localStorage.getItem(key);
        return val === "false" ? false : true;
    }
    var setConf = function(key, val) {
        return window.localStorage.setItem(key, val);
    }
    var wrapper = function(f, name, conf) {
        return function() {
            if (getConf(conf)) {
                console.log("Intercepting", name);
                return Promise.resolve();
            }
            var args = Array.prototype.splice.call(arguments, 0);
            return f.apply(this, args);
        };
    };
    var maybeReset = function() {
        if (presencePatched && seenPatched) {
            console.log("restoring Object.defineProperty()");
            Object.defineProperty = objDefPropOrig;
        }
    };
    var refreshMenu = function() {
        for (var id; id = menuIDs.pop();) {
            GM_unregisterMenuCommand(id);
        };
        menuIDs.push(GM_registerMenuCommand(`${getConf(offlineConf) ? "✅" : "⬛"} OfflineMode`, function(){ toggle(offlineConf); }));
        menuIDs.push(GM_registerMenuCommand(`${getConf(unreadConf) ? "✅" : "⬛"} UnreadMode`, function(){ toggle(unreadConf); }));
    };
    var toggle = function(conf) {
        console.log("toggled:", conf);
        setConf(conf, !getConf(conf));
        refreshMenu();
    };
    refreshMenu();
    console.log("patching Object.defineProperty()");
    Object.defineProperty = function(obj, prop, desc) {
        if (!presencePatched && obj.sendPresenceAvailable) {
            console.log("patching sendPresenceAvailable()");
            obj.sendPresenceAvailable = wrapper(obj.sendPresenceAvailable, "sendPresenceAvailable", offlineConf);
            presencePatched = true;
            maybeReset();
        }
        if (!seenPatched && prop === "__esModule") {
            setTimeout(function (){
                if (obj.sendSeen) {
                    console.log("patching sendSeen()");
                    obj.sendSeen = wrapper(obj.sendSeen, "sendSeen", unreadConf);
                    seenPatched = true;
                    maybeReset();
                }
            });
        }
        return objDefPropOrig.call(this, obj, prop, desc);
    };
})();
