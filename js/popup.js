// <reference path="../jquery-1.3.2.js" />

var Feeds;

var BackgroundPage;
var GoogleReader;
var TabPort;
var TabId;

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
        BackgroundPage.showPageAction(TabId, isSubscribed ? 'subscribed' : null);
        
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
    }
};

function errorHandler(xhr, status, exc)
{
    if (BackgroundPage.isUnauthorizedStatus(xhr.status))
    {
        UI.setState('unauthorized');
    }
    else
    {
        UI.failed.text(xhr.statusText);
        UI.setState('failed');
        
        BackgroundPage.showPageAction(TabId, 'failed');
    }
}

function unsubscribeFeed()
{
    GoogleReader.unsubscribe(Feeds[0], errorHandler, function(result)
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
        GoogleReader.setTitle(Feeds[0], newTitle, errorHandler, function(result, status)
        {
            UI.oldTitle = newTitle;
        });
    }
}

function updateFeedFolder()
{
    if (this.checked)
    {
        GoogleReader.addSubscriptionFolder(Feeds[0], this.value, errorHandler);
    }
    else
    {
        GoogleReader.removeSubscriptionFolder(Feeds[0], this.value, errorHandler);
    }
}

function openSignInPage()
{
    BackgroundPage.openSignInPage();
}

window.onunload = function()
{
    updateFeedTitle();
};

window.onload = function()
{
    BackgroundPage = chrome.extension.getBackgroundPage();
    GoogleReader = BackgroundPage.googleReader;
    
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
                        
            GoogleReader.ensureSubscribed(Feeds[0], errorHandler, function(subscr)
            {
                UI.setIsNew(subscr.isNewSubscription, true);
                UI.setTitle(subscr.title);
                
                GoogleReader.getFolders(errorHandler, function(folders)
                {
                    UI.setFolders(folders);
                    UI.setFeedFolders(subscr.categories);
                });
            });
        });
        
        TabPort.postMessage('GetFeeds');
    })
};