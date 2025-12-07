#Requires -Version 7.0
<#
.SYNOPSIS
    FleetFusion Development Task Automation
.DESCRIPTION
    Common development tasks for the FleetFusion project.
    Run with: .\.agent\dev-tasks.ps1 -Task <TaskName>
.PARAMETER Task
    The task to run. Options: lint, typecheck, test, build, prisma-status, 
    prisma-studio, fresh-install, check-stubs, audit-domains
.EXAMPLE
    .\.agent\dev-tasks.ps1 -Task lint
    .\.agent\dev-tasks.ps1 -Task check-stubs
#>

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet(
        'lint', 
        'typecheck', 
        'test', 
        'build', 
        'prisma-status', 
        'prisma-studio', 
        'fresh-install', 
        'check-stubs',
        'audit-domains',
        'fix-husky',
        'create-e2e-folder'
    )]
    [string]$Task
)

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "`n🚀 FleetFusion Dev Tasks" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "Task: $Task`n" -ForegroundColor Yellow

switch ($Task) {
    'lint' {
        Write-Host "Running ESLint..." -ForegroundColor Green
        pnpm lint
    }
    
    'typecheck' {
        Write-Host "Running TypeScript type-check..." -ForegroundColor Green
        pnpm type-check
    }
    
    'test' {
        Write-Host "Running Vitest..." -ForegroundColor Green
        pnpm test
    }
    
    'build' {
        Write-Host "Building Next.js project..." -ForegroundColor Green
        pnpm build
    }
    
    'prisma-status' {
        Write-Host "Checking Prisma migration status..." -ForegroundColor Green
        pnpm prisma migrate status
    }
    
    'prisma-studio' {
        Write-Host "Opening Prisma Studio..." -ForegroundColor Green
        pnpm prisma studio
    }
    
    'fresh-install' {
        Write-Host "Removing node_modules and reinstalling..." -ForegroundColor Green
        Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
        Remove-Item -Force pnpm-lock.yaml -ErrorAction SilentlyContinue
        pnpm install
        pnpm prisma:generate
    }
    
    'check-stubs' {
        Write-Host "Checking for stub files that need implementation..." -ForegroundColor Green
        $stubCount = 0
        $stubFiles = @()
        
        # Check lib/server stubs
        $serverFiles = Get-ChildItem -Path "src/lib/server" -Filter "*.ts" -Recurse
        foreach ($file in $serverFiles) {
            $content = Get-Content $file.FullName -Raw
            if ($content -match "^// Stub for") {
                $stubFiles += $file.FullName.Replace($ProjectRoot, ".")
                $stubCount++
            }
        }
        
        # Check domain Actions/Fetchers stubs
        $domainPaths = @(
            "src/app/vehicles/lib",
            "src/app/drivers/lib",
            "src/app/dispatch/lib",
            "src/app/dashboard/lib",
            "src/app/compliance/lib",
            "src/app/ifta/lib",
            "src/app/analytics/lib",
            "src/app/settings/lib",
            "src/app/notifications/lib",
            "src/app/admin/lib",
            "src/app/auth/lib"
        )
        
        foreach ($path in $domainPaths) {
            if (Test-Path $path) {
                $files = Get-ChildItem -Path $path -Filter "*.ts"
                foreach ($file in $files) {
                    $content = Get-Content $file.FullName -Raw
                    if ($content -match "^// Stub for") {
                        $stubFiles += $file.FullName.Replace($ProjectRoot, ".")
                        $stubCount++
                    }
                }
            }
        }
        
        # Check observability stubs
        $obsFiles = Get-ChildItem -Path "src/lib/observability" -Filter "*.ts" -ErrorAction SilentlyContinue
        foreach ($file in $obsFiles) {
            $content = Get-Content $file.FullName -Raw
            if ($content -match "^// Stub for") {
                $stubFiles += $file.FullName.Replace($ProjectRoot, ".")
                $stubCount++
            }
        }
        
        Write-Host "`n📋 Stub Files Found: $stubCount" -ForegroundColor Yellow
        foreach ($stub in $stubFiles) {
            Write-Host "   - $stub" -ForegroundColor Gray
        }
        
        if ($stubCount -eq 0) {
            Write-Host "✅ No stub files found!" -ForegroundColor Green
        } else {
            Write-Host "`n⚠️  These files need implementation before the feature is complete." -ForegroundColor Yellow
        }
    }
    
    'audit-domains' {
        Write-Host "Auditing domain folder structure..." -ForegroundColor Green
        $domains = @('auth', 'dashboard', 'vehicles', 'drivers', 'dispatch', 'compliance', 'ifta', 'analytics', 'settings', 'notifications', 'admin')
        $requiredFolders = @('lib', 'components', 'schemas', 'tests', 'types', 'styles')
        $requiredLibFiles = @('Actions.ts', 'Fetchers.ts')
        
        foreach ($domain in $domains) {
            $domainPath = "src/app/$domain"
            Write-Host "`n📁 $domain" -ForegroundColor Cyan
            
            if (-not (Test-Path $domainPath)) {
                Write-Host "   ❌ Domain folder missing!" -ForegroundColor Red
                continue
            }
            
            foreach ($folder in $requiredFolders) {
                $folderPath = "$domainPath/$folder"
                if (Test-Path $folderPath) {
                    Write-Host "   ✅ $folder/" -ForegroundColor Green
                } else {
                    Write-Host "   ❌ $folder/ (missing)" -ForegroundColor Red
                }
            }
            
            # Check for Actions/Fetchers
            foreach ($fileType in $requiredLibFiles) {
                $fileName = "$domain$fileType"
                $filePath = "$domainPath/lib/$fileName"
                if (Test-Path $filePath) {
                    $content = Get-Content $filePath -Raw
                    if ($content -match "^// Stub") {
                        Write-Host "   ⚠️  $fileName (stub)" -ForegroundColor Yellow
                    } else {
                        Write-Host "   ✅ $fileName" -ForegroundColor Green
                    }
                } else {
                    Write-Host "   ❌ $fileName (missing)" -ForegroundColor Red
                }
            }
        }
    }
    
    'fix-husky' {
        Write-Host "Fixing Husky pre-commit hook..." -ForegroundColor Green
        $preCommitPath = ".husky/pre-commit"
        $hookContent = @"
#!/usr/bin/env sh
. "`$(dirname -- "`$0")/_/husky.sh"

pnpm lint-staged
"@
        Set-Content -Path $preCommitPath -Value $hookContent -NoNewline
        Write-Host "✅ Pre-commit hook updated to run lint-staged" -ForegroundColor Green
        
        $prePushPath = ".husky/pre-push"
        $pushContent = @"
#!/usr/bin/env sh
. "`$(dirname -- "`$0")/_/husky.sh"

pnpm type-check
"@
        Set-Content -Path $prePushPath -Value $pushContent -NoNewline
        Write-Host "✅ Pre-push hook updated to run type-check" -ForegroundColor Green
    }
    
    'create-e2e-folder' {
        Write-Host "Creating e2e folder structure..." -ForegroundColor Green
        $e2eDir = "e2e"
        
        if (-not (Test-Path $e2eDir)) {
            New-Item -ItemType Directory -Path $e2eDir | Out-Null
            Write-Host "✅ Created e2e/ folder" -ForegroundColor Green
        }
        
        # Create smoke test file
        $smokeTestContent = @"
import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('health endpoint returns ok', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FleetFusion/);
  });

  test('sign-in page loads', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await expect(page.locator('body')).toBeVisible();
  });
});
"@
        Set-Content -Path "$e2eDir/smoke.spec.ts" -Value $smokeTestContent
        Write-Host "✅ Created e2e/smoke.spec.ts" -ForegroundColor Green
        
        Write-Host "`n📝 Run E2E tests with: pnpm test:e2e" -ForegroundColor Yellow
    }
}

Write-Host "`n✨ Task completed!" -ForegroundColor Green
