if (typeof(jachymko) == 'undefined')
{
    jachymko = { };
}

jachymko.ObjectCache = function(factory, maxAge)
{
    this._acquired = null;
    
    this._value = null;
    this._hasValue = false;
    
    this._factory = factory;
    this._maxAge = maxAge || 60000;
};

jachymko.ObjectCache.prototype.age = function()
{
    if (this._acquired)
    {
        return new Date().valueOf() - this._acquired;
    }
    
    return null;
};

jachymko.ObjectCache.prototype.get = function(error, success)
{
    var self = this;
    
    if ((self._hasValue) && (self.age() < self._maxAge))
    {
        success(self._value);
    }
    else
    {
        self._factory(error, function(result)
        {
            self._value = result;
            self._hasValue = true;
            self._acquired = new Date().valueOf();
            
            success(result);
        });
    }
};

jachymko.ObjectCache.prototype.invalidate = function()
{
    this._hasValue = false;
};
