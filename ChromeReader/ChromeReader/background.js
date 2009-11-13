/// <reference path="google_reader_client.js" />

window.createReader = function()
{
    return new GoogleReaderClient();
};

window.showPageAction = function(tabId, isSubscribed)
{
    var icon = 'icons/page_action.png';
    var title = 'Subscribe page feed';
    
    if (isSubscribed)
    {
        icon = 'icons/page_action_subscribed.png';
        title = 'Edit page feed subscribtion';
    }

    chrome.pageAction.show(tabId);
    
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
};

chrome.extension.onConnect.addListener(function(port)
{
    port.onMessage.addListener(function(msg)
    {
        if ((msg) && (msg.action == 'FeedsDiscovered'))
        {
            var reader = new GoogleReaderClient();
            var tabId = port.tab.id;
            
            reader.getSubscription(msg.data[0], 
                function(xhr, textStatus, errorThrown) 
                {
                },
                function(sub, status)
                {
                    window.showPageAction(tabId, sub);
                }
            );
        }            
    });
});