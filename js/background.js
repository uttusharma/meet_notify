const meetTabs = new Map();
const meetRegex = /https?:\/\/meet.google.com\/\w{3}-\w{4}-\w{3}/;
const codeRegex = /\w{3}-\w{4}-\w{3}/;

var chats_text = [];
var user_keywords = [];
var notifications_seen = [];



chrome.extension.onConnect.addListener(function (port) {

    port.onMessage.addListener(function (msg) {
        if (msg.message === "clean") {
            chats_text = [];
            notifications_seen = [];
        }

    });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    if (changeInfo.hasOwnProperty('url') && meetRegex.test(changeInfo.url)) {
        const code = codeRegex.exec(changeInfo.url)[0];
        meetTabs.set(tabId, code);
    }
});


chrome.tabs.onRemoved.addListener(function (tabId) {
    chats_text = [];
    notifications_seen = [];
    if (meetTabs.has(tabId)) {
        meetTabs.delete(tabId);
    }
    console.log("🔒 Exit Triggered");
});

chrome.runtime.onStartup.addListener(function () {
    console.log("✈ Startup Triggered");
});

chrome.runtime.onInstalled.addListener(function (details) {
    chrome.storage.local.get(null, function (data) {
        if (!data.hasOwnProperty('keywords')) {
            user_keywords = ['Attendance', 'Present', 'Present Mam', 'Present Sir'];
            chrome.storage.local.set({
                'keywords': user_keywords
            });
        }
    });
});



chrome.tabs.query({
        url: '*://meet.google.com/**-**-**'
    },
    function (tabs) {
        for (const tab of tabs) {
            if (meetRegex.test(tab.url)) {
                console.log("⭐ Found a meet tab");
                chrome.tabs.executeScript(tab.id, {
                    file: './js/foreground.js'
                }, () => {});
                const code = codeRegex.exec(tab.url)[0];
                meetTabs.set(tab.id, code);
            }
        }
        // tabs.forEach(function (tab) {
        //     if (/^https:\/\/meet\.google/.test(tab.url)) {

        //     }
        // });
    });

chrome.runtime.onMessage.addListener(function (request, response, _sendResponse) {
    if (request.message === "activate_icon") {
        chrome.pageAction.show(response.tab.id);
    } else
    if (request.message == "chats" || request.chats_list && request.chats_list.length > chats_text.length)
        chats_text = request.chats_list;
    if (request.message == "loaded") {
        chrome.notifications.create('', {
            title: 'Meet Notify : ' + codeRegex.exec(request.url)[0],
            message: 'Loaded Successfully!😀',
            iconUrl: 'icons/icon-128x128.png',
            type: 'basic'
        });
    }
    getLocalKeywords();
    matchKeywords();
    console.log("chats👉 " + chats_text);
});


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
            title: '✨ Just wanted to notify you',
            message: '🔔 Matched : ' + body,
            iconUrl: 'icons/icon-128x128.png',
            type: 'basic'
        });
        notifications_seen.push(body);
    }

}

function matchKeywords() {
    // console.log("___" + user_keywords);
    for (var i = 0; i < user_keywords.length; i++) {
        var elem = chats_text.find(a => a.includes(user_keywords[i].toLowerCase()));

        // console.log("===" + elem);
        if (elem) {
            console.log("Keyword match");
            var elem2 = notifications_seen.find(a => a.includes(elem.toLowerCase()));
            if (typeof elem2 === "undefined") {
                showNotification(elem);
            }
        }
    }
}