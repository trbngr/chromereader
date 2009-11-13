/// <reference path="../jquery-1.3.2.js" />

var Feeds;
var OldTitle;

var BackgroundPage;
var GoogleReader;
var TabPort;
var TabId;

var UI = 
{
    connecting: $('#connecting'),
    connected:  $('#connected'),
    failed:     $('#failed'),
    
    added:      $('#added'),
    removed:    $('#removed'),
    existing:   $('#existing'),
    
    close: $('#close'),
    remove: $('#remove'),
    feedName: $('#feedName'),
    
    setState: function(state)
    {
        function setIsVisible(obj, value)
        {
            if (value)
            {
                obj.removeClass('hidden');
            }
            else
            {
                obj.addClass('hidden');
            }
        }
        
        setIsVisible(this.connecting, (state == 'connecting'));
        setIsVisible(this.connected,  ((state == 'added') || (state == 'existing')));
        setIsVisible(this.failed,     (state == 'failed'));
        
        setIsVisible(this.added,      (state == 'added'));
        setIsVisible(this.removed,    (state == 'removed'));
        setIsVisible(this.existing,   (state == 'existing'));
    },
    
    errorHandler: function(xhr, status, errorThrown)
    {
        this.failed.text(status);
        this.setState('failed');
    }
};

function unsubscribeFeed()
{
    if (Feeds && GoogleReader)
    {
        GoogleReader.unsubscribe(Feeds[0], UI.errorHandler, function(result, status)
        {
            BackgroundPage.showPageAction(TabId, false);
            
            UI.setState('removed');
            window.close();
        })
    }
}

function updateFeedTitle()
{
    var newTitle = UI.feedName.val();
    
    if ((GoogleReader) && (Feeds) && (OldTitle != newTitle))
    {
        GoogleReader.setTitle(Feeds[0], newTitle, UI.errorHandler, function(result, status)
        {
            OldTitle = newTitle;
        });
    }
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
    UI.close.click(window.close);
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
                        
            GoogleReader.ensureSubscribed(Feeds[0], UI.errorHandler, function(result, status)
            {
                OldTitle = result.title;
                UI.feedName.val(OldTitle);
                
                if (result.isNewSubscription)
                {
                    UI.setState('added');
                    BackgroundPage.showPageAction(TabId, true);
                }
                else
                {
                    UI.setState('existing');
                }
            });
        });
        
        TabPort.postMessage('GetFeeds');
    })
};