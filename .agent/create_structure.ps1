$treeFile = "directory-tree.txt"
$lines = Get-Content $treeFile

$rootDir = Get-Location
$pathStack = New-Object System.Collections.Generic.List[string]
$startFound = $false

$knownFiles = @('LICENSE', 'CODEOWNERS', 'Dockerfile', 'Makefile', '.gitignore', '.prettierrc', '.env.example')
$forceDirectories = @('.github', '.husky', '.vscode', 'specs', 'prisma', 'public', 'src', 'app', 'auth', 'dashboard', 'vehicles', 'drivers', 'dispatch', 'compliance', 'ifta', 'analytics', 'settings', 'notifications', 'admin', 'docs', 'components', 'lib', 'types', 'schemas', 'tests', 'styles', 'ui', 'layouts', 'nav', 'providers', 'server', 'pdf', 'excel', 'files', 'observability', 'utils', 'config')

# Cleanup garbage from previous run
if (Test-Path "src/│") { Remove-Item "src/│" -Recurse -Force }

# State to track if we are "inside" a file (ignoring its contents)
$ignoreDepth = -1 # If > -1, ignore everything deeper than this

foreach ($line in $lines) {
    if (-not $startFound) {
        if ($line.Trim() -eq 'FleetFusion') {
            $startFound = $true
        }
        continue
    }

    if ([string]::IsNullOrWhiteSpace($line)) { continue }

    # Regex to match the tree structure prefix
    if ($line -match '^([│\s└├─]+)(.+)') {
        $prefix = $matches[1]
        $name = $matches[2].Trim()

        if ([string]::IsNullOrWhiteSpace($name)) { continue }
        # Ignore lines that are just structural chars
        if ($name -match '^[│└├─\s]+$') { continue }

        # Calculate depth
        $depth = [math]::Floor(($prefix.Length - 2) / 3)

        # Check if we are in an ignored block (children of a file)
        if ($ignoreDepth -ne -1) {
            if ($depth -gt $ignoreDepth) {
                continue
            } else {
                # We are back to a level equal or higher than the ignored file
                $ignoreDepth = -1
            }
        }

        # Adjust stack
        while ($pathStack.Count -gt $depth) {
            $pathStack.RemoveAt($pathStack.Count - 1)
        }

        # Determine if file or directory
        $isFile = $false
        $extension = [System.IO.Path]::GetExtension($name)
        
        if ($forceDirectories -contains $name) {
            $isFile = $false
        }
        elseif ($name -match '\[.*\]' -or $name -match '\(.*\)') {
             $isFile = $false
        }
        elseif (-not [string]::IsNullOrEmpty($extension) -or $knownFiles -contains $name) {
            $isFile = $true
        }

        # Filter out descriptions (lines with spaces that aren't files)
        if ($name.Contains(' ') -and -not $isFile) {
            continue
        }

        $currentPath = Join-Path $rootDir (Join-Path -Path "." -ChildPath ($pathStack -join '\'))
        $fullPath = Join-Path $currentPath $name

        if ($isFile) {
            if (-not (Test-Path $fullPath)) {
                $parentDir = Split-Path $fullPath
                if (-not (Test-Path $parentDir)) {
                    New-Item -ItemType Directory -Force -Path $parentDir | Out-Null
                    Write-Host "Created parent directory: $parentDir"
                }
                New-Item -ItemType File -Path $fullPath -Value "// Stub for $name" | Out-Null
                Write-Host "Created file: $fullPath"
            }
            # Set ignore depth for children of this file
            $ignoreDepth = $depth
        } else {
            # Directory
            $pathStack.Add($name)
            $dirPath = Join-Path $currentPath $name
            if (-not (Test-Path $dirPath)) {
                New-Item -ItemType Directory -Force -Path $dirPath | Out-Null
                Write-Host "Created directory: $dirPath"
            }
            $ignoreDepth = -1 # Reset ignore depth as we entered a directory
        }
    }
}
