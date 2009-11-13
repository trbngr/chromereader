/// <reference path="../jquery-1.3.2.js" />
/// <reference path="object_cache.js" />

function GoogleReaderClient()
{
    var self = this;
    
    self._url = 'http://www.google.com/reader/api/0/';
    self._client = 'ChromeReader'
    
    self._token = new ObjectCache(function(error, success)
    {
        self._get(
        {
            url: 'token',
            dataType: 'text',
            error: error,
            success: success
        });
    });
    
    self._subscriptions = new ObjectCache(function(error, success)
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

GoogleReaderClient.prototype._log = function(msg)
{
    console.log(msg);
};

GoogleReaderClient.prototype._makeUrl = function(part)
{
    return this._url + part + '?client=' + this._client;
};

GoogleReaderClient.prototype._makeFeedId = function(url)
{
    return 'feed/' + url;
};

GoogleReaderClient.prototype._get = function(options)
{
    var self = this;

    options.type = 'GET';
    options.url = self._makeUrl(options.url);
    options.dataType = options.dataType || 'json';
    
    $.ajax(options);
};

GoogleReaderClient.prototype._post = function(options)
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

GoogleReaderClient.prototype._editSubscription = function(feed, error, success, data)
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

GoogleReaderClient.prototype.subscribe = function(feed, error, success)
{
    this._editSubscription(feed, error, success,
    {
        ac: 'subscribe'
    });
};

GoogleReaderClient.prototype.unsubscribe = function(feed, error, success)
{
    this._editSubscription(feed, error, success,
    {
        ac: 'unsubscribe'
    });
};

GoogleReaderClient.prototype.setTitle = function(feed, title, error, success)
{
    this._editSubscription(feed, error, success,
    {
        ac: 'edit', t: title
    });
};

GoogleReaderClient.prototype.getSubscription = function(feed, error, success)
{
    var self = this;
    
    self._subscriptions.get(error, function(result, status)
    {
        var i;
        var feedid = self._makeFeedId(feed);
        
        for (i in result.subscriptions)
        {
            var subscr = result.subscriptions[i];
            
            if (subscr.id == feedid)
            {
                success(subscr, status);
                return;
            }
        }
        
        success(null, status);
    });
};

GoogleReaderClient.prototype.ensureSubscribed = function(feed, error, success)
{
    var self = this;
    
    self.getSubscription(feed, error, function(sub, status)
    {
        if (sub)
        {
            sub.isNewSubscription = false;
            success(sub, status);
        }
        else
        {
            self.subscribe(feed, error, function(result, status)
            {
                self.getSubscription(feed, error, function(sub, status)
                {
                    if (sub)
                    {
                        sub.isNewSubscription = true;
                    }
                    
                    success(sub, status);
                });
            });
        }            
    });
};