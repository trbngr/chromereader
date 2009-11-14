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
    var icon = 'png/page_action.png';
    var title = chrome.i18n.getMessage('page_action_title');
    
    if (state == 'subscribed')
    {
        icon = 'png/page_action_subscribed.png';
        title = chrome.i18n.getMessage('page_action_title_subscribed');
    }
    else if (state == 'unauthorized')
    {
        icon = 'png/page_action_error.png';
        title = chrome.i18n.getMessage('page_action_title_unauthorized');
    }
    else if (state == 'failed')
    {
        icon = 'png/page_action_error.png';
        title = chrome.i18n.getMessage('page_action_title_failed');
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