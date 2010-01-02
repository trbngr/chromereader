(function($)
{
    function getPreferredFeeds(feeds)
    {
        if (feeds.all.length >= 2)
        {
            if (feeds.atom.length == feeds.rss.length)
            {
                return new Dictionary(feeds.atom);
            }
        }
        
        return new Dictionary(feeds.all);
    }
    
    function makeFixedFunction(result)
    {
        return function(success)
        {
            if (success instanceof Function)
            {
                success(result);
            }
        };
    }
    
    window.chromeReader = window.chromeReader || { };
    
    window.chromeReader.GoogleReaderModel = function(feedUrls, client, errorHandler)
    {
        var model = this;
        
        function loadFeedContents(feed, count, success)
        {
            if ((feed._contentsCount) && (feed._contentsCount >= count))
            {
                if (success instanceof Function)
                {
                    success(feed._contents);
                }
            }
            else
            {
                client.getFeedContents(feed.url, count, errorHandler, function(contents)
                {
                    feed._contents = contents;
                    feed._contentsCount = count;
                    
                    if (success instanceof Function)
                    {
                        success(contents);
                    }
                });
            }
        }
    
        function GoogleReaderFeed(url)
        {
            this.url = url;
            this.isPreferred = false;
            this.isSubscribed = false;
        }
        
        GoogleReaderFeed.prototype.getTitle = function(success)
        {
            var self = this;
            
            loadFeedContents(self, 1, function(contents)
            {
                self.getTitle = makeFixedFunction(contents.title);
                
                if (success instanceof Function)
                {
                    success(contents.title);
                }
            });
        };
        
        GoogleReaderFeed.prototype.setTitle = function(title, success)
        {
            if (this.isSubscribed)
            {
                client.setTitle(this.url, title, errorHandler, function()
                {
                    model.load(success);
                });
            }
        };
        
        GoogleReaderFeed.prototype.getFolders = function(success)
        {
            if (success instanceof Function)
            {
                success([]);
            }
        };
        
        GoogleReaderFeed.prototype.subscribe = function(success)
        {
            if (this.isSubscribed)
            {
                if (success instanceof Function)
                {
                    success();
                }
            }
            else
            {            
                client.subscribe(this.url, errorHandler, function()
                {
                    model.load(success);
                });
            }
        };
        
        GoogleReaderFeed.prototype.unsubscribe = function(success)
        {
            if (this.isSubscribed)
            {
                client.unsubscribe(this.url, errorHandler, function()
                {
                    model.load(success);
                });
            }
            else
            {
                if (success instanceof Function)
                {
                    success();
                }
            }
        };
        
        model.feeds = $.map(feedUrls.all, function(url)
        {
            return new GoogleReaderFeed(url);
        });
        
        model.load = function(success)
        {
            var feedsById = new Dictionary(client.makeFeedId, model.feeds);
            var preferred = getPreferredFeeds(feedUrls);

            client.getSubscriptions(errorHandler, function(result)
            {
                $.each(model.feeds, function(i, feed)
                {
                    feed.isPreferred  = feed.url in preferred;
                    feed.isSubscribed = false;
                });
                
                $.each(result.subscriptions, function(i, sub)
                {
                    var feed = feedsById[sub.id];
                    
                    if (feed)
                    {
                        feed.isSubscribed = true;
                        
                        feed.getTitle = makeFixedFunction(sub.title);
                        feed.getFolders = makeFixedFunction(sub.categories.map(function(cat)
                        {
                            return cat.label;
                        }));
                    }
                });
                
                if (success instanceof Function)
                {
                    success();
                }
            });
        };
    };
    
})(jQuery);