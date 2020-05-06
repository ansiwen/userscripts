// ==UserScript==
// @name         WhatsAppOffline
// @namespace    https://github.com/ansiwen
// @version      0.1
// @description  Disable WhatsApp online and message-read status
// @author       Sven Anderson
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
    var mode = {
        offline: true,
        unread: true
    }
    var menuIDs = [];
    var wrapper = function(f, name, key) {
        return function() {
            if (mode[key]) {
                console.log("Intercepting", name);
                return Promise.resolve();
            }
            var args = Array.prototype.splice.call(arguments, 0);
            return f.apply(this, args);
        }
    }
    var maybeReset = function() {
        if (presencePatched && seenPatched) {
            console.log("restoring Object.defineProperty()");
            Object.defineProperty = objDefPropOrig;
        }
    }
    var refreshMenu = function() {
        menuIDs.forEach(function(id){
            GM_unregisterMenuCommand(id)
        })
        menuIDs.push(GM_registerMenuCommand("Offline Mode:"+(mode.offline?"ON":"OFF"), function(){toggle("offline")}));
        menuIDs.push(GM_registerMenuCommand("Unread Mode:"+(mode.unread?"ON":"OFF"), function(){toggle("unread")}));
    }
    var toggle = function(key) {
        console.log("toggled", key, "mode")
        mode[key] = !mode[key];
        console.log(mode);
        refreshMenu();
    }
    refreshMenu()
    console.log("patching Object.defineProperty()");
    Object.defineProperty = function(obj, prop, desc) {
        if (!presencePatched && obj.sendPresenceAvailable) {
            console.log("patching sendPresenceAvailable()");
            obj.sendPresenceAvailable = wrapper(obj.sendPresenceAvailable, "sendPresenceAvailable", "offline");
            presencePatched = true;
            maybeReset();
        }
        if (!seenPatched && prop == "__esModule") {
            setTimeout(function (){
                if (obj.sendSeen) {
                    console.log("patching sendSeen()");
                    obj.sendSeen = wrapper(obj.sendSeen, "sendSeen", "unread");
                    seenPatched = true;
                    maybeReset();
                }
            })
        }
        return objDefPropOrig.call(this, obj, prop, desc);
    }
})();
