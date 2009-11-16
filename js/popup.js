// <reference path="..\..\jquery-1.3.2.js" />

var Feeds;
var TabPort;
var TabId;

var chromeReader;

var UI = 
{
    oldTitle: null,

    unauthorized: $('#unauthorized'),
    connecting:   $('#connecting'),
    connected:    $('#connected'),
    failed:       $('#failed'),
    
    added:    $('#added'),
    removed:  $('#removed'),
    existing: $('#existing'),
    
    signin:   $('#signin'),
    remove:   $('#remove'),
    folders:  $('#folders'),
    feedName: $('#feedName'),
    
    nameRow:   $('#nameRow'),
    foldersRow: $('#foldersRow'),
    
    folderChecks: function()
    {
        return $('input[name="folderCheck"]');
    },
    
    setIsNew: function(isNew, isSubscribed)
    {
        chromeReader.showPageAction(TabId, isSubscribed ? 'subscribed' : null);
        
        if (isSubscribed)
        {
            if (isNew)
            {
                this.setState('added');
            }
            else
            {
                this.setState('existing');
            }
        }
        else
        {
            this.setState('removed');
        }
    },

    setIsVisible: function(obj, value)
    {
        if (value)
        {
            obj.removeClass('hidden');
        }
        else
        {
            obj.addClass('hidden');
        }
    },
    
    setFeedFolders: function(categories)
    {
        var labels = []
        
        for (var i in categories)
        {
            labels.push(categories[i].label);
        }
        
        this.folderChecks().val(labels);
    },
    
    setFolders: function(folders)
    {
        var html = [];
        var hasFolders = (folders && folders.length);
        
        if (hasFolders)
        {
            for (var i in folders)
            {
                var lbl = folders[i];
                
                html.push('<li><input type="checkbox" name="folderCheck" value="');
                html.push(lbl);
                html.push('" id="folderCheck_');
                html.push(lbl);
                html.push('" /><label for="folderCheck_');
                html.push(lbl);
                html.push('">');
                html.push(lbl);
                html.push('</label></li>');
            }
        }
        
        this.setIsVisible(this.foldersRow, hasFolders);        
        this.folders.html(html.join(''));
        
        this.folderChecks().change(updateFeedFolder);
    },
        
    setState: function(state)
    {
        this.setIsVisible(this.unauthorized, (state == 'unauthorized'));
        this.setIsVisible(this.connecting,   (state == 'connecting'));
        this.setIsVisible(this.connected,    ((state == 'added') || (state == 'existing')));
        this.setIsVisible(this.failed,       (state == 'failed'));
        
        this.setIsVisible(this.added,    (state == 'added'));
        this.setIsVisible(this.removed,  (state == 'removed'));
        this.setIsVisible(this.existing, (state == 'existing'));
    },
    
    setTitle: function(title)
    {
        this.oldTitle = title;
        this.feedName.val(title);
    },
    
    localize: function()
    {
        $('*[i18n\\:msg]').each(function(i)
        {
            var el = $(this);
            var key = el.attr('i18n\\:msg');
            
            if (key)
            {
                el.text(chromeReader.localize(key, el.text()));
            }
        });
    }
};

function errorHandler(xhr, status, exc)
{
    if (chromeReader.isUnauthorizedStatus(xhr.status))
    {
        UI.setState('unauthorized');
        chromeReader.showPageAction(TabId, 'unauthorized');
    }
    else
    {
        UI.failed.text(xhr.statusText);
        UI.setState('failed');
        
        chromeReader.showPageAction(TabId, 'failed');
    }
}

function unsubscribeFeed()
{
    chromeReader.client.unsubscribe(Feeds[0], errorHandler, function(result)
    {
        UI.setIsNew(false, false);
        window.close();
    })
}

function updateFeedTitle()
{
    var oldTitle = UI.oldTitle;
    var newTitle = UI.feedName.val();
    
    if (oldTitle != newTitle)
    {
        chromeReader.client.setTitle(Feeds[0], newTitle, errorHandler, function(result, status)
        {
            UI.oldTitle = newTitle;
        });
    }
}

function updateFeedFolder()
{
    if (this.checked)
    {
        chromeReader.client.addSubscriptionFolder(Feeds[0], this.value, errorHandler);
    }
    else
    {
        chromeReader.client.removeSubscriptionFolder(Feeds[0], this.value, errorHandler);
    }
}

function openSignInPage()
{
    chromeReader.openSignInPage();
}

window.onunload = function()
{
    updateFeedTitle();
};

window.onload = function()
{
    chromeReader = chrome.extension.getBackgroundPage().jachymko.chromeReader;

    UI.localize();
    
    // add event listeners
    UI.signin.click(openSignInPage);
    UI.remove.click(unsubscribeFeed);
    UI.feedName.blur(updateFeedTitle);
    
    UI.feedName.focus();
    
    chrome.tabs.getSelected(null, function(tab) 
    {
        TabId = tab.id;
        TabPort = chrome.tabs.connect(TabId);
        
        TabPort.onMessage.addListener(function(feeds)
        {
            Feeds = feeds;
                        
            chromeReader.client.ensureSubscribed(Feeds[0], errorHandler, function(subscr)
            {
                UI.setIsNew(subscr.isNewSubscription, true);
                UI.setTitle(subscr.title);
                
                chromeReader.client.getFolders(errorHandler, function(folders)
                {
                    UI.setFolders(folders);
                    UI.setFeedFolders(subscr.categories);
                });
            });
        });
        
        TabPort.postMessage('GetFeeds');
    })
};