Add-Type -AssemblyName System.Drawing

$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$base = Join-Path $root "output\cdn-upload-final\themes\time-travel-flight"
$files = Get-ChildItem -LiteralPath $base -Recurse -File | Where-Object {
  $_.Extension -eq ".png" -and $_.Length -gt 1MB
}

foreach ($file in $files) {
  $img = [System.Drawing.Image]::FromFile($file.FullName)
  $maxSide = 1024
  $ratio = [Math]::Min(1.0, $maxSide / [Math]::Max($img.Width, $img.Height))
  $width = [int]([Math]::Round($img.Width * $ratio))
  $height = [int]([Math]::Round($img.Height * $ratio))
  $bmp = New-Object System.Drawing.Bitmap($width, $height)
  $graphics = [System.Drawing.Graphics]::FromImage($bmp)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.DrawImage($img, 0, 0, $width, $height)
  $img.Dispose()
  $tmp = "$($file.FullName).tmp.png"
  $bmp.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bmp.Dispose()
  Move-Item -LiteralPath $tmp -Destination $file.FullName -Force
}

Get-ChildItem -LiteralPath $base -Recurse -File | Where-Object {
  $_.Extension -eq ".png"
} | Sort-Object Length -Descending | Select-Object -First 10 FullName, Length
