var port;

// Attempt to reconnect
var reconnectToExtension = function () {
    // Reset port
    port = null;
    // Attempt to reconnect after 1 second
    setTimeout(connectToExtension, 1000 * 1);
};

// Attempt to connect
var connectToExtension = function () {

    // Make the connection
    port = chrome.runtime.connect({
        name: "my-port"
    });

    // When extension is upgraded or disabled and renabled, the content scripts
    // will still be injected, so we have to reconnect them.
    // We listen for an onDisconnect event, and then wait for a second before
    // trying to connect again. Becuase chrome.runtime.connect fires an onDisconnect
    // event if it does not connect, an unsuccessful connection should trigger
    // another attempt, 1 second later.
    port.onDisconnect.addListener(reconnectToExtension);

};

// Connect for the first time
connectToExtension();

var chats_text = [];
var user_keywords = [];
var notifications_seen = [];


function searchMeetTab() {
    chrome.tabs.query({
        currentWindow: true
    }, function (tabs) {
        tabs.forEach(function (tab) {
            if (/^https:\/\/meet\.google/.test(tab.url)) {
                console.log("Found a meet tab");
                chrome.tabs.executeScript(tab.id, {
                    file: './foreground.js'
                }, () => {});
            }
        });
    });
}


function searchMeetTabClean() {
    chrome.tabs.query({
        currentWindow: true
    }, function (tabs) {
        tabs.forEach(function (tab) {
            if (/^https:\/\/meet\.google/.test(tab.url)) {
                console.log("Found a meet tab");
                chrome.tabs.sendMessage(tab.id, {
                    message: "clean"
                });
            }
        });
    });
}

searchMeetTab();


function getLocalKeywords() {
    chrome.storage.local.get("keywords", function (items) {
        // console.log(items.keywords);
        user_keywords = items.keywords;
    });
}

getLocalKeywords();

function showNotification(body) {
    var elem = notifications_seen.find(a => a.includes(body.toLowerCase()));
    if (typeof elem === "undefined") {
        chrome.notifications.create('', {
            title: 'Just wanted to notify you',
            message: 'KEYWORD MATCHED : ' + body,
            iconUrl: '/icon-128x128.png',
            type: 'basic'
        });
        notifications_seen.push(body);
    }

}

function matchKeywords() {

    for (var i = 0; i < user_keywords.length; i++) {
        var elem = chats_text.find(a => a.includes(user_keywords[i].toLowerCase()));
        if (elem) {
            console.log("Keyword match");
            var elem2 = notifications_seen.find(a => a.includes(elem.toLowerCase()));
            if (typeof elem2 === "undefined") {
                showNotification(elem);
            }
        }
    }
}

chrome.runtime.onMessage.addListener(function (request, response, _sendResponse) {
    if (request.message === "activate_icon") {
        chrome.pageAction.show(response.tab.id);
    } else
    if (request.message == "chats" || request.chats_list && request.chats_list.length > chats_text.length)
        chats_text = request.chats_list;
    if (request.message == "loaded")
        chrome.notifications.create('', {
            title: 'Meet Notify',
            message: 'Extension loaded Successfully! :)',
            iconUrl: '/icon-128x128.png',
            type: 'basic'
        });
    notifications_seen.push(body);
    getLocalKeywords();
    matchKeywords();
    console.log(chats_text);
});


chrome.extension.onConnect.addListener(function (port) {

    port.onMessage.addListener(function (msg) {
        if (msg.message === "clean") {
            chats_text = [];
            notifications_seen = [];
            searchMeetTabClean();
        }

    });
});




chrome.tabs.onRemoved.addListener(function (tabId) {
    chats_text = [];
    notifications_seen = [];
    console.log("Close Triggered");
});


// chrome.runtime.onInstalled.addListener(function () {
//     searchMeetTab();
// });

chrome.runtime.onStartup.addListener(function () {
    console.log("Startup Triggered");
});


// //start a timer of 100 seconds on Sheets API call. After call again unless subscribed.

// chrome.tabs.onCreated.addListener((_tab) => {
//     searchMeetTab();
// });