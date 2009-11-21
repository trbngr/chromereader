window.chromeReaderPopup = $.extend(window.chromeReaderPopup || { },
{
    View: function(context)
    {
        var prevTitle = null;
        
        var self = this;
        var ui = 
        {
            feedName: $('#feedName', context),
            
            folders: $('#folders', context),
            foldersRow: $('#foldersRow', context),
            
            remove: $('#remove', context),
            signin: $('#signin', context)
        };
        
        function event(name)
        {
            return function(handler)
            {
                if ($.isFunction(handler))
                {
                    return $(self).bind(name, handler);
                }

                return $(self).trigger(name, $.makeArray(arguments));
            }
        }
        
        function triggerRename()
        {
            var newTitle = ui.feedName.val();
         
            if ((prevTitle != null) && (prevTitle != newTitle))
            {
                self.rename(newTitle);
                prevTitle = newTitle;
            }
        }
        
        function setState(state)
        {
            $('#failed', context).toggle(state == 'failed');
            $('#connecting', context).toggle(state == 'connecting');
            $('#unauthorized', context).toggle(state == 'unauthorized');
            
            $('#added', context).toggle(state == 'added');
            $('#removed', context).toggle(state == 'removed');
            $('#existing', context).toggle(state == 'existing');
            $('#connected', context).toggle((state == 'added') || (state == 'existing'));
        }
        
        self.addFolder = event('addFolder');
        self.removeFolder = event('removeFolder');

        self.rename = event('rename');
        self.signin = event('signin');
        self.unsubscribe = event('unsubscribe');
        
        self.fail = function(status)
        {
            setState('failed');
            $('#failed', context).text(status);
        };
        
        self.unauthorized = function()
        {
            setState('unauthorized');
        };
        
        self.feedName = function(newName)
        {
            return ui.feedName.val(newName);
        };
        
        self.subscription = function(s)
        {
            if (s)
            {
                prevTitle = s.title;
                ui.feedName.val(s.title);
                
                if (s.isNew)
                {
                    setState('added');
                }
                else
                {
                    setState('existing');
                }
            }
            else
            {
                prevTitle = null;
                setState('removed');
            }            
        };
        
        self.folders = function(folders, checked)
        {
            ui.folders.checkboxlist('setItems', folders);
            ui.folders.checkboxlist('check', checked);
            
            ui.foldersRow.show();
        };
        
        $(window).unload(triggerRename);
        ui.feedName.blur(triggerRename);
        
        ui.signin.click(function()
        {
            self.signin();
        });
        
        ui.remove.click(function()
        {
            self.unsubscribe();
        });
        
        ui.folders.checkboxlist(
        {
            checked: function(_, folder) { self.addFolder(folder); },
            unchecked: function(_, folder) { self.removeFolder(folder); }
        });
    }
});
