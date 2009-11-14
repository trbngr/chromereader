function Get-ScriptDirectory
{
    $Invocation = (Get-Variable MyInvocation -Scope 1).Value
    Split-Path $Invocation.MyCommand.Path
}

Push-Location ( Get-ScriptDirectory )

try
{
    if (Test-Path ..\tmp)
    {
    	Remove-Item ..\tmp -Force -Recurse
    }

    xcopy . ..\tmp /s /e /i /exclude:FilesToExclude.exclude

    $ExtDir = (Resolve-Path ..\tmp).Path
    $ExtPem = (Resolve-Path .\ChromeReader.pem).Path

    $ChromeArgs = 
    (
        "--pack-extension=$ExtDir", 
        "--pack-extension-key=$ExtPem",
        "--no-message-box"
    )
    
    $chrome = Start-Process 'D:\chromium\drops\latest\chrome.exe' $ChromeArgs -PassThru -Debug -Verbose
    $chrome.WaitForExit()
    
    if (Test-Path ..\tmp.crx)
    {
        if (-not (Test-Path ..\ChromeReader_out  -PathType Container))
        {
            New-Item ..\ChromeReader_out -ItemType Container
        }
        
        Move-Item ..\tmp.crx ..\ChromeReader_out\ChromeReader.crx
        Invoke-Item ..\ChromeReader_out
    }
    
    Remove-Item ..\tmp -Force -Recurse
}
finally
{
    Pop-Location
}