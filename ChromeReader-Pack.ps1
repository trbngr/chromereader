if (Test-Path .\tmp)
{
	Remove-Item .\tmp -Force
}

xcopy .\ChromeReader .\tmp /s /e /i

$ExtDir = (Resolve-Path .\tmp).Path
$ExtPem = (Resolve-Path .\ChromeReader.pem).Path

& 'D:\chromium\drops\latest\chrome.exe' "--pack-extension=$ExtDir" "--pack-extension-key=$ExtPem"

#Remove-Item .\tmp -Force -Recurse