window.chromeReader = $.extend(window.chromeReader || { },
{
    GoogleReaderClient: function()
    {
        var self = this;
        
        self._url = 'http://www.google.com/reader/api/0/';
        self._client = 'ChromeReader'
        
        self._tags = new chromeReader.ObjectCache(function(error, success)
        {
            self._get(
            {
                url: 'tag/list',
                success: success,
                error: error,
                data:
                {
                    output: 'json'
                }
            });
        });
        
        self._token = new chromeReader.ObjectCache(function(error, success)
        {
            self._get(
            {
                url: 'token',
                dataType: 'text',
                error: error,
                success: success
            });
        });
        
        self._subscriptions = new chromeReader.ObjectCache(function(error, success)
        {
            self._get(
            {
                url: 'subscription/list',
                success: success,
                error: error,
                data:
                {
                    output: 'json'
                }
            });    
        });
    }
});

chromeReader.GoogleReaderClient.prototype._makeUrl = function(part)
{
    return this._url + part + '?client=' + this._client + '&ck=' + new Date().valueOf();
};

chromeReader.GoogleReaderClient.prototype._makeFeedId = function(feedOrUrl)
{
    return feedOrUrl.id || ('feed/' + feedOrUrl);
};

chromeReader.GoogleReaderClient.prototype._makeFolderId = function(folder)
{
    return 'user/-/label/' + folder;
};

chromeReader.GoogleReaderClient.prototype._get = function(options)
{
    var self = this;

    options.type = 'GET';
    options.url = self._makeUrl(options.url);
    options.dataType = options.dataType || 'json';
    
    $.ajax(options);
};

chromeReader.GoogleReaderClient.prototype._post = function(options)
{
    var self = this;

    self._token.get(options.error, function(token)
    {
        options.type = 'POST';
        options.dataType = 'text';
        options.url = self._makeUrl(options.url);
        
        options.data = options.data || { };            
        options.data['T'] = token;
        
        $.ajax(options);
    });
};

chromeReader.GoogleReaderClient.prototype._editSubscription = function(feed, error, success, data)
{
    data.s = this._makeFeedId(feed);

    this._subscriptions.invalidate();
    this._post(
    {
        url: 'subscription/edit',
        success: success,
        error: error,
        data: data
    });
};

chromeReader.GoogleReaderClient.prototype.addSubscriptionFolder = function(feed, folder, error, success)
{
    this._editSubscription(feed, error, success, 
    {
        ac: 'edit', a: this._makeFolderId(folder)
    });
};

chromeReader.GoogleReaderClient.prototype.removeSubscriptionFolder = function(feed, folder, error, success)
{
    this._editSubscription(feed, error, success, 
    {
        ac: 'edit', r: this._makeFolderId(folder)
    });
};

chromeReader.GoogleReaderClient.prototype.invalidate = function()
{
    this._tags.invalidate();
    this._subscriptions.invalidate();
};

chromeReader.GoogleReaderClient.prototype.subscribe = function(feed, error, success)
{
    this._editSubscription(feed, error, success,
    {
        ac: 'subscribe'
    });
};

chromeReader.GoogleReaderClient.prototype.unsubscribe = function(feed, error, success)
{
    this._editSubscription(feed, error, success,
    {
        ac: 'unsubscribe'
    });
};

chromeReader.GoogleReaderClient.prototype.setTitle = function(feed, title, error, success)
{
    this._editSubscription(feed, error, success,
    {
        ac: 'edit', t: title
    });
};

chromeReader.GoogleReaderClient.prototype.getFolders = function(error, success)
{
    var self = this;
    
    self._tags.get(error, function(result, status)
    {
        var labelRegex = /label\/(.*)$/i
        var folders = [];
        
        for (var i in result.tags)
        {
            var tag = result.tags[i];
            var match = labelRegex.exec(tag.id)
            
            if (match && match[1])
            {
                folders.push(match[1]);
            }
        }
        
        success(folders);
    });
};

chromeReader.GoogleReaderClient.prototype.getSubscription = function(feeds, error, success)
{
    var self = this;
    
    self._subscriptions.get(error, function(result)
    {
        var feedMap = { };

        for (var j in feeds)
        {
            feedMap[self._makeFeedId(feeds[j])] = true;
        }   
             
        for (var i in result.subscriptions)
        {
            var subscr = result.subscriptions[i];
            
            if (feedMap[subscr.id])
            {
                success(subscr);
                return;
            }
        }
        
        success(null);
    });
};

chromeReader.GoogleReaderClient.prototype.ensureSubscribed = function(feeds, error, success)
{
    var self = this;
    
    self.getSubscription(feeds, error, function(sub)
    {
        if (sub)
        {
            sub.isNew = false;
            success(sub);
        }
        else
        {
            self.subscribe(feeds[0], error, function()
            {
                self.getSubscription(feeds, error, function(sub)
                {
                    if (sub)
                    {
                        sub.isNew = true;
                    }
                    
                    success(sub);
                });
            });
        }            
    });
};