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
            }            
        };
        
        self.folders = function(folders, checked, newFolder)
        {
            if (newFolder)
            {
                checked = checked || [];
                checked.push(newFolder);
            }
            
            if (folders && folders.length)
            {
                var placeholder = chromeReader.localize('popup_newfolder_placeholder', "New Folder");
                var label = chromeReader.localize('popup_feed_folders', "Folders:");

                ui.newFolder
                    .appendTo(ui.newFolderLI)
                    .attr('placeholder', placeholder)
                    .attr('disabled', '')
                    .removeClass('busy')
                    .val('');

                ui.foldersLabel.html(label);

                ui.folders.addClass('hasitems');
            }

            ui.folders
                .checkboxlist('setItems', folders)
                .checkboxlist('check', checked)
                .checkboxlist('highlight', newFolder);
        };
        
        $(window).unload(triggerRename);

        ui.feedName.blur(triggerRename);
        
        ui.newFolder.blur(triggerNewFolder);
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
