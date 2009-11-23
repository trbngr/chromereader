window.chromeReaderPopup = $.extend(window.chromeReaderPopup || { },
{
    Controller: function(view, chromeReader)
    {
        var self = this;
        var client = chromeReader.client;

        self.subscr = null;
        
        self.tabId = null;
        self.tabPort = null;
        
        function noop() 
        {
        }
        
        function showPageAction(status)
        {
            chromeReader.showPageAction(self.tabId, status);
        }

        function errorHandler(xhr, status, exc)
        {
            chrome.extension.getBackgroundPage().console.log([xhr, status, exc]);
        
            if (chromeReader.isUnauthorizedStatus(xhr.status))
            {
                showPageAction('unauthorized');
                view.unauthorized();
            }
            else
            {
                showPageAction('failed');
                
                if (xhr.status == 400)
                {
                    view.fail(xhr.responseText);
                }
                else
                {
                    view.fail(xhr.statusText);
                }
            }
        }
        
        function ensureSubscribed(feeds)
        {
            client.ensureSubscribed(feeds, errorHandler, function(s)
            {
                self.subscr = s;

                view.subscription(s);
                showPageAction('subscribed');

                client.getFolders(errorHandler, function(folders)
                {
                    var checked = s.categories.map(function(cat)
                    {
                        return cat.label;
                    });
                    
                    view.folders(folders, checked);
                });
            });
        }

        self.run = function()
        {
            view.addFolder(function(event, folder)
            {
                client.addSubscriptionFolder(self.subscr, folder, errorHandler, noop);
            });
            
            view.removeFolder(function(event, folder)
            {
                client.removeSubscriptionFolder(self.subscr, folder, errorHandler, noop);
            });
        
            view.rename(function(event, title)
            {
                client.setTitle(self.subscr, title, errorHandler, noop);
            });

            view.signin(function()
            {
                chromeReader.openSignInPage();
            });

            view.unsubscribe(function()
            {
                client.unsubscribe(self.subscr, errorHandler, function(result)
                {
                    showPageAction(null);
                    
                    view.subscription(null);
                    window.close();
                })
            });

            chrome.tabs.getSelected(null, function(tab)
            {
                self.tabId = tab.id;
                
                self.tabPort = chrome.tabs.connect(tab.id);
                self.tabPort.onMessage.addListener(ensureSubscribed);
                self.tabPort.postMessage('GetFeeds');
            });
        };
    }
});