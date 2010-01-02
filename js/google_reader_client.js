(function($)
{
    function makeFeedId(feedOrUrl)
    {
        if (/^feed\//.test(feedOrUrl))
        {
            return feedOrUrl;
        }
        
        if (feedOrUrl.id)
        {
            return feedOrUrl.id;
        }
        
        if (feedOrUrl.url)
        {
            feedOrUrl = url;
        }
        
        return ('feed/' + feedOrUrl);
    }

    function makeFolderId(folder)
    {
        return 'user/-/label/' + folder;
    }

    window.chromeReader = window.chromeReader || { };
    
    window.chromeReader.GoogleReaderClient = function(client, baseUrl)
    {
        client = client || 'ChromeReader';
        baseUrl = baseUrl || 'http://www.google.com/reader/api/0/';

        function makeUrl(part)
        {
            return baseUrl + part + 
                   '?client=' + client + 
                   '&ck=' + new Date().valueOf();
        }

        function get(options)
        {
            options.type = 'GET';
            options.url = makeUrl(options.url);
            options.dataType = options.dataType || 'json';
            
            $.ajax(options);
        }

        function getTags(error, success)
        {
            get(
            {
                url: 'tag/list',
                success: success,
                error: error,
                data:
                {
                    output: 'json'
                }
            });    
        }
        
        function getToken(error, success)
        {
            get(
            {
                url: 'token',
                dataType: 'text',
                error: error,
                success: success
            });
        }

        function post(options)
        {
            getToken(options.error, function(token)
            {
                options.type = 'POST';
                options.dataType = 'text';
                options.url = makeUrl(options.url);
                
                options.data = options.data || { };            
                options.data['T'] = token;
                
                $.ajax(options);
            });
        }

        function editSubscription(feed, error, success, data)
        {
            data.s = makeFeedId(feed);

            post(
            {
                url: 'subscription/edit',
                success: success,
                error: error,
                data: data
            });
        }
        
        this.makeFeedId = makeFeedId;
        this.makeFolderId = makeFolderId;
        
        this.addSubscriptionFolder = function(feed, folder, error, success)
        {
            editSubscription(feed, error, success, 
            {
                ac: 'edit', a: makeFolderId(folder)
            });
        };

        this.removeSubscriptionFolder = function(feed, folder, error, success)
        {
            editSubscription(feed, error, success, 
            {
                ac: 'edit', r: makeFolderId(folder)
            });
        };

        this.setTitle = function(feed, title, error, success)
        {
            editSubscription(feed, error, success,
            {
                ac: 'edit', t: title
            });
        };

        this.subscribe = function(feed, error, success)
        {
            editSubscription(feed, error, success,
            {
                ac: 'subscribe'
            });
        };

        this.unsubscribe = function(feed, error, success)
        {
            editSubscription(feed, error, success,
            {
                ac: 'unsubscribe'
            });
        };

        this.getFeedUnreadCount = function(feedOrUrl, error, success)
        {
            get(
            {
                url: 'unread-count',
                data: { output: 'json' },
                error: error,
                success: function(result)
                {
                    var feedId = makeFeedId(feedOrUrl);
                    
                    for (var i in result.unreadcounts)
                    {
                        var item = result.unreadcounts[i];
                        
                        if (item.id == feedId)
                        {
                            success(item.count);
                            return;
                        }
                    }
                }
            });
        };

        this.getFeedContents = function(feedOrUrl, count, error, success)
        {
            var data = 
            {
            };
            
            if (typeof count == 'Function')
            {
                success = error;
                error = count;
            }
            else if (count)
            {
                data.n = count;
            }
        
            get(
            {
                url: 'stream/contents/' + encodeURIComponent(makeFeedId(feedOrUrl)),
                data: data,
                error: error,
                success: sucess
            });        
        };

        this.getFolders = function(error, success)
        {
            getTags(error, function(result)
            {
                var folders = [];
                
                for (var i in result.tags)
                {
                    var tag = result.tags[i];
                    var match = /label\/(.*)$/i.exec(tag.id)
                    
                    if (match && match[1])
                    {
                        folders.push(match[1]);
                    }
                }
                
                success(folders);
            });
        };

        this.getSubscriptions = function(feeds, error, success)
        {
            get(
            {
                url: 'subscription/list',
                success: success,
                error: error,
                data:
                {
                    output: 'json'
                }
            });  
        };
    }
        
})(jQuery);