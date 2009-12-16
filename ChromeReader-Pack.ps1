$ExtName = 'ChromeReader'
$SevenZip = "${Env:JachymkoUtil}\7-Zip\current\7z.exe"

function Get-ScriptDirectory
{
    $Invocation = (Get-Variable MyInvocation -Scope 1).Value
    Split-Path $Invocation.MyCommand.Path
}

Push-Location ( Get-ScriptDirectory )

try
{
    & $SevenZip a "$ExtName.zip" . -tzip -r "-x@$ExtName.exclude"
}
finally
{
    Pop-Location
}