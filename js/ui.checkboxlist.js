(function($) 
{
    $.widget("ui.checkboxlist", 
    {
        _init: function()
        {
            this.element.addClass('ui-checkboxlist ui-widget');
            
            this.list  = $('<ul></ul>');
            this.list.appendTo(this.element);
            
            this.uniquifier = $.data(this.list);
        },
        
        _doCheck: function(items, val)
        {
            if (!$.isArray(items))
            {
                items = [ items ];
            }
            
            var boxes = $(':checkbox', this.list);
            
            for (var i in items)
            {
                for (var b = 0; b < boxes.length; b++)
                {
                    if (boxes[b].value == items[i])
                    {
                        boxes[b].checked = val;
                        break;
                    }
                }
            }        
        },
        
        destroy: function()
        {
            this.list.remove();
            this.element.removeClass('ui-checkboxlist ui-widget');
            
            $.widget.prototype.destroy.apply(this, arguments);
        },
        
        check: function(items)
        {
            this._doCheck(items, true);
        },
        
        uncheck: function(items)
        {
            this._doCheck(items, false);
        },
        
        setItems: function(items)
        {
            var thisWidget = this;
        
            function newCheckbox(itm, chkid)
            {
                var chk = $('<input />');
                
                chk.attr(
                { 
                    id:    chkid, 
                    type:  'checkbox',
                    value: itm.value || itm,
                });

                chk.change(function()
                {
                    if (this.checked)
                    {
                        thisWidget._trigger('checked', 0, this.value);
                    }
                    else
                    {
                        thisWidget._trigger('unchecked', 0, this.value);
                    }
                });
                
                return chk;
            }
            
            function newLabel(itm, chkid)
            {
                var label = $('<label></label>');
                
                label.attr('for', chkid);
                label.text(itm.label || itm);
                
                return label;
            }
            
            for (var i in items)
            {
                var itm = items[i];
                var chkid = 'ui-checkboxlist-check-' + this.uniquifier + '-' + i;
                
                var li = $('<li></li>');

                li.appendTo(this.list);

                newCheckbox(itm, chkid).appendTo(li);
                newLabel(itm, chkid).appendTo(li);                
            }
        }
    });

})(jQuery);