function doShowPageAction(tabId, icon, title)
{
    chrome.pageAction.setIcon(
    {
        tabId: tabId, path: icon
    });

    chrome.pageAction.setTitle(
    {
        tabId: tabId, title: title
    });

    chrome.pageAction.show(tabId);
}

function makeTabErrorHandler(tabId)
{
    return function(xhr, status, exc)
    {
        chromeReader.tabErrorHandler(tabId, xhr, status, exc);
    }
}

window.chromeReader = $.extend(window.chromeReader || { },
{
    client: new chromeReader.GoogleReaderClient(),
    
    openSignInPage: function()
    {
        chrome.tabs.create(
        {
            url: 'https://www.google.com/accounts/ServiceLogin?hl=en&nui=1&service=reader&continue=https://www.google.com/reader'
        });
    },
    
    isUnauthorizedStatus: function(status)
    {
        return ((status == 401) || (status == 403))
    },
    
    tabErrorHandler: function(tabId, xhr, status, exc)
    {
        console.log(
        {
            tab: tabId,
            exc: exc,
            xhr: xhr,
            status: status
        });
        
        var icon = 'png/page_action_error.png';
        var message = "Google Reader not available";
        
        if (chromeReader.isUnauthorizedStatus(xhr.status))
        {
            message = "Please sign in to Google Reader";
        }
        
        doShowPageAction(tabId, icon, message);
    },
    
    showPageActionSubscribed: function(tabId, subscription)
    {
        var icon = 'png/page_action_subscribed.png';
        var title = "Edit page feed subscribtion";
        
        doShowPageAction(tabId, icon, title);
        
        chromeReader.client.getFeedUnreadCount(subscription, makeTabErrorHandler(tabId), function(unreadCount)
        {
            if (unreadCount > 0)
            {
                title += "\n" + unreadCount.toLocaleString() + " unread item";
                
                if (unreadCount > 1)
                {
                    title += "s";
                }
                
                doShowPageAction(tabId, icon, title);
            }
        });
    },
    
    showPageAction: function(tabId, arg)
    {
        if (tabId)
        {
            var icon = 'png/page_action.png';
            var title = "Subscribe page feed";
                
            if (arg && arg.updated)
            {
                title += "\nLast updated " + $.timeago(arg.updated);
            }
            
            doShowPageAction(tabId, icon, title);
        }
    }
});

chrome.extension.onConnect.addListener(function(port)
{
    var tabId = port.tab.id;
    var tabErrorHandler = makeTabErrorHandler(tabId);

    port.onMessage.addListener(function(msg)
    {
        console.log(msg);
        
        if ((msg) && (msg.action == 'FeedsDiscovered'))
        {
            chromeReader.client.getSubscription(msg.data.all, tabErrorHandler, function(sub)
            {
                if (sub)
                {
                    chromeReader.showPageActionSubscribed(tabId, sub);
                }
                else
                {
                    chromeReader.showPageAction(tabId);
                    
                    chromeReader.client.getFeedUpdateTime(msg.data.all[0], tabErrorHandler, function(lastUpdated)
                    {
                        chromeReader.showPageAction(tabId, { updated: lastUpdated });
                    });
                }
            });
        }            
    });
});