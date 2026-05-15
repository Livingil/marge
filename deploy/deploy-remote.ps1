param(
  [string]$ServerHost = "176.97.97.114",
  [string]$User = "vladimir",
  [int]$Port = 50022,
  [string]$RemoteDir = "",
  [ValidateSet("backend", "frontend")]
  [string[]]$Services = @()
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($RemoteDir)) {
  $RemoteDir = "/home/$User/marge"
}

if (-not (Test-Path ".env")) { throw "Local .env not found. Create it from .env.prod.example." }
if (-not (Test-Path "deploy/backend.env")) { throw "Local deploy/backend.env not found. Create it from deploy/backend.env.example." }

$remote = "$User@$ServerHost"
$sshArgs = @("-p", "$Port")
$scpArgs = @("-P", "$Port")

$servicesNormalized = @($Services | ForEach-Object { "$_".Trim().ToLowerInvariant() } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique)
$serviceArgs = ""
if ($servicesNormalized.Count -gt 0) {
  $serviceArgs = " " + ($servicesNormalized -join " ")
}

ssh @sshArgs $remote "mkdir -p '$RemoteDir/deploy'"
scp @scpArgs docker-compose.prod.yml .env "$remote`:$RemoteDir/"
scp @scpArgs deploy/backend.env "$remote`:$RemoteDir/deploy/"

ssh @sshArgs $remote "cd '$RemoteDir' && docker compose -f docker-compose.prod.yml pull$serviceArgs && docker compose -f docker-compose.prod.yml up -d --remove-orphans$serviceArgs"
ssh @sshArgs $remote "cd '$RemoteDir' && docker compose -f docker-compose.prod.yml ps$serviceArgs"
