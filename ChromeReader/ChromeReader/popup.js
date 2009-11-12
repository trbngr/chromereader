/// <reference path="../jquery-1.3.2.js" />

var Feeds;
var GoogleReader;
var OldTitle;

function closePopup()
{
    if (chrome.experimental && 
        chrome.experimental.extension && 
        chrome.experimental.extension.getPopupView)
    {
        GoogleReader._log(chrome.experimental.extension.getPopupView());
        chrome.experimental.extension.getPopupView().close();
    }
    else
    {
        window.close();
    }
}

function showError(error)
{
    $('#failed').text(error);
    $('#failed').show();
}

function unsubscribeFeed()
{
    if (Feeds && GoogleReader)
    {
        GoogleReader.unsubscribe(Feeds[0], function(result, status)
        {
            if (status == 'success')
            {
                closePopup();
            }
            else
            {
                showError(status);
            }
        })
    }
}

function updateFeedTitle()
{
    var newTitle = $('#feedName').val();
    
    if ((GoogleReader) && (Feeds) && (OldTitle != newTitle))
    {
        GoogleReader.setTitle(Feeds[0], newTitle, function(result, status)
        {
            OldTitle = newTitle;
        
            if (status != 'success')
            {
                showError(status);
            }
            else if (result != 'OK')
            {
                showError(result);
            }
        });
    }
}

$('#close').click(closePopup);
$('#remove').click(unsubscribeFeed);

$('#feedName').blur(updateFeedTitle);

$(document).ready(function()
{
    $('#feedName').focus();
});

if (chrome.experimental &&
    chrome.experimental.popup &&
    chrome.experimental.popup.onClosed)
{
    chrome.experimental.popup.onClosed.addListener(updateFeedTitle);
}

chrome.tabs.getSelected(null, function(tab) 
{
    var port = chrome.tabs.connect(tab.id);
    
    port.onMessage.addListener(function(feeds)
    {
        var background = chrome.extension.getBackgroundPage();

        Feeds = feeds;
        GoogleReader = background.createReader();        
        
        GoogleReader.ensureSubscribed(Feeds[0], function(result, status)
        {
            $('#connecting').hide();
            
            if (status != 'success')
            {
                showError(status);
            }
            else
            {
                OldTitle = result.title;
                
                $('#connected').show();
                $('#feedName').val(OldTitle);
                
                if (result.isNewSubscription)
                {
                    $('#added').show();
                }
                else
                {
                    $('#existing').show();
                }
            }
        });
    });
    
    port.postMessage('GetFeeds');
})
