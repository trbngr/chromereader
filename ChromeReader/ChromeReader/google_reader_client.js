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

GoogleReaderClient.prototype._get = function(url, callback, data, type)
{
    $.get(this._makeUrl(url), data, callback, type || 'json');
};

GoogleReaderClient.prototype._getToken = function(callback)
{
    var self = this;

    if (self._token)
    {
        callback(this._token);
    }
    else
    {
        self._get('token', function(result, status)
        {
            if (status == 'success')
            {
                self._token = result;
                callback(self._token);
            }
            else
            {
                self._log('Failed to get token: ' + status);
            }
        }, { }, 'text');
    }
};

GoogleReaderClient.prototype._post = function(url, callback, data)
{
    var self = this;

    data = data || { };
    url = self._makeUrl(url);
    
    self._getToken(function(token)
    {
        data['T'] = token;
        $.post(url, data, callback);
    });
};

GoogleReaderClient.prototype.subscribe = function(feed, callback)
{
    this._post('subscription/edit', callback,
    {
        s: this._makeFeedId(feed), 
        ac: 'subscribe'
    });
};

GoogleReaderClient.prototype.unsubscribe = function(feed, callback)
{
    this._post('subscription/edit', callback,
    {
        s: this._makeFeedId(feed), 
        ac: 'unsubscribe'
    });
};
GoogleReaderClient.prototype.setTitle = function(feed, title, callback)
{
    this._post('subscription/edit', callback,
    {
        s: this._makeFeedId(feed), 
        ac: 'edit',
        t: title
    });
};

GoogleReaderClient.prototype.getSubscriptions = function(callback)
{
    this._get('subscription/list', callback,
    {
        output: 'json'
    });
};

GoogleReaderClient.prototype.getSubscription = function(feed, callback)
{
    var self = this;
    
    this.getSubscriptions(function(result, status)
    {
        if (status == 'success')
        {
            var i;
            var feedid = self._makeFeedId(feed);
            
            for (i in result.subscriptions)
            {
                var subscr = result.subscriptions[i];
                
                if (subscr.id == feedid)
                {
                    callback(subscr, status);
                    return;
                }
            }
        }
        
        callback(null, status);
    });
};

GoogleReaderClient.prototype.ensureSubscribed = function(feed, callback)
{
    var self = this;
    
    self.getSubscription(feed, function(sub, status)
    {
        if (status != 'success')
        {
            callback(null, status);
            return;
        }
        
        if (sub)
        {
            sub.isNewSubscription = false;
            callback(sub, status);
        }
        else
        {
            self.subscribe(feed, function(result, status)
            {
                if (status == 'success')
                {
                    self.getSubscription(feed, function(sub, status)
                    {
                        if (sub)
                        {
                            sub.isNewSubscription = true;
                        }
                        
                        callback(sub, status);
                    });
                }
                else
                {
                    callback(null, status);
                }
            });
        }            
    });
};