param(
  [string]$Registry = "docker.io",
  [string]$Namespace = "livingil",
  [string]$BackendVersion = "",
  [string]$FrontendVersion = "",
  [string]$Platform = "linux/amd64",
  [string]$FrontendApiUrl = "https://api.example.com",
  [ValidateSet("backend", "frontend")]
  [string[]]$Components = @("backend", "frontend")
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

function Assert-LastExitCode {
  param([string]$StepName)
  if ($LASTEXITCODE -ne 0) {
    throw "$StepName failed with exit code $LASTEXITCODE"
  }
}

$Components = @(
  $Components | ForEach-Object { "$_".Trim().ToLowerInvariant() } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique
)

if ($Components -contains "backend") {
  if ([string]::IsNullOrWhiteSpace($BackendVersion)) {
    $BackendVersion = Read-PackageVersion -PackageJsonPath "backend/package.json"
  }
  $backendImage = Get-ImageName -RegistryValue $Registry -NamespaceValue $Namespace -Repo "marge-backend"
  docker buildx build --platform $Platform -f backend/Dockerfile --build-arg APP_VERSION=$BackendVersion -t "${backendImage}:${BackendVersion}" -t "${backendImage}:latest" --push backend
  Assert-LastExitCode "Backend image publish"
}

if ($Components -contains "frontend") {
  if ([string]::IsNullOrWhiteSpace($FrontendVersion)) {
    $FrontendVersion = Read-PackageVersion -PackageJsonPath "frontend/package.json"
  }
  $frontendImage = Get-ImageName -RegistryValue $Registry -NamespaceValue $Namespace -Repo "marge-frontend"
  docker buildx build --platform $Platform -f frontend/Dockerfile --build-arg VITE_API_URL=$FrontendApiUrl --build-arg VITE_APP_VERSION=$FrontendVersion -t "${frontendImage}:${FrontendVersion}" -t "${frontendImage}:latest" --push frontend
  Assert-LastExitCode "Frontend image publish"
}
