$ErrorActionPreference = 'Stop'
$version = '8.10.2'
$distributionName = "gradle-$version"
$cacheRoot = Join-Path $env:USERPROFILE ".gradle\wrapper\dists\rbac-$distributionName"
$gradle = Join-Path $cacheRoot "$distributionName\bin\gradle.bat"

if (-not (Test-Path $gradle)) {
    New-Item -ItemType Directory -Force -Path $cacheRoot | Out-Null
    $archive = Join-Path $cacheRoot "$distributionName-bin.zip"
    $url = "https://services.gradle.org/distributions/$distributionName-bin.zip"
    Write-Host "Downloading Gradle $version..."
    Invoke-WebRequest -Uri $url -OutFile $archive
    Expand-Archive -Path $archive -DestinationPath $cacheRoot -Force
    Remove-Item $archive -Force
}

& $gradle @args
exit $LASTEXITCODE
