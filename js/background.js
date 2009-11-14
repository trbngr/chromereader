/// <reference path="reader_client.js" />



window.googleReader = new GoogleReaderClient();

window.openSignInPage = function()
{
    chrome.tabs.create(
    {
        url: 'https://www.google.com/accounts/ServiceLogin?hl=en&nui=1&service=reader&continue=https://www.google.com/reader'
    });
};

window.showPageAction = function(tabId, state)
{
    var icon = 'icons/page_action.png';
    var title = 'Subscribe page feed';
    
    if (state == 'subscribed')
    {
        icon = 'icons/page_action_subscribed.png';
        title = 'Edit page feed subscribtion';
    }
    else if (state == 'unauthorized')
    {
        icon = 'icons/page_action_error.png';
        title = 'Please sign in to Google Reader';
    }
    else if (state == 'failed')
    {
        icon = 'icons/page_action_error.png';
        title = 'Google Reader not available';
    }
        
    chrome.pageAction.setIcon(
    {
        tabId: tabId,
        path:  icon
    });
    
    chrome.pageAction.setTitle(
    {
        tabId: tabId,
        title: title
    });

    chrome.pageAction.show(tabId);
};

window.isUnauthorizedStatus = function(status)
{
    return ((status == 401) || (status == 403))
};

chrome.extension.onConnect.addListener(function(port)
{
    var tabId = port.tab.id;

    var errorHandler = function(xhr, status, exc)
    {
        var state = 'failed';
        
        if (window.isUnauthorizedStatus(xhr.status))
        {
            state = 'unauthorized';
        }
    
        window.showPageAction(tabId, state);
    };

    port.onMessage.addListener(function(msg)
    {
        if ((msg) && (msg.action == 'FeedsDiscovered'))
        {
            googleReader.getSubscription(msg.data[0], errorHandler, function(sub)
            {
                window.showPageAction(tabId, sub ? 'subscribed' : null);
            });
        }            
    });
});