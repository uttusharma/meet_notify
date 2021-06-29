var observing = false;
var keywords = [];
var chatTexts = [];

chrome.runtime.sendMessage({
    "message": "activate_icon"
});

// console.log(document.all[0].outerHTML);
var chats = document.querySelectorAll('div[data-sender-name]');

for (let i = 0; i < chats.length; i++) {
    let chat = chats[i].querySelector('.Zmm6We');
    let text = chat.innerText.replace(/\(...\)/, '').replace(/^[\+\=]/, '').trim();
    chatTexts.push(text);
}

chrome.runtime.sendMessage({
    message: "loaded",
    url: window.location.href
});

chrome.runtime.sendMessage({
    message: "chats",
    chats_list: chatTexts
});


chrome.runtime.onMessage.addListener(function (response, sendResponse) {
    console.log(response);
    if (response.message == "clean") {
        chatsTexts = [];
        console.log("Done Cleaning Notification");
    }
});



function setChatObserver(mutations) {

    observing = true;
    for (let mutation of mutations) {
        for (let addedNode of mutation.addedNodes) {
            if (addedNode.nodeName === 'DIV') {
                let int_chat = addedNode.querySelector('.Zmm6We');
                if (int_chat && int_chat.lastChild) {
                    let int_text1 = int_chat.lastChild.className;
                    if (int_text1 === "oIy2qc") {
                        let int_text2 = int_chat.lastChild.getAttribute('data-message-text');
                        chatTexts.push(int_text2);
                        chrome.runtime.sendMessage({
                            message: "chats",
                            chats_list: chatTexts
                        });
                    }

                } else {
                    let vnt_text1 = addedNode.className;
                    if (vnt_text1 === "oIy2qc") {
                        let vnt_chat2 = addedNode.getAttribute('data-message-text');
                        if (vnt_chat2) {
                            // console.log(vnt_chat2);

                            // console.log("Added Node 2 : ", addedNode);
                            if (chatTexts.indexOf(vnt_chat2) === -1) {
                                chatTexts.push(vnt_chat2);
                                chrome.runtime.sendMessage({
                                    chats_list: chatTexts
                                });
                            }
                        }
                    }
                }

            }
        }

    }
}




var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
var observer = new MutationObserver(setChatObserver);




// configuration of the observer:
var config = {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true
};

observer.observe(document, config);