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
        
        _findCheckboxes: function(items)
        {
            var boxes = $(':checkbox', this.list);
            var results = [];

            if (!$.isArray(items))
            {
                items = [ items ];
            }
                        
            for (var i in items)
            {
                for (var b = 0; b < boxes.length; b++)
                {
                    if (boxes[b].value == items[i])
                    {
                        results.push(boxes[b]);
                        break;
                    }
                }
            }
            
            return $(results);
        },
        
        _findListItems: function(items)
        {
            return this._findCheckboxes(items).parent('li');
        },
        
        _doCheck: function(items, val)
        {
            this._findCheckboxes(items).each(function()
            {
                this.checked = val;
            });
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
        
        highlight: function(items)
        {
            var li = this._findListItems(items);
            var parent = this.list.parent();
            
            parent.scrollTo(li, { easing: 'swing', over: -2 });
            li.effect('highlight');
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
            
            $('.ui-checkboxlist-item', this.list).remove();
            
            for (var i = items.length - 1; i >= 0; i--)
            {
                var itm = items[i];
                var chkid = 'ui-checkboxlist-check-' + $.data(itm);
                
                var li = $('<li class="ui-checkboxlist-item"></li>');
                var chk = newCheckbox(itm, chkid);
                var label = newLabel(itm, chkid);

                chk.appendTo(li);
                label.appendTo(li);

                li.prependTo(this.list);
            }
        }
    });

})(jQuery);