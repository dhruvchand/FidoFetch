var currentTab;
var inStash;

/*
 * Updates the browserAction icon to reflect whether the current page
 * is already in the stash
 */
function updateIcon() {

    browser.pageAction.setIcon({
        path: inStash ? {
            19: "icons/star-filled-19.png",
            38: "icons/star-filled-38.png"
        } : {
            19: "icons/star-empty-19.png",
            38: "icons/star-empty-38.png"
        },

        tabId: currentTab.id
    });



}


function getRandom() {

    let gettingItem = browser.storage.local.get("URLs");
    gettingItem.then(loadRand, onError);
     updateIcon();

}

function loadRand(item) {

    if (item.URLs.list != undefined && item.URLs.list.length > 0) {

        randPage = item.URLs.list[getRandomInt(0, item.URLs.list.length)];
        browser.tabs.update({
            url: randPage
        });

    }

}

/*
 * Switches currentTab and inStash to reflect the currently active tab
 */


function updateActiveTab(tabs) {
    var gettingActiveTab = browser.tabs.query({
        active: true,
        currentWindow: true
    });
    gettingActiveTab.then((tabs) => {
        currentTab = tabs[0];
        browser.pageAction.show(tabs[0].id);

        let gettingItem = browser.storage.local.get("URLs");
        gettingItem.then(updateTab, onError);

    });


    function updateTab(item) {

        if (item.URLs == undefined) {
            item.URLs = {};
            item.URLs.list = [];
        }
        if (item.URLs.list.filter(function(e){
           return e == currentTab.url
        }).length == 0) {
            inStash = false;
            updateIcon();
        } else {
            inStash = true;
            updateIcon();
        }



    }




}





browser.pageAction.onClicked.addListener(function() {
    let gettingItem = browser.storage.local.get("URLs");
    gettingItem.then(storeURL, onError);
     updateActiveTab();
});


function storeURL(item) {


    if (item.URLs == undefined) {
        item.URLs = {};
        item.URLs.list = [];
    }

    if (item.URLs.list.filter(function(e){ return e == currentTab.url}).length == 0) {
        item.URLs.list.push(currentTab.url);
    }
    else{
        item.URLs.list = item.URLs.list.filter(function(e){ return e != currentTab.url});
    }


    browser.storage.local.set(item);
    


}

function onError(error) {
    console.log(`Error: ${error}`);
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}


browser.browserAction.onClicked.addListener(getRandom);

// listen to tab URL changes
browser.tabs.onUpdated.addListener(updateActiveTab);

// listen to tab switching
browser.tabs.onActivated.addListener(updateActiveTab);

// update when the extension loads initially
updateActiveTab();