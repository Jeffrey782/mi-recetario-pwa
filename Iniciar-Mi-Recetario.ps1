# Servidor local para probar la PWA en Windows sin instalar Python ni Node.js.
$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://localhost:8000/')
$types = @{
    '.html' = 'text/html; charset=utf-8'
    '.css' = 'text/css; charset=utf-8'
    '.js' = 'text/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.webmanifest' = 'application/manifest+json; charset=utf-8'
    '.svg' = 'image/svg+xml'
    '.png' = 'image/png'
}

try {
    $listener.Start()
    Write-Host 'Mi Recetario: http://localhost:8000/'
    Write-Host 'Deja esta ventana abierta. Pulsa Ctrl+C para detener.'
    Start-Process 'http://localhost:8000/'
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        try {
            $urlPath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath).TrimStart('/')
            if ([string]::IsNullOrEmpty($urlPath)) { $urlPath = 'index.html' }
            $full = [System.IO.Path]::GetFullPath((Join-Path $root $urlPath))
            if (-not $full.StartsWith($root + [System.IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -or -not [System.IO.File]::Exists($full)) {
                $context.Response.StatusCode = 404
            } else {
                $ext = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
                if ($types.ContainsKey($ext)) { $context.Response.ContentType = $types[$ext] }
                $bytes = [System.IO.File]::ReadAllBytes($full)
                $context.Response.ContentLength64 = $bytes.Length
                $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        } catch {
            $context.Response.StatusCode = 500
            Write-Warning $_.Exception.Message
        } finally {
            $context.Response.Close()
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
