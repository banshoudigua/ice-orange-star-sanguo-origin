Add-Type -AssemblyName System.Drawing

$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$finalBase = Join-Path $root "output\cdn-upload-final\themes\time-travel-flight"
$backupBase = Join-Path $root "output\cdn-upload-final-original-backup\themes\time-travel-flight\yunwu-png-originals"

$finalResolved = Resolve-Path $finalBase
$rootResolved = Resolve-Path $root
if (-not $finalResolved.Path.StartsWith($rootResolved.Path)) {
  throw "finalBase is outside project root"
}

$files = Get-ChildItem -LiteralPath $finalBase -Recurse -File | Where-Object {
  $_.Extension -eq ".png"
}

foreach ($file in $files) {
  $relative = $file.FullName.Substring($finalBase.Length).TrimStart("\")
  $backupPath = Join-Path $backupBase $relative
  $backupDir = Split-Path -Parent $backupPath
  New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

  $img = [System.Drawing.Image]::FromFile($file.FullName)
  $maxSide = if ($file.Name -eq "time-travel-flight-hero.png") { 1280 } else { 1024 }
  $ratio = [Math]::Min(1.0, $maxSide / [Math]::Max($img.Width, $img.Height))
  $width = [int]([Math]::Round($img.Width * $ratio))
  $height = [int]([Math]::Round($img.Height * $ratio))
  $bmp = New-Object System.Drawing.Bitmap($width, $height)
  $graphics = [System.Drawing.Graphics]::FromImage($bmp)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.Clear([System.Drawing.Color]::White)
  $graphics.DrawImage($img, 0, 0, $width, $height)
  $img.Dispose()

  $jpgPath = [IO.Path]::ChangeExtension($file.FullName, ".jpg")
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object {
    $_.MimeType -eq "image/jpeg"
  }
  $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 76L)
  $bmp.Save($jpgPath, $codec, $params)
  $graphics.Dispose()
  $bmp.Dispose()

  Move-Item -LiteralPath $file.FullName -Destination $backupPath -Force
}

Get-ChildItem -LiteralPath $finalBase -Recurse -File | Where-Object {
  $_.Extension -match "\.(jpg|jpeg|png)$"
} | Sort-Object Length -Descending | Select-Object -First 12 FullName, Length
