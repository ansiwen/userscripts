// ==UserScript==
// @name         old WhatsAppOffline
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Disable WhatsApp online state!
// @author       Sven Anderson
// @match        https://web.whatsapp.com/
// @grant        none
// ==/UserScript==

//HTMLAnchorElement.prototype.realAddEventListener = HTMLAnchorElement.prototype.addEventListener;

//HTMLAnchorElement.prototype.addEventListener = function(a,b,c){
//   this.realAddEventListener(a,reportIn,c);
//    this.realAddEventListener(a,b,c);
//    if(!this.lastListenerInfo){  this.lastListenerInfo = []; }
//    this.lastListenerInfo.push({a : a, b : b , c : c});
//};

// Notes:
// sendPresenceAvailable
// sendPresenceUnavailable
// sendPresenceUpdate

window.WhatsAppOffline = {
    alwaysOffline: true,
    alwaysUnread: true
}

Object.defineProperty = function() {
    console.log("patching Object.defineProperty()");
    var objDefPropOrig = Object.defineProperty;
    var presencePatched = false;
    var seenPatched = false;
    var wrapper = function(f, name, key) {
        return function() {
            if (window.WhatsAppOffline[key]) {
                console.log("Intercepting ", name);
                return Promise.resolve();
            }
            return f.apply(this, arguments);
        }
    }
    var maybeReset = function() {
        if (presencePatched && seenPatched) {
            console.log("restoring Object.defineProperty()");
            Object.defineProperty = objDefPropOrig;
        }
    }
    return function(obj, prop, desc) {
        if (prop == "sendPresenceAvailable") {
            setTimeout(function (){
                if (obj.sendPresenceAvailable) {
                    //debugger;
                    console.log("patching sendPresenceAvailable()");
                    obj.sendPresenceAvailable = wrapper(obj.sendPresenceAvailable, "sendPresenceAvailable", "alwaysOffline");
                    presencePatched = true;
                    maybeReset();
                } else {
                    alert("patching sendPresenceAvailable() failed");
                }
            })
        }
        if (!seenPatched && prop == "__esModule") {
            setTimeout(function (){
                if (obj.sendSeen) {
                    console.log("patching sendSeen()");
                    obj.sendSeen = wrapper(obj.sendSeen, "sendSeen", "alwaysUnread");
                    seenPatched = true;
                    maybeReset();
                }
            })
        }
        return objDefPropOrig.call(this, obj, prop, desc);
    }
}()

// setTimeout(function() {
//     var wrapper = function(f, p) {
//         return function() {
//             console.log("from promise: ", p);
//             console.log("calling function: ", f);
//             console.log(f.toString());
//             f.apply(this, arguments)
//         }
//     }
//     console.log(window.Promise);
//     window.realPromise = window.Promise;
//     window.Promise = function(f) {
// //        console.log("Promise constructor before: ", this);
// //    Function.prototype.bind.apply(window.realPromise, arguments);
//         window.realPromise.call(this, wrapper(f, this));
// //        window.console.log("Promise constructor after: ", this);
//     }

//     Object.getOwnPropertyNames(window.realPromise).forEach( m => {
//         console.log("Copy property: ", m);
//         window.Promise[m] = window.realPromise[m];
//     })
//     Object.getOwnPropertyNames(window.Promise.prototype).forEach( m => {
//         console.log("Prototype: ", m);
// //    window.Promise.prototype[m] = window.realPromise.prototype[m];
//     })
// }, 100)


// window.realAddEventListener = window.addEventListener;

// window.addEventListener = function(a,b,c){
// //     console.log("addEventListener");
// //     console.log("a:", a);
// //     console.log("b:", b);
// //     console.log("c:", c);
//     var wrapper = function(){
// //         console.log("event wrapper");
// //         console.log("a:", a);
// //         console.log("b:", b);
// //         console.log("c:", c);
// //         console.log("this: ", this);
//         var args = [].splice.call(arguments, 0);
// //         console.log("args: ", args);
// //         if (a == "focus") {
// //             console.log("focus event blocked.")
// //             return
// //         }
//         return b.apply(this, args);
//     };
// //     window.realAddEventListener(a,reportIn,c);
// //     if(!window.blurHandler && a == "blur") {
// //         console.log("blurHandler:");
// //         console.log(b);
// //         window.blurHandler = b;
// //     }
// //     if (a == "focus") {
// //         var b2 = function() {
// //             console.log("focus wrapper");
// //             if (window.blurHandler) {
// //                 window.blurHandler();
// //             }
// //         };
// //         window.realAddEventListener(a,b2,c);
// //     } else {
//         window.realAddEventListener(a,wrapper,c);
// //    }
// };

// window.realSetTimeout = window.setTimeout

// window.setTimeout = function(f, t){
// //     console.log('setTimeout');
// //     console.log("f:", f);
// //     console.log("t:", t);
//     var wrapper = function(){
//         console.log("timeout wrapper");
//         console.log("f:", f);
//         console.log("t:", t);
//         console.log("this: ", this);
//         return f();
//     };
//     return window.realSetTimeout(wrapper, t);
// }

// window.realSetInterval = window.setInterval

// window.setInterval = function(f, t){
// //     console.log('setInterval');
// //     console.log("f:", f);
// //     console.log("t:", t);
//     var wrapper = function(){
//         console.log("interval wrapper");
//         console.log("f:", f);
//         console.log("t:", t);
//         console.log("this: ", this);
//         return f();
//     };
//     return window.realSetInterval(wrapper, t);
// }

// document.hasFocus = function(){
//     console.log("hasFocus() blocked.");
//     return false
// }
