var Feeds = [];

function findFeeds() 
{
    var result = document.evaluate(
        '//link[@rel="alternate"][' +
        'contains(@type, "rss") or ' +
        'contains(@type, "atom") or ' +
        'contains(@type, "rdf")]',
        document, null, 0, null);

    var item;
    
    Feeds = [];

    while (item = result.iterateNext())
    {
        Feeds.push(item.href);
    }

    if (Feeds.length > 0)
    {
        chrome.extension.connect().postMessage(
        {
            action: 'FeedsDiscovered',
            data: Feeds
        });
    }
}

if (window == top) 
{
    findFeeds();
    window.addEventListener("focus", findFeeds);

    chrome.extension.onConnect.addListener(function(port)
    {
        port.onMessage.addListener(function(msg)
        {
            if (msg == 'GetFeeds')
            {
                port.postMessage(Feeds);
            }
        });
    });
}