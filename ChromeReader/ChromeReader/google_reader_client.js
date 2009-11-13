/// <reference path="../jquery-1.3.2.js" />

function GoogleReaderClient()
{
    this._url = 'http://www.google.com/reader/api/0/';
    this._client = 'ChromeReader'
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

GoogleReaderClient.prototype._getToken = function(options, sync)
{
    var self = this;

    if (self._token)
    {
        options.success(self._token, 'success');
    }
    else
    {
        self._get(
        {
            url: 'token',
            async: !sync,
            dataType: 'text',
            error: options.error,
            success: function(result, status)
            {
                self._token = result;
                options.success(result, status);
            }
        });
    }
};

GoogleReaderClient.prototype._post = function(options, sync)
{
    var self = this;

    self._getToken(
    {
        success: function(token, status)
        {
            options.type = 'POST';
            options.async = !sync;
            options.dataType = 'text';
            options.url = self._makeUrl(options.url);
            
            options.data = options.data || { };            
            options.data['T'] = token;
            
            $.ajax(options);
        },
        error: options.error
    }, sync);
};

GoogleReaderClient.prototype._editSubscription = function(feed, error, success, data, sync)
{
    data.s = this._makeFeedId(feed);

    this._post(
    {
        url: 'subscription/edit',
        success: success,
        error: error,
        data: data
    }, sync);
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
    console.log('setTitle - feed: ' + feed + ' title: ' + title);
    
    this._editSubscription(feed, error, success,
    {
        ac: 'edit', t: title
    }, /* sync: */ true );
};

GoogleReaderClient.prototype.getSubscriptions = function(error, success)
{
    this._get(
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

GoogleReaderClient.prototype.getSubscription = function(feed, error, success)
{
    var self = this;
    self.getSubscriptions(error, function(result, status)
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