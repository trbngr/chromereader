function Dictionary(keys, values)
{
    if (keys instanceof Array)
    {
        if (values instanceof Function)
        {
            for (var i = 0; i < keys.length; i++) 
            {
                this[keys[i]] = values(keys[i]);
            }
        }
        else
        {
            for (var i = 0; i < keys.length; i++) 
            {
                this[keys[i]] = values && values[i] ? values[i] : null;
            }
        }
    }
    else if (keys instanceof Function)
    {
        if (values instanceof Array)
        {
            for (var i = 0; i < values.length; i++) 
            {
                this[keys(values[i])] = values[i];
            }
        }
    }
}

Dictionary.prototype.keys = function()
{
    var keys = [];
    
    for (var k in this)
    {
        if (this.hasOwnProperty(k))
        {
            keys.push(k);
        }
    }
    
    return keys;
};

Dictionary.prototype.values = function()
{
    var values = [];
    
    for (var k in this)
    {
        if (this.hasOwnProperty(k))
        {
            values.push(this[k]);
        }
    }
    
    return values;
};