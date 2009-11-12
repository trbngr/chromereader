/// <reference path="google_reader_client.js" />

window.createReader = function()
{
    return new GoogleReaderClient();
};

chrome.extension.onConnect.addListener(function(port)
{
    port.onMessage.addListener(function(msg)
    {
        if ((msg) && (msg.action == 'FeedsDiscovered'))
        {
            var reader = new GoogleReaderClient();
            var tabId = port.tab.id;
            
            chrome.pageAction.show(tabId);
            chrome.pageAction.setTitle(
            {
                tabId: tabId,
                title: 'Subscribe page feed'
            });
        
            reader.getSubscription(msg.data[0], function(sub, status)
            {
                if (sub)
                {
                    chrome.pageAction.setTitle(
                    {
                        tabId: tabId,
                        title: 'Edit page feed subscribtion'
                    });
                }
            });
        }            
    });
});