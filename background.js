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
                chrome.tabs.sendMessage(tab.id,{message : "clean"}); 
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
    }
    else
    if (request.chats_list && request.chats_list.length > chats_text.length)
        chats_text = request.chats_list;
    getLocalKeywords();
    matchKeywords();
    console.log(chats_text);
});


chrome.extension.onConnect.addListener(function(port) {

    port.onMessage.addListener(function(msg) {
        if (msg.message === "clean")
        {
            chats_text = [];
            notifications_seen = [];
            searchMeetTabClean();
        }
       
    });
});




// chrome.tabs.onRemoved.addListener(function (tabId) {

// });


// chrome.runtime.onInstalled.addListener(function () {
//     searchMeetTab();
// });

// chrome.runtime.onStartup.addListener(function () {
//     searchMeetTab();
// });


// //start a timer of 100 seconds on Sheets API call. After call again unless subscribed.

// chrome.tabs.onCreated.addListener((_tab) => {
//     searchMeetTab();
// });