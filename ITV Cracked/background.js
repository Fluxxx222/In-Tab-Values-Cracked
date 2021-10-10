/*
In-Tab Values was developed in full by:
  _  __  ____        _ 
 | |/ / |  _ \      | |
 | ' /  | | | |  _  | |
 | . \  | |_| | | |_| |
 |_|\_\ |____/   \___/ 

Contacts:
    Email - kdjstuffs@gmail.com
    Discord - KDJ#7137
    Roblox Developer Forums - https://devforum.roblox.com/u/excessenergy/summary
In-Tab Values Privacy Policy:
    https://github.com/KDJDEV/ITV-Privacy-Policy/blob/main/In-Tab-Values%20Privacy%20Policy.md
*/

var user_id
let online = true

async function startTab() {

    let url = "https://www.roblox.com/trades"
    window.open(url, '_blank');
    saveLocal("New", false)
}

async function getGlobalData() {
    return await fetch(chrome.runtime.getURL("data.json")).then(response => response.json());
}

//play notification sound
async function playSound() {
    if (await getFromStorageLocal("Activation noise") == true) {
        url = chrome.runtime.getURL("audio/click.mp3")
        var audio = new Audio(url);
        audio.volume = 0.3;
        audio.play();
    }
}


async function GetUserId() {

    let result = new Promise(async function(resolve, reject) {

        let url = "https://users.roblox.com/v1/users/authenticated"
        user_id = await sendGETRequest("https://users.roblox.com/v1/users/authenticated")
        resolve(user_id)
    })

    result = await result
    return result


}
//function to check if authenicated user owns our VIP server

var SubscriptionStatus = false
// Check if you have a VIP server
async function CheckSubscription() {
	SubscriptionStatus = true
}

function get(url) {
    return new Promise((resolve, reject) => {

        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);

        // request state change event
        xhr.onreadystatechange = function() {

            // request completed?
            if (xhr.readyState !== 4) return;

            if (xhr.status === 200) {

                resolve(JSON.parse(xhr.response))
            } else {
                // request error
                resolve(false)
            }
        };

        // start request
        xhr.send();
    })
}
async function sendGETRequest(url) {
    try {

        if (online == true) {

            let response = await get(url)


            let json = await response
            return json

        }
    } catch (e) {
        print('request error')
    }

}

function sortObject(obj) {
    return Object.keys(obj).sort().reduce(function(result, key) {
        result[key] = obj[key];
        return result;
    }, {});
}

function Alert(alert) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        let tab = tabs[0]
        console.log(tab.url)
        if (tab.url.indexOf("roblox.com/trades") != -1 || (tab.url.indexOf("roblox.com/users/") != -1 && tab.url.indexOf("/trade") != -1) || (tab.url.indexOf("roblox.com/users/") != -1 && tab.url.indexOf("/profile") != -1)) {
            chrome.tabs.sendMessage(tab.id, { command: "send_alert", alert: "In-Tab Values: " + alert });
        }
    })
}
let allValueData = null
let lastWorkaround = 0
let previousAllValueData = null

async function start(tab) {

    if (online == true) {
        chrome.tabs.sendMessage(tab.id, { type: 'test' }, async function(isInjected) {
            //let newapiurl = await sendGETRequest("https://api.github.com/gists/9cf812eb64a35551caa02502c18d496f")
            //let newurl = newapiurl.files["rare_values.json"]["raw_url"]
            newurl = `https://gist.githubusercontent.com/KDJDEV/9cf812eb64a35551caa02502c18d496f/raw/rare_values.json`
            if (Date.now() - lastWorkaround > 60000) {
                try {
                    lastWorkaround = Date.now()
                    allValueData = fetch(newurl)
                    allValueData = await allValueData
                    allValueData = await allValueData.json()
                    //console.log("gist.githubusercontent.com success")
                } catch (error) {
                    console.log(error)
                    lastWorkaround = Date.now()
                    newurl = `https://api.github.com/gists/9cf812eb64a35551caa02502c18d496f` //?cachebust=${Date.now()}
                    allValueData = fetch(newurl)
                    allValueData = await allValueData
                    allValueData = await allValueData.json()
                    allValueData = JSON.parse(allValueData["files"]["rare_values.json"]["content"])
                    //console.log('gist.githubusercontent.com failed, workaround')
                }
            }
            if (allValueData != null) {
                let allValueDataClone = JSON.parse(JSON.stringify(allValueData))

                if (allValueDataClone == null || allValueDataClone.RAPtoValue == null || allValueDataClone.rolimons == null) {
                    if (previousAllValueData != null) {
                        allValueDataClone = previousAllValueData
                    }
                }
                previousAllValueData = allValueDataClone



                let rolimonsData = allValueDataClone.rolimons
                let rblxData = allValueDataClone.rblx
                let rbxcityData = allValueDataClone.rbxcity
                let valueData = rolimonsData


                let alert = "The value provider sites are currently offline so ITV cannot collect values. Please try again later."
                if (rolimonsData == null) {
                    Alert(alert)
                    return
                }

                if (await getFromStorageLocal("Value Provider") === "rblx.trade") {
                    alert = "The rblx.trade value provider site is currently offline so ITV cannot collect values. Please select a different value provider from the options menu."
                    if (rblxData == null) {
                        Alert(alert)
                        return
                    }
                    for (const id in valueData.items) {
                        if (rblxData[id] != undefined) {
                            if (valueData.items[id][3] != -1) {
                                valueData.items[id][3] = Number(rblxData[id])
                            }

                            valueData.items[id][4] = Number(rblxData[id])
                            //valueData.items[id][11] = true //is rblx
                        }
                    }
                }

                if (await getFromStorageLocal("Value Provider") === "rolimons.com") {
                    valueData = rolimonsData
                }

                let valueBrackets = allValueDataClone.RAPtoValue
                if (await getFromStorageLocal("Value Provider") === "rblx.trade") {
                    valueBrackets = allValueDataClone["RAPtoValue_rblx"]
                }
                valueBrackets = sortObject(valueBrackets)

                valueBrackets = await valueBrackets //do we need this?
                window.user_id = await GetUserId(tab)

                await CheckSubscription()
                let owned = SubscriptionStatus

                if (owned == true) {
                    //VIP server is owned
                    if (isInjected != true) {
                        if (tab.url.indexOf("roblox.com/trades") != -1 || (tab.url.indexOf("roblox.com/users/") != -1 && tab.url.indexOf("/trade") != -1) || (tab.url.indexOf("roblox.com/users/") != -1 && tab.url.indexOf("/profile") != -1)) {
                            chrome.tabs.executeScript(tab.id, {
                                file: 'main.js'
                            })
                            chrome.tabs.sendMessage(tab.id, {
                                type: 'activate',
                                data: [valueData, valueBrackets, await getFromStorageLocal("Value Provider")]
                            });
                        }

                        chrome.tabs.sendMessage(tab.id, { command: "add_itv_icon", tabId: tab.id });


                    }

                } else {
                    //VIP server is not owned

                    if (isInjected != true) {
                        if (tab.url.indexOf("roblox.com/trades") != -1 || (tab.url.indexOf("roblox.com/users/") != -1 && tab.url.indexOf("/trade") != -1) || (tab.url.indexOf("roblox.com/users/") != -1 && tab.url.indexOf("/profile") != -1)) {
                            chrome.tabs.executeScript(tab.id, {
                                file: 'main.js'
                            })
                            chrome.tabs.sendMessage(tab.id, {
                                type: 'activate',
                                data: [valueData, valueBrackets, await getFromStorageLocal("Value Provider")]
                            });
                        }

                        chrome.tabs.sendMessage(tab.id, { command: "add_itv_icon", tabId: tab.id });


                    }

                }


            }
        });
    };
};

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {

    if (tab.url !== undefined && changeInfo.status == 'complete') {
        debounce = false
        start(tab)

    };



});

function saveLocal(name, value) {
    var items = {};
    items[name] = value
    chrome.storage.local.set(items, function() {});
}

async function getFromStorageLocal(name) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(name, async function(items) {
            let globalData = await getGlobalData()

            value = items[name]
            if (value == undefined) {
                for (let key in globalData) {
                    if (globalData.hasOwnProperty(key)) {
                        for (let thisKey in globalData[key]) {
                            if (thisKey == name) {
                                value = globalData[key][thisKey][1]
                                saveLocal(name, value)
                                resolve(value)
                            }
                            for (let thisThisKey in globalData[key][thisKey]) {
                                if (thisThisKey == name) {
                                    value = globalData[key][thisKey][thisThisKey][1]
                                    saveLocal(name, value)
                                    resolve(value)
                                }
                            }
                        }
                    }
                }

                if (name == "tradeCache") {
                    saveLocal(name, {})
                } else if (name == "New") {
                    saveLocal(true)
                    resolve(true)
                }
            }
            resolve(value)
        });
    })
}

// Returns a Promise that resolves after "ms" Milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms))

function ObjectLength(object) {
    var length = 0;
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            ++length;
        }
    }
    return length;
};

let waitTime = 1900
let tradeCache = []
let restart = false
let cleaningTabId = null
async function caching2() {
    tradeCache = await getFromStorageLocal("tradeCache")
    if (tradeCache == null) {
        tradeCache = []
    }

    let getAllTrades = new Promise(function(resolve, reject) {
        let allTrades = []

        async function processPageCursor(pageCursor) {
            try {
                fetch(`https://trades.roblox.com/v1/trades/Inbound?sortOrder=Asc&limit=100&cursor=${pageCursor}`)
                    .catch(async function() {
                        waitTime = 7000
                        await timer(waitTime);
                        //console.log('retrying')
                        processPageCursor(pageCursor) //request failed, try again
                    })
                    .then(r => r.json().catch(async () => {
                        waitTime = 7000;
                        await timer(waitTime);
                        processPageCursor(pageCursor);
                    }).then(data => ({ status: r.status, body: data })))
                    .then(async data => {
                        if (data.status === 200) {
                            tradesData = data.body
                            let nextPageCursor = tradesData.nextPageCursor
                            //console.log("collected trades with cursor: " + nextPageCursor)
                            tradesData = tradesData.data
                            allTrades = allTrades.concat(tradesData);
                            await timer(waitTime);

                            waitTime = 1900
                            if (nextPageCursor === null) {
                                resolve(allTrades)
                            } else {
                                processPageCursor(nextPageCursor)
                            }
                        } else {
                            waitTime = 7000
                            await timer(waitTime);
                            //console.log('retrying')
                            processPageCursor(pageCursor) //request failed, try again
                        }
                    });
            } catch (e) {
                waitTime = 7000
                await timer(waitTime);
                //console.log('retrying')
                processPageCursor(pageCursor) //request failed, try again
            }
        }
        processPageCursor("")
    })
    getAllTrades.then(async (tradesData) => {

        function getRidOfOld(tradesData) {
            for (const index in tradeCache) {
                let cachedTrade = tradeCache[index]
                if (cachedTrade !== null) {
                    let value = tradesData.find(trade => trade.id === cachedTrade[0])
                    if (value === undefined || value === null) {
                        //console.log("deleted: ", tradeCache[index])
                        tradeCache.splice(index, 1)
                    }
                }
            }
            saveLocal("tradeCache", tradeCache)

            //console.log("got rid of old trades")
        }
        getRidOfOld(tradesData)

        if (cleaningTabId != null) {
            chrome.tabs.sendMessage(cleaningTabId, {
                command: "cleanUpTradesDone"
            });
            restart = false
            cleaningTabId = null
        }
        tradeCache = await getFromStorageLocal("tradeCache")

        var index = 0
        async function loopFunction() { //loop through list of trades
            let tradesDataTrade = tradesData[index]
            let tradeId = tradesDataTrade.id

            if (tradeCache.find(trade => trade != null && trade[0] === tradeId) === undefined) { //check to make sure trade doesn't already exist in cache
                try {
                    fetch(`https://trades.roblox.com/v1/trades/${tradeId}`)
                        .catch(async function() {
                            waitTime = 7000
                            await timer(waitTime);
                            //console.log('retrying')
                            if (index < tradesData.length) {
                                if (restart == false) {
                                    loopFunction()
                                } else {
                                    caching2()
                                }
                            }
                        })
                        .then(r => r.json().then(data => ({ status: r.status, body: data })))
                        .then(async data => {
                            tradeDataTrade = data.body
                            if (data.status === 200) {
                                tradeCache.splice(index, 0, [tradeId, tradeDataTrade]); //add newly discovered trade to cache
                                //console.log(tradeCache)
                                saveLocal("tradeCache", tradeCache)
                                waitTime = 1900
                                await timer(waitTime);
                                index++
                                if (index < tradesData.length) {
                                    if (restart == false) {
                                        loopFunction()
                                    } else {
                                        caching2()
                                    }
                                }
                            } else {
                                waitTime = 7000
                                await timer(waitTime);
                                //console.log('retrying')
                                if (index < tradesData.length) {
                                    if (restart == false) {
                                        loopFunction()
                                    } else {
                                        caching2()
                                    }
                                }
                            }
                        });
                } catch (err) {
                    waitTime = 7000
                    await timer(waitTime);
                    //console.log('retrying')
                    if (index < tradesData.length) {
                        if (restart == false) {
                            loopFunction()
                        } else {
                            caching2()
                        }
                    }
                }
            } else {
                await timer(50)
                index++
                //console.log('trade already cached, moving on')
                if (index < tradesData.length) {
                    if (restart == false) {
                        loopFunction()
                    } else {
                        caching2()
                    }
                }
            }

            if (index === tradesData.length - 1) { //minus one because the length returns number of objects starting count at one instead of 0 array index
                //loop finished
                getRidOfOld(tradesData)

                await timer(waitTime);
                //console.log('looped through all trades, refetch all trades')
                caching2()
                return
            }
        }

        if (restart == false) {
            loopFunction()
        } else {
            caching2()
        }
    })
}
caching2()
chrome.tabs.onActivated.addListener(async function(tabId, changeInfo, tab) {

    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function(tabs) {
        let tab = tabs[0];
        start(tab)
    });
})


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.command === "purchased") {
        setTimeout(function() {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    command: "thanks_for_purchasing"
                });
            })
        }, 1000)
        sendResponse();
    }

    return true;
});

window.addEventListener('offline', function(e) {
    console.log('offline');
    online = false
});
window.addEventListener('online', function(e) {
    console.log('online');
    online = true
});

async function firstCheck() {
    if (await getFromStorageLocal("New") == true) {
        startTab()
    }
}
firstCheck()

function purchaseSequence() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { command: "redirect", url: "https://www.roblox.com/games/7466730072" }, function() {
            chrome.tabs.onUpdated.addListener(function() {
                let send2 = function() {
                    setTimeout(function() {
                        chrome.tabs.sendMessage(tabs[0].id, { command: "prompt_purchase" });
                    }, 1000)
                    chrome.tabs.onUpdated.removeListener(send2);
                }
                chrome.tabs.onUpdated.addListener(send2)

            });
        });
    })
}

function cancelSequence() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { command: "redirect", url: "https://www.roblox.com/games/7466730072" }, function() {
            let send = function() {
                console.log('send cancel')
                setTimeout(function() {
                    chrome.tabs.sendMessage(tabs[0].id, { command: "cancel_subscription" });
                }, 1000)
                chrome.tabs.onUpdated.removeListener(send);
            }
            chrome.tabs.onUpdated.addListener(send)
        });
    })
}

function findWithAttr(array, attr, value) {
    for (var i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.command == 'purchaseSequence') {
        purchaseSequence()
    }

    if (request.command == 'cancelSequence') {
        cancelSequence()
    }
    if (request.command == 'tradeDeclined') {
        let tradeId = request.data
        console.log(Number(tradeId))
        let tradeCache = await getFromStorageLocal("tradeCache")
        let index = findWithAttr(tradeCache, 0, Number(tradeId))
        if (index != -1) {
            console.log('trade declined at index ' + index)
            tradeCache.splice(index, 1)
            saveLocal("tradeCache", tradeCache)
        }
    }
    if (request.command == 'cleanUpTrades') {
        cleaningTabId = sender.tab.id
        restart = true
    }
    return true;
});