/// <reference path="../jquery-1.3.2.js" />

$('#close').bind('click', function() 
{
    window.close(); 
});

$(document).ready(function()
{
    $('#feedName').focus();
});

chrome.tabs.getSelected(null, function(tab) 
{
    var port = chrome.tabs.connect(tab.id);
    
    port.onMessage.addListener(function(feeds)
    {
        var background = chrome.extension.getBackgroundPage();
        var reader = background.createReader();
        
        reader.ensureSubscribed(feeds[0], function(result, status)
        {
            reader._log(status);
            reader._log(result);

            $('#connecting').addClass('hidden');
            
            if (status != 'success')
            {
                $('#failed').text(result.status);
                $('#failed').removeClass('hidden');
            }
            else
            {
                $('#connected').removeClass('hidden');
                $('#feedName').val(result.title);
                
                if (result.isNewSubscription)
                {
                    $('#added').removeClass('hidden');
                }
                else
                {
                    $('#existing').removeClass('hidden');
                }
            }
        });
    });
    
    port.postMessage('GetFeeds');
})
