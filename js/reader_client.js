/// <reference path="../jquery-1.3.2.js" />
/// <reference path="object_cache.js" />

function GoogleReaderClient()
{
    var self = this;
    
    self._url = 'http://www.google.com/reader/api/0/';
    self._client = 'ChromeReader'
    
    self._tags = new ObjectCache(function(error, success)
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
    var curr  = arguments.callee.caller, 
        FUNC  = 'function', ANON = "{anonymous}", 
        fnRE  = /function\s*([\w\-$]+)?\s*\(/i, 
        stack = [],j=0, 
        fn,args,i; 

    while (curr)
    { 
        fn    = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON; 
        args  = stack.slice.call(curr.arguments); 
        i     = args.length; 

        while (i--) 
        { 
            switch (typeof args[i]) 
            { 
                case 'string'  : args[i] = '"'+args[i].replace(/"/g,'\\"')+'"'; break; 
                case 'function': args[i] = FUNC; break; 
            } 
        } 

        stack[j++] = fn + '(' + args.join() + ')'; 
        curr = curr.caller; 
    } 

    console.log(
    {
        stack: stack,
        data: msg
    });
};

GoogleReaderClient.prototype._makeUrl = function(part)
{
    return this._url + part + '?client=' + this._client + '&ck=' + new Date().valueOf();
};

GoogleReaderClient.prototype._makeFeedId = function(url)
{
    return 'feed/' + url;
};

GoogleReaderClient.prototype._getFolderId = function(folder, error, success)
{
    var self = this;
    
    self._tags.get(error, function(result)
    {
        for (var i in result.tags)
        {
            var tag = result.tags[i];
            var pieces = tag.id.split('/');
            
            if ((pieces) && (pieces.length == 4))
            {
                if ((pieces[2] == 'label') && (pieces[3] == folder))
                {
                    success(tag.id);
                    break;
                }
            }
        }
    });
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

GoogleReaderClient.prototype.addSubscriptionFolder = function(feed, folder, error, success)
{
    var self = this;
    
    self._getFolderId(folder, error, function(tagId)
    {
        self._editSubscription(feed, error, success, 
        {
            ac: 'edit', a: tagId
        });
    });
};

GoogleReaderClient.prototype.removeSubscriptionFolder = function(feed, folder, error, success)
{
    var self = this;
    
    self._getFolderId(folder, error, function(tagId)
    {
        self._editSubscription(feed, error, success, 
        {
            ac: 'edit', r: tagId
        });
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

GoogleReaderClient.prototype.getFolders = function(error, success)
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

GoogleReaderClient.prototype.getSubscription = function(feed, error, success)
{
    var self = this;
    
    self._subscriptions.get(error, function(result, status)
    {
        var feedid = self._makeFeedId(feed);
        
        for (var i in result.subscriptions)
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
        
    self.getSubscription(feed, error, function(sub)
    {
        if (sub)
        {
            sub.isNewSubscription = false;
            success(sub, status);
        }
        else
        {
            self.subscribe(feed, error, function(result)
            {
                self.getSubscription(feed, error, function(sub)
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