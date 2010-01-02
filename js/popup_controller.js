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
        
        function showPageAction(arg)
        {
            chromeReader.showPageAction(self.tabId, arg);
        }

        function showPageActionSubscribed(subscription)
        {
            chromeReader.showPageActionSubscribed(self.tabId, subscription);
        }

        function errorHandler(xhr, status, exc)
        {
            chromeReader.tabErrorHandler(self.tabId, xhr, status, exc);
            
            if (chromeReader.isUnauthorizedStatus(xhr.status))
            {
                view.unauthorized();
            }
            else if (xhr.status == 400)
            {
                view.fail(xhr.responseText);
            }
            else
            {
                view.fail(xhr.statusText);
            }
        }
        
        function loadFolders(newFolder)
        {
            client.getFolders(errorHandler, function(folders)
            {
                var checked = self.subscr.categories.map(function(cat)
                {
                    return cat.label;
                });
                
                view.folders(folders, checked, newFolder);
            });
        }
        
        function ensureSubscribed(feeds, newFolder)
        {
            client.ensureSubscribed(feeds, errorHandler, function(s)
            {
                self.subscr = s;

                view.subscription(s);
                showPageActionSubscribed(s);

                loadFolders(newFolder);
            });
        }

        function init(feeds)
        {
            if (feeds.subscribed.length == 0)
            {
                if (feeds.preferred.length == 1)
                {
                    client.subscribe(feeds.preferred[0], errorHandler, function
                }
            }
            else if (feeds.subscribed.length == 1)
            {
            }
            else
            {
            }
        }

        self.run = function()
        {
            view.addFolder(function(event, folder)
            {
                client.addSubscriptionFolder(self.subscr, folder, errorHandler, noop);
            });
            
            view.newFolder(function(event, folder)
            {
                client.addSubscriptionFolder(self.subscr, folder, errorHandler, function()
                {
                    ensureSubscribed([ self.subscr ], folder);
                });
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
                    view.subscription(null);
                    showPageAction();
                    
                    client.getFeedUpdateTime(self.subscr, errorHandler, function(lastUpdated)
                    {
                        showPageAction({ updated: lastUpdated });
                    });
                })
            });

            chrome.tabs.getSelected(null, function(tab)
            {
                self.tabId = tab.id;
                
                chrome.tabs.sendRequest(tab.id, 'GetFeeds', function(feeds)
                {
                    init(feeds);
                });
            });
        };
    }
});