if (window === top) 
{
    function findFeeds(type) 
    {
        var xpath = '//link[@rel="alternate"][contains(@type, "' + type + '")]';

        var nodes = document.evaluate(xpath, document, null, 0, null);
        var results = [];
        var item;
        
        while (item = nodes.iterateNext())
        {
            results.push(item.href);
        }

        return results;
    }

    var feeds =
    {
        atom: findFeeds('atom'),
        rss: findFeeds('rss')
    };
    
    feeds.all = feeds.atom.concat(feeds.rss);
    
    if (feeds.all.length)
    {
        chrome.extension.onRequest.addListener(function(request, sender, reply)
        {
            if (request === 'GetFeeds')
            {
                reply(feeds);
            }
        });

        chrome.extension.sendRequest(feeds, function(response)
        {
            feeds = response;
        });
    }
}