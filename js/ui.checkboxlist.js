(function($) 
{
    $.widget("ui.checkboxlist", 
    {
        _init: function()
        {
            this.list = $('ul', this.element);
            this.listCreated = false;
            
            if (!this.list[0])
            {
                this.listCreated = true;

                this.list = $('<ul></ul>');
                this.list.appendTo(this.element);
            }
        
            this.element.addClass('ui-checkboxlist ui-widget');
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
            if (this.listCreated)
            {
                this.list.remove();
            }
            
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
                return $('<input type="checkbox" />')
                    .attr({ id: chkid, value: itm.value || itm })
                    .change(function()
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
            }
            
            function newLabel(itm, chkid)
            {
                return itm.element ||
                    $('<label></label>')
                    .attr('for', chkid)
                    .text(itm.label || itm);
            }
            
            for (var i = items.length - 1; i >= 0; i--)
            {
                var itm = items[i];
                var chkid = 'ui-checkboxlist-check-' + $.data(itm);
                
                var li = $('<li></li>');
                var chk = newCheckbox(itm, chkid);
                var label = newLabel(itm, chkid);

                chk.appendTo(li);
                label.appendTo(li);

                li.prependTo(this.list);
            }
        }
    });

})(jQuery);