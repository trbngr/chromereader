window.chromeReaderPopup = $.extend(window.chromeReaderPopup || { },
{
    View: function(context, chromeReader)
    {
        var prevTitle = null;
        
        var self = this;
        var ui = 
        {
            feedName: $('#feedName', context),
            remove: $('#remove', context),
            signin: $('#signin', context),
            
            folders: $('#folders', context),
            foldersLabel: $('label[for="folders"]', context),
            
            newFolder: $('#newFolder', context),
            newFolderLI: $('#newFolderLI', context)
        };
        
        function event(name)
        {
            var $this = $(this);
            
            return function(handler)
            {
                if ($.isFunction(handler))
                {
                    return $this.bind(name, handler);
                }

                return $this.trigger(name, $.makeArray(arguments));
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

        function triggerNewFolder()
        {
            var val = ui.newFolder.val();
            
            if (val)
            {
                ui.newFolder
                    .attr('disabled', 'disabled')
                    .addClass('busy');
                    
                self.newFolder(val);
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
        self.newFolder = event('newFolder');
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
                
                window.setTimeout(window.close, 300);
            }
        };
        
        self.folders = function(folders, checked, newFolder)
        {
            if (newFolder)
            {
                checked = checked || [];
                checked.push(newFolder);
            }

            ui.newFolder.attr('placeholder', "New Folder")
            
            if (folders && folders.length)
            {
                ui.newFolder
                    .appendTo(ui.newFolderLI)
                    .attr('disabled', '')
                    .removeClass('busy')
                    .val('');

                ui.folders.addClass('hasitems');
            }
            else
            {
                ui.foldersLabel.html("Folder:");
            }

            ui.folders
                .checkboxlist('setItems', folders)
                .checkboxlist('check', checked)
                .checkboxlist('highlight', newFolder);
        };
        
        var $window = $(window);
        var $body = $(document.body);
        
        $window.unload(triggerRename);
        
        if (navigator.platform == 'Win32')
        {
            $body.addClass('platform-win32');
        }
        else
        {
            $body.addClass('platform-other');
        }
        
        ui.feedName.blur(triggerRename);
        
        ui.newFolder.keyup(function(e)
        {
            if (e.keyCode == 13)
            {
                triggerNewFolder();
            }
        });
        
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
