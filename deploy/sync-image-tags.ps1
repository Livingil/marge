param(
  [string]$EnvPath = ".env",
  [string]$ExampleEnvPath = ".env.prod.example",
  [string]$Registry = "docker.io",
  [string]$Namespace = "livingil",
  [switch]$SkipExample
)

$ErrorActionPreference = "Stop"

function Read-PackageVersion {
  param([string]$PackageJsonPath)
  $packageJson = Get-Content -Path $PackageJsonPath -Raw | ConvertFrom-Json
  return "$($packageJson.version)".Trim()
}

function Get-ImageName {
  param([string]$RegistryValue,[string]$NamespaceValue,[string]$Repo)
  if ([string]::IsNullOrWhiteSpace($RegistryValue) -or $RegistryValue -eq "docker.io") {
    return "$NamespaceValue/$Repo"
  }
  return "$RegistryValue/$NamespaceValue/$Repo"
}

function Update-EnvValue {
  param([string]$Content,[string]$Key,[string]$Value)
  $escapedKey = [regex]::Escape($Key)
  $line = "${Key}=${Value}"
  if ($Content -match "(?m)^${escapedKey}=") {
    return [regex]::Replace($Content, "(?m)^${escapedKey}=.*$", $line)
  }
  $normalized = $Content.TrimEnd("`r", "`n")
  if ([string]::IsNullOrEmpty($normalized)) { return "$line`r`n" }
  return "$normalized`r`n$line`r`n"
}

function Sync-EnvFile {
  param([string]$Path,[hashtable]$Values)
  if (-not (Test-Path $Path)) { throw "Env file not found: $Path" }
  $content = Get-Content -Path $Path -Raw
  foreach ($key in $Values.Keys) { $content = Update-EnvValue -Content $content -Key $key -Value $Values[$key] }
  Set-Content -Path $Path -Value $content -NoNewline
}

$backendVersion = Read-PackageVersion -PackageJsonPath "backend/package.json"
$frontendVersion = Read-PackageVersion -PackageJsonPath "frontend/package.json"

$values = @{
  "BACKEND_VERSION" = $backendVersion
  "BACKEND_IMAGE" = "$(Get-ImageName -RegistryValue $Registry -NamespaceValue $Namespace -Repo "marge-backend"):$backendVersion"
  "FRONTEND_IMAGE" = "$(Get-ImageName -RegistryValue $Registry -NamespaceValue $Namespace -Repo "marge-frontend"):$frontendVersion"
}

Sync-EnvFile -Path $EnvPath -Values $values
if (-not $SkipExample) { Sync-EnvFile -Path $ExampleEnvPath -Values $values }
