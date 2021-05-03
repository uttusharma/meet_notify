let keywords = [];
let chatTexts = [];

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
    chats_list: chatTexts
});


chrome.runtime.onMessage.addListener(function (response, sendResponse) {
    console.log(response);
    if (response.message == "clean") {
        chatsTexts = [];
        console.log("Done Cleaning Notification");
    }
});

alert("Meet Notify Loaded Successfully!");

let observer = new MutationObserver(mutations => {

    for (let mutation of mutations) {
        let check = '';
        for (let addedNode of mutation.addedNodes) {
            if (addedNode.nodeName === 'DIV') {
                let int_chat = addedNode.querySelector('.Zmm6We');
                if (int_chat && int_chat.lastChild) {
                    let int_text = int_chat.lastChild.getAttribute('data-message-text');
                    // console.log(int_text);
                    if (check != int_text) {
                        chatTexts.push(int_text);
                        chrome.runtime.sendMessage({
                            chats_list: chatTexts
                        });
                        check = int_text;
                    }
                } else {
                    let vnt_chat = addedNode.getAttribute('data-message-text');
                    if (vnt_chat) {
                        // console.log(vnt_chat);
                        if (chatTexts.indexOf(vnt_chat) === -1) {
                            chatTexts.push(vnt_chat);
                            chrome.runtime.sendMessage({
                                chats_list: chatTexts
                            });
                        }
                    }
                }
            }
        }
    }

});


// configuration of the observer:
var config = {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true
};

observer.observe(document, config);